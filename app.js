// CineVault - Main Application
import { initDB, addItem, getAllItems, updateItem, deleteItem, importItems } from "./db.js";
import { initTheme, toggleTheme } from "./theme.js";
import { searchMedia, normalizeResult } from "./search.js";
import { showToast, showAddForm, showConfirm } from "./popup.js";
import { renderDashboard, renderList, renderSearchResults, renderStats, setViewMode, getViewMode } from "./ui.js";

let allItems = [];
let filteredItems = [];
let searchQuery = "";
let activeFilter = "all";
let sortBy = "dateAdded";
let searchResults = [];
let searchPage = 1;
let isSearching = false;
let activeSection = "dashboard";

const CATEGORIES = ["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary", "General"];

async function init() {
  showLoader(true);
  await initDB();
  await initTheme();
  registerSW();
  allItems = await getAllItems();
  setupEventListeners();
  navigateTo("dashboard");
  showLoader(false);
  setupContextMenu();
  setupKeyboardShortcuts();
}

function showLoader(show) {
  const loader = document.getElementById("app-loader");
  if (loader) loader.style.display = show ? "flex" : "none";
}

function setupEventListeners() {
  // Theme toggle
  document.getElementById("theme-toggle").onclick = toggleTheme;

  // Nav items
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.onclick = () => navigateTo(el.dataset.nav);
  });

  // Search input (dashboard)
  const dashSearch = document.getElementById("dash-search");
  if (dashSearch) {
    dashSearch.addEventListener("input", debounce(() => {
      searchQuery = dashSearch.value.trim();
      applyFiltersAndRender();
    }, 300));
  }

  // Filter buttons
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      applyFiltersAndRender();
    };
  });

  // Sort select
  const sortSel = document.getElementById("sort-select");
  if (sortSel) sortSel.onchange = () => { sortBy = sortSel.value; applyFiltersAndRender(); };

  // View toggle
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-view]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setViewMode(btn.dataset.view);
      applyFiltersAndRender();
    };
  });

  // Add button
  document.getElementById("add-btn").onclick = () => showAddForm(handleManualAdd);

  // Search page
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => { searchPage = 1; performSearch(); }, 500));
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter") { searchPage = 1; performSearch(); } });
  }

  // Export / Import
  document.getElementById("export-btn")?.addEventListener("click", exportWatchlist);
  document.getElementById("import-btn")?.addEventListener("click", () => document.getElementById("import-file")?.click());
  document.getElementById("import-file")?.addEventListener("change", importWatchlist);

  // Backup
  document.getElementById("backup-btn")?.addEventListener("click", backupWatchlist);

  // Random picker
  document.getElementById("random-btn")?.addEventListener("click", randomPicker);

  // Clear all
  document.getElementById("clear-all-btn")?.addEventListener("click", () => {
    showConfirm("Clear Watchlist?", "This will permanently remove all items.", async () => {
      const { clearAllItems } = await import("./db.js");
      await clearAllItems();
      allItems = [];
      applyFiltersAndRender();
      updateDashboard();
      showToast("Watchlist cleared", "warning");
    });
  });

  // Category filter
  setupCategoryFilter();

  // Mobile nav toggle
  const sidebar = document.querySelector(".sidebar");
  document.getElementById("mobile-nav-toggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar?.classList.toggle("open");
  });

  // Click outside sidebar closes it on mobile
  document.addEventListener("click", (e) => {
    if (sidebar?.classList.contains("open") && !sidebar.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });

  // Install PWA
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById("install-btn")?.style.setProperty("display", "flex");
  });
  document.getElementById("install-btn")?.addEventListener("click", () => {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; }
  });
}

function setupCategoryFilter() {
  const catFilter = document.getElementById("category-filter");
  if (!catFilter) return;
  catFilter.innerHTML = CATEGORIES.map((c, i) =>
    `<button class="cat-btn ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
  catFilter.querySelectorAll(".cat-btn").forEach(btn => {
    btn.onclick = () => {
      catFilter.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFiltersAndRender();
    };
  });
}

function getActiveCategory() {
  const active = document.querySelector(".cat-btn.active");
  return active ? active.dataset.cat : "All";
}

function applyFiltersAndRender() {
  const cat = getActiveCategory();
  filteredItems = allItems.filter(item => {
    const matchSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === "all" ||
      (activeFilter === "watched" && item.watched) ||
      (activeFilter === "unwatched" && !item.watched) ||
      (activeFilter === "movies" && item.type === "movie") ||
      (activeFilter === "series" && item.type === "series") ||
      (activeFilter === "favorites" && item.favorite);
    const matchCat = cat === "All" || item.category === cat;
    return matchSearch && matchFilter && matchCat;
  });

  // Sort
  filteredItems.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "rating") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    if (sortBy === "year") return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    return new Date(b.dateAdded) - new Date(a.dateAdded);
  });

  // Render into both dashboard grid and watchlist section grid
  const dashGrid = document.getElementById("watchlist-grid");
  const mainGrid = document.getElementById("watchlist-grid-main");

  const onItemsChange = async (srcIdx, destIdx) => {
    if (srcIdx !== undefined && destIdx !== undefined) {
      const moved = filteredItems.splice(srcIdx, 1)[0];
      filteredItems.splice(destIdx, 0, moved);
      filteredItems.forEach((item, i) => { item.order = i; updateItem(item); });
    }
    allItems = await getAllItems();
    applyFiltersAndRender();
    updateDashboard();
  };

  if (dashGrid && activeSection === "dashboard") renderList(filteredItems, dashGrid, onItemsChange);
  if (mainGrid && activeSection === "watchlist") renderList(filteredItems, mainGrid, onItemsChange);

  // Update count label
  const countEl = document.getElementById("results-count");
  if (countEl) countEl.textContent = `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""}`;
}

function updateDashboard() {
  const watched = allItems.filter(i => i.watched).length;
  renderDashboard({
    total: allItems.length,
    movies: allItems.filter(i => i.type === "movie").length,
    series: allItems.filter(i => i.type === "series").length,
    watched,
    favorites: allItems.filter(i => i.favorite).length,
  });

  // Recently added
  const recentEl = document.getElementById("recent-list");
  if (recentEl) {
    const recent = [...allItems].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);
    recentEl.innerHTML = recent.length ? recent.map(item => `
      <div class="recent-item glass-panel">
        <div class="recent-poster">${item.poster ? `<img src="${item.poster}" loading="lazy">` : "🎬"}</div>
        <div class="recent-info">
          <span class="recent-name">${item.name}</span>
          <span class="recent-meta">${item.type} · ${item.year || "N/A"}</span>
        </div>
        <span class="badge badge-${item.watched ? "watched" : "unwatched"}">${item.watched ? "✓" : "○"}</span>
      </div>
    `).join("") : "<p class='empty-recent'>No items yet</p>";
  }
}

function navigateTo(section) {
  activeSection = section;
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll("[data-nav]").forEach(n => n.classList.remove("active"));
  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.add("active");
  document.querySelector(`[data-nav="${section}"]`)?.classList.add("active");
  document.querySelector(".sidebar")?.classList.remove("open");

  if (section === "dashboard") { updateDashboard(); applyFiltersAndRender(); }
  if (section === "watchlist") applyFiltersAndRender();
  if (section === "stats") renderStats(allItems);
}

async function performSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;
  const query = input.value.trim();
  if (!query) { document.getElementById("search-results").innerHTML = ""; return; }

  if (isSearching) return;
  isSearching = true;

  const resultsContainer = document.getElementById("search-results");
  resultsContainer.innerHTML = `<div class="search-loading"><div class="spinner"></div><p>Searching...</p></div>`;

  try {
    const { results, total, demo } = await searchMedia(query, searchPage);
    searchResults = results;
    const existingIds = new Set(allItems.map(i => i.sourceId || i.id));
    renderSearchResults(results, resultsContainer, handleSearchAdd, existingIds);
    if (demo) showToast("Showing demo results (API limit reached)", "info");

    // Pagination
    const pageInfo = document.getElementById("search-pagination");
    if (pageInfo) pageInfo.innerHTML = total > 8
      ? `<span>${results.length} of ${total}</span><button class="cv-btn btn-ghost" id="load-more">Load More</button>`
      : "";
    document.getElementById("load-more")?.addEventListener("click", () => {
      searchPage++; isSearching = false; performSearch();
    });
  } catch (e) {
    resultsContainer.innerHTML = `<div class="search-error">Search failed. Please try again.</div>`;
  }
  isSearching = false;
}

async function handleSearchAdd(result) {
  const norm = normalizeResult(result);
  const item = {
    id: "cv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    sourceId: norm.imdbID,
    name: norm.Title,
    type: norm.Type,
    year: norm.Year,
    rating: norm.imdbRating,
    poster: norm.Poster,
    description: norm.Plot,
    genre: norm.Genre,
    director: norm.Director,
    actors: norm.Actors,
    runtime: norm.Runtime,
    totalSeasons: norm.totalSeasons,
    category: norm.Genre ? norm.Genre.split(",")[0].trim() : "General",
    watched: false,
    favorite: false,
    dateAdded: new Date().toISOString(),
    notes: "",
    userRating: 0,
    episodesWatched: 0,
    order: allItems.length,
  };
  await addItem(item);
  allItems.push(item);
  showToast(`"${item.name}" added to watchlist`, "success");
  // Refresh search to show as added
  performSearch();
}

async function handleManualAdd(data) {
  const item = {
    id: "cv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    name: data.name,
    type: data.type || "movie",
    year: data.year || "N/A",
    rating: data.rating || "N/A",
    poster: data.poster || null,
    description: data.description || "",
    category: data.category || "General",
    watched: false,
    favorite: false,
    dateAdded: new Date().toISOString(),
    notes: "",
    userRating: 0,
    episodesWatched: 0,
    order: allItems.length,
  };
  await addItem(item);
  allItems.push(item);
  applyFiltersAndRender();
  updateDashboard();
  showToast(`"${item.name}" added to watchlist`, "success");
}

function exportWatchlist() {
  const data = JSON.stringify({ version: 1, exported: new Date().toISOString(), items: allItems }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `cinevault-backup-${Date.now()}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast("Watchlist exported ✓", "success");
}

async function importWatchlist(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const items = data.items || data;
    if (!Array.isArray(items)) throw new Error("Invalid format");
    await importItems(items);
    allItems = await getAllItems();
    applyFiltersAndRender();
    updateDashboard();
    showToast(`Imported ${items.length} items ✓`, "success");
  } catch {
    showToast("Invalid file format", "error");
  }
  e.target.value = "";
}

function backupWatchlist() {
  exportWatchlist();
}

function randomPicker() {
  const unwatched = allItems.filter(i => !i.watched);
  if (!unwatched.length) { showToast("No unwatched items to pick from!", "warning"); return; }
  const pick = unwatched[Math.floor(Math.random() * unwatched.length)];
  showToast(`Tonight watch: "${pick.name}"`, "info", 5000);
}

function setupContextMenu() {
  const menu = document.getElementById("context-menu");
  if (!menu) return;

  let ctxItem = null;
  // Track whether a context menu is currently open – used to swallow the
  // next document click that would otherwise immediately re-fire an action.
  let menuJustOpened = false;

  document.addEventListener("contextmenu", (e) => {
    const card = e.target.closest(".cv-card");
    if (!card) { menu.style.display = "none"; return; }
    e.preventDefault();
    ctxItem = filteredItems.find(i => i.id === card.dataset.id);
    if (!ctxItem) return;
    menu.style.cssText = `display:block;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 160)}px`;
    document.getElementById("ctx-title").textContent = ctxItem.name;
    // Update label text only (keep Lucide icon nodes intact)
    const watchBtn = document.getElementById("ctx-watch");
    const favBtn   = document.getElementById("ctx-fav");
    if (watchBtn) watchBtn.lastChild.textContent = " " + (ctxItem.watched ? "Mark Unwatched" : "Mark Watched");
    if (favBtn)   favBtn.lastChild.textContent   = " " + (ctxItem.favorite ? "Remove Favorite" : "Add Favorite");
    menuJustOpened = true;
  });

  // Close on any outside click — but swallow the very first click after
  // opening so it doesn't immediately trigger a card action underneath
  document.addEventListener("click", (e) => {
    if (menuJustOpened) { menuJustOpened = false; return; }
    if (!menu.contains(e.target)) menu.style.display = "none";
  });

  // Also close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menu.style.display = "none";
  });

  document.getElementById("ctx-watch")?.addEventListener("click", async (e) => {
    e.stopPropagation();
    menu.style.display = "none";
    if (!ctxItem) return;
    ctxItem.watched = !ctxItem.watched;
    await updateItem(ctxItem);
    applyFiltersAndRender();
    showToast(ctxItem.watched ? "Marked as watched" : "Marked as unwatched", "success");
  });

  document.getElementById("ctx-fav")?.addEventListener("click", async (e) => {
    e.stopPropagation();
    menu.style.display = "none";
    if (!ctxItem) return;
    ctxItem.favorite = !ctxItem.favorite;
    await updateItem(ctxItem);
    applyFiltersAndRender();
    showToast(ctxItem.favorite ? "Added to favorites" : "Removed from favorites", "info");
  });

  document.getElementById("ctx-remove")?.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = "none";
    if (!ctxItem) return;
    showConfirm("Remove item?", `Remove "${ctxItem.name}" from watchlist?`, async () => {
      await deleteItem(ctxItem.id);
      allItems = allItems.filter(i => i.id !== ctxItem.id);
      applyFiltersAndRender();
      updateDashboard();
      showToast("Removed", "warning");
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const key = e.key.toLowerCase();
    if (key === "d") navigateTo("dashboard");
    else if (key === "w") navigateTo("watchlist");
    else if (key === "s") navigateTo("search");
    else if (key === "t") navigateTo("stats");
    else if (key === "a") showAddForm(handleManualAdd);
    else if (key === "r") randomPicker();
    else if (key === "e") exportWatchlist();
    else if (key === "?" || key === "/") showShortcutsHelp();
  });
}

function showShortcutsHelp() {
  import("./popup.js").then(({ showPopup }) => {
    showPopup({
      title: "⌨️ Keyboard Shortcuts",
      body: `
        <div class="shortcuts-grid">
          ${[["D","Dashboard"],["W","Watchlist"],["S","Search"],["T","Statistics"],["A","Add item"],["R","Random picker"],["E","Export"],["?","Show shortcuts"]].map(([k,v])=>
            `<kbd>${k}</kbd><span>${v}</span>`
          ).join("")}
        </div>
      `
    });
  });
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("SW registered"))
      .catch(e => console.warn("SW failed:", e));
  }
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// Start app
init().catch(console.error);
