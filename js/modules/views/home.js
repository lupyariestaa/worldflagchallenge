import { tr } from "../i18n.js";
import { getDerivedStats } from "../stats.js";
import { navigate } from "../router.js";

export function renderHome(container) {
  const stats = getDerivedStats();
  container.innerHTML = `
    <section class="hero fade-in">
      <h1>World Flag <span class="gold">Challenge</span></h1>
      <p>${tr("tagline")}</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" id="heroPlayBtn">🚀 ${tr("play_now")}</button>
        <button class="btn btn-secondary btn-lg" id="heroCollectionBtn">🗺️ ${tr("nav_collection")}</button>
      </div>
    </section>

    <div class="stat-strip">
      <div class="stat-pill glass">
        <div class="num">${stats.collected}/${stats.collectionTotal}</div>
        <div class="label">${tr("collection_progress")}</div>
      </div>
      <div class="stat-pill glass">
        <div class="num">${stats.totalGames}</div>
        <div class="label">${tr("stats_total_games")}</div>
      </div>
      <div class="stat-pill glass">
        <div class="num">${stats.accuracy}%</div>
        <div class="label">${tr("stats_accuracy")}</div>
      </div>
      <div class="stat-pill glass">
        <div class="num">${stats.highestStreak}</div>
        <div class="label">${tr("stats_highest_streak")}</div>
      </div>
    </div>

    <h2 class="section-title"><span class="bar"></span>${tr("choose_mode")}</h2>
    <div class="grid-cards">
      ${modeCardHTML("classic", "📘")}
      ${modeCardHTML("time", "⏱️")}
      ${modeCardHTML("survival", "🛡️")}
      ${modeCardHTML("hardcore", "💀")}
    </div>
  `;

  container.querySelector("#heroPlayBtn").addEventListener("click", () => navigate("play"));
  container.querySelector("#heroCollectionBtn").addEventListener("click", () => navigate("collection"));
  container.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => navigate("play", { presetMode: card.dataset.mode }));
  });
}

function modeCardHTML(mode, icon) {
  return `
    <div class="card card-hover mode-card glass" data-mode="${mode}">
      <div class="icon">${icon}</div>
      <h3>${tr("mode_" + mode)}</h3>
      <p>${tr("mode_" + mode + "_desc")}</p>
    </div>
  `;
}
