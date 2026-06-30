import { tr } from "../i18n.js";
import { navigate } from "../router.js";

let selectedMode = "classic";
let selectedDifficulty = "medium";

export function renderPlay(container, params) {
  if (params && params.presetMode) selectedMode = params.presetMode;

  container.innerHTML = `
    <h2 class="section-title fade-in"><span class="bar"></span>${tr("choose_mode")}</h2>
    <div class="grid-cards">
      ${modeCard("classic", "📘")}
      ${modeCard("time", "⏱️")}
      ${modeCard("survival", "🛡️")}
      ${modeCard("hardcore", "💀")}
    </div>

    <h2 class="section-title"><span class="bar"></span>${tr("choose_difficulty")}</h2>
    <div class="diff-row">
      ${diffChip("easy")}
      ${diffChip("medium")}
      ${diffChip("hard")}
    </div>

    <div style="margin-top:40px; text-align:center;">
      <button class="btn btn-primary btn-lg" id="startGameBtn">🎮 ${tr("start_game")}</button>
    </div>
  `;

  container.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedMode = card.dataset.mode;
      refreshSelection(container);
    });
  });
  container.querySelectorAll(".diff-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      selectedDifficulty = chip.dataset.diff;
      refreshSelection(container);
    });
  });
  container.querySelector("#startGameBtn").addEventListener("click", () => {
    navigate("gameplay", { mode: selectedMode, difficulty: selectedDifficulty });
  });

  refreshSelection(container);
}

function refreshSelection(container) {
  container.querySelectorAll(".mode-card").forEach(card => {
    card.classList.toggle("selected", card.dataset.mode === selectedMode);
  });
  container.querySelectorAll(".diff-chip").forEach(chip => {
    chip.classList.toggle("selected", chip.dataset.diff === selectedDifficulty);
  });
}

function modeCard(mode, icon) {
  return `
    <div class="card card-hover mode-card glass" data-mode="${mode}">
      <div class="icon">${icon}</div>
      <h3>${tr("mode_" + mode)}</h3>
      <p>${tr("mode_" + mode + "_desc")}</p>
    </div>
  `;
}
function diffChip(level) {
  return `<button class="diff-chip" data-diff="${level}">${tr("difficulty_" + level)}</button>`;
}
