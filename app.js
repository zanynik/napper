const STORAGE_KEY = "napper-web-state-v2";
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const agePriors = [
  { maxMonths: 2, wakeMinutes: 70, wakeRange: [45, 95], napMinutes: 95, naps: 5, totalDaySleep: 500 },
  { maxMonths: 4, wakeMinutes: 100, wakeRange: [75, 140], napMinutes: 85, naps: 4, totalDaySleep: 380 },
  { maxMonths: 6, wakeMinutes: 135, wakeRange: [105, 180], napMinutes: 80, naps: 3, totalDaySleep: 260 },
  { maxMonths: 8, wakeMinutes: 165, wakeRange: [135, 210], napMinutes: 72, naps: 3, totalDaySleep: 230 },
  { maxMonths: 12, wakeMinutes: 195, wakeRange: [160, 255], napMinutes: 70, naps: 2, totalDaySleep: 180 },
  { maxMonths: 18, wakeMinutes: 255, wakeRange: [210, 330], napMinutes: 90, naps: 1, totalDaySleep: 150 },
  { maxMonths: 36, wakeMinutes: 320, wakeRange: [260, 390], napMinutes: 85, naps: 1, totalDaySleep: 110 },
];

const els = {
  headline: document.querySelector("#headline"),
  dialMain: document.querySelector("#dialMain"),
  dialSub: document.querySelector("#dialSub"),
  dialSlices: document.querySelector("#dialSlices"),
  dialTicks: document.querySelector("#dialTicks"),
  dialNow: document.querySelector("#dialNow"),
  napToggleButton: document.querySelector("#napToggleButton"),
  wakeWindowStat: document.querySelector("#wakeWindowStat"),
  targetNapStat: document.querySelector("#targetNapStat"),
  confidenceStat: document.querySelector("#confidenceStat"),
  predictionCards: document.querySelector("#predictionCards"),
  timelineList: document.querySelector("#timelineList"),
  predictionCardTemplate: document.querySelector("#predictionCardTemplate"),
  timelineItemTemplate: document.querySelector("#timelineItemTemplate"),
  settingsForm: document.querySelector("#settingsForm"),
  babyNameInput: document.querySelector("#babyNameInput"),
  ageMonthsInput: document.querySelector("#ageMonthsInput"),
  wakeTimeInput: document.querySelector("#wakeTimeInput"),
  bedTimeInput: document.querySelector("#bedTimeInput"),
  baselineWakeInput: document.querySelector("#baselineWakeInput"),
  baselineNapInput: document.querySelector("#baselineNapInput"),
  installButton: document.querySelector("#installButton"),
  resetTodayButton: document.querySelector("#resetTodayButton"),
  useNowButton: document.querySelector("#useNowButton"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  resetAllButton: document.querySelector("#resetAllButton"),
};

let deferredInstallPrompt = null;

function now() {
  return new Date();
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${pad(hours)}:${pad(mins)}`;
}

function parseTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatClock(dateLike) {
  return new Date(dateLike).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(minutes) {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }
  if (hours) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function ewma(values, alpha = 0.45) {
  if (!values.length) {
    return null;
  }

  return values.slice(1).reduce((acc, value) => alpha * value + (1 - alpha) * acc, values[0]);
}

function median(values) {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(values) {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sumSqDiff = values.reduce((sum, v) => sum + (v - mean) ** 2, 0);
  return Math.sqrt(sumSqDiff / (values.length - 1));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getPrior(ageMonths) {
  return agePriors.find((prior) => ageMonths <= prior.maxMonths) || agePriors[agePriors.length - 1];
}

// Circadian sleep propensity model (Process C, Borbély two-process model)
// Babies have natural sleepy windows at ~9:30 AM and ~1:30 PM,
// with a late-afternoon alerting period around 5 PM.
// Circadian rhythms emerge around 2-3 months (Rivkees 2003).
function circadianAdjustment(predictedStartTime, ageMonths) {
  const hour = predictedStartTime.getHours() + predictedStartTime.getMinutes() / 60;
  const circadianMaturity = clamp((ageMonths - 1) / 4, 0, 1);
  const morningDip = Math.exp(-0.5 * ((hour - 9.5) / 1.0) ** 2) * 10;
  const afternoonDip = Math.exp(-0.5 * ((hour - 13.5) / 1.2) ** 2) * 15;
  const lateAlert = Math.exp(-0.5 * ((hour - 17) / 1.0) ** 2) * -8;
  return (morningDip + afternoonDip + lateAlert) * circadianMaturity;
}

function getTodaySleepTotal(todayNaps) {
  return todayNaps
    .filter((nap) => nap.endDate)
    .reduce((sum, nap) => sum + (nap.endDate - nap.startDate) / 60000, 0);
}

function buildSeedState() {
  return {
    profile: {
      babyName: "Baby",
      ageMonths: 6,
      wakeTime: "07:00",
      bedTime: "19:30",
      baselineWake: 135,
      baselineNap: 80,
    },
    naps: [],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.profile && Array.isArray(saved.naps)) {
      return saved;
    }
  } catch (error) {
    console.error("Failed to parse saved state", error);
  }

  return buildSeedState();
}

const state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function replaceState(nextState) {
  state.profile = nextState.profile;
  state.naps = nextState.naps;
  syncForm();
  render();
}

function isValidState(candidate) {
  return (
    candidate &&
    typeof candidate === "object" &&
    candidate.profile &&
    typeof candidate.profile === "object" &&
    Array.isArray(candidate.naps)
  );
}

function getTodayBounds() {
  const base = startOfDay(now());
  const dayStart = new Date(base.getTime() + parseTime(state.profile.wakeTime) * 60000);
  const dayEnd = new Date(base.getTime() + parseTime(state.profile.bedTime) * 60000);
  return { dayStart, dayEnd };
}

function getCompletedNaps() {
  return state.naps
    .filter((nap) => nap.end)
    .map((nap) => ({
      ...nap,
      startDate: new Date(nap.start),
      endDate: new Date(nap.end),
    }))
    .sort((a, b) => a.startDate - b.startDate);
}

function getActiveNap() {
  return state.naps.find((nap) => !nap.end) || null;
}

function recentWakeWindows() {
  const naps = getCompletedNaps();
  const values = [];

  naps.forEach((nap, index) => {
    const prevEnd = index === 0 ? null : naps[index - 1].endDate;
    const wakeAnchor = prevEnd || new Date(startOfDay(nap.startDate).getTime() + parseTime(state.profile.wakeTime) * 60000);
    const wakeMinutes = (nap.startDate - wakeAnchor) / 60000;
    if (wakeMinutes > 20 && wakeMinutes < 500) {
      values.push(wakeMinutes);
    }
  });

  return values.slice(-8);
}

function recentNapLengths() {
  return getCompletedNaps()
    .map((nap) => (nap.endDate - nap.startDate) / 60000)
    .filter((minutes) => minutes > 10 && minutes < 240)
    .slice(-8);
}

function getPredictionModel() {
  const profile = state.profile;
  const prior = getPrior(profile.ageMonths);
  const wakeSeries = recentWakeWindows();
  const napSeries = recentNapLengths();
  const wakeMedian = median(wakeSeries);
  const wakeEwma = ewma(wakeSeries);
  const napMedian = median(napSeries);
  const napEwma = ewma(napSeries);

  const blendedWakeBase =
    wakeSeries.length >= 2
      ? 0.45 * (wakeMedian || prior.wakeMinutes) +
        0.35 * (wakeEwma || prior.wakeMinutes) +
        0.2 * profile.baselineWake
      : 0.6 * prior.wakeMinutes + 0.4 * profile.baselineWake;

  const blendedNapBase =
    napSeries.length >= 2
      ? 0.45 * (napMedian || prior.napMinutes) +
        0.35 * (napEwma || prior.napMinutes) +
        0.2 * profile.baselineNap
      : 0.6 * prior.napMinutes + 0.4 * profile.baselineNap;

  const wakeDeviation =
    wakeSeries.length >= 2
      ? stddev(wakeSeries)
      : (prior.wakeRange[1] - prior.wakeRange[0]) / 4;

  const confidenceScore = clamp(
    97 - wakeDeviation * 0.95 - Math.max(0, 4 - wakeSeries.length) * 10,
    30,
    96,
  );

  return {
    prior,
    wakeBase: clamp(blendedWakeBase, prior.wakeRange[0], prior.wakeRange[1]),
    napBase: clamp(blendedNapBase, 25, 180),
    confidenceScore,
    wakeDeviation,
  };
}

function getTodayEvents() {
  const { dayStart, dayEnd } = getTodayBounds();
  return state.naps
    .map((nap) => ({
      ...nap,
      startDate: new Date(nap.start),
      endDate: nap.end ? new Date(nap.end) : null,
    }))
    .filter((nap) => nap.startDate >= startOfDay(now()) && nap.startDate <= dayEnd)
    .sort((a, b) => a.startDate - b.startDate)
    .filter((nap) => nap.startDate >= dayStart || (nap.endDate && nap.endDate >= dayStart));
}

function getCurrentWakeAnchor(todayNaps, dayStart) {
  const activeNap = getActiveNap();
  if (activeNap) {
    return null;
  }

  const completedToday = todayNaps.filter((nap) => nap.endDate);
  if (!completedToday.length) {
    return dayStart;
  }

  return completedToday[completedToday.length - 1].endDate;
}

function buildPredictions() {
  const { dayStart, dayEnd } = getTodayBounds();
  const model = getPredictionModel();
  const todayNaps = getTodayEvents();
  const activeNap = getActiveNap();
  const predictions = [];
  const todaySleepTotal = getTodaySleepTotal(todayNaps);
  const remainingDaySleepBudget = Math.max(0, model.prior.totalDaySleep - todaySleepTotal);

  if (activeNap) {
    const activeStart = new Date(activeNap.start);
    const plannedLength = clamp(Math.min(model.napBase, Math.max(remainingDaySleepBudget, 25)), 25, 180);
    const end = new Date(activeStart.getTime() + plannedLength * 60000);
    predictions.push({
      kind: "active",
      start: activeStart,
      end,
      title: "Current nap",
      note: `Likely to end around ${formatClock(end)} with ${formatDuration(
        Math.max(0, remainingDaySleepBudget - plannedLength),
      )} of daytime sleep budget left.`,
    });
  }

  let cursor = activeNap
    ? new Date(new Date(activeNap.start).getTime() + model.napBase * 60000)
    : getCurrentWakeAnchor(todayNaps, dayStart);
  let napIndex = todayNaps.filter((nap) => nap.endDate).length + (activeNap ? 1 : 0);
  let shortNapAdjustment = 0;

  const completedToday = todayNaps.filter((nap) => nap.endDate);
  if (completedToday.length) {
    const lastNap = completedToday[completedToday.length - 1];
    const lastDuration = (lastNap.endDate - lastNap.startDate) / 60000;
    const sleepDeficit = Math.max(0, model.napBase - lastDuration);
    shortNapAdjustment = -Math.min(model.wakeBase * 0.22, sleepDeficit * 0.35);
  }

  let projectedDaySleep = todaySleepTotal + (activeNap ? model.napBase : 0);

  while (cursor && napIndex < model.prior.naps + 2) {
    const progression = clamp(napIndex / Math.max(1, model.prior.naps), 0, 1);
    const wakeFactor = 0.86 + 0.24 * Math.sqrt(progression);
    const roughStart = new Date(cursor.getTime() + model.wakeBase * wakeFactor * 60000);
    const circadianMinutes = circadianAdjustment(roughStart, state.profile.ageMonths);
    const sleepPressureBudget =
      projectedDaySleep >= model.prior.totalDaySleep
        ? Math.min(24, (projectedDaySleep - model.prior.totalDaySleep) * 0.18)
        : 0;
    const targetWake = clamp(
      model.wakeBase * wakeFactor - circadianMinutes + shortNapAdjustment + sleepPressureBudget,
      model.prior.wakeRange[0],
      model.prior.wakeRange[1],
    );
    const start = new Date(cursor.getTime() + targetWake * 60000);
    if (start >= dayEnd) {
      break;
    }

    const napScale = napIndex === 0 ? 1.05 : napIndex >= model.prior.naps - 1 ? 0.85 : 1;
    const remainingBudget = Math.max(0, model.prior.totalDaySleep - projectedDaySleep);
    const budgetTaper = remainingBudget <= model.napBase ? clamp(remainingBudget / model.napBase, 0.45, 1) : 1;
    const targetNap = clamp(Math.min(model.napBase * napScale * budgetTaper, Math.max(remainingBudget, 25)), 25, 150);
    const end = new Date(Math.min(start.getTime() + targetNap * 60000, dayEnd.getTime()));
    const budgetAfterNap = Math.max(0, remainingBudget - targetNap);

    predictions.push({
      kind: "predicted",
      start,
      end,
      title: napIndex >= model.prior.naps - 1 ? "Likely last nap" : `Predicted nap ${napIndex + 1}`,
      note: `${formatDuration(targetWake)} awake, ${formatDuration(targetNap)} target sleep, ${formatDuration(
        budgetAfterNap,
      )} daytime budget left.`,
      targetWake,
      targetNap,
      circadianMinutes,
      budgetAfterNap,
    });

    cursor = end;
    napIndex += 1;
    projectedDaySleep += targetNap;
    shortNapAdjustment = 0;
  }

  return { predictions, model, todaySleepTotal };
}

function describeConfidence(score) {
  if (score >= 78) {
    return "high";
  }
  if (score >= 58) {
    return "medium";
  }
  return "learning";
}

function getNextPredictionInfo() {
  const activeNap = getActiveNap();
  const { predictions, model, todaySleepTotal } = buildPredictions();

  if (activeNap) {
    const end = new Date(activeNap.start);
    end.setMinutes(end.getMinutes() + model.napBase);
    return {
      title: "Current nap",
      main: formatClock(end),
      sub: `likely end in ${formatDuration((end - now()) / 60000)}`,
      wake: model.wakeBase,
      nap: model.napBase,
      confidence: describeConfidence(model.confidenceScore),
      predictions,
      model,
      todaySleepTotal,
    };
  }

  const next = predictions.find((prediction) => prediction.kind === "predicted");
  if (!next) {
    return {
      title: "Day complete",
      main: formatClock(getTodayBounds().dayEnd),
      sub: "bedtime is the next big sleep",
      wake: model.wakeBase,
      nap: model.napBase,
      confidence: describeConfidence(model.confidenceScore),
      predictions,
      model,
      todaySleepTotal,
    };
  }

  const minutesAway = Math.round((next.start - now()) / 60000);
  return {
    title: next.title,
    main: formatClock(next.start),
    sub: minutesAway <= 0 ? "ready now" : `in ${formatDuration(minutesAway)}`,
    wake: next.targetWake || model.wakeBase,
    nap: next.targetNap || model.napBase,
    confidence: describeConfidence(model.confidenceScore),
    predictions,
    model,
    todaySleepTotal,
  };
}

function polarPoint(cx, cy, radius, angleDeg) {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function angleForTime(date, dayStart, dayEnd) {
  const fraction = clamp((date - dayStart) / (dayEnd - dayStart), 0, 1);
  return fraction * 360;
}

function renderDial(todayNaps, predictionData) {
  const { dayStart, dayEnd } = getTodayBounds();
  els.dialSlices.innerHTML = "";
  els.dialTicks.innerHTML = "";
  els.dialNow.innerHTML = "";

  [0, 0.25, 0.5, 0.75, 1].forEach((step) => {
    const angle = step * 360;
    const inner = polarPoint(180, 180, 110, angle);
    const outer = polarPoint(180, 180, 140, angle);
    const labelPoint = polarPoint(180, 180, 156, angle);
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("class", "dial-tick");
    tick.setAttribute("x1", inner.x);
    tick.setAttribute("y1", inner.y);
    tick.setAttribute("x2", outer.x);
    tick.setAttribute("y2", outer.y);
    els.dialTicks.appendChild(tick);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "dial-tick-label");
    label.setAttribute("x", labelPoint.x);
    label.setAttribute("y", labelPoint.y);
    label.setAttribute("text-anchor", "middle");
    label.textContent = formatClock(new Date(dayStart.getTime() + step * (dayEnd - dayStart)));
    els.dialTicks.appendChild(label);
  });

  todayNaps.forEach((nap) => {
    const startAngle = angleForTime(nap.startDate, dayStart, dayEnd);
    const endDate = nap.endDate || now();
    const endAngle = angleForTime(endDate, dayStart, dayEnd);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", `dial-slice ${nap.endDate ? "logged" : "active"}`);
    path.setAttribute("d", arcPath(180, 180, 128, startAngle, endAngle));
    els.dialSlices.appendChild(path);
  });

  predictionData.predictions
    .filter((prediction) => prediction.kind === "predicted")
    .forEach((prediction) => {
      const startAngle = angleForTime(prediction.start, dayStart, dayEnd);
      const endAngle = angleForTime(prediction.end, dayStart, dayEnd);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "dial-slice predicted");
      path.setAttribute("d", arcPath(180, 180, 128, startAngle, endAngle));
      els.dialSlices.appendChild(path);
    });

  const nowAngle = angleForTime(now(), dayStart, dayEnd);
  const inner = polarPoint(180, 180, 92, nowAngle);
  const outer = polarPoint(180, 180, 144, nowAngle);
  const nowLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  nowLine.setAttribute("class", "dial-now-line");
  nowLine.setAttribute("x1", inner.x);
  nowLine.setAttribute("y1", inner.y);
  nowLine.setAttribute("x2", outer.x);
  nowLine.setAttribute("y2", outer.y);
  els.dialNow.appendChild(nowLine);

  const nowDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  nowDot.setAttribute("class", "dial-now-dot");
  nowDot.setAttribute("cx", outer.x);
  nowDot.setAttribute("cy", outer.y);
  nowDot.setAttribute("r", 5);
  els.dialNow.appendChild(nowDot);
}

function renderPredictions(predictionData) {
  els.predictionCards.innerHTML = "";
  const items = predictionData.predictions.filter((prediction) => prediction.kind !== "active").slice(0, 3);

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "timeline-empty";
    empty.textContent = "No more predicted naps for today. The planner is holding for bedtime.";
    els.predictionCards.appendChild(empty);
    return;
  }

  items.forEach((prediction) => {
    const node = els.predictionCardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".prediction-time").textContent = formatClock(prediction.start);
    node.querySelector(".prediction-title").textContent = prediction.title;
    node.querySelector(".prediction-note").textContent = prediction.note;
    els.predictionCards.appendChild(node);
  });
}

function renderTimeline(todayNaps, predictionData) {
  els.timelineList.innerHTML = "";
  const items = [];

  todayNaps.forEach((nap) => {
    const isActive = !nap.endDate;
    items.push({
      title: isActive ? "Nap in progress" : "Logged nap",
      time: `${formatClock(nap.startDate)}${nap.endDate ? ` - ${formatClock(nap.endDate)}` : ""}`,
      note: isActive
        ? "Tap End nap when the sleep ends."
        : `${formatDuration((nap.endDate - nap.startDate) / 60000)} total sleep.`,
      sortKey: nap.startDate.getTime(),
      state: isActive ? "active" : "logged",
    });
  });

  predictionData.predictions
    .filter((prediction) => prediction.kind === "predicted")
    .slice(0, 3)
    .forEach((prediction) => {
      items.push({
        title: prediction.title,
        time: `${formatClock(prediction.start)} - ${formatClock(prediction.end)}`,
        note: prediction.note,
        sortKey: prediction.start.getTime(),
        state: "predicted",
      });
    });

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "timeline-empty";
    empty.textContent = "No naps logged yet. Start the first nap and predictions will appear here.";
    els.timelineList.appendChild(empty);
    return;
  }

  items
    .sort((a, b) => a.sortKey - b.sortKey)
    .forEach((item) => {
      const node = els.timelineItemTemplate.content.firstElementChild.cloneNode(true);
      node.classList.add(`timeline-item-${item.state}`);
      node.querySelector(".timeline-title").textContent = item.title;
      node.querySelector(".timeline-time").textContent = item.time;
      node.querySelector(".timeline-note").textContent = item.note;
      els.timelineList.appendChild(node);
    });
}

function syncForm() {
  const { profile } = state;
  els.babyNameInput.value = profile.babyName;
  els.ageMonthsInput.value = profile.ageMonths;
  els.wakeTimeInput.value = profile.wakeTime;
  els.bedTimeInput.value = profile.bedTime;
  els.baselineWakeInput.value = profile.baselineWake;
  els.baselineNapInput.value = profile.baselineNap;
}

function render() {
  const profile = state.profile;
  const todayNaps = getTodayEvents();
  const predictionData = getNextPredictionInfo();
  const daySleepBudgetRemaining = Math.max(0, predictionData.model.prior.totalDaySleep - predictionData.todaySleepTotal);

  els.headline.textContent = `${profile.babyName}'s next sleep`;
  els.dialMain.textContent = predictionData.main;
  els.dialSub.textContent = `${predictionData.sub} · ${formatDuration(daySleepBudgetRemaining)} day sleep left`;
  els.wakeWindowStat.textContent = formatDuration(predictionData.wake);
  els.targetNapStat.textContent = formatDuration(predictionData.nap);
  els.confidenceStat.textContent = predictionData.confidence;
  els.napToggleButton.textContent = getActiveNap() ? "End nap" : "Start nap";

  renderDial(todayNaps, predictionData);
  renderPredictions(predictionData);
  renderTimeline(todayNaps, predictionData);
  saveState();
}

function startNap() {
  state.naps.push({
    id: uid(),
    start: now().toISOString(),
    end: null,
  });
  render();
}

function endNap() {
  const activeNap = getActiveNap();
  if (!activeNap) {
    return;
  }
  activeNap.end = now().toISOString();
  render();
}

function resetToday() {
  const { dayStart } = getTodayBounds();
  state.naps = state.naps.filter((nap) => new Date(nap.start) < dayStart);
  render();
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "napper-web",
    version: 1,
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `napper-backup-${stamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const nextState = parsed && parsed.state ? parsed.state : parsed;
  if (!isValidState(nextState)) {
    throw new Error("Invalid backup file.");
  }
  replaceState(nextState);
}

function resetAll() {
  replaceState(buildSeedState());
}

els.napToggleButton.addEventListener("click", () => {
  if (getActiveNap()) {
    endNap();
  } else {
    startNap();
  }
});

els.useNowButton.addEventListener("click", () => {
  if (!getActiveNap()) {
    startNap();
  }
});

els.resetTodayButton.addEventListener("click", resetToday);
els.exportButton.addEventListener("click", exportData);
els.resetAllButton.addEventListener("click", () => {
  if (window.confirm("Reset the profile and remove all saved nap data on this device?")) {
    resetAll();
  }
});
els.importInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    await importData(file);
  } catch (error) {
    window.alert("That file could not be imported. Please choose a Napper backup JSON file.");
    console.error(error);
  } finally {
    event.target.value = "";
  }
});

els.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = {
    babyName: els.babyNameInput.value.trim() || "Baby",
    ageMonths: clamp(Number(els.ageMonthsInput.value) || 0, 0, 36),
    wakeTime: els.wakeTimeInput.value || "07:00",
    bedTime: els.bedTimeInput.value || "19:30",
    baselineWake: clamp(Number(els.baselineWakeInput.value) || 60, 30, 420),
    baselineNap: clamp(Number(els.baselineNapInput.value) || 60, 20, 240),
  };
  syncForm();
  render();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  els.installButton.hidden = false;
});

els.installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  });
}

syncForm();
render();

setInterval(() => {
  render();
}, 60000);
