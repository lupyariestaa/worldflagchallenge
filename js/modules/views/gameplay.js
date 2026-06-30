import { tr } from "../i18n.js";
import { navigate } from "../router.js";
import { GameSession, MODE_CONFIG } from "../game.js";
import { getState } from "../state.js";
import { checkAchievements } from "../achievements.js";
import { showAchievementToasts } from "./achievements.js";

let session = null;
let timerInterval = null;
let timeRemaining = 0;
let totalTimeForBar = 0;
let containerRef = null;

const FLAG_URL = code => `https://flagcdn.com/w320/${code}.png`;

export function renderGameplay(container, params) {
  containerRef = container;
  const { mode, difficulty } = params;
  session = new GameSession(mode, difficulty);
  startNextQuestion();
}

function baseTimerSeconds(mode) {
  const settingsTimer = getState().settings.timerDuration || 15;
  if (mode === "hardcore") return Math.max(4, Math.round(settingsTimer * 0.5));
  if (mode === "time") return 60; // total countdown handled separately for time-attack
  return settingsTimer;
}

function startNextQuestion() {
  clearInterval(timerInterval);

  if (session.mode === "time" && session.questionNumber === 0) {
    // total countdown for the whole time-attack run
    timeRemaining = baseTimerSeconds("time");
    totalTimeForBar = timeRemaining;
  } else if (session.mode !== "time") {
    timeRemaining = baseTimerSeconds(session.mode);
    totalTimeForBar = timeRemaining;
  }

  const q = session.nextQuestion();
  if (!q) { return endGame(); }

  renderQuestion(q);
  startTimer();
}

function renderQuestion(q) {
  const cfg = session.config;
  const livesHTML = cfg.hasLives
    ? `<div class="meta-chip lives glass">❤️ ${tr("lives")}: ${session.lives}</div>` : "";
  const qOfHTML = cfg.questionCount !== Infinity
    ? tr("question_of", { current: session.questionNumber, total: cfg.questionCount })
    : `${tr("question_of", { current: session.questionNumber, total: "∞" })}`;

  containerRef.innerHTML = `
    <div class="game-topbar fade-in">
      <div class="game-meta">
        <div class="meta-chip score glass">⭐ ${tr("score")}: ${session.score}</div>
        <div class="meta-chip streak glass">🔥 ${tr("streak")}: ${session.streak}</div>
        ${livesHTML}
      </div>
      <button class="btn btn-ghost" id="quitBtn">✖ ${tr("back")}</button>
    </div>

    <div class="timer-bar-wrap"><div class="timer-bar" id="timerBar"></div></div>

    <div class="flag-stage">
      <div class="flag-frame"><img src="${FLAG_URL(q.correctCountry.code)}" alt="flag" id="flagImg"/></div>
      <p class="question-label">${qOfHTML} — ${tr("question_label")}</p>
    </div>

    <div class="options-grid" id="optionsGrid">
      ${q.options.map(o => `<button class="option-btn" data-code="${o.code}">${countryName(o)}</button>`).join("")}
    </div>
  `;

  containerRef.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(btn.dataset.code));
  });
  containerRef.querySelector("#quitBtn").addEventListener("click", () => {
    if (confirm(tr("quit_confirm"))) {
      clearInterval(timerInterval);
      navigate("home");
    }
  });
}

function countryName(country) {
  const lang = getState().settings.language;
  return country.name[lang] || country.name.en;
}

function startTimer() {
  const bar = () => containerRef.querySelector("#timerBar");
  updateTimerBar(bar());
  timerInterval = setInterval(() => {
    timeRemaining -= 0.1;
    const el = bar();
    if (el) updateTimerBar(el);
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      if (session.mode === "time") {
        // Total countdown for the whole Time Attack run has expired.
        session.currentQuestion = null;
        endGame();
      } else {
        handleAnswer(null); // per-question timeout = wrong
      }
    }
  }, 100);
}

function updateTimerBar(el) {
  if (!el) return;
  const pct = Math.max(0, (timeRemaining / totalTimeForBar) * 100);
  el.style.width = pct + "%";
  el.classList.toggle("warn", pct < 30);
}

function handleAnswer(code) {
  clearInterval(timerInterval);
  const result = session.answer(code);

  // visually mark options
  containerRef.querySelectorAll(".option-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.code === result.correctCountry.code) btn.classList.add("correct");
    else if (btn.dataset.code === code) btn.classList.add("wrong");
  });

  setTimeout(() => showCountryCard(result), 450);
}

function showCountryCard(result) {
  const lang = getState().settings.language;
  const c = result.correctCountry;
  const modalRoot = document.getElementById("modalRoot");
  modalRoot.innerHTML = `
    <div class="modal-overlay" id="countryModalOverlay">
      <div class="country-card fade-in">
        <img class="country-card-flag" src="${FLAG_URL(c.code)}" alt="flag"/>
        <div class="country-card-body">
          <div class="country-card-result ${result.isCorrect ? "correct" : "wrong"}">
            ${result.isCorrect ? "✅ " + tr("correct") : "❌ " + tr("wrong")}
          </div>
          <h2>${c.name[lang] || c.name.en}</h2>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">${tr("capital")}</div><div class="info-value">${c.capital}</div></div>
            <div class="info-item"><div class="info-label">${tr("currency")}</div><div class="info-value">${c.currency}</div></div>
            <div class="info-item"><div class="info-label">${tr("population")}</div><div class="info-value">${c.population.toLocaleString()}</div></div>
            <div class="info-item"><div class="info-label">${tr("language")}</div><div class="info-value">${c.language[lang] || c.language.en}</div></div>
            <div class="info-item"><div class="info-label">${tr("continent")}</div><div class="info-value">${c.continent}</div></div>
          </div>
          <div class="fact-box">💡 ${c.fact[lang] || c.fact.en}</div>
          <div class="auto-next-bar"><div class="auto-next-fill" id="autoNextFill"></div></div>
        </div>
      </div>
    </div>
  `;

  let pct = 100;
  const duration = 3200;
  const step = 50;
  const fill = document.getElementById("autoNextFill");
  const tick = setInterval(() => {
    pct -= (100 * step) / duration;
    if (fill) fill.style.width = Math.max(0, pct) + "%";
    if (pct <= 0) {
      clearInterval(tick);
      proceedAfterCard(result);
    }
  }, step);

  document.getElementById("countryModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "countryModalOverlay") {
      clearInterval(tick);
      proceedAfterCard(result);
    }
  });
}

function proceedAfterCard(result) {
  document.getElementById("modalRoot").innerHTML = "";
  if (result.isGameOver || session.isOver()) {
    endGame();
  } else {
    startNextQuestion();
  }
}

function endGame() {
  clearInterval(timerInterval);
  session.finalize();
  const newAch = checkAchievements();

  containerRef.innerHTML = `
    <div class="card gameover-card fade-in glass">
      <div style="font-size:46px;">🏁</div>
      <h2>${tr("game_over")}</h2>
      <div class="big-score">${session.score}</div>
      <div class="gameover-stats">
        <div><div class="n">${session.correctCount}</div><div class="l">${tr("correct_answers")}</div></div>
        <div><div class="n">${session.wrongCount}</div><div class="l">${tr("wrong_answers")}</div></div>
        <div><div class="n">${session.bestStreakThisGame}</div><div class="l">${tr("streak")}</div></div>
      </div>
      <div class="gameover-actions">
        <button class="btn btn-primary" id="playAgainBtn">🔁 ${tr("play_again")}</button>
        <button class="btn btn-secondary" id="goHomeBtn">🏠 ${tr("go_home")}</button>
      </div>
    </div>
  `;
  containerRef.querySelector("#playAgainBtn").addEventListener("click", () => {
    navigate("gameplay", { mode: session.mode, difficulty: session.difficulty });
  });
  containerRef.querySelector("#goHomeBtn").addEventListener("click", () => navigate("home"));

  if (newAch.length) showAchievementToasts(newAch);
}
