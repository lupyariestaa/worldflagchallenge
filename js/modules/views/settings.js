import { tr, setLanguage, currentLang } from "../i18n.js";
import { getState, updateSettings, updateStats, resetProgress } from "../state.js";
import { navigate } from "../router.js";

export function renderSettings(container) {
  updateStats(s => { s.openedSettings = true; });
  const settings = getState().settings;

  container.innerHTML = `
    <h2 class="section-title fade-in"><span class="bar"></span>${tr("settings_title")}</h2>
    <div class="settings-list">

      <div class="card settings-row glass">
        <div>
          <div class="label">${tr("settings_theme")}</div>
        </div>
        <div class="select-pill">
          <button data-theme-val="dark" class="${settings.theme === "dark" ? "selected" : ""}">${tr("settings_theme_dark")}</button>
          <button data-theme-val="light" class="${settings.theme === "light" ? "selected" : ""}">${tr("settings_theme_light")}</button>
        </div>
      </div>

      <div class="card settings-row glass">
        <div><div class="label">${tr("settings_language")}</div></div>
        <div class="select-pill">
          <button data-lang-val="id" class="${currentLang() === "id" ? "selected" : ""}">Indonesia</button>
          <button data-lang-val="en" class="${currentLang() === "en" ? "selected" : ""}">English</button>
        </div>
      </div>

      <div class="card settings-row glass">
        <div><div class="label">${tr("settings_sound")}</div></div>
        <button class="toggle ${settings.sound ? "on" : ""}" id="soundToggle"><span class="knob"></span></button>
      </div>

      <div class="card settings-row glass">
        <div><div class="label">${tr("settings_music")}</div></div>
        <button class="toggle ${settings.music ? "on" : ""}" id="musicToggle"><span class="knob"></span></button>
      </div>

      <div class="card settings-row glass">
        <div>
          <div class="label">${tr("settings_timer")}</div>
          <div class="desc" id="timerVal">${settings.timerDuration} ${tr("seconds")}</div>
        </div>
        <input type="range" min="5" max="30" step="1" value="${settings.timerDuration}" class="range-input" id="timerRange"/>
      </div>

      <div class="card settings-row glass">
        <div>
          <div class="label">${tr("settings_reset")}</div>
        </div>
        <button class="btn danger-btn" id="resetBtn">🗑️ ${tr("settings_reset")}</button>
      </div>

    </div>
  `;

  container.querySelectorAll("[data-theme-val]").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.themeVal;
      updateSettings({ theme: val });
      document.body.setAttribute("data-theme", val);
      renderSettings(container);
    });
  });

  container.querySelectorAll("[data-lang-val]").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.langVal);
      navigate("settings");
    });
  });

  container.querySelector("#soundToggle").addEventListener("click", (e) => {
    const newVal = !getState().settings.sound;
    updateSettings({ sound: newVal });
    e.currentTarget.classList.toggle("on", newVal);
  });
  container.querySelector("#musicToggle").addEventListener("click", (e) => {
    const newVal = !getState().settings.music;
    updateSettings({ music: newVal });
    e.currentTarget.classList.toggle("on", newVal);
  });

  const timerRange = container.querySelector("#timerRange");
  timerRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    container.querySelector("#timerVal").textContent = `${val} ${tr("seconds")}`;
    updateSettings({ timerDuration: val });
  });

  container.querySelector("#resetBtn").addEventListener("click", () => {
    showResetConfirm();
  });
}

function showResetConfirm() {
  const modalRoot = document.getElementById("modalRoot");
  modalRoot.innerHTML = `
    <div class="modal-overlay" id="resetOverlay">
      <div class="confirm-card card glass fade-in">
        <h3>${tr("settings_reset")}</h3>
        <p>${tr("settings_reset_confirm")}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="cancelResetBtn">${tr("cancel")}</button>
          <button class="btn danger-btn" id="confirmResetBtn">${tr("confirm")}</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("cancelResetBtn").addEventListener("click", () => modalRoot.innerHTML = "");
  document.getElementById("confirmResetBtn").addEventListener("click", () => {
    resetProgress();
    modalRoot.innerHTML = "";
    navigate("home");
  });
  document.getElementById("resetOverlay").addEventListener("click", (e) => {
    if (e.target.id === "resetOverlay") modalRoot.innerHTML = "";
  });
}
