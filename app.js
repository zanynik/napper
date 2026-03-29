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
  topBarEyebrow: document.querySelector("#topBarEyebrow"),
  topBarTitle: document.querySelector("#topBarTitle"),
  sleepTabButton: document.querySelector("#sleepTabButton"),
  feedTabButton: document.querySelector("#feedTabButton"),
  settingsTabButton: document.querySelector("#settingsTabButton"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
  sleepModeEyebrow: document.querySelector("#sleepModeEyebrow"),
  sleepModeHeadline: document.querySelector("#sleepModeHeadline"),
  sleepModeNote: document.querySelector("#sleepModeNote"),
  sleepModeTimer: document.querySelector("#sleepModeTimer"),
  sleepModeTimerPrimaryLabel: document.querySelector("#sleepModeTimerPrimaryLabel"),
  sleepModeTimerValue: document.querySelector("#sleepModeTimerValue"),
  sleepModeTimerSecondaryLabel: document.querySelector("#sleepModeTimerSecondaryLabel"),
  sleepModeTimerEnd: document.querySelector("#sleepModeTimerEnd"),
  sleepLivePanel: document.querySelector("#sleepLivePanel"),
  napStartTimeButton: document.querySelector("#napStartTimeButton"),
  napAdjustRow: document.querySelector("#napAdjustRow"),
  napAdjustMinusFive: document.querySelector("#napAdjustMinusFive"),
  napAdjustMinusOne: document.querySelector("#napAdjustMinusOne"),
  napAdjustPlusOne: document.querySelector("#napAdjustPlusOne"),
  napAdjustPlusFive: document.querySelector("#napAdjustPlusFive"),
  sleepPrimaryButton: document.querySelector("#sleepPrimaryButton"),
  sleepModeSwitchButton: document.querySelector("#sleepModeSwitchButton"),
  sleepSecondaryButton: document.querySelector("#sleepSecondaryButton"),
  feedHeadline: document.querySelector("#feedHeadline"),
  feedQuickNote: document.querySelector("#feedQuickNote"),
  feedLeftButton: document.querySelector("#feedLeftButton"),
  feedRightButton: document.querySelector("#feedRightButton"),
  feedBothButton: document.querySelector("#feedBothButton"),
  feedBottleButton: document.querySelector("#feedBottleButton"),
  nextSleepEyebrow: document.querySelector("#nextSleepEyebrow"),
  nextSleepMain: document.querySelector("#nextSleepMain"),
  nextSleepNote: document.querySelector("#nextSleepNote"),
  nextFeedMain: document.querySelector("#nextFeedMain"),
  nextFeedNote: document.querySelector("#nextFeedNote"),
  sleepDateStrip: document.querySelector("#sleepDateStrip"),
  sleepDayEyebrow: document.querySelector("#sleepDayEyebrow"),
  sleepDayTitle: document.querySelector("#sleepDayTitle"),
  sleepDaySummary: document.querySelector("#sleepDaySummary"),
  planTrack: document.querySelector("#planTrack"),
  sleepRingStartLabel: document.querySelector("#sleepRingStartLabel"),
  sleepRingEndLabel: document.querySelector("#sleepRingEndLabel"),
  sleepDayList: document.querySelector("#sleepDayList"),
  addSleepEntryButton: document.querySelector("#addSleepEntryButton"),
  sleepDetailsOverlay: document.querySelector("#sleepDetailsOverlay"),
  sleepDetailsTitle: document.querySelector("#sleepDetailsTitle"),
  sleepDetailsCloseButton: document.querySelector("#sleepDetailsCloseButton"),
  feedDateStrip: document.querySelector("#feedDateStrip"),
  openFeedDetailsButton: document.querySelector("#openFeedDetailsButton"),
  historyEyebrow: document.querySelector("#historyEyebrow"),
  historyTitle: document.querySelector("#historyTitle"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  addFeedEntryButton: document.querySelector("#addFeedEntryButton"),
  feedDetailsOverlay: document.querySelector("#feedDetailsOverlay"),
  feedDetailsTitle: document.querySelector("#feedDetailsTitle"),
  feedDetailsCloseButton: document.querySelector("#feedDetailsCloseButton"),
  manualNapForm: document.querySelector("#manualNapForm"),
  manualSleepStartLabel: document.querySelector("#manualSleepStartLabel"),
  manualSleepEndLabel: document.querySelector("#manualSleepEndLabel"),
  manualSleepSaveButton: document.querySelector("#manualSleepSaveButton"),
  manualNapStartInput: document.querySelector("#manualNapStartInput"),
  manualNapEndInput: document.querySelector("#manualNapEndInput"),
  manualFeedForm: document.querySelector("#manualFeedForm"),
  manualFeedTimeInput: document.querySelector("#manualFeedTimeInput"),
  manualFeedKindInput: document.querySelector("#manualFeedKindInput"),
  settingsForm: document.querySelector("#settingsForm"),
  ageSummary: document.querySelector("#ageSummary"),
  babyNameInput: document.querySelector("#babyNameInput"),
  dateOfBirthInput: document.querySelector("#dateOfBirthInput"),
  dueDateInput: document.querySelector("#dueDateInput"),
  ageDisplayInput: document.querySelector("#ageDisplayInput"),
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

function formatTimerDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
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

function overlapsRange(start, end, rangeStart, rangeEnd) {
  return end > rangeStart && start < rangeEnd;
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

function getProfileAgeInfo(referenceDate = now(), profile = state.profile) {
  const today = startOfDay(referenceDate);
  const birthValue = profile.dateOfBirth;
  const dueValue = profile.dueDate;
  const fallbackMonths = clamp(Number(profile.ageMonthsFallback) || 0, 0, 36);

  if (isValidDateValue(birthValue)) {
    const birthDate = parseDateValue(birthValue);
    const chronologicalDays = Math.max(0, Math.floor((today - birthDate) / MS_IN_DAY));
    let effectiveDays = chronologicalDays;
    let summary = `Age ${humanizeAge(chronologicalDays)}.`;
    let display = humanizeAge(chronologicalDays);

    if (isValidDateValue(dueValue)) {
      const dueDate = parseDateValue(dueValue);
      if (dueDate > birthDate) {
        effectiveDays = Math.max(0, Math.floor((today - dueDate) / MS_IN_DAY));
        summary = `Chronological age ${humanizeAge(chronologicalDays)}. Corrected age ${humanizeAge(
          effectiveDays,
        )}.`;
        display = `${humanizeAge(effectiveDays)} corrected`;
      }
    }

    return {
      ageMonths: effectiveDays / 30.4375,
      display,
      summary,
      source: "dates",
    };
  }

  return {
    ageMonths: fallbackMonths,
    display: `${fallbackMonths} month${fallbackMonths === 1 ? "" : "s"}`,
    summary: `Using manual age ${fallbackMonths} months. Add date of birth for more precise age-based predictions.`,
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
  openComposer: null,
  sleepDetailsOpen: false,
  feedDetailsOpen: false,
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
  ui.openComposer = null;
  ui.sleepDetailsOpen = false;
  ui.feedDetailsOpen = false;
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

function getActiveNapTimerData(model = getSleepPredictionModel()) {
  const activeNap = getActiveNap();
  if (!activeNap) {
    return null;
  }

  const startDate = new Date(activeNap.start);
  const predictedEnd = new Date(startDate.getTime() + model.napBase * 60000);
  const elapsedMs = Math.max(0, now() - startDate);
  const remainingMs = predictedEnd - now();

  return {
    startDate,
    predictedEnd,
    elapsedMs,
    remainingMs,
    isOverdue: remainingMs < 0,
  };
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

function getNightFragmentationStats(night) {
  if (!night?.startDate || !night?.endDate) {
    return null;
  }

  const timeInBedMinutes = Math.max(0, (night.endDate - night.startDate) / 60000);
  const awakeMinutes = (night.breaks || []).reduce((sum, nightBreak) => {
    if (!nightBreak.startDate) {
      return sum;
    }
    const breakEnd = nightBreak.endDate || night.endDate;
    return sum + Math.max(0, (breakEnd - nightBreak.startDate) / 60000);
  }, 0);
  const asleepMinutes = Math.max(0, timeInBedMinutes - awakeMinutes);

  return {
    breakCount: (night.breaks || []).length,
    timeInBedMinutes,
    awakeMinutes,
    asleepMinutes,
    sleepEfficiency: timeInBedMinutes ? asleepMinutes / timeInBedMinutes : 0,
  };
}

function getNightFragmentationAdjustment(referenceDate = now()) {
  const completedNights = getParsedNights()
    .filter((night) => night.endDate && night.endDate <= referenceDate)
    .sort((a, b) => a.endDate - b.endDate);
  const lastNight = completedNights[completedNights.length - 1] || null;

  if (!lastNight || !isSameDay(lastNight.endDate, referenceDate)) {
    return {
      applies: false,
      firstWakeReduction: 0,
      confidencePenalty: 0,
      note: "",
    };
  }

  const baselineNights = completedNights.slice(-7, -1);
  if (baselineNights.length < 2) {
    return {
      applies: false,
      firstWakeReduction: 0,
      confidencePenalty: 0,
      note: "",
    };
  }

  const lastStats = getNightFragmentationStats(lastNight);
  const baselineStats = baselineNights.map(getNightFragmentationStats).filter(Boolean);
  if (!lastStats || !baselineStats.length) {
    return {
      applies: false,
      firstWakeReduction: 0,
      confidencePenalty: 0,
      note: "",
    };
  }

  const baselineAwake = average(baselineStats.map((stats) => stats.awakeMinutes)) || 0;
  const baselineBreaks = average(baselineStats.map((stats) => stats.breakCount)) || 0;
  const baselineEfficiency = average(baselineStats.map((stats) => stats.sleepEfficiency)) || 0;
  const awakeDelta = Math.max(0, lastStats.awakeMinutes - baselineAwake);
  const breakDelta = Math.max(0, lastStats.breakCount - baselineBreaks);
  const efficiencyDelta = Math.max(0, baselineEfficiency - lastStats.sleepEfficiency);
  const ageMonths = getProfileAgeInfo(referenceDate).ageMonths;
  const ageWeight = clamp(1.05 - ageMonths * 0.08, 0.35, 1);

  // Keep the night-fragmentation effect intentionally modest: infant longitudinal
  // actigraphy does not support a large next-day nap-compensation effect.
  const severity = clamp(awakeDelta / 25 + breakDelta * 0.35 + efficiencyDelta * 7, 0, 1.6);
  const firstWakeReduction = Math.round(clamp(severity * 10 * ageWeight, 0, 12));
  const confidencePenalty = Math.round(clamp(severity * 8 + awakeDelta / 18, 0, 18));

  if (!firstWakeReduction && !confidencePenalty) {
    return {
      applies: false,
      firstWakeReduction: 0,
      confidencePenalty: 0,
      note: "",
    };
  }

  return {
    applies: true,
    firstWakeReduction,
    confidencePenalty,
    note: firstWakeReduction ? " First nap nudged a bit earlier after a more wakeful night." : "",
  };
}

function getSleepPredictionModel() {
  const ageInfo = getProfileAgeInfo();
  const prior = getSleepPrior(ageInfo.ageMonths);
  const wakeSeries = recentWakeWindows();
  const napSeries = recentNapLengths();
  const fragmentationAdjustment = getNightFragmentationAdjustment();
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
    confidenceScore: clamp(
      97 - wakeDeviation * 0.95 - Math.max(0, 4 - wakeSeries.length) * 10 - fragmentationAdjustment.confidencePenalty,
      30,
      96,
    ),
    fragmentationAdjustment,
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
    const nightRecoveryAdjustment =
      !activeNap && napIndex === 0 ? model.fragmentationAdjustment.firstWakeReduction : 0;
    const targetWake = clamp(
      model.wakeBase * wakeFactor - circadianMinutes + shortNapAdjustment + sleepPressureBudget - nightRecoveryAdjustment,
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
      note: `${formatDuration(targetNap)} sleep after about ${formatDuration(targetWake)} awake.${
        napIndex === 0 ? model.fragmentationAdjustment.note : ""
      }`,
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

function buildForecastSleepPlanForDate(dateValue) {
  const referenceDay = parseDateValue(dateValue);
  const { dayStart, dayEnd } = getDayBoundsForDate(referenceDay);
  const tomorrowWake = getDayBoundsForDate(addDays(referenceDay, 1)).dayStart;
  const model = getSleepPredictionModel();
  const blocks = [];
  let cursor = dayStart;

  for (let napIndex = 0; napIndex < model.prior.naps + 1; napIndex += 1) {
    const progression = clamp(napIndex / Math.max(1, model.prior.naps), 0, 1);
    const wakeFactor = 0.86 + 0.24 * Math.sqrt(progression);
    const roughStart = new Date(cursor.getTime() + model.wakeBase * wakeFactor * 60000);
    const circadianMinutes = circadianAdjustment(roughStart, model.ageInfo.ageMonths);
    const targetWake = clamp(
      model.wakeBase * wakeFactor - circadianMinutes,
      model.prior.wakeRange[0],
      model.prior.wakeRange[1],
    );
    const start = new Date(cursor.getTime() + targetWake * 60000);
    if (start >= dayEnd) {
      break;
    }

    const napScale = napIndex === 0 ? 1.05 : napIndex >= model.prior.naps - 1 ? 0.85 : 1;
    const targetNap = clamp(model.napBase * napScale, 25, 150);
    const end = new Date(Math.min(start.getTime() + targetNap * 60000, dayEnd.getTime()));

    blocks.push({
      kind: "predicted",
      start,
      end,
      title: napIndex >= model.prior.naps - 1 ? "Last nap" : `Nap ${napIndex + 1}`,
      note: `${formatDuration(targetNap)} sleep after about ${formatDuration(targetWake)} awake.`,
    });

    cursor = end;
  }

  blocks.push({
    kind: "night",
    start: dayEnd,
    end: tomorrowWake,
    title: "Night sleep",
    note: `Bedtime around ${formatClock(dayEnd)} and next wake around ${formatClock(tomorrowWake)} the next morning.`,
  });

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
    const timer = getActiveNapTimerData(plan.model);
    return {
      headline: `${state.profile.babyName} is napping`,
      note: `Started at ${formatClock(activeNap.start)}. Predicted wake around ${formatClock(timer.predictedEnd)}.`,
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

function getSleepSectionMeta(dateValue, isCurrentDate) {
  const dateLabel = formatDateLabel(dateValue);

  if (ui.sleepMode === "sun") {
    return {
      panelEyebrow: "Sleep",
      panelTitle: isCurrentDate ? "Daytime" : `Daytime on ${dateLabel}`,
      nextEyebrow: isCurrentDate ? "Today" : "Daytime summary",
      emptyState: isCurrentDate
        ? "No naps logged yet. Daytime naps and predictions will appear here as you go."
        : "No daytime naps logged for this date yet.",
      summaryFallback: `${dateLabel} · no naps logged yet`,
    };
  }

  return {
    panelEyebrow: "Sleep",
    panelTitle: isCurrentDate ? "Tonight" : `Night of ${dateLabel}`,
    nextEyebrow: isCurrentDate ? "Tonight" : "Night summary",
    emptyState: isCurrentDate
      ? "Tonight's sleep will appear here once bedtime is logged."
      : "No night sleep logged for this date yet.",
    summaryFallback: `${dateLabel} night · no night sleep logged yet`,
  };
}

function getSleepSectionBounds(dateValue, sleepPlan) {
  const dateReference = parseDateValue(dateValue);
  const baseBounds = sleepPlan || {
    ...getDayBoundsForDate(dateReference),
    tomorrowWake: getDayBoundsForDate(addDays(dateReference, 1)).dayStart,
  };

  return ui.sleepMode === "sun"
    ? {
        ...baseBounds,
        rangeStart: baseBounds.dayStart,
        rangeEnd: baseBounds.dayEnd,
      }
    : {
        ...baseBounds,
        rangeStart: baseBounds.dayEnd,
        rangeEnd: baseBounds.tomorrowWake,
      };
}

function buildSleepSectionEntries(bounds, includePredictions, sleepPlan) {
  const actualEntries =
    ui.sleepMode === "sun"
      ? getParsedNaps()
          .filter((nap) => overlapsRange(nap.startDate, nap.endDate || now(), bounds.rangeStart, bounds.rangeEnd))
          .map((nap) => ({
            id: nap.id,
            type: "nap",
            variant: "sun",
            sortDate: nap.startDate,
            timeLabel: nap.endDate
              ? `${formatClock(nap.startDate)} - ${formatClock(nap.endDate)}`
              : `${formatClock(nap.startDate)} - in progress`,
            title: "Nap",
            note: nap.endDate
              ? `${formatDuration((nap.endDate - nap.startDate) / 60000)} total sleep.`
              : "Currently still running.",
            durationMinutes: nap.endDate ? (nap.endDate - nap.startDate) / 60000 : Math.max(0, (now() - nap.startDate) / 60000),
            isPredicted: false,
          }))
      : getParsedNights()
          .filter((night) =>
            overlapsRange(night.startDate, night.endDate || now(), bounds.rangeStart, bounds.rangeEnd),
          )
          .flatMap((night) => {
            const breakCount = (night.breaks || []).length;
            const entries = [
              {
                id: night.id,
                type: "night",
                variant: "moon",
                sortDate: night.startDate,
                timeLabel: `${formatClock(night.startDate)} - ${night.endDate ? formatClock(night.endDate) : "in progress"}`,
                title: "Night sleep",
                note: `${formatDuration(getNightDurationMinutes(night))} asleep${
                  breakCount ? ` with ${breakCount} wake break${breakCount === 1 ? "" : "s"}` : ""
                }.`,
                durationMinutes: getNightDurationMinutes(night),
                isPredicted: false,
              },
            ];

            (night.breaks || [])
              .filter((nightBreak) =>
                overlapsRange(nightBreak.startDate, nightBreak.endDate || now(), bounds.rangeStart, bounds.rangeEnd),
              )
              .forEach((nightBreak) => {
                entries.push({
                  id: nightBreak.id,
                  type: "break",
                  parentId: night.id,
                  variant: "moon",
                  sortDate: nightBreak.startDate,
                  timeLabel: `${formatClock(nightBreak.startDate)} - ${
                    nightBreak.endDate ? formatClock(nightBreak.endDate) : "in progress"
                  }`,
                  title: "Wake break",
                  note: nightBreak.endDate
                    ? `${formatDuration((nightBreak.endDate - nightBreak.startDate) / 60000)} awake.`
                    : "Wake break is still running.",
                  durationMinutes: nightBreak.endDate
                    ? (nightBreak.endDate - nightBreak.startDate) / 60000
                    : Math.max(0, (now() - nightBreak.startDate) / 60000),
                  isPredicted: false,
                });
              });

            return entries;
          });

  const predictedEntries = includePredictions && sleepPlan
    ? sleepPlan.blocks
        .filter((block) => (ui.sleepMode === "sun" ? block.kind === "predicted" : block.kind === "night"))
        .filter((block) => overlapsRange(block.start, block.end, bounds.rangeStart, bounds.rangeEnd))
        .map((block) => ({
          sortDate: block.start,
          variant: ui.sleepMode,
          timeLabel: `${formatClock(block.start)} - ${formatClock(block.end)}`,
          title: block.title,
          note: block.note,
          durationMinutes: (block.end - block.start) / 60000,
          isPredicted: true,
        }))
    : [];

  return [...actualEntries, ...predictedEntries].sort((a, b) => a.sortDate - b.sortDate);
}

function getSleepSectionOverview(dateValue, isCurrentDate, isFutureDate, sleepPlan, bounds) {
  const dateLabel = formatDateLabel(dateValue);

  if (isFutureDate) {
    const predictions = sleepPlan.blocks.filter((block) =>
      ui.sleepMode === "sun" ? block.kind === "predicted" : block.kind === "night",
    );
    const timeSummary = predictions.map((block) => formatClock(block.start)).join(", ");

    return ui.sleepMode === "sun"
      ? {
          main: `Predicted naps for ${dateLabel}`,
          note: predictions.length ? `Likely naps around ${timeSummary}.` : "Prediction is still building for this day.",
        }
      : {
          main: `Predicted night for ${dateLabel}`,
          note: `Bedtime around ${formatClock(bounds.dayEnd)} and wake around ${formatClock(bounds.tomorrowWake)}.`,
        };
  }

  if (!isCurrentDate) {
    return ui.sleepMode === "sun"
      ? {
          main: `Logged daytime sleep on ${dateLabel}`,
          note: "Naps between the first wake and bedtime appear below.",
        }
      : {
          main: `Logged night for ${dateLabel}`,
          note: "This view follows the bedtime on that date into the next morning.",
        };
  }

  if (ui.sleepMode === "sun") {
    const activeNap = getActiveNap();
    const activeNapStart = activeNap ? new Date(activeNap.start) : null;
    if (activeNapStart && overlapsRange(activeNapStart, now(), bounds.rangeStart, bounds.rangeEnd)) {
      const end = new Date(activeNapStart.getTime() + sleepPlan.model.napBase * 60000);
      return {
        main: `${state.profile.babyName} is napping now`,
        note: `Likely awake around ${formatClock(end)}.`,
      };
    }

    const nextNap = sleepPlan.blocks.find((block) => block.kind === "predicted" && block.end > now());
    if (nextNap) {
      return {
        main: `Next nap around ${formatClock(nextNap.start)}`,
        note: nextNap.note,
      };
    }

    return {
      main: `Daytime sleep is wrapping up`,
      note: `Bedtime looks to be around ${formatClock(bounds.dayEnd)}.`,
    };
  }

  const activeNight = getActiveNightEvent();
  if (activeNight && overlapsRange(activeNight.startDate, now(), bounds.rangeStart, bounds.rangeEnd)) {
    const activeBreak = getActiveNightBreak(activeNight);
    return activeBreak
      ? {
          main: `${state.profile.babyName} is awake tonight`,
          note: `Wake started at ${formatClock(activeBreak.startDate)}. Use Back asleep or Final wake above when ready.`,
        }
      : {
          main: `Night started at ${formatClock(activeNight.startDate)}`,
          note: `Final wake is expected around ${formatClock(bounds.tomorrowWake)} tomorrow.`,
        };
  }

  return {
    main: `Bedtime around ${formatClock(bounds.dayEnd)}`,
    note: `Next wake is likely around ${formatClock(bounds.tomorrowWake)} tomorrow.`,
  };
}

function getPlanSegments(bounds, sleepPlan, includePredictions) {
  const rangeStart = bounds.rangeStart;
  const rangeEnd = bounds.rangeEnd;

  const actualSleepSegments =
    ui.sleepMode === "sun"
      ? getParsedNaps().map((nap) => ({
          kind: nap.endDate ? "sun-logged" : "sun-active",
          start: nap.startDate,
          end: nap.endDate || now(),
        }))
      : getParsedNights().flatMap((night) => {
          const segments = [];
          const nightEnd = night.endDate || bounds.rangeEnd;
          let cursor = night.startDate;

          (night.breaks || []).forEach((nightBreak) => {
            const breakEnd = nightBreak.endDate || now();
            if (nightBreak.startDate > cursor) {
              segments.push({
                kind: night.endDate ? "moon-logged" : "moon-active",
                start: cursor,
                end: nightBreak.startDate,
              });
            }

            segments.push({
              kind: "moon-break",
              start: nightBreak.startDate,
              end: breakEnd,
            });

            cursor = breakEnd;
          });

          if (nightEnd > cursor) {
            segments.push({
              kind: night.endDate ? "moon-logged" : "moon-active",
              start: cursor,
              end: nightEnd,
            });
          }

          return segments;
        });

  const futureSegments =
    includePredictions && sleepPlan
      ? sleepPlan.blocks
          .filter((block) => (ui.sleepMode === "sun" ? block.kind === "predicted" : block.kind === "night"))
          .map((block) => ({
            kind: ui.sleepMode === "sun" ? "sun-predicted" : "moon-predicted",
            start: block.start,
            end: block.end,
          }))
      : [];

  return [...actualSleepSegments, ...futureSegments]
    .filter((segment) => segment.end > rangeStart && segment.start < rangeEnd)
    .map((segment) => ({
      ...segment,
      progressStart: clamp((segment.start - rangeStart) / (rangeEnd - rangeStart), 0, 1),
      progressEnd: clamp((segment.end - rangeStart) / (rangeEnd - rangeStart), 0, 1),
    }));
}

function renderPlanTrack(bounds, includePredictions, sleepPlan) {
  const segments = getPlanSegments(bounds, sleepPlan, includePredictions);
  const rangeStart = bounds.rangeStart;
  const rangeEnd = bounds.rangeEnd;
  const radius = 132;
  const center = 160;
  const startAngle = -135;
  const totalAngle = 270;
  const backgroundEndAngle = startAngle + totalAngle;

  const angleFor = (progress) => startAngle + progress * totalAngle;
  const polarToCartesian = (angle, radiusValue) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radiusValue * Math.cos(radians),
      y: center + radiusValue * Math.sin(radians),
    };
  };
  const describeArc = (arcStart, arcEnd, radiusValue) => {
    const start = polarToCartesian(arcStart, radiusValue);
    const end = polarToCartesian(arcEnd, radiusValue);
    const largeArcFlag = arcEnd - arcStart > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radiusValue} ${radiusValue} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const segmentMarkup = segments
    .filter((segment) => segment.progressEnd > segment.progressStart)
    .map((segment) => {
      const segmentStart = angleFor(segment.progressStart);
      const segmentEnd = angleFor(segment.progressEnd);
      return `<path class="plan-ring-segment plan-ring-segment-${segment.kind}" d="${describeArc(
        segmentStart,
        segmentEnd,
        radius,
      )}" />`;
    })
    .join("");

  const showNowMarker = includePredictions && ui.historyDate === formatDateInput(now());
  const nowProgress = clamp((now() - rangeStart) / (rangeEnd - rangeStart), 0, 1);
  const nowPoint = polarToCartesian(angleFor(nowProgress), radius);
  const nowMarkup = showNowMarker
    ? `<circle class="plan-ring-now-dot" cx="${nowPoint.x}" cy="${nowPoint.y}" r="7"></circle>`
    : "";

  els.planTrack.className = `plan-track plan-track-${ui.sleepMode}`;
  els.planTrack.innerHTML = `
    <svg class="plan-ring-svg" viewBox="0 0 320 320" role="presentation" focusable="false">
      <path class="plan-ring-base plan-ring-base-${ui.sleepMode}" d="${describeArc(startAngle, backgroundEndAngle, radius)}" />
      ${segmentMarkup}
      ${nowMarkup}
    </svg>
  `;
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
  els.settingsTabButton.classList.toggle("is-active", ui.activeTab === "settings");
  els.addSleepEntryButton.classList.toggle("is-active", ui.openComposer === "sleep");
  els.addFeedEntryButton.classList.toggle("is-active", ui.openComposer === "feed");

  els.tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== ui.activeTab;
  });
}

function getDateRailDates() {
  const today = startOfDay(now());
  return [-2, -1, 0, 1].map((offset) => addDays(today, offset));
}

function renderDateStrip(container) {
  const dates = getDateRailDates();
  container.innerHTML = dates
    .map((date) => {
      const value = formatDateInput(date);
      const isSelected = value === ui.historyDate;
      const isToday = value === formatDateInput(now());
      return `
        <button
          class="date-chip${isSelected ? " is-active" : ""}${isToday ? " is-today" : ""}"
          type="button"
          data-date-value="${value}"
          aria-pressed="${isSelected ? "true" : "false"}"
          aria-label="${date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}"
        >
          <span class="date-chip-day">${date.getDate()}</span>
          ${isToday ? '<span class="date-chip-dot" aria-hidden="true"></span>' : ""}
        </button>
      `;
    })
    .join("");
}

function renderDateStrips() {
  renderDateStrip(els.sleepDateStrip);
  renderDateStrip(els.feedDateStrip);
}

function renderNapStartAdjuster() {
  const activeNap = getActiveNap();
  const showLivePanel = ui.sleepMode === "sun" && Boolean(activeNap);

  els.sleepLivePanel.classList.toggle("is-visible", showLivePanel);
  els.napAdjustRow.hidden = !showLivePanel;

  if (!showLivePanel) {
    els.napStartTimeButton.textContent = "Start time";
    return;
  }

  const activeStart = new Date(activeNap.start);
  els.napStartTimeButton.textContent = formatClock(activeStart);
}

function renderSleepDetailsOverlay() {
  els.sleepDetailsOverlay.hidden = !ui.sleepDetailsOpen;
  document.body.classList.toggle("is-overlay-open", ui.sleepDetailsOpen || ui.feedDetailsOpen);
  if (!ui.sleepDetailsOpen) {
    return;
  }

  els.sleepDetailsTitle.textContent =
    ui.sleepMode === "sun"
      ? ui.historyDate === formatDateInput(now())
        ? "Today sleep details"
        : `Sleep details for ${formatDateLabel(ui.historyDate)}`
      : ui.historyDate === formatDateInput(now())
        ? "Tonight details"
        : `Night details for ${formatDateLabel(ui.historyDate)}`;
}

function renderFeedDetailsOverlay() {
  els.feedDetailsOverlay.hidden = !ui.feedDetailsOpen;
  document.body.classList.toggle("is-overlay-open", ui.sleepDetailsOpen || ui.feedDetailsOpen);
  if (!ui.feedDetailsOpen) {
    return;
  }

  els.feedDetailsTitle.textContent =
    ui.historyDate === formatDateInput(now()) ? "Today feed details" : `Feed details for ${formatDateLabel(ui.historyDate)}`;
}

function renderSleepModeTimer(sleepPlan = buildSleepPlan()) {
  const timer = ui.sleepMode === "sun" ? getActiveNapTimerData(sleepPlan.model) : null;

  els.sleepModeTimer.hidden = !timer;
  if (!timer) {
    return;
  }

  els.sleepModeTimerPrimaryLabel.textContent = "Asleep";
  els.sleepModeTimerValue.textContent = formatTimerDuration(timer.elapsedMs);
  els.sleepModeTimerSecondaryLabel.textContent = timer.isOverdue ? "Overdue" : "Left";
  els.sleepModeTimerEnd.textContent = formatTimerDuration(Math.abs(timer.remainingMs));
}

function renderSleepModeSwitch() {
  if (ui.sleepMode === "sun") {
    els.sleepModeSwitchButton.textContent = "zzz";
    els.sleepModeSwitchButton.setAttribute("aria-label", "Switch to night sleep");
    els.sleepModeSwitchButton.classList.add("is-night");
    return;
  }

  els.sleepModeSwitchButton.textContent = "day";
  els.sleepModeSwitchButton.setAttribute("aria-label", "Switch to daytime naps");
  els.sleepModeSwitchButton.classList.remove("is-night");
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

function getDefaultManualNapValues(dateValue = ui.historyDate) {
  if (dateValue === formatDateInput(now())) {
    const roundedEnd = new Date(Math.round(now().getTime() / 300000) * 300000);
    const start = new Date(roundedEnd.getTime() - 45 * 60000);
    return {
      start: formatTimeInput(start),
      end: formatTimeInput(roundedEnd),
    };
  }

  return {
    start: "13:00",
    end: "14:00",
  };
}

function getDefaultManualNightValues(dateValue = ui.historyDate) {
  const referenceDay = parseDateValue(dateValue);
  const currentBounds = getDayBoundsForDate(referenceDay);
  const nextBounds = getDayBoundsForDate(addDays(referenceDay, 1));

  return {
    start: formatTimeInput(currentBounds.dayEnd),
    end: formatTimeInput(nextBounds.dayStart),
  };
}

function getDefaultManualFeedValue(dateValue = ui.historyDate) {
  if (dateValue === formatDateInput(now())) {
    return formatTimeInput(now());
  }

  return "12:00";
}

function populateManualNapForm() {
  const defaults =
    ui.sleepMode === "moon" ? getDefaultManualNightValues(ui.historyDate) : getDefaultManualNapValues(ui.historyDate);
  els.manualNapStartInput.value = defaults.start;
  els.manualNapEndInput.value = defaults.end;
}

function populateManualFeedForm() {
  els.manualFeedTimeInput.value = getDefaultManualFeedValue(ui.historyDate);
}

function openSleepDetails({ compose = false } = {}) {
  ui.sleepDetailsOpen = true;
  if (compose) {
    ui.openComposer = "sleep";
    populateManualNapForm();
  }
  render();
}

function closeSleepDetails() {
  ui.sleepDetailsOpen = false;
  if (ui.openComposer === "sleep") {
    ui.openComposer = null;
  }
  render();
}

function openFeedDetails({ compose = false } = {}) {
  ui.feedDetailsOpen = true;
  if (compose) {
    ui.openComposer = "feed";
    populateManualFeedForm();
  }
  render();
}

function closeFeedDetails() {
  ui.feedDetailsOpen = false;
  if (ui.openComposer === "feed") {
    ui.openComposer = null;
  }
  render();
}

function renderTopBar() {
  const selectedDateLabel =
    ui.historyDate === formatDateInput(now()) ? "Today" : formatDateLabel(ui.historyDate);

  if (ui.activeTab === "sleep") {
    els.topBarEyebrow.textContent = selectedDateLabel;
    els.topBarTitle.textContent = "Sleep";
    return;
  }

  if (ui.activeTab === "feed") {
    els.topBarEyebrow.textContent = selectedDateLabel;
    els.topBarTitle.textContent = "Feed";
    return;
  }

  els.topBarEyebrow.textContent = state.profile.babyName || "Baby";
  els.topBarTitle.textContent = "Settings";
}

function renderSleepDayView(sleepPlan) {
  const isCurrentDate = ui.historyDate === formatDateInput(now());
  const isFutureDate = parseDateValue(ui.historyDate) > startOfDay(now());
  const referencePlan = isCurrentDate ? sleepPlan : isFutureDate ? buildForecastSleepPlanForDate(ui.historyDate) : null;
  const bounds = getSleepSectionBounds(ui.historyDate, referencePlan);
  const meta = getSleepSectionMeta(ui.historyDate, isCurrentDate);
  const sectionEntries = buildSleepSectionEntries(bounds, isCurrentDate || isFutureDate, referencePlan);
  const loggedEntries = sectionEntries.filter((entry) => !entry.isPredicted);
  const summaryEntries = loggedEntries.filter((entry) => entry.type !== "break");
  const totalMinutes = summaryEntries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);
  const overview = getSleepSectionOverview(ui.historyDate, isCurrentDate, isFutureDate, referencePlan || sleepPlan, bounds);
  const entryCount = summaryEntries.length;
  const wakeBreakCount = loggedEntries.filter((entry) => entry.type === "break").length;

  els.sleepDayEyebrow.textContent = meta.panelEyebrow;
  els.sleepDayTitle.textContent = meta.panelTitle;
  els.nextSleepEyebrow.textContent = meta.nextEyebrow;
  els.nextSleepMain.textContent = overview.main;
  els.nextSleepNote.textContent = overview.note;
  els.sleepRingStartLabel.textContent =
    ui.sleepMode === "sun" ? `Wake ${formatClock(bounds.dayStart)}` : `Bed ${formatClock(bounds.dayEnd)}`;
  els.sleepRingEndLabel.textContent =
    ui.sleepMode === "sun" ? `Bed ${formatClock(bounds.dayEnd)}` : `Wake ${formatClock(bounds.tomorrowWake)}`;

  renderPlanTrack(bounds, isCurrentDate || isFutureDate, referencePlan);
  els.manualNapForm.hidden = ui.openComposer !== "sleep";

  if (entryCount) {
    const entryLabel =
      ui.sleepMode === "sun"
        ? `${entryCount} nap${entryCount === 1 ? "" : "s"}`
        : `${entryCount} night${entryCount === 1 ? "" : "s"}`;
    const breakLabel =
      ui.sleepMode === "moon" && wakeBreakCount
        ? ` · ${wakeBreakCount} wake break${wakeBreakCount === 1 ? "" : "s"}`
        : "";
    els.sleepDaySummary.textContent = `${formatDateLabel(ui.historyDate)} · ${entryLabel} · ${formatDuration(
      totalMinutes,
    )} asleep${breakLabel}`;
  } else if (isCurrentDate && ui.sleepMode === "moon") {
    els.sleepDaySummary.textContent = `Tonight · bedtime around ${formatClock(bounds.dayEnd)} · wake around ${formatClock(
      bounds.tomorrowWake,
    )}`;
  } else if (isFutureDate) {
    const predictionCount = sectionEntries.length;
    const predictionLabel =
      ui.sleepMode === "sun"
        ? `${predictionCount} predicted nap${predictionCount === 1 ? "" : "s"}`
        : "predicted night";
    els.sleepDaySummary.textContent = `${formatDateLabel(ui.historyDate)} · ${predictionLabel}`;
  } else {
    els.sleepDaySummary.textContent = meta.summaryFallback;
  }

  if (!sectionEntries.length) {
    els.sleepDayList.innerHTML = `<div class="empty-state">${meta.emptyState}</div>`;
    return;
  }

  els.sleepDayList.innerHTML = sectionEntries
    .map(
      (entry) => `
        <article class="upcoming-card upcoming-card-${entry.variant}${entry.isPredicted ? " upcoming-card-predicted" : ""}">
          <div class="upcoming-card-time">${entry.timeLabel}</div>
          <div class="upcoming-card-copy">
            <strong>${entry.title}</strong>
            <p>${entry.note}</p>
          </div>
          ${
            entry.id
              ? `<button class="history-delete" type="button" data-delete-type="${entry.type}" data-delete-id="${entry.id}">Delete</button>`
              : `<span class="list-tag">Predicted</span>`
          }
        </article>
      `,
    )
    .join("");
}

function syncForm() {
  const { profile } = state;
  const ageInfo = getProfileAgeInfo(now(), profile);
  els.babyNameInput.value = profile.babyName;
  els.dateOfBirthInput.value = profile.dateOfBirth;
  els.dueDateInput.value = profile.dueDate;
  els.ageMonthsInput.value = profile.ageMonthsFallback;
  els.ageDisplayInput.value = ageInfo.display;
  els.ageMonthsInput.disabled = ageInfo.source === "dates";
}

function syncDateInputs() {
  return;
}

function syncAgePreview() {
  const ageInfo = getProfileAgeInfo(now(), {
    babyName: els.babyNameInput.value.trim() || "Baby",
    dateOfBirth: els.dateOfBirthInput.value || "",
    dueDate: els.dueDateInput.value || "",
    ageMonthsFallback: clamp(Number(els.ageMonthsInput.value) || 0, 0, 36),
  });

  els.ageDisplayInput.value = ageInfo.display;
  els.ageMonthsInput.disabled = ageInfo.source === "dates";
}

function render() {
  const sleepPlan = buildSleepPlan();
  const sleepSummary = getNextSleepSummary(sleepPlan);
  const napCopy = getQuickNapCopy(sleepPlan);
  const nightCopy = getQuickNightCopy();
  const feedPrediction = getNextFeedPrediction();
  const feedCopy = getQuickFeedCopy(feedPrediction);
  const ageInfo = getProfileAgeInfo();
  const showPlayButton = ui.sleepMode === "sun" && !getActiveNap() && !getActiveNight();

  if (ui.sleepMode === "sun") {
    els.sleepModeEyebrow.textContent = "Nap";
    els.sleepModeHeadline.textContent = napCopy.headline;
    els.sleepModeNote.textContent = napCopy.note;
    els.sleepPrimaryButton.textContent = showPlayButton ? "Start" : napCopy.button;
    els.sleepPrimaryButton.disabled = napCopy.disabled;
    els.sleepSecondaryButton.hidden = true;
    els.manualSleepStartLabel.textContent = "Start";
    els.manualSleepEndLabel.textContent = "End";
    els.manualSleepSaveButton.textContent = "Save nap";
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
    els.manualSleepStartLabel.textContent = "Bedtime";
    els.manualSleepEndLabel.textContent = "Final wake";
    els.manualSleepSaveButton.textContent = "Save night";
  }

  els.sleepPrimaryButton.classList.toggle("is-play-button", showPlayButton);

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
  els.manualFeedForm.hidden = ui.openComposer !== "feed";

  renderTopBar();
  renderDateStrips();
  renderTabs();
  renderSleepModeSwitch();
  renderSleepModeTimer(sleepPlan);
  renderNapStartAdjuster();
  renderSleepDayView(sleepPlan);
  renderSleepDetailsOverlay();
  renderFeedHistory();
  renderFeedDetailsOverlay();
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

function adjustActiveNapStart(deltaMinutes) {
  const activeNap = getActiveNap();
  if (!activeNap) {
    return;
  }

  const currentStart = new Date(activeNap.start);
  const maxStart = now();
  const completedNaps = getCompletedNaps();
  const previousNap = completedNaps[completedNaps.length - 1] || null;
  const minStart = previousNap ? new Date(previousNap.endDate.getTime() + 60000) : null;
  let nextStart = new Date(currentStart.getTime() + deltaMinutes * 60000);

  if (minStart && nextStart < minStart) {
    nextStart = minStart;
  }

  if (nextStart > maxStart) {
    nextStart = maxStart;
  }

  activeNap.start = nextStart.toISOString();
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
  ui.openComposer = null;
  ui.sleepDetailsOpen = true;
  render();
  return true;
}

function addManualNight(dateValue, startTime, endTime) {
  const start = combineDateAndTime(dateValue, startTime);
  let end = combineDateAndTime(dateValue, endTime);

  if (end <= start) {
    end = addDays(end, 1);
  }

  if ((end - start) / 60000 < 30) {
    window.alert("Final wake needs to be meaningfully after bedtime.");
    return false;
  }

  state.nights.push({
    id: uid(),
    start: start.toISOString(),
    end: end.toISOString(),
    breaks: [],
  });
  ui.historyDate = dateValue;
  ui.openComposer = null;
  ui.sleepDetailsOpen = true;
  render();
  return true;
}

function addManualFeed(dateValue, timeValue, kind) {
  ui.historyDate = dateValue;
  ui.openComposer = null;
  ui.feedDetailsOpen = true;
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
  if (type === "break") {
    state.nights = state.nights.map((night) => ({
      ...night,
      breaks: (night.breaks || []).filter((nightBreak) => nightBreak.id !== id),
    }));
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
  ui.openComposer = null;
  ui.feedDetailsOpen = false;
  render();
});

els.feedTabButton.addEventListener("click", () => {
  ui.activeTab = "feed";
  ui.openComposer = null;
  ui.sleepDetailsOpen = false;
  render();
});

els.settingsTabButton.addEventListener("click", () => {
  ui.activeTab = "settings";
  ui.openComposer = null;
  ui.sleepDetailsOpen = false;
  ui.feedDetailsOpen = false;
  render();
});

els.sleepModeSwitchButton.addEventListener("click", () => {
  ui.sleepMode = ui.sleepMode === "sun" ? "moon" : "sun";
  ui.openComposer = null;
  render();
});

els.planTrack.addEventListener("click", () => {
  openSleepDetails();
});

els.planTrack.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openSleepDetails();
  }
});

els.sleepDetailsCloseButton.addEventListener("click", () => {
  closeSleepDetails();
});

els.sleepDetailsOverlay.addEventListener("click", (event) => {
  if (event.target === els.sleepDetailsOverlay) {
    closeSleepDetails();
  }
});

els.openFeedDetailsButton.addEventListener("click", () => {
  openFeedDetails();
});

els.openFeedDetailsButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openFeedDetails();
  }
});

els.feedDetailsCloseButton.addEventListener("click", () => {
  closeFeedDetails();
});

els.feedDetailsOverlay.addEventListener("click", (event) => {
  if (event.target === els.feedDetailsOverlay) {
    closeFeedDetails();
  }
});

els.addSleepEntryButton.addEventListener("click", () => {
  if (ui.openComposer === "sleep") {
    ui.openComposer = null;
    ui.sleepDetailsOpen = true;
    render();
    return;
  }

  openSleepDetails({ compose: true });

  if (typeof els.manualNapStartInput.showPicker === "function") {
    els.manualNapStartInput.showPicker();
  } else {
    els.manualNapStartInput.focus();
  }
});

els.addFeedEntryButton.addEventListener("click", () => {
  if (ui.openComposer === "feed") {
    ui.openComposer = null;
    ui.feedDetailsOpen = true;
    render();
    return;
  }

  openFeedDetails({ compose: true });

  if (typeof els.manualFeedTimeInput.showPicker === "function") {
    els.manualFeedTimeInput.showPicker();
  } else {
    els.manualFeedTimeInput.focus();
  }
});

els.napAdjustMinusFive.addEventListener("click", () => adjustActiveNapStart(-5));
els.napAdjustMinusOne.addEventListener("click", () => adjustActiveNapStart(-1));
els.napAdjustPlusOne.addEventListener("click", () => adjustActiveNapStart(1));
els.napAdjustPlusFive.addEventListener("click", () => adjustActiveNapStart(5));

els.manualNapForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const saved =
    ui.sleepMode === "moon"
      ? addManualNight(ui.historyDate, els.manualNapStartInput.value, els.manualNapEndInput.value)
      : addManualNap(ui.historyDate, els.manualNapStartInput.value, els.manualNapEndInput.value);
  if (saved) {
    populateManualNapForm();
  }
});

els.manualFeedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addManualFeed(ui.historyDate, els.manualFeedTimeInput.value, els.manualFeedKindInput.value);
  populateManualFeedForm();
});

function handleDateChange(value) {
  ui.historyDate = value || formatDateInput(now());
  ui.openComposer = null;
  syncDateInputs();
  render();
}

function handleDateStripClick(event) {
  const button = event.target.closest("[data-date-value]");
  if (!button) {
    return;
  }

  handleDateChange(button.dataset.dateValue);
}

els.sleepDateStrip.addEventListener("click", handleDateStripClick);
els.feedDateStrip.addEventListener("click", handleDateStripClick);

els.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) {
    return;
  }

  if (window.confirm("Delete this entry?")) {
    deleteEntry(button.dataset.deleteType, button.dataset.deleteId);
  }
});

els.sleepDayList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) {
    return;
  }

  if (window.confirm("Delete this entry?")) {
    deleteEntry(button.dataset.deleteType, button.dataset.deleteId);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ui.sleepDetailsOpen) {
    closeSleepDetails();
    return;
  }

  if (event.key === "Escape" && ui.feedDetailsOpen) {
    closeFeedDetails();
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

els.dateOfBirthInput.addEventListener("input", syncAgePreview);
els.dueDateInput.addEventListener("input", syncAgePreview);
els.ageMonthsInput.addEventListener("input", syncAgePreview);
els.babyNameInput.addEventListener("input", syncAgePreview);

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

setInterval(() => {
  renderSleepModeTimer();
}, 1000);
