import { renderHome } from "./views/home.js";
import { renderPlay } from "./views/play.js";
import { renderGameplay } from "./views/gameplay.js";
import { renderCollection } from "./views/collection.js";
import { renderStats } from "./views/stats.js";
import { renderAchievements } from "./views/achievements.js";
import { renderSettings } from "./views/settings.js";

const routes = {
  home: renderHome,
  play: renderPlay,
  gameplay: renderGameplay,
  collection: renderCollection,
  stats: renderStats,
  achievements: renderAchievements,
  settings: renderSettings,
};

let currentRoute = "home";

export function navigate(route, params) {
  if (!routes[route]) route = "home";
  currentRoute = route;
  const container = document.getElementById("mainContent");
  document.getElementById("modalRoot").innerHTML = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
  routes[route](container, params || {});
  updateActiveNav(route);
  closeMobileDrawer();
}

function updateActiveNav(route) {
  document.querySelectorAll(".nav-btn[data-route]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === route);
  });
}

function closeMobileDrawer() {
  const drawer = document.getElementById("mobileDrawer");
  if (drawer) drawer.classList.remove("open");
}

export function getCurrentRoute() {
  return currentRoute;
}

export function initRouter() {
  document.querySelectorAll("[data-route]").forEach(el => {
    el.addEventListener("click", () => navigate(el.dataset.route));
  });
  const hamburger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => drawer.classList.toggle("open"));
  }
  navigate("home");
}
