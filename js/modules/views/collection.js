import { tr, currentLang } from "../i18n.js";
import { COUNTRIES } from "../../data/countries.js";
import { isCollected, getCollectionCount } from "../state.js";

let activeFilter = "all";
let searchTerm = "";

const FLAG_URL = code => `https://flagcdn.com/w80/${code}.png`;

const CONTINENTS = [
  ["all", "continents_all"],
  ["Asia", "cont_asia"],
  ["Eropa", "cont_europe"],
  ["Afrika", "cont_africa"],
  ["Amerika Utara", "cont_namerica"],
  ["Amerika Selatan", "cont_samerica"],
  ["Oseania", "cont_oceania"],
];

export function renderCollection(container) {
  const collected = getCollectionCount();
  const total = COUNTRIES.length;
  const pct = Math.round((collected / total) * 100);

  container.innerHTML = `
    <div class="collection-header fade-in">
      <div>
        <h2 class="section-title" style="margin:0 0 8px;"><span class="bar"></span>${tr("collection_title")}</h2>
        <div>${tr("collection_progress")}: <strong>${collected} / ${total}</strong></div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>

    <div class="filter-row">
      ${CONTINENTS.map(([val, key]) => `<button class="filter-chip" data-cont="${val}">${tr(key)}</button>`).join("")}
      <input type="text" class="search-input" id="searchInput" placeholder="${tr("search_country")}"/>
    </div>

    <div class="country-grid" id="countryGrid"></div>
  `;

  container.querySelectorAll(".filter-chip").forEach(chip => {
    chip.classList.toggle("selected", chip.dataset.cont === activeFilter);
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.cont;
      container.querySelectorAll(".filter-chip").forEach(c => c.classList.toggle("selected", c === chip));
      renderGrid(container);
    });
  });

  const searchInput = container.querySelector("#searchInput");
  searchInput.value = searchTerm;
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderGrid(container);
  });

  renderGrid(container);
}

function renderGrid(container) {
  const grid = container.querySelector("#countryGrid");
  const lang = currentLang();
  const filtered = COUNTRIES.filter(c => {
    const matchCont = activeFilter === "all" || c.continent === activeFilter;
    const name = (c.name[lang] || c.name.en).toLowerCase();
    const matchSearch = !searchTerm || name.includes(searchTerm);
    return matchCont && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">${tr("no_data")}</div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => {
    const found = isCollected(c.code);
    return `
      <div class="country-tile ${found ? "found" : "locked"}">
        <img src="${FLAG_URL(c.code)}" alt="${c.code}" loading="lazy"/>
        <div class="name">${found ? (c.name[lang] || c.name.en) : "???"}</div>
      </div>
    `;
  }).join("");
}
