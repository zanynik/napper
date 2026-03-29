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
  statusNote: document.querySelector("#statusNote"),
  napToggleButton: document.querySelector("#napToggleButton"),
  manualLogForm: document.querySelector("#manualLogForm"),
  manualDateInput: document.querySelector("#manualDateInput"),
  manualStartInput: document.querySelector("#manualStartInput"),
  manualEndInput: document.querySelector("#manualEndInput"),
  nextSleepMain: document.querySelector("#nextSleepMain"),
  nextSleepNote: document.querySelector("#nextSleepNote"),
  planScale: document.querySelector("#planScale"),
  planTrack: document.querySelector("#planTrack"),
  upcomingList: document.querySelector("#upcomingList"),
  historyDateInput: document.querySelector("#historyDateInput"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  settingsForm: document.querySelector("#settingsForm"),
  babyNameInput: document.querySelector("#babyNameInput"),
  ageMonthsInput: document.querySelector("#ageMonthsInput"),
  wakeTimeInput: document.querySelector("#wakeTimeInput"),
  bedTimeInput: document.querySelector("#bedTimeInput"),
  baselineWakeInput: document.querySelector("#baselineWakeInput"),
  baselineNapInput: document.querySelector("#baselineNapInput"),
  installButton: document.querySelector("#installButton"),
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

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_IN_DAY);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseTime(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
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

function formatDateInput(dateLike) {
  const date = new Date(dateLike);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateValue(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(dateLike) {
  const date =
    typeof dateLike === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)
      ? parseDateValue(dateLike)
      : new Date(dateLike);
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
  if (values.length < 2) {
    return null;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const sumSqDiff = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Math.sqrt(sumSqDiff / (values.length - 1));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function combineDateAndTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function getPrior(ageMonths) {
  return agePriors.find((prior) => ageMonths <= prior.maxMonths) || agePriors[agePriors.length - 1];
}

function circadianAdjustment(predictedStartTime, ageMonths) {
  const hour = predictedStartTime.getHours() + predictedStartTime.getMinutes() / 60;
  const circadianMaturity = clamp((ageMonths - 1) / 4, 0, 1);
  const morningDip = Math.exp(-0.5 * ((hour - 9.5) / 1.0) ** 2) * 10;
  const afternoonDip = Math.exp(-0.5 * ((hour - 13.5) / 1.2) ** 2) * 15;
  const lateAlert = Math.exp(-0.5 * ((hour - 17) / 1.0) ** 2) * -8;
  return (morningDip + afternoonDip + lateAlert) * circadianMaturity;
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

function normalizeState(candidate) {
  const base = buildSeedState();
  if (!candidate || typeof candidate !== "object") {
    return base;
  }

  const profile = {
    babyName: String(candidate.profile?.babyName || base.profile.babyName).slice(0, 24),
    ageMonths: clamp(Number(candidate.profile?.ageMonths) || base.profile.ageMonths, 0, 36),
    wakeTime: candidate.profile?.wakeTime || base.profile.wakeTime,
    bedTime: candidate.profile?.bedTime || base.profile.bedTime,
    baselineWake: clamp(Number(candidate.profile?.baselineWake) || base.profile.baselineWake, 30, 420),
    baselineNap: clamp(Number(candidate.profile?.baselineNap) || base.profile.baselineNap, 20, 240),
  };

  const naps = Array.isArray(candidate.naps)
    ? candidate.naps
        .filter((nap) => nap && nap.start)
        .map((nap) => {
          const startDate = new Date(nap.start);
          const endDate = nap.end ? new Date(nap.end) : null;
          if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
            return null;
          }
          return {
            id: nap.id || uid(),
            start: startDate.toISOString(),
            end: endDate ? endDate.toISOString() : null,
          };
        })
        .filter(Boolean)
    : [];

  return { profile, naps };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return normalizeState(saved);
  } catch (error) {
    console.error("Failed to parse saved state", error);
    return buildSeedState();
  }
}

const state = loadState();
const ui = {
  historyDate: formatDateInput(now()),
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function replaceState(nextState) {
  const normalized = normalizeState(nextState);
  state.profile = normalized.profile;
  state.naps = normalized.naps;
  ui.historyDate = formatDateInput(now());
  syncForm();
  syncDateInputs();
  render();
}

function isValidState(candidate) {
  return candidate && typeof candidate === "object" && candidate.profile && Array.isArray(candidate.naps);
}

function getParsedNaps() {
  return state.naps
    .map((nap) => ({
      ...nap,
      startDate: new Date(nap.start),
      endDate: nap.end ? new Date(nap.end) : null,
    }))
    .filter((nap) => !Number.isNaN(nap.startDate.getTime()))
    .sort((a, b) => a.startDate - b.startDate);
}

function getCompletedNaps() {
  return getParsedNaps().filter((nap) => nap.endDate && nap.endDate > nap.startDate);
}

function getActiveNap() {
  return state.naps.find((nap) => !nap.end) || null;
}

function getActiveNapEvent() {
  const activeNap = getActiveNap();
  if (!activeNap) {
    return null;
  }
  return {
    ...activeNap,
    startDate: new Date(activeNap.start),
    endDate: null,
  };
}

function getTodayBounds() {
  const today = startOfDay(now());
  const dayStart = new Date(today.getTime() + parseTime(state.profile.wakeTime) * 60000);
  const dayEnd = new Date(today.getTime() + parseTime(state.profile.bedTime) * 60000);
  return { dayStart, dayEnd };
}

function getTodayEvents() {
  const { dayStart, dayEnd } = getTodayBounds();
  return getParsedNaps().filter((nap) => {
    const napEnd = nap.endDate || now();
    return nap.startDate < dayEnd && napEnd > dayStart;
  });
}

function recentWakeWindows() {
  const naps = getCompletedNaps();
  const values = [];

  naps.forEach((nap, index) => {
    const previousEnd = index === 0 ? null : naps[index - 1].endDate;
    const wakeAnchor =
      previousEnd ||
      new Date(startOfDay(nap.startDate).getTime() + parseTime(state.profile.wakeTime) * 60000);
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
  };
}

function getTodaySleepTotal(todayNaps) {
  return todayNaps
    .filter((nap) => nap.endDate)
    .reduce((sum, nap) => sum + (nap.endDate - nap.startDate) / 60000, 0);
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
  const activeNap = getActiveNapEvent();
  const predictions = [];
  const todaySleepTotal = getTodaySleepTotal(todayNaps);
  const remainingDaySleepBudget = Math.max(0, model.prior.totalDaySleep - todaySleepTotal);

  if (activeNap) {
    const plannedLength = clamp(Math.min(model.napBase, Math.max(remainingDaySleepBudget, 25)), 25, 180);
    const end = new Date(activeNap.startDate.getTime() + plannedLength * 60000);
    predictions.push({
      kind: "active",
      start: activeNap.startDate,
      end,
      title: "Sleeping now",
      targetNap: plannedLength,
      note: `Likely to end around ${formatClock(end)}.`,
    });
  }

  let cursor = activeNap
    ? new Date(activeNap.startDate.getTime() + model.napBase * 60000)
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
    const targetNap = clamp(
      Math.min(model.napBase * napScale * budgetTaper, Math.max(remainingBudget, 25)),
      25,
      150,
    );
    const end = new Date(Math.min(start.getTime() + targetNap * 60000, dayEnd.getTime()));

    predictions.push({
      kind: "predicted",
      start,
      end,
      title: napIndex >= model.prior.naps - 1 ? "Last nap" : `Nap ${napIndex + 1}`,
      targetWake,
      targetNap,
      note: `${formatDuration(targetNap)} sleep after about ${formatDuration(targetWake)} awake.`,
    });

    cursor = end;
    napIndex += 1;
    projectedDaySleep += targetNap;
    shortNapAdjustment = 0;
  }

  return { predictions, model, todaySleepTotal };
}

function buildSleepPlan() {
  const { dayStart, dayEnd } = getTodayBounds();
  const tomorrowWake = new Date(startOfDay(dayStart).getTime() + MS_IN_DAY + parseTime(state.profile.wakeTime) * 60000);
  const { predictions, model } = buildPredictions();

  const blocks = predictions.map((prediction) => ({
    kind: prediction.kind,
    start: prediction.start,
    end: prediction.end,
    title: prediction.title,
    note: prediction.note,
  }));

  if (tomorrowWake > now()) {
    blocks.push({
      kind: "night",
      start: dayEnd,
      end: tomorrowWake,
      title: "Night sleep",
      note: `Bedtime around ${formatClock(dayEnd)} and next wake around ${formatClock(tomorrowWake)} tomorrow.`,
    });
  }

  blocks.sort((a, b) => a.start - b.start);

  return {
    model,
    blocks,
    dayStart,
    dayEnd,
    tomorrowWake,
  };
}

function getNextSleepSummary(plan) {
  const active = plan.blocks.find((block) => block.kind === "active" && block.end > now());
  if (active) {
    return {
      main: `${state.profile.babyName} is sleeping now`,
      note: `Likely to wake around ${formatClock(active.end)}.`,
    };
  }

  const nextBlock = plan.blocks.find((block) => block.end > now());
  if (!nextBlock) {
    return {
      main: "No more sleep blocks today",
      note: "Tomorrow's schedule will begin from the next wake time.",
    };
  }

  if (nextBlock.kind === "night") {
    return {
      main: `Night sleep around ${formatClock(nextBlock.start)}`,
      note: `Expected until about ${formatClock(nextBlock.end)} tomorrow morning.`,
    };
  }

  return {
    main: `${nextBlock.title} around ${formatClock(nextBlock.start)}`,
    note: `${formatDuration((nextBlock.end - nextBlock.start) / 60000)} of likely sleep.`,
  };
}

function getFocusCopy(plan) {
  const activeNap = getActiveNapEvent();
  if (activeNap) {
    return {
      headline: `${state.profile.babyName} is sleeping`,
      note: `Started at ${formatClock(activeNap.startDate)}. Tap once when the nap ends.`,
      button: "End nap now",
    };
  }

  const nextBlock = plan.blocks.find((block) => block.kind !== "night" && block.end > now());
  if (nextBlock) {
    const minutesUntil = Math.round((nextBlock.start - now()) / 60000);
    return {
      headline: `Next nap around ${formatClock(nextBlock.start)}`,
      note: minutesUntil <= 0 ? "Sleep could happen any time now." : `Likely in about ${formatDuration(minutesUntil)}.`,
      button: "Start nap now",
    };
  }

  return {
    headline: `Next big sleep around ${formatClock(plan.dayEnd)}`,
    note: "If a surprise nap happens, you can still log it here.",
    button: "Start nap now",
  };
}

function getPlanSegments(plan) {
  const rangeStart = plan.dayStart;
  const rangeEnd = plan.tomorrowWake;

  const loggedSegments = getTodayEvents().map((nap) => ({
    kind: nap.endDate ? "logged" : "active",
    start: nap.startDate,
    end: nap.endDate || now(),
  }));

  const futureSegments = plan.blocks
    .filter((block) => block.kind === "predicted" || block.kind === "night")
    .map((block) => ({
      kind: block.kind,
      start: block.start,
      end: block.end,
    }));

  return [...loggedSegments, ...futureSegments]
    .filter((segment) => segment.end > rangeStart && segment.start < rangeEnd)
    .map((segment) => ({
      ...segment,
      left: clamp(((segment.start - rangeStart) / (rangeEnd - rangeStart)) * 100, 0, 100),
      width: clamp(((segment.end - segment.start) / (rangeEnd - rangeStart)) * 100, 0.8, 100),
    }));
}

function renderPlanScale(plan) {
  const markers = [
    { label: `Wake ${formatClock(plan.dayStart)}` },
    { label: "Midday" },
    { label: `Bed ${formatClock(plan.dayEnd)}` },
    { label: "Midnight" },
    { label: `Wake ${formatClock(plan.tomorrowWake)}` },
  ];

  els.planScale.innerHTML = markers
    .map((marker) => `<div class="scale-label">${marker.label}</div>`)
    .join("");
}

function renderPlanTrack(plan) {
  const segments = getPlanSegments(plan);
  const rangeStart = plan.dayStart;
  const rangeEnd = plan.tomorrowWake;

  if (!segments.length) {
    els.planTrack.innerHTML = `<div class="plan-track-empty">No naps logged yet. The bar will fill in as naps happen and predictions update.</div>`;
    return;
  }

  const nowPosition = clamp(((now() - rangeStart) / (rangeEnd - rangeStart)) * 100, 0, 100);

  const segmentMarkup = segments
    .map(
      (segment) =>
        `<div class="plan-segment plan-segment-${segment.kind}" style="left:${segment.left}%;width:${segment.width}%"></div>`,
    )
    .join("");

  els.planTrack.innerHTML = `${segmentMarkup}<div class="plan-now-marker" style="left:${nowPosition}%"></div>`;
}

function renderUpcoming(plan) {
  const upcoming = plan.blocks.filter((block) => block.end > now()).slice(0, 4);

  if (!upcoming.length) {
    els.upcomingList.innerHTML = `<div class="empty-state">No upcoming sleep blocks yet.</div>`;
    return;
  }

  els.upcomingList.innerHTML = upcoming
    .map(
      (block) => `
        <article class="upcoming-card">
          <div class="upcoming-card-time">${formatClock(block.start)} - ${formatClock(block.end)}</div>
          <div class="upcoming-card-copy">
            <strong>${block.title}</strong>
            <p>${block.note}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function getNapsForDate(dateValue) {
  const rangeStart = combineDateAndTime(dateValue, "00:00");
  const rangeEnd = addDays(rangeStart, 1);
  return getParsedNaps().filter((nap) => nap.startDate >= rangeStart && nap.startDate < rangeEnd);
}

function renderHistory() {
  const naps = getNapsForDate(ui.historyDate);
  const finishedMinutes = naps
    .filter((nap) => nap.endDate)
    .reduce((sum, nap) => sum + (nap.endDate - nap.startDate) / 60000, 0);

  if (!naps.length) {
    els.historySummary.textContent = `${formatDateLabel(ui.historyDate)} · no naps logged`;
    els.historyList.innerHTML = `<div class="empty-state">No naps logged for this date yet.</div>`;
    return;
  }

  els.historySummary.textContent = `${formatDateLabel(ui.historyDate)} · ${naps.length} nap${
    naps.length === 1 ? "" : "s"
  } · ${formatDuration(finishedMinutes)} total`;

  els.historyList.innerHTML = naps
    .map((nap, index) => {
      const timeLabel = nap.endDate
        ? `${formatClock(nap.startDate)} - ${formatClock(nap.endDate)}`
        : `${formatClock(nap.startDate)} - in progress`;
      const note = nap.endDate
        ? `${formatDuration((nap.endDate - nap.startDate) / 60000)} total sleep.`
        : "Currently still running.";

      return `
        <article class="history-item">
          <div class="history-time">${timeLabel}</div>
          <div class="history-copy">
            <strong>Nap ${index + 1}</strong>
            <p>${note}</p>
          </div>
          <button class="history-delete" type="button" data-delete-nap="${nap.id}">Delete</button>
        </article>
      `;
    })
    .join("");
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

function syncDateInputs() {
  els.historyDateInput.value = ui.historyDate;
  els.manualDateInput.value = ui.historyDate;
}

function render() {
  const plan = buildSleepPlan();
  const summary = getNextSleepSummary(plan);
  const focus = getFocusCopy(plan);

  els.headline.textContent = focus.headline;
  els.statusNote.textContent = focus.note;
  els.napToggleButton.textContent = focus.button;
  els.nextSleepMain.textContent = summary.main;
  els.nextSleepNote.textContent = summary.note;

  renderPlanScale(plan);
  renderPlanTrack(plan);
  renderUpcoming(plan);
  renderHistory();
  saveState();
}

function startNap() {
  if (getActiveNap()) {
    return;
  }

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

function addManualNap(dateValue, startTime, endTime) {
  const start = combineDateAndTime(dateValue, startTime);
  const end = combineDateAndTime(dateValue, endTime);

  if (end <= start) {
    window.alert("End time needs to be after the start time.");
    return;
  }

  state.naps.push({
    id: uid(),
    start: start.toISOString(),
    end: end.toISOString(),
  });

  ui.historyDate = dateValue;
  render();
}

function deleteNap(id) {
  state.naps = state.naps.filter((nap) => nap.id !== id);
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
  link.href = url;
  link.download = `napper-backup-${formatDateInput(now())}.json`;
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

els.manualLogForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addManualNap(els.manualDateInput.value, els.manualStartInput.value, els.manualEndInput.value);
  els.manualStartInput.value = "";
  els.manualEndInput.value = "";
});

els.historyDateInput.addEventListener("change", (event) => {
  ui.historyDate = event.target.value || formatDateInput(now());
  syncDateInputs();
  renderHistory();
});

els.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-nap]");
  if (!button) {
    return;
  }

  if (window.confirm("Delete this nap?")) {
    deleteNap(button.dataset.deleteNap);
  }
});

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
syncDateInputs();
render();

setInterval(() => {
  render();
}, 60000);
