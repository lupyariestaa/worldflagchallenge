import { getState, getCollectionCount } from "./state.js";
import { COUNTRIES } from "../data/countries.js";

const CONTINENTS = ["Asia", "Eropa", "Afrika", "Amerika Utara", "Amerika Selatan", "Oseania"];

function continentCountryCounts() {
  const counts = {};
  CONTINENTS.forEach(c => counts[c] = 0);
  COUNTRIES.forEach(c => { counts[c.continent] = (counts[c.continent] || 0) + 1; });
  return counts;
}

export function getDerivedStats() {
  const state = getState();
  const s = state.stats;
  const collected = getCollectionCount();
  const totalAnswered = s.totalAnswered || 0;
  const accuracy = totalAnswered > 0 ? Math.round((s.totalCorrect / totalAnswered) * 100) : 0;
  const avgResponseTime = totalAnswered > 0 ? (s.totalResponseTime / totalAnswered) : 0;

  let favContinent = null, favMax = -1;
  let missedContinent = null, missedMax = -1;
  CONTINENTS.forEach(c => {
    const correct = (s.continentCorrect && s.continentCorrect[c]) || 0;
    const wrong = (s.continentWrong && s.continentWrong[c]) || 0;
    if (correct > favMax) { favMax = correct; favContinent = c; }
    if (wrong > missedMax) { missedMax = wrong; missedContinent = c; }
  });
  if (favMax <= 0) favContinent = null;
  if (missedMax <= 0) missedContinent = null;

  const totalPerContinent = continentCountryCounts();
  const collectedPerContinent = {};
  CONTINENTS.forEach(c => collectedPerContinent[c] = 0);
  COUNTRIES.forEach(c => {
    if (state.collection[c.code]) collectedPerContinent[c.continent]++;
  });
  const continentDone = {};
  CONTINENTS.forEach(c => { continentDone[c] = collectedPerContinent[c] >= totalPerContinent[c]; });

  return {
    totalGames: s.totalGames || 0,
    totalCorrect: s.totalCorrect || 0,
    totalWrong: s.totalWrong || 0,
    totalAnswered,
    accuracy,
    highestStreak: s.highestStreak || 0,
    avgResponseTime,
    favContinent,
    missedContinent,
    collected,
    collectionTotal: COUNTRIES.length,
    continentDone,
    fastestAnswer: s.fastestAnswer || 0,
    classicCompleted: s.classicCompleted || 0,
    classicPerfect: s.classicPerfect || 0,
    timeAttackPlayed: s.timeAttackPlayed || 0,
    timeAttackBest: s.timeAttackBest || 0,
    survivalPlayed: s.survivalPlayed || 0,
    survivalBest: s.survivalBest || 0,
    hardcorePlayed: s.hardcorePlayed || 0,
    hardcoreBest: s.hardcoreBest || 0,
    playedAtNight: !!s.playedAtNight,
    playedEarlyMorning: !!s.playedEarlyMorning,
    openedSettings: !!s.openedSettings,
    usedBothLanguages: !!s.usedBothLanguages,
    comeback: !!s.comeback,
    daysPlayed: s.daysPlayed || [],
    unlockedCount: Object.keys(state.achievements || {}).length,
  };
}

export function continentLabelKey(continent) {
  const map = {
    "Asia": "cont_asia",
    "Eropa": "cont_europe",
    "Afrika": "cont_africa",
    "Amerika Utara": "cont_namerica",
    "Amerika Selatan": "cont_samerica",
    "Oseania": "cont_oceania",
  };
  return map[continent] || continent;
}
