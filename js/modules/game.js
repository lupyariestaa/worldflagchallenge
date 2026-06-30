import { COUNTRIES } from "../data/countries.js";
import { updateStats, addToCollection } from "./state.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function difficultyPool(difficulty) {
  const sorted = [...COUNTRIES].sort((a, b) => b.population - a.population);
  if (difficulty === "easy") return sorted.slice(0, 80);
  if (difficulty === "medium") return sorted.slice(0, 150);
  return sorted;
}

export const MODE_CONFIG = {
  classic: { questionCount: 10, hasTimer: true, hasLives: false },
  time: { questionCount: Infinity, hasTimer: true, isCountdownTotal: true, hasLives: false },
  survival: { questionCount: Infinity, hasTimer: true, hasLives: true, lives: 1 },
  hardcore: { questionCount: Infinity, hasTimer: true, hasLives: true, lives: 1, timerMultiplier: 0.5 },
};

export class GameSession {
  constructor(mode, difficulty) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.config = MODE_CONFIG[mode];
    this.pool = shuffle(difficultyPool(difficulty));
    this.usedIndices = new Set();
    this.questionNumber = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreakThisGame = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.lives = this.config.hasLives ? this.config.lives : null;
    this.responseTimes = [];
    this.finished = false;
    this.currentQuestion = null;
    this.questionStartTime = null;
  }

  hasNextQuestion() {
    if (this.config.questionCount !== Infinity && this.questionNumber >= this.config.questionCount) return false;
    return this.usedIndices.size < this.pool.length;
  }

  nextQuestion() {
    let idx = -1;
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.usedIndices.has(i)) { idx = i; break; }
    }
    if (idx === -1) return null;
    this.usedIndices.add(idx);
    const correctCountry = this.pool[idx];

    const distractorCandidates = this.pool.filter((c, i) => i !== idx && c.code !== correctCountry.code);
    const distractors = shuffle(distractorCandidates).slice(0, 3);
    const options = shuffle([correctCountry, ...distractors]);

    this.questionNumber++;
    this.questionStartTime = performance.now();
    this.currentQuestion = { correctCountry, options };
    return this.currentQuestion;
  }

  answer(selectedCode) {
    if (!this.currentQuestion) return null;
    const elapsedSec = (performance.now() - this.questionStartTime) / 1000;
    const isCorrect = selectedCode === this.currentQuestion.correctCountry.code;
    this.responseTimes.push(elapsedSec);

    if (isCorrect) {
      this.score += 10 + Math.max(0, Math.floor(10 - elapsedSec));
      this.streak++;
      this.bestStreakThisGame = Math.max(this.bestStreakThisGame, this.streak);
      this.correctCount++;
      addToCollection(this.currentQuestion.correctCountry.code);
    } else {
      this.streak = 0;
      this.wrongCount++;
      if (this.config.hasLives) this.lives--;
    }

    const continent = this.currentQuestion.correctCountry.continent;
    updateStats(s => {
      s.totalAnswered = (s.totalAnswered || 0) + 1;
      s.totalResponseTime = (s.totalResponseTime || 0) + elapsedSec;
      if (isCorrect) {
        s.totalCorrect = (s.totalCorrect || 0) + 1;
        s.continentCorrect = s.continentCorrect || {};
        s.continentCorrect[continent] = (s.continentCorrect[continent] || 0) + 1;
        if (!s.fastestAnswer || elapsedSec < s.fastestAnswer) s.fastestAnswer = elapsedSec;
      } else {
        s.totalWrong = (s.totalWrong || 0) + 1;
        s.continentWrong = s.continentWrong || {};
        s.continentWrong[continent] = (s.continentWrong[continent] || 0) + 1;
      }
      if (this.streak > (s.highestStreak || 0)) s.highestStreak = this.streak;
    });

    return {
      isCorrect,
      correctCountry: this.currentQuestion.correctCountry,
      elapsedSec,
      livesLeft: this.lives,
      isGameOver: this.config.hasLives && this.lives <= 0,
    };
  }

  isOver() {
    if (this.config.hasLives && this.lives <= 0) return true;
    if (this.config.questionCount !== Infinity) return this.questionNumber >= this.config.questionCount;
    return !this.hasNextQuestion();
  }

  finalize() {
    this.finished = true;
    const now = new Date();
    const hour = now.getHours();
    const dayKey = now.toISOString().slice(0, 10);

    updateStats(s => {
      s.totalGames = (s.totalGames || 0) + 1;
      if (hour >= 0 && hour < 4) s.playedAtNight = true;
      if (hour >= 5 && hour < 7) s.playedEarlyMorning = true;
      s.daysPlayed = s.daysPlayed || [];
      if (!s.daysPlayed.includes(dayKey)) s.daysPlayed.push(dayKey);

      const won = this.wrongCount === 0;
      if (s.lastGameWon === false && won) s.comeback = true;
      s.lastGameWon = won;

      if (this.mode === "classic") {
        s.classicCompleted = (s.classicCompleted || 0) + 1;
        if (this.wrongCount === 0) s.classicPerfect = (s.classicPerfect || 0) + 1;
      } else if (this.mode === "time") {
        s.timeAttackPlayed = (s.timeAttackPlayed || 0) + 1;
        s.timeAttackBest = Math.max(s.timeAttackBest || 0, this.correctCount);
      } else if (this.mode === "survival") {
        s.survivalPlayed = (s.survivalPlayed || 0) + 1;
        s.survivalBest = Math.max(s.survivalBest || 0, this.correctCount);
      } else if (this.mode === "hardcore") {
        s.hardcorePlayed = (s.hardcorePlayed || 0) + 1;
        s.hardcoreBest = Math.max(s.hardcoreBest || 0, this.correctCount);
      }
    });
  }
}
