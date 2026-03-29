const STORAGE_KEY = "napper-web-state-v2";
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const sleepPriors = [
  { maxMonths: 2, wakeMinutes: 70, wakeRange: [45, 95], napMinutes: 95, naps: 5, totalDaySleep: 500, dayLengthMinutes: 720 },
  { maxMonths: 4, wakeMinutes: 100, wakeRange: [75, 140], napMinutes: 85, naps: 4, totalDaySleep: 380, dayLengthMinutes: 735 },
  { maxMonths: 6, wakeMinutes: 135, wakeRange: [105, 180], napMinutes: 80, naps: 3, totalDaySleep: 260, dayLengthMinutes: 750 },
  { maxMonths: 8, wakeMinutes: 165, wakeRange: [135, 210], napMinutes: 72, naps: 3, totalDaySleep: 230, dayLengthMinutes: 765 },
  { maxMonths: 12, wakeMinutes: 195, wakeRange: [160, 255], napMinutes: 70, naps: 2, totalDaySleep: 180, dayLengthMinutes: 780 },
  { maxMonths: 18, wakeMinutes: 255, wakeRange: [210, 330], napMinutes: 90, naps: 1, totalDaySleep: 150, dayLengthMinutes: 780 },
  { maxMonths: 36, wakeMinutes: 320, wakeRange: [260, 390], napMinutes: 85, naps: 1, totalDaySleep: 110, dayLengthMinutes: 810 },
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
  sunModeButton: document.querySelector("#sunModeButton"),
  moonModeButton: document.querySelector("#moonModeButton"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
  sleepModeEyebrow: document.querySelector("#sleepModeEyebrow"),
  sleepModeHeadline: document.querySelector("#sleepModeHeadline"),
  sleepModeNote: document.querySelector("#sleepModeNote"),
  napEditRow: document.querySelector("#napEditRow"),
  napStartTimeButton: document.querySelector("#napStartTimeButton"),
  napEndTimeButton: document.querySelector("#napEndTimeButton"),
  napTimeEditForm: document.querySelector("#napTimeEditForm"),
  napTimeEditInput: document.querySelector("#napTimeEditInput"),
  napTimeCancelButton: document.querySelector("#napTimeCancelButton"),
  sleepPrimaryButton: document.querySelector("#sleepPrimaryButton"),
  sleepSecondaryButton: document.querySelector("#sleepSecondaryButton"),
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
  sleepDateInput: document.querySelector("#sleepDateInput"),
  sleepDayEyebrow: document.querySelector("#sleepDayEyebrow"),
  sleepDayTitle: document.querySelector("#sleepDayTitle"),
  sleepDaySummary: document.querySelector("#sleepDaySummary"),
  planScale: document.querySelector("#planScale"),
  planTrack: document.querySelector("#planTrack"),
  sleepDayList: document.querySelector("#sleepDayList"),
  feedHistoryDateInput: document.querySelector("#feedHistoryDateInput"),
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

function formatTimeInput(dateLike) {
  const date = new Date(dateLike);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

function average(values) {
  if (!values.length) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
  sleepMode: "sun",
  napEditTarget: null,
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

function getEditableNap() {
  const activeNap = getActiveNap();
  if (activeNap) {
    return {
      ...activeNap,
      startDate: new Date(activeNap.start),
      endDate: null,
    };
  }

  const completedNaps = getCompletedNaps();
  return completedNaps.length ? completedNaps[completedNaps.length - 1] : null;
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function minutesIntoDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function dateAtMinutes(day, minutes) {
  return new Date(day.getTime() + minutes * 60000);
}

function getDayBoundsForDate(referenceDate = now()) {
  const referenceDay = startOfDay(referenceDate);
  const ageInfo = getProfileAgeInfo(referenceDate);
  const prior = getSleepPrior(ageInfo.ageMonths);
  const parsedNights = getParsedNights();
  const completedNights = parsedNights.filter((night) => night.endDate);
  const endingNightToday = completedNights.find((night) => isSameDay(night.endDate, referenceDay));
  const startingNightToday = parsedNights.find((night) => isSameDay(night.startDate, referenceDay));
  const recentWakeMinutes = completedNights.slice(-6).map((night) => minutesIntoDay(night.endDate));
  const recentBedMinutes = parsedNights.slice(-6).map((night) => minutesIntoDay(night.startDate));

  const wakeMinute = endingNightToday
    ? minutesIntoDay(endingNightToday.endDate)
    : clamp(Math.round(average(recentWakeMinutes) ?? 7 * 60), 5 * 60, 11 * 60);

  let bedMinute = startingNightToday
    ? minutesIntoDay(startingNightToday.startDate)
    : Math.round(average(recentBedMinutes) ?? wakeMinute + prior.dayLengthMinutes);

  const earliestBedMinute = wakeMinute + 8 * 60;
  const latestBedMinute = wakeMinute + 16 * 60;
  if (bedMinute < earliestBedMinute || bedMinute > latestBedMinute) {
    bedMinute = wakeMinute + prior.dayLengthMinutes;
  }

  return {
    dayStart: dateAtMinutes(referenceDay, wakeMinute),
    dayEnd: dateAtMinutes(referenceDay, bedMinute),
    prior,
  };
}

function getTodayBounds() {
  return getDayBoundsForDate(now());
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
    const wakeAnchor = previousEnd || getDayBoundsForDate(nap.startDate).dayStart;
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
  const tomorrowWake = getDayBoundsForDate(addDays(dayStart, 1)).dayStart;
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

function getPlanSegments(bounds, sleepPlan, isCurrentDate) {
  const rangeStart = bounds.dayStart;
  const rangeEnd = bounds.tomorrowWake;

  const actualSleepSegments = [
    ...getParsedNaps().map((nap) => ({
      kind: nap.endDate ? "logged" : "active",
      start: nap.startDate,
      end: nap.endDate || now(),
    })),
    ...getParsedNights().map((night) => ({
      kind: "night",
      start: night.startDate,
      end: night.endDate || now(),
    })),
  ];

  const futureSegments =
    isCurrentDate && sleepPlan
      ? sleepPlan.blocks
          .filter((block) => ["predicted", "night", "night-active"].includes(block.kind))
          .map((block) => ({
            kind: block.kind === "night-active" ? "night" : block.kind,
            start: block.start,
            end: block.end,
          }))
      : [];

  return [...actualSleepSegments, ...futureSegments]
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

function renderPlanTrack(bounds, isCurrentDate, sleepPlan) {
  const segments = getPlanSegments(bounds, sleepPlan, isCurrentDate);
  const rangeStart = bounds.dayStart;
  const rangeEnd = bounds.tomorrowWake;

  if (!segments.length) {
    els.planTrack.innerHTML = `<div class="plan-track-empty">${
      isCurrentDate
        ? "No sleep logged yet. Naps and tonight's sleep will appear here as you go."
        : "No sleep logged for this date yet."
    }</div>`;
    return;
  }

  const segmentMarkup = segments
    .map(
      (segment) =>
        `<div class="plan-segment plan-segment-${segment.kind}" style="left:${segment.left}%;width:${segment.width}%"></div>`,
    )
    .join("");

  if (!isCurrentDate) {
    els.planTrack.innerHTML = segmentMarkup;
    return;
  }

  const nowPosition = clamp(((now() - rangeStart) / (rangeEnd - rangeStart)) * 100, 0, 100);
  els.planTrack.innerHTML = `${segmentMarkup}<div class="plan-now-marker" style="left:${nowPosition}%"></div>`;
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
  els.sunModeButton.classList.toggle("is-active", ui.sleepMode === "sun");
  els.moonModeButton.classList.toggle("is-active", ui.sleepMode === "moon");

  els.tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== ui.activeTab;
  });
}

function renderNapTimeEditor() {
  if (ui.sleepMode !== "sun") {
    els.napEditRow.hidden = true;
    els.napTimeEditForm.hidden = true;
    ui.napEditTarget = null;
    return;
  }

  const editableNap = getEditableNap();
  if (!editableNap) {
    els.napEditRow.hidden = true;
    els.napTimeEditForm.hidden = true;
    ui.napEditTarget = null;
    return;
  }

  els.napEditRow.hidden = false;
  els.napStartTimeButton.textContent = `Start ${formatClock(editableNap.startDate)}`;
  els.napStartTimeButton.dataset.napId = editableNap.id;
  els.napStartTimeButton.dataset.field = "start";

  if (editableNap.endDate) {
    els.napEndTimeButton.hidden = false;
    els.napEndTimeButton.textContent = `End ${formatClock(editableNap.endDate)}`;
    els.napEndTimeButton.dataset.napId = editableNap.id;
    els.napEndTimeButton.dataset.field = "end";
  } else {
    els.napEndTimeButton.hidden = true;
    delete els.napEndTimeButton.dataset.napId;
    delete els.napEndTimeButton.dataset.field;
  }

  if (!ui.napEditTarget || ui.napEditTarget.napId !== editableNap.id) {
    els.napTimeEditForm.hidden = true;
    ui.napEditTarget = null;
    return;
  }

  const valueDate = ui.napEditTarget.field === "start" ? editableNap.startDate : editableNap.endDate;
  if (!valueDate) {
    els.napTimeEditForm.hidden = true;
    ui.napEditTarget = null;
    return;
  }

  els.napTimeEditForm.hidden = false;
  els.napTimeEditInput.value = formatTimeInput(valueDate);
}

function renderFeedHistory() {
  const allEntries = buildHistoryEntries(ui.historyDate);
  const entries = allEntries.filter((entry) => entry.type === "feed");
  const feedCount = entries.length;

  if (!entries.length) {
    els.historySummary.textContent = `${formatDateLabel(ui.historyDate)} · no feeds logged yet`;
    els.historyList.innerHTML = `<div class="empty-state">No feeds logged for this date yet.</div>`;
    return;
  }

  els.historySummary.textContent = `${formatDateLabel(ui.historyDate)} · ${feedCount} feed${
    feedCount === 1 ? "" : "s"
  }`;
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

function renderSleepDayView(sleepPlan) {
  const isCurrentDate = ui.historyDate === formatDateInput(now());
  const dateReference = parseDateValue(ui.historyDate);
  const bounds = isCurrentDate
    ? sleepPlan
    : {
        ...getDayBoundsForDate(dateReference),
        tomorrowWake: getDayBoundsForDate(addDays(dateReference, 1)).dayStart,
      };

  const sleepEntries = buildHistoryEntries(ui.historyDate).filter(
    (entry) => entry.type === "nap" || entry.type === "night",
  );
  const predictedEntries = isCurrentDate
    ? sleepPlan.blocks
        .filter((block) => block.kind === "predicted" || block.kind === "night")
        .map((block) => ({
          sortDate: block.start,
          timeLabel: `${formatClock(block.start)} - ${formatClock(block.end)}`,
          title: block.title,
          note: block.note,
        }))
    : [];

  const dayEntries = [...sleepEntries, ...predictedEntries].sort((a, b) => a.sortDate - b.sortDate);
  const napCount = sleepEntries.filter((entry) => entry.type === "nap").length;
  const nightCount = sleepEntries.filter((entry) => entry.type === "night").length;
  const summaryParts = [
    napCount ? `${napCount} nap${napCount === 1 ? "" : "s"}` : null,
    nightCount ? `${nightCount} night${nightCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  els.sleepDayEyebrow.textContent = isCurrentDate ? "Sleep day view" : "Sleep history";
  els.sleepDayTitle.textContent = isCurrentDate
    ? "Today and tonight"
    : `Sleep on ${formatDateLabel(ui.historyDate)}`;
  els.nextSleepMain.textContent = isCurrentDate ? els.nextSleepMain.textContent : `Logged sleep on ${formatDateLabel(ui.historyDate)}`;
  els.nextSleepNote.textContent = isCurrentDate
    ? els.nextSleepNote.textContent
    : "Predictions only show for today. Past dates show the actual logged sleep day.";

  renderPlanScale(bounds);
  renderPlanTrack(bounds, isCurrentDate, sleepPlan);

  els.sleepDaySummary.textContent = summaryParts.length
    ? `${formatDateLabel(ui.historyDate)} · ${summaryParts.join(" · ")}`
    : `${formatDateLabel(ui.historyDate)} · no sleep logs yet`;

  if (!dayEntries.length) {
    els.sleepDayList.innerHTML = `<div class="empty-state">No sleep logged for this date yet.</div>`;
    return;
  }

  els.sleepDayList.innerHTML = dayEntries
    .map(
      (entry) => `
        <article class="upcoming-card">
          <div class="upcoming-card-time">${entry.timeLabel}</div>
          <div class="upcoming-card-copy">
            <strong>${entry.title}</strong>
            <p>${entry.note}</p>
          </div>
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
}

function syncDateInputs() {
  els.sleepDateInput.value = ui.historyDate;
  els.feedHistoryDateInput.value = ui.historyDate;
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

  if (ui.sleepMode === "sun") {
    els.sleepModeEyebrow.textContent = "Nap";
    els.sleepModeHeadline.textContent = napCopy.headline;
    els.sleepModeNote.textContent = napCopy.note;
    els.sleepPrimaryButton.textContent = napCopy.button;
    els.sleepPrimaryButton.disabled = napCopy.disabled;
    els.sleepSecondaryButton.hidden = true;
  } else {
    els.sleepModeEyebrow.textContent = "Night";
    els.sleepModeHeadline.textContent = nightCopy.headline;
    els.sleepModeNote.textContent = nightCopy.note;
    els.sleepPrimaryButton.textContent = nightCopy.primary;
    els.sleepPrimaryButton.disabled = false;
    els.sleepSecondaryButton.hidden = !nightCopy.secondary;
    if (nightCopy.secondary) {
      els.sleepSecondaryButton.textContent = nightCopy.secondary;
    }
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
  renderNapTimeEditor();
  renderSleepDayView(sleepPlan);
  renderFeedHistory();
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

function updateNapTime(napId, field, timeValue) {
  const nap = state.naps.find((item) => item.id === napId);
  if (!nap) {
    return;
  }

  const currentStart = new Date(nap.start);
  const currentEnd = nap.end ? new Date(nap.end) : null;
  const baseDate = field === "start" ? currentStart : currentEnd;
  if (!baseDate) {
    return;
  }

  const updatedDate = combineDateAndTime(formatDateInput(baseDate), timeValue);

  if (field === "start") {
    if (currentEnd && updatedDate >= currentEnd) {
      window.alert("Start time needs to be before the end time.");
      return;
    }
    nap.start = updatedDate.toISOString();
  } else {
    if (updatedDate <= currentStart) {
      window.alert("End time needs to be after the start time.");
      return;
    }
    nap.end = updatedDate.toISOString();
  }

  ui.napEditTarget = null;
  render();
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

els.sleepPrimaryButton.addEventListener("click", () => {
  if (ui.sleepMode === "sun") {
    if (getActiveNap()) {
      endNap();
    } else {
      startNap();
    }
    return;
  }

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

els.sleepSecondaryButton.addEventListener("click", () => {
  if (ui.sleepMode === "moon") {
    endNight();
  }
});

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

els.sunModeButton.addEventListener("click", () => {
  ui.sleepMode = "sun";
  render();
});

els.moonModeButton.addEventListener("click", () => {
  ui.sleepMode = "moon";
  render();
});

els.napEditRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-nap-id]");
  if (!button) {
    return;
  }

  ui.napEditTarget = {
    napId: button.dataset.napId,
    field: button.dataset.field,
  };
  render();

  if (typeof els.napTimeEditInput.showPicker === "function") {
    els.napTimeEditInput.showPicker();
  } else {
    els.napTimeEditInput.focus();
  }
});

els.napTimeEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ui.napEditTarget) {
    return;
  }
  updateNapTime(ui.napEditTarget.napId, ui.napEditTarget.field, els.napTimeEditInput.value);
});

els.napTimeCancelButton.addEventListener("click", () => {
  ui.napEditTarget = null;
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

function handleDateChange(value) {
  ui.historyDate = value || formatDateInput(now());
  syncDateInputs();
  render();
}

els.sleepDateInput.addEventListener("change", (event) => {
  handleDateChange(event.target.value);
});

els.feedHistoryDateInput.addEventListener("change", (event) => {
  handleDateChange(event.target.value);
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
