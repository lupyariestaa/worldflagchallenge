import { tr, currentLang } from "../i18n.js";
import { getAllAchievementsWithStatus, getTotalEarnedPoints } from "../achievements.js";

export function renderAchievements(container) {
  const list = getAllAchievementsWithStatus();
  const earned = getTotalEarnedPoints();
  const lang = currentLang();

  container.innerHTML = `
    <div class="collection-header fade-in">
      <h2 class="section-title" style="margin:0;"><span class="bar"></span>${tr("achievements_title")}</h2>
      <div class="meta-chip score glass">⭐ ${earned} ${tr("stats_achievement_points")}</div>
    </div>
    <div class="ach-grid">
      ${list.map(a => achCardHTML(a, lang)).join("")}
    </div>
  `;
}

function achCardHTML(a, lang) {
  return `
    <div class="card ach-card glass ${a.unlocked ? "" : "locked"}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-info">
        <h4>${a.name[lang] || a.name.en}</h4>
        <p>${a.desc[lang] || a.desc.en}</p>
        <div class="ach-points">+${a.points} pts</div>
      </div>
    </div>
  `;
}

export function showAchievementToasts(newAchievements) {
  const lang = currentLang();
  const wrap = document.getElementById("achievementToastContainer");
  newAchievements.forEach((a, i) => {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "ach-toast";
      el.innerHTML = `
        <div class="ach-icon">${a.icon}</div>
        <div>
          <div class="tt">${tr("achievement_unlocked")}</div>
          <div class="tn">${a.name[lang] || a.name.en}</div>
        </div>
      `;
      wrap.appendChild(el);
      setTimeout(() => {
        el.style.transition = "opacity .4s ease, transform .4s ease";
        el.style.opacity = "0";
        el.style.transform = "translateX(40px)";
        setTimeout(() => el.remove(), 400);
      }, 4000);
    }, i * 350);
  });
}
