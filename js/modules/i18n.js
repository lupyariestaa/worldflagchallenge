import { t } from "../data/translations.js";
import { getState, updateSettings, updateStats } from "./state.js";

export function currentLang() {
  return getState().settings.language;
}

export function tr(key, vars) {
  return t(key, currentLang(), vars);
}

export function setLanguage(lang) {
  updateSettings({ language: lang });
  updateStats(s => {
    s.seenLanguages = s.seenLanguages || [];
    if (!s.seenLanguages.includes(lang)) s.seenLanguages.push(lang);
    s.usedBothLanguages = s.seenLanguages.includes("id") && s.seenLanguages.includes("en");
  });
  applyStaticTranslations();
}

export function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = tr(key);
  });
  document.documentElement.lang = currentLang();
}
