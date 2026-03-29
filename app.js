const STORAGE_KEY = "napper-web-state-v2";
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const sleepPriors = [
  { maxMonths: 2, wakeMinutes: 70, wakeRange: [45, 95], napMinutes: 95, naps: 5, totalDaySleep: 500 },
  { maxMonths: 4, wakeMinutes: 100, wakeRange: [75, 140], napMinutes: 85, naps: 4, totalDaySleep: 380 },
  { maxMonths: 6, wakeMinutes: 135, wakeRange: [105, 180], napMinutes: 80, naps: 3, totalDaySleep: 260 },
  { maxMonths: 8, wakeMinutes: 165, wakeRange: [135, 210], napMinutes: 72, naps: 3, totalDaySleep: 230 },
  { maxMonths: 12, wakeMinutes: 195, wakeRange: [160, 255], napMinutes: 70, naps: 2, totalDaySleep: 180 },
  { maxMonths: 18, wakeMinutes: 255, wakeRange: [210, 330], napMinutes: 90, naps: 1, totalDaySleep: 150 },
  { maxMonths: 36, wakeMinutes: 320, wakeRange: [260, 390], napMinutes: 85, naps: 1, totalDaySleep: 110 },
];

const feedPriors = [
  { maxMonths: 2, intervalMinutes: 150, range: [90, 240] },
  { maxMonths: 4, intervalMinutes: 165, range: [105, 255] },
  { maxMonths: 6, intervalMinutes: 180, range: [120, 270] },
  { maxMonths: 12, intervalMinutes: 210, range: [135, 300] },
  { maxMonths: 36, intervalMinutes: 240, range: [150, 360] },
];

const els = {
  sleepTabButton: document.querySelector("#sleepTabButton"),
  feedTabButton: document.querySelector("#feedTabButton"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
  napHeadline: document.querySelector("#napHeadline"),
  napNote: document.querySelector("#napNote"),
  napToggleButton: document.querySelector("#napToggleButton"),
  nightHeadline: document.querySelector("#nightHeadline"),
  nightNote: document.querySelector("#nightNote"),
  nightPrimaryButton: document.querySelector("#nightPrimaryButton"),
  nightSecondaryButton: document.querySelector("#nightSecondaryButton"),
  feedHeadline: document.querySelector("#feedHeadline"),
  feedQuickNote: document.querySelector("#feedQuickNote"),
  feedLeftButton: document.querySelector("#feedLeftButton"),
  feedRightButton: document.querySelector("#feedRightButton"),
  feedBothButton: document.querySelector("#feedBothButton"),
  feedBottleButton: document.querySelector("#feedBottleButton"),
  nextSleepMain: document.querySelector("#nextSleepMain"),
  nextSleepNote: document.querySelector("#nextSleepNote"),
  nextFeedMain: document.querySelector("#nextFeedMain"),
  nextFeedNote: document.querySelector("#nextFeedNote"),
  planScale: document.querySelector("#planScale"),
  planTrack: document.querySelector("#planTrack"),
  upcomingList: document.querySelector("#upcomingList"),
  historyDateInput: document.querySelector("#historyDateInput"),
  historyEyebrow: document.querySelector("#historyEyebrow"),
  historyTitle: document.querySelector("#historyTitle"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  manualNapForm: document.querySelector("#manualNapForm"),
  manualNapDateInput: document.querySelector("#manualNapDateInput"),
  manualNapStartInput: document.querySelector("#manualNapStartInput"),
  manualNapEndInput: document.querySelector("#manualNapEndInput"),
  manualFeedForm: document.querySelector("#manualFeedForm"),
  manualFeedDateInput: document.querySelector("#manualFeedDateInput"),
  manualFeedTimeInput: document.querySelector("#manualFeedTimeInput"),
  manualFeedKindInput: document.querySelector("#manualFeedKindInput"),
  settingsForm: document.querySelector("#settingsForm"),
  ageSummary: document.querySelector("#ageSummary"),
  babyNameInput: document.querySelector("#babyNameInput"),
  dateOfBirthInput: document.querySelector("#dateOfBirthInput"),
  dueDateInput: document.querySelector("#dueDateInput"),
  ageMonthsInput: document.querySelector("#ageMonthsInput"),
  wakeTimeInput: document.querySelector("#wakeTimeInput"),
  bedTimeInput: document.querySelector("#bedTimeInput"),
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

function combineDateAndTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function parseDateValue(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
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

function formatFeedKind(kind) {
  return {
    left: "Left breast",
    right: "Right breast",
    both: "Both breasts",
    bottle: "Bottle",
  }[kind] || "Feed";
}

function humanizeAge(days) {
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  if (weeks <= 0) {
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return `${weeks} week${weeks === 1 ? "" : "s"} ${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
}

function isValidDateValue(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getProfileAgeInfo(referenceDate = now()) {
  const today = startOfDay(referenceDate);
  const birthValue = state.profile.dateOfBirth;
  const dueValue = state.profile.dueDate;

  if (isValidDateValue(birthValue)) {
    const birthDate = parseDateValue(birthValue);
    const chronologicalDays = Math.max(0, Math.floor((today - birthDate) / MS_IN_DAY));
    let effectiveDays = chronologicalDays;
    let summary = `Age ${humanizeAge(chronologicalDays)}.`;

    if (isValidDateValue(dueValue)) {
      const dueDate = parseDateValue(dueValue);
      if (dueDate > birthDate) {
        effectiveDays = Math.max(0, Math.floor((today - dueDate) / MS_IN_DAY));
        summary = `Chronological age ${humanizeAge(chronologicalDays)}. Corrected age ${humanizeAge(
          effectiveDays,
        )}.`;
      }
    }

    return {
      ageMonths: effectiveDays / 30.4375,
      summary,
      source: "dates",
    };
  }

  return {
    ageMonths: clamp(Number(state.profile.ageMonthsFallback) || 0, 0, 36),
    summary: `Using manual age ${state.profile.ageMonthsFallback} months. Add date of birth for more precise age-based predictions.`,
    source: "manual",
  };
}

function getSleepPrior(ageMonths) {
  return sleepPriors.find((prior) => ageMonths <= prior.maxMonths) || sleepPriors[sleepPriors.length - 1];
}

function getFeedPrior(ageMonths) {
  return feedPriors.find((prior) => ageMonths <= prior.maxMonths) || feedPriors[feedPriors.length - 1];
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
      dateOfBirth: "",
      dueDate: "",
      ageMonthsFallback: 6,
      wakeTime: "07:00",
      bedTime: "19:30",
    },
    naps: [],
    nights: [],
    feeds: [],
  };
}

function normalizeSleepRecord(record) {
  if (!record || !record.start) {
    return null;
  }

  const startDate = new Date(record.start);
  const endDate = record.end ? new Date(record.end) : null;
  if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
    return null;
  }

  return {
    id: record.id || uid(),
    start: startDate.toISOString(),
    end: endDate ? endDate.toISOString() : null,
  };
}

function normalizeNightRecord(record) {
  if (!record || !record.start) {
    return null;
  }

  const startDate = new Date(record.start);
  const endDate = record.end ? new Date(record.end) : null;
  if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
    return null;
  }

  const breaks = Array.isArray(record.breaks)
    ? record.breaks
        .map((nightBreak) => {
          if (!nightBreak || !nightBreak.start) {
            return null;
          }
          const breakStart = new Date(nightBreak.start);
          const breakEnd = nightBreak.end ? new Date(nightBreak.end) : null;
          if (Number.isNaN(breakStart.getTime()) || (breakEnd && Number.isNaN(breakEnd.getTime()))) {
            return null;
          }
          return {
            id: nightBreak.id || uid(),
            start: breakStart.toISOString(),
            end: breakEnd ? breakEnd.toISOString() : null,
          };
        })
        .filter(Boolean)
    : [];

  return {
    id: record.id || uid(),
    start: startDate.toISOString(),
    end: endDate ? endDate.toISOString() : null,
    breaks,
  };
}

function normalizeFeedRecord(record) {
  const timeValue = record?.time || record?.start;
  if (!timeValue) {
    return null;
  }

  const time = new Date(timeValue);
  if (Number.isNaN(time.getTime())) {
    return null;
  }

  const kind = ["left", "right", "both", "bottle"].includes(record.kind) ? record.kind : "left";
  return {
    id: record.id || uid(),
    time: time.toISOString(),
    kind,
  };
}

function normalizeState(candidate) {
  const base = buildSeedState();
  if (!candidate || typeof candidate !== "object") {
    return base;
  }

  const profile = {
    babyName: String(candidate.profile?.babyName || base.profile.babyName).slice(0, 24),
    dateOfBirth: candidate.profile?.dateOfBirth || "",
    dueDate: candidate.profile?.dueDate || "",
    ageMonthsFallback: clamp(
      Number(candidate.profile?.ageMonthsFallback ?? candidate.profile?.ageMonths) || base.profile.ageMonthsFallback,
      0,
      36,
    ),
    wakeTime: candidate.profile?.wakeTime || base.profile.wakeTime,
    bedTime: candidate.profile?.bedTime || base.profile.bedTime,
  };

  return {
    profile,
    naps: Array.isArray(candidate.naps) ? candidate.naps.map(normalizeSleepRecord).filter(Boolean) : [],
    nights: Array.isArray(candidate.nights) ? candidate.nights.map(normalizeNightRecord).filter(Boolean) : [],
    feeds: Array.isArray(candidate.feeds) ? candidate.feeds.map(normalizeFeedRecord).filter(Boolean) : [],
  };
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
  activeTab: "sleep",
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function replaceState(nextState) {
  const normalized = normalizeState(nextState);
  state.profile = normalized.profile;
  state.naps = normalized.naps;
  state.nights = normalized.nights;
  state.feeds = normalized.feeds;
  ui.historyDate = formatDateInput(now());
  syncForm();
  syncDateInputs();
  render();
}

function isValidState(candidate) {
  return (
    candidate &&
    typeof candidate === "object" &&
    candidate.profile &&
    Array.isArray(candidate.naps) &&
    Array.isArray(candidate.nights ?? []) &&
    Array.isArray(candidate.feeds ?? [])
  );
}

function getParsedNaps() {
  return state.naps
    .map((nap) => ({
      ...nap,
      startDate: new Date(nap.start),
      endDate: nap.end ? new Date(nap.end) : null,
    }))
    .sort((a, b) => a.startDate - b.startDate);
}

function getParsedFeeds() {
  return state.feeds
    .map((feed) => ({
      ...feed,
      timeDate: new Date(feed.time),
    }))
    .sort((a, b) => a.timeDate - b.timeDate);
}

function getParsedNights() {
  return state.nights
    .map((night) => ({
      ...night,
      startDate: new Date(night.start),
      endDate: night.end ? new Date(night.end) : null,
      breaks: (night.breaks || [])
        .map((nightBreak) => ({
          ...nightBreak,
          startDate: new Date(nightBreak.start),
          endDate: nightBreak.end ? new Date(nightBreak.end) : null,
        }))
        .sort((a, b) => a.startDate - b.startDate),
    }))
    .sort((a, b) => a.startDate - b.startDate);
}

function getActiveNap() {
  return state.naps.find((nap) => !nap.end) || null;
}

function getActiveNight() {
  return state.nights.find((night) => !night.end) || null;
}

function getActiveNightEvent() {
  const activeNight = getActiveNight();
  if (!activeNight) {
    return null;
  }

  return {
    ...activeNight,
    startDate: new Date(activeNight.start),
    endDate: null,
    breaks: (activeNight.breaks || []).map((nightBreak) => ({
      ...nightBreak,
      startDate: new Date(nightBreak.start),
      endDate: nightBreak.end ? new Date(nightBreak.end) : null,
    })),
  };
}

function getActiveNightBreak(nightEvent = getActiveNightEvent()) {
  return nightEvent?.breaks?.find((nightBreak) => !nightBreak.endDate) || null;
}

function getCompletedNaps() {
  return getParsedNaps().filter((nap) => nap.endDate && nap.endDate > nap.startDate);
}

function getTodayBounds() {
  const today = startOfDay(now());
  const dayStart = new Date(today.getTime() + parseTime(state.profile.wakeTime) * 60000);
  const dayEnd = new Date(today.getTime() + parseTime(state.profile.bedTime) * 60000);
  return { dayStart, dayEnd };
}

function getTodayNaps() {
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

function recentFeedIntervals() {
  const feeds = getParsedFeeds();
  const values = [];

  feeds.forEach((feed, index) => {
    if (index === 0) {
      return;
    }
    const interval = (feed.timeDate - feeds[index - 1].timeDate) / 60000;
    if (interval > 20 && interval < 480) {
      values.push(interval);
    }
  });

  return values.slice(-12);
}

function getSleepPredictionModel() {
  const ageInfo = getProfileAgeInfo();
  const prior = getSleepPrior(ageInfo.ageMonths);
  const wakeSeries = recentWakeWindows();
  const napSeries = recentNapLengths();
  const wakeMedian = median(wakeSeries);
  const wakeEwma = ewma(wakeSeries);
  const napMedian = median(napSeries);
  const napEwma = ewma(napSeries);

  const blendedWakeBase =
    wakeSeries.length >= 2
      ? 0.58 * (wakeMedian || prior.wakeMinutes) + 0.42 * (wakeEwma || prior.wakeMinutes)
      : prior.wakeMinutes;

  const blendedNapBase =
    napSeries.length >= 2
      ? 0.58 * (napMedian || prior.napMinutes) + 0.42 * (napEwma || prior.napMinutes)
      : prior.napMinutes;

  const wakeDeviation =
    wakeSeries.length >= 2 ? stddev(wakeSeries) : (prior.wakeRange[1] - prior.wakeRange[0]) / 4;

  return {
    ageInfo,
    prior,
    wakeBase: clamp(blendedWakeBase, prior.wakeRange[0], prior.wakeRange[1]),
    napBase: clamp(blendedNapBase, 25, 180),
    confidenceScore: clamp(97 - wakeDeviation * 0.95 - Math.max(0, 4 - wakeSeries.length) * 10, 30, 96),
  };
}

function getFeedPredictionModel() {
  const ageInfo = getProfileAgeInfo();
  const prior = getFeedPrior(ageInfo.ageMonths);
  const intervals = recentFeedIntervals();
  const intervalMedian = median(intervals);
  const intervalEwma = ewma(intervals);

  const intervalBase =
    intervals.length >= 2
      ? 0.62 * (intervalMedian || prior.intervalMinutes) + 0.38 * (intervalEwma || prior.intervalMinutes)
      : prior.intervalMinutes;

  return {
    ageInfo,
    prior,
    intervalMinutes: clamp(intervalBase, prior.range[0], prior.range[1]),
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

function buildSleepPredictions() {
  const { dayStart, dayEnd } = getTodayBounds();
  const model = getSleepPredictionModel();
  const todayNaps = getTodayNaps();
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
      note: `Likely to end around ${formatClock(end)}.`,
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
    const circadianMinutes = circadianAdjustment(roughStart, model.ageInfo.ageMonths);
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
      note: `${formatDuration(targetNap)} sleep after about ${formatDuration(targetWake)} awake.`,
    });

    cursor = end;
    napIndex += 1;
    projectedDaySleep += targetNap;
    shortNapAdjustment = 0;
  }

  return { predictions, model };
}

function getNextFeedPrediction() {
  const feeds = getParsedFeeds();
  const model = getFeedPredictionModel();
  const lastFeed = feeds[feeds.length - 1] || null;

  if (!lastFeed) {
    return {
      model,
      lastFeed: null,
      nextTime: null,
      suggestion: "Log the first feed to start feed timing predictions.",
    };
  }

  const nextTime = new Date(lastFeed.timeDate.getTime() + model.intervalMinutes * 60000);
  let sideSuggestion = "";
  if (lastFeed.kind === "left") {
    sideSuggestion = "Likely right side next.";
  } else if (lastFeed.kind === "right") {
    sideSuggestion = "Likely left side next.";
  } else if (lastFeed.kind === "both") {
    sideSuggestion = "Likely whichever side feels fullest next.";
  } else {
    sideSuggestion = "Bottle was last, so the next method may vary.";
  }

  return {
    model,
    lastFeed,
    nextTime,
    suggestion: sideSuggestion,
  };
}

function getNightDurationMinutes(night) {
  const endDate = night.endDate || now();
  const totalMinutes = Math.max(0, (endDate - night.startDate) / 60000);
  const awakeMinutes = (night.breaks || []).reduce((sum, nightBreak) => {
    const breakEnd = nightBreak.endDate || endDate;
    return sum + Math.max(0, (breakEnd - nightBreak.startDate) / 60000);
  }, 0);
  return Math.max(0, totalMinutes - awakeMinutes);
}

function buildSleepPlan() {
  const { dayStart, dayEnd } = getTodayBounds();
  const tomorrowWake = new Date(startOfDay(dayStart).getTime() + MS_IN_DAY + parseTime(state.profile.wakeTime) * 60000);
  const { predictions, model } = buildSleepPredictions();
  const activeNight = getActiveNightEvent();
  const blocks = predictions.map((prediction) => ({
    kind: prediction.kind,
    start: prediction.start,
    end: prediction.end,
    title: prediction.title,
    note: prediction.note,
  }));

  if (activeNight) {
    blocks.push({
      kind: "night-active",
      start: activeNight.startDate,
      end: tomorrowWake,
      title: "Night sleep",
      note: `Night started at ${formatClock(activeNight.startDate)}.`,
    });
  } else if (tomorrowWake > now()) {
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
  const currentNight = plan.blocks.find((block) => block.kind === "night-active");
  if (currentNight && currentNight.start <= now()) {
    return {
      main: `${state.profile.babyName} is in night sleep`,
      note: `Night started at ${formatClock(currentNight.start)}.`,
    };
  }

  const activeNap = plan.blocks.find((block) => block.kind === "active" && block.end > now());
  if (activeNap) {
    return {
      main: `${state.profile.babyName} is napping now`,
      note: `Likely awake around ${formatClock(activeNap.end)}.`,
    };
  }

  const nextBlock = plan.blocks.find((block) => block.end > now());
  if (!nextBlock) {
    return {
      main: "No more sleep blocks yet",
      note: "New logs will keep adjusting the rest of the day.",
    };
  }

  return {
    main: `${nextBlock.title} around ${formatClock(nextBlock.start)}`,
    note: nextBlock.note,
  };
}

function getQuickNapCopy(plan) {
  const activeNight = getActiveNightEvent();
  if (activeNight) {
    return {
      headline: "Night is active",
      note: "End the night with Final wake before starting a daytime nap.",
      button: "Night in progress",
      disabled: true,
    };
  }

  const activeNap = getActiveNap();
  if (activeNap) {
    return {
      headline: `${state.profile.babyName} is napping`,
      note: `Started at ${formatClock(activeNap.start)}. Tap when the nap ends.`,
      button: "End nap now",
      disabled: false,
    };
  }

  const nextNap = plan.blocks.find((block) => block.kind === "predicted" && block.end > now());
  if (nextNap) {
    const minutesUntil = Math.round((nextNap.start - now()) / 60000);
    return {
      headline: `Next nap around ${formatClock(nextNap.start)}`,
      note: minutesUntil <= 0 ? "Sleep could happen any time now." : `Likely in about ${formatDuration(minutesUntil)}.`,
      button: "Start nap now",
      disabled: false,
    };
  }

  return {
    headline: `Next big sleep around ${formatClock(plan.dayEnd)}`,
    note: "If a surprise nap happens, you can still log it here.",
    button: "Start nap now",
    disabled: false,
  };
}

function getQuickNightCopy() {
  const activeNight = getActiveNightEvent();
  if (!activeNight) {
    return {
      headline: "Night sleep not started",
      note: "At bedtime, start the night. Log wake periods only if the baby fully wakes.",
      primary: "Start night",
      secondary: null,
    };
  }

  const activeBreak = getActiveNightBreak(activeNight);
  if (activeBreak) {
    return {
      headline: `${state.profile.babyName} is awake`,
      note: `Wake started at ${formatClock(activeBreak.startDate)}. Tap when sleep resumes, or use Final wake for the morning.`,
      primary: "Back asleep",
      secondary: "Final wake",
    };
  }

  return {
    headline: `Night started at ${formatClock(activeNight.startDate)}`,
    note: "If the baby wakes, tap Log wake. Use Final wake when the night is over.",
    primary: "Log wake",
    secondary: "Final wake",
  };
}

function getQuickFeedCopy(feedPrediction) {
  const feeds = getParsedFeeds();
  const lastFeed = feeds[feeds.length - 1];
  if (!lastFeed) {
    return {
      headline: "Log a feed in one tap",
      note: "Choose the side or method used for this feed.",
    };
  }

  const nextText = feedPrediction.nextTime ? `Next likely around ${formatClock(feedPrediction.nextTime)}.` : "Prediction is still learning.";
  return {
    headline: `Last feed at ${formatClock(lastFeed.timeDate)}`,
    note: `${formatFeedKind(lastFeed.kind)}. ${nextText}`,
  };
}

function getPlanSegments(plan) {
  const rangeStart = plan.dayStart;
  const rangeEnd = plan.tomorrowWake;

  const loggedNapSegments = getTodayNaps().map((nap) => ({
    kind: nap.endDate ? "logged" : "active",
    start: nap.startDate,
    end: nap.endDate || now(),
  }));

  const futureSegments = plan.blocks
    .filter((block) => ["predicted", "night", "night-active"].includes(block.kind))
    .map((block) => ({
      kind: block.kind === "night-active" ? "night" : block.kind,
      start: block.start,
      end: block.end,
    }));

  return [...loggedNapSegments, ...futureSegments]
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

  els.planScale.innerHTML = markers.map((marker) => `<div class="scale-label">${marker.label}</div>`).join("");
}

function renderPlanTrack(plan) {
  const segments = getPlanSegments(plan);
  const rangeStart = plan.dayStart;
  const rangeEnd = plan.tomorrowWake;

  if (!segments.length) {
    els.planTrack.innerHTML = `<div class="plan-track-empty">No sleep logged yet. Naps and tonight's sleep will appear here as you go.</div>`;
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

function buildHistoryEntries(dateValue) {
  const rangeStart = combineDateAndTime(dateValue, "00:00");
  const rangeEnd = addDays(rangeStart, 1);
  const entries = [];

  getParsedNaps()
    .filter((nap) => nap.startDate >= rangeStart && nap.startDate < rangeEnd)
    .forEach((nap) => {
      entries.push({
        id: nap.id,
        type: "nap",
        sortDate: nap.startDate,
        timeLabel: nap.endDate
          ? `${formatClock(nap.startDate)} - ${formatClock(nap.endDate)}`
          : `${formatClock(nap.startDate)} - in progress`,
        title: "Nap",
        note: nap.endDate
          ? `${formatDuration((nap.endDate - nap.startDate) / 60000)} total sleep.`
          : "Currently still running.",
      });
    });

  getParsedFeeds()
    .filter((feed) => feed.timeDate >= rangeStart && feed.timeDate < rangeEnd)
    .forEach((feed) => {
      entries.push({
        id: feed.id,
        type: "feed",
        sortDate: feed.timeDate,
        timeLabel: formatClock(feed.timeDate),
        title: "Feed",
        note: formatFeedKind(feed.kind),
      });
    });

  getParsedNights()
    .filter((night) => {
      const endDate = night.endDate || now();
      return night.startDate < rangeEnd && endDate > rangeStart;
    })
    .forEach((night) => {
      const visibleStart = new Date(Math.max(night.startDate.getTime(), rangeStart.getTime()));
      const breakCount = (night.breaks || []).length;
      entries.push({
        id: night.id,
        type: "night",
        sortDate: visibleStart,
        timeLabel: `${formatClock(night.startDate)} - ${night.endDate ? formatClock(night.endDate) : "in progress"}`,
        title: "Night sleep",
        note: `${formatDuration(getNightDurationMinutes(night))} asleep${breakCount ? ` with ${breakCount} wake break${breakCount === 1 ? "" : "s"}` : ""}.`,
      });
    });

  return entries.sort((a, b) => a.sortDate - b.sortDate);
}

function renderTabs() {
  els.sleepTabButton.classList.toggle("is-active", ui.activeTab === "sleep");
  els.feedTabButton.classList.toggle("is-active", ui.activeTab === "feed");

  els.tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== ui.activeTab;
  });
}

function renderHistory() {
  const allEntries = buildHistoryEntries(ui.historyDate);
  const entries =
    ui.activeTab === "sleep"
      ? allEntries.filter((entry) => entry.type === "nap" || entry.type === "night")
      : allEntries.filter((entry) => entry.type === "feed");
  const napCount = allEntries.filter((entry) => entry.type === "nap").length;
  const feedCount = allEntries.filter((entry) => entry.type === "feed").length;
  const nightCount = allEntries.filter((entry) => entry.type === "night").length;

  els.historyEyebrow.textContent = ui.activeTab === "sleep" ? "Sleep history" : "Feed history";
  els.historyTitle.textContent = ui.activeTab === "sleep" ? "See one day at a time" : "See feeds by date";

  if (!entries.length) {
    els.historySummary.textContent =
      ui.activeTab === "sleep"
        ? `${formatDateLabel(ui.historyDate)} · no sleep logs yet`
        : `${formatDateLabel(ui.historyDate)} · no feeds logged yet`;
    els.historyList.innerHTML =
      ui.activeTab === "sleep"
        ? `<div class="empty-state">No naps or night sleep logged for this date yet.</div>`
        : `<div class="empty-state">No feeds logged for this date yet.</div>`;
    return;
  }

  const summaryParts =
    ui.activeTab === "sleep"
      ? [
          napCount ? `${napCount} nap${napCount === 1 ? "" : "s"}` : null,
          nightCount ? `${nightCount} night${nightCount === 1 ? "" : "s"}` : null,
        ].filter(Boolean)
      : [feedCount ? `${feedCount} feed${feedCount === 1 ? "" : "s"}` : null].filter(Boolean);

  els.historySummary.textContent = `${formatDateLabel(ui.historyDate)} · ${summaryParts.join(" · ")}`;
  els.historyList.innerHTML = entries
    .map(
      (entry) => `
        <article class="history-item">
          <div class="history-time">${entry.timeLabel}</div>
          <div class="history-copy">
            <strong>${entry.title}</strong>
            <p>${entry.note}</p>
          </div>
          <button class="history-delete" type="button" data-delete-type="${entry.type}" data-delete-id="${entry.id}">Delete</button>
        </article>
      `,
    )
    .join("");
}

function syncForm() {
  const { profile } = state;
  els.babyNameInput.value = profile.babyName;
  els.dateOfBirthInput.value = profile.dateOfBirth;
  els.dueDateInput.value = profile.dueDate;
  els.ageMonthsInput.value = profile.ageMonthsFallback;
  els.wakeTimeInput.value = profile.wakeTime;
  els.bedTimeInput.value = profile.bedTime;
}

function syncDateInputs() {
  els.historyDateInput.value = ui.historyDate;
  els.manualNapDateInput.value = ui.historyDate;
  els.manualFeedDateInput.value = ui.historyDate;
}

function render() {
  const sleepPlan = buildSleepPlan();
  const sleepSummary = getNextSleepSummary(sleepPlan);
  const napCopy = getQuickNapCopy(sleepPlan);
  const nightCopy = getQuickNightCopy();
  const feedPrediction = getNextFeedPrediction();
  const feedCopy = getQuickFeedCopy(feedPrediction);
  const ageInfo = getProfileAgeInfo();

  els.napHeadline.textContent = napCopy.headline;
  els.napNote.textContent = napCopy.note;
  els.napToggleButton.textContent = napCopy.button;
  els.napToggleButton.disabled = napCopy.disabled;

  els.nightHeadline.textContent = nightCopy.headline;
  els.nightNote.textContent = nightCopy.note;
  els.nightPrimaryButton.textContent = nightCopy.primary;
  els.nightSecondaryButton.hidden = !nightCopy.secondary;
  if (nightCopy.secondary) {
    els.nightSecondaryButton.textContent = nightCopy.secondary;
  }

  els.feedHeadline.textContent = feedCopy.headline;
  els.feedQuickNote.textContent = feedCopy.note;
  els.nextSleepMain.textContent = sleepSummary.main;
  els.nextSleepNote.textContent = sleepSummary.note;

  if (feedPrediction.nextTime) {
    const minutesAway = Math.round((feedPrediction.nextTime - now()) / 60000);
    els.nextFeedMain.textContent = `Around ${formatClock(feedPrediction.nextTime)}`;
    els.nextFeedNote.textContent =
      (minutesAway <= 0 ? "Feed could be due now." : `Likely in about ${formatDuration(minutesAway)}.`) +
      ` ${feedPrediction.suggestion}`;
  } else {
    els.nextFeedMain.textContent = "Waiting for feed data";
    els.nextFeedNote.textContent = feedPrediction.suggestion;
  }

  els.ageSummary.textContent = ageInfo.summary;

  renderTabs();
  renderPlanScale(sleepPlan);
  renderPlanTrack(sleepPlan);
  renderUpcoming(sleepPlan);
  renderHistory();
  saveState();
}

function startNap() {
  if (getActiveNap()) {
    return;
  }
  if (getActiveNight()) {
    window.alert("End the active night before starting a daytime nap.");
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

function startNight() {
  if (getActiveNight()) {
    return;
  }
  if (getActiveNap()) {
    window.alert("End the current nap before starting night sleep.");
    return;
  }

  state.nights.push({
    id: uid(),
    start: now().toISOString(),
    end: null,
    breaks: [],
  });
  render();
}

function startNightWake() {
  const activeNight = getActiveNight();
  if (!activeNight) {
    return;
  }
  const activeBreak = (activeNight.breaks || []).find((nightBreak) => !nightBreak.end);
  if (activeBreak) {
    return;
  }

  activeNight.breaks.push({
    id: uid(),
    start: now().toISOString(),
    end: null,
  });
  render();
}

function endNightWake() {
  const activeNight = getActiveNight();
  if (!activeNight) {
    return;
  }
  const activeBreak = (activeNight.breaks || []).find((nightBreak) => !nightBreak.end);
  if (!activeBreak) {
    return;
  }
  activeBreak.end = now().toISOString();
  render();
}

function endNight() {
  const activeNight = getActiveNight();
  if (!activeNight) {
    return;
  }
  const activeBreak = (activeNight.breaks || []).find((nightBreak) => !nightBreak.end);
  if (activeBreak) {
    activeBreak.end = now().toISOString();
  }
  activeNight.end = now().toISOString();
  render();
}

function addFeed(kind, timeDate = now(), shouldRender = true) {
  state.feeds.push({
    id: uid(),
    time: new Date(timeDate).toISOString(),
    kind,
  });
  if (shouldRender) {
    render();
  }
}

function addManualNap(dateValue, startTime, endTime) {
  const start = combineDateAndTime(dateValue, startTime);
  const end = combineDateAndTime(dateValue, endTime);

  if (end <= start) {
    window.alert("End time needs to be after the start time.");
    return false;
  }

  state.naps.push({
    id: uid(),
    start: start.toISOString(),
    end: end.toISOString(),
  });
  ui.historyDate = dateValue;
  render();
  return true;
}

function addManualFeed(dateValue, timeValue, kind) {
  ui.historyDate = dateValue;
  addFeed(kind, combineDateAndTime(dateValue, timeValue), false);
  render();
}

function deleteEntry(type, id) {
  if (type === "nap") {
    state.naps = state.naps.filter((nap) => nap.id !== id);
  }
  if (type === "night") {
    state.nights = state.nights.filter((night) => night.id !== id);
  }
  if (type === "feed") {
    state.feeds = state.feeds.filter((feed) => feed.id !== id);
  }
  render();
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "napper-web",
    version: 2,
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

els.nightPrimaryButton.addEventListener("click", () => {
  const activeNight = getActiveNightEvent();
  if (!activeNight) {
    startNight();
    return;
  }

  if (getActiveNightBreak(activeNight)) {
    endNightWake();
  } else {
    startNightWake();
  }
});

els.nightSecondaryButton.addEventListener("click", endNight);

els.feedLeftButton.addEventListener("click", () => addFeed("left"));
els.feedRightButton.addEventListener("click", () => addFeed("right"));
els.feedBothButton.addEventListener("click", () => addFeed("both"));
els.feedBottleButton.addEventListener("click", () => addFeed("bottle"));

els.sleepTabButton.addEventListener("click", () => {
  ui.activeTab = "sleep";
  render();
});

els.feedTabButton.addEventListener("click", () => {
  ui.activeTab = "feed";
  render();
});

els.manualNapForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const saved = addManualNap(
    els.manualNapDateInput.value,
    els.manualNapStartInput.value,
    els.manualNapEndInput.value,
  );
  if (saved) {
    els.manualNapStartInput.value = "";
    els.manualNapEndInput.value = "";
    syncDateInputs();
  }
});

els.manualFeedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addManualFeed(els.manualFeedDateInput.value, els.manualFeedTimeInput.value, els.manualFeedKindInput.value);
  els.manualFeedTimeInput.value = "";
  syncDateInputs();
});

els.historyDateInput.addEventListener("change", (event) => {
  ui.historyDate = event.target.value || formatDateInput(now());
  syncDateInputs();
  renderHistory();
});

els.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) {
    return;
  }

  if (window.confirm("Delete this entry?")) {
    deleteEntry(button.dataset.deleteType, button.dataset.deleteId);
  }
});

els.exportButton.addEventListener("click", exportData);
els.resetAllButton.addEventListener("click", () => {
  if (window.confirm("Reset the profile and remove all saved data on this device?")) {
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
    dateOfBirth: els.dateOfBirthInput.value || "",
    dueDate: els.dueDateInput.value || "",
    ageMonthsFallback: clamp(Number(els.ageMonthsInput.value) || 0, 0, 36),
    wakeTime: els.wakeTimeInput.value || "07:00",
    bedTime: els.bedTimeInput.value || "19:30",
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
