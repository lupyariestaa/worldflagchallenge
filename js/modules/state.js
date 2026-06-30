// Centralized localStorage state management for World Flag Challenge
const STORAGE_KEY = "wfc_state_v1";

const DEFAULT_STATE = {
  settings: {
    theme: "dark",
    language: "id",
    sound: true,
    music: false,
    timerDuration: 15, // seconds per question (used by time/hardcore base)
  },
  collection: {}, // { countryCode: true }
  stats: {
    totalGames: 0,
    totalCorrect: 0,
    totalWrong: 0,
    highestStreak: 0,
    totalResponseTime: 0, // sum seconds
    totalAnswered: 0,
    fastestAnswer: 0,
    continentCorrect: {},
    continentWrong: {},
    classicCompleted: 0,
    classicPerfect: 0,
    timeAttackPlayed: 0,
    timeAttackBest: 0,
    survivalPlayed: 0,
    survivalBest: 0,
    hardcorePlayed: 0,
    hardcoreBest: 0,
    playedAtNight: false,
    playedEarlyMorning: false,
    openedSettings: false,
    usedBothLanguages: false,
    seenLanguages: [],
    lastGameWon: null,
    comeback: false,
    daysPlayed: [],
  },
  achievements: {}, // { achievementId: true }
};

function deepMerge(target, source) {
  const out = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULT_STATE, parsed);
  } catch (e) {
    console.error("Failed to load state, using defaults", e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function getState() {
  return state;
}

export function updateSettings(partial) {
  state.settings = { ...state.settings, ...partial };
  saveState();
  return state.settings;
}

export function addToCollection(code) {
  const isNew = !state.collection[code];
  state.collection[code] = true;
  if (isNew) saveState();
  return isNew;
}

export function getCollectionCount() {
  return Object.keys(state.collection).length;
}

export function isCollected(code) {
  return !!state.collection[code];
}

export function updateStats(mutatorFn) {
  mutatorFn(state.stats);
  saveState();
}

export function unlockAchievement(id) {
  if (state.achievements[id]) return false;
  state.achievements[id] = { unlockedAt: Date.now() };
  saveState();
  return true;
}

export function isAchievementUnlocked(id) {
  return !!state.achievements[id];
}

export function getUnlockedAchievementIds() {
  return Object.keys(state.achievements);
}

export function resetProgress() {
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
}

export function persist() {
  saveState();
}
