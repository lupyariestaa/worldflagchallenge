import { getState } from "./modules/state.js";
import { applyStaticTranslations } from "./modules/i18n.js";
import { initRouter } from "./modules/router.js";

function bootstrap() {
  try {
    const settings = getState().settings;
    document.body.setAttribute("data-theme", settings.theme);
    document.documentElement.lang = settings.language;
    applyStaticTranslations();
    initRouter();
  } catch (err) {
    console.error("Failed to bootstrap World Flag Challenge:", err);
    document.getElementById("mainContent").innerHTML =
      `<div class="empty-state">⚠️ Terjadi kesalahan saat memuat aplikasi. Silakan refresh halaman.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
