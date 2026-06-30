import { tr } from "../i18n.js";
import { getDerivedStats, continentLabelKey } from "../stats.js";
import { getTotalEarnedPoints } from "../achievements.js";

export function renderStats(container) {
  const s = getDerivedStats();
  const points = getTotalEarnedPoints();
  const fav = s.favContinent ? tr(continentLabelKey(s.favContinent)) : tr("no_data");
  const missed = s.missedContinent ? tr(continentLabelKey(s.missedContinent)) : tr("no_data");

  const items = [
    ["🎮", s.totalGames, "stats_total_games"],
    ["✅", s.totalCorrect, "stats_total_correct"],
    ["❌", s.totalWrong, "stats_total_wrong"],
    ["🎯", s.accuracy + "%", "stats_accuracy"],
    ["🔥", s.highestStreak, "stats_highest_streak"],
    ["⏱️", s.avgResponseTime.toFixed(1) + tr("sec_short"), "stats_avg_time"],
    ["🌍", fav, "stats_fav_continent"],
    ["⚠️", missed, "stats_missed_continent"],
    ["🏵️", points, "stats_achievement_points"],
    ["🗺️", `${s.collected}/${s.collectionTotal}`, "stats_collection_progress"],
  ];

  container.innerHTML = `
    <h2 class="section-title fade-in"><span class="bar"></span>${tr("stats_title")}</h2>
    <div class="stats-grid">
      ${items.map(([icon, val, key]) => `
        <div class="card stat-card glass">
          <div class="icon">${icon}</div>
          <div class="val">${val}</div>
          <div class="lbl">${tr(key)}</div>
        </div>
      `).join("")}
    </div>
  `;
}
