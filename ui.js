// CineVault - UI Rendering Layer
import { showDetailPopup, showToast, closePopup } from "./popup.js";
import { updateItem, deleteItem } from "./db.js";

// Inline SVGs for dynamically created elements
const UI_IC = {
  film:       `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  filmSm:     `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  starFill:   `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check:      `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  undo:       `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  heartFill:  `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  heart:      `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  x:          `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  plus:       `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  checkAdded: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

let viewMode = "grid";
let dragSrcIndex = null;

export function setViewMode(mode) { viewMode = mode; }
export function getViewMode() { return viewMode; }

export function renderDashboard(stats) {
  const els = {
    "stat-total": stats.total,
    "stat-movies": stats.movies,
    "stat-series": stats.series,
    "stat-watched": stats.watched,
    "stat-unwatched": stats.total - stats.watched,
    "stat-favorites": stats.favorites,
  };
  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) animateCounter(el, val);
  });

  // Progress bar
  const pct = stats.total > 0 ? Math.round((stats.watched / stats.total) * 100) : 0;
  const bar = document.getElementById("progress-bar");
  const pctEl = document.getElementById("progress-pct");
  if (bar) bar.style.width = pct + "%";
  if (pctEl) pctEl.textContent = pct + "%";
}

export function renderList(items, container, onItemsChange) {
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" style="color:var(--text-muted);opacity:0.4;">${UI_IC.film}</div>
        <h3>Your watchlist is empty</h3>
        <p>Search for movies &amp; series or add them manually</p>
      </div>
    `;
    return;
  }

  container.className = `watchlist-container view-${viewMode}`;

  items.forEach((item, index) => {
    const card = createCard(item, index, onItemsChange);
    container.appendChild(card);
  });

  // Staggered entrance animation
  const cards = container.querySelectorAll(".cv-card");
  cards.forEach((card, i) => {
    card.style.animationDelay = `${Math.min(i * 0.05, 0.5)}s`;
    card.classList.add("card-enter");
  });
}

function createCard(item, index, onItemsChange) {
  const card = document.createElement("div");
  card.className = `cv-card ${item.watched ? "card-watched" : ""} ${item.favorite ? "card-fav" : ""}`;
  card.dataset.id = item.id;
  card.draggable = true;

  card.innerHTML = `
    <div class="card-poster">
      ${item.poster
        ? `<img src="${item.poster}" alt="${escapeHtml(item.name)}" class="card-poster-img" loading="lazy"
             referrerpolicy="no-referrer" crossorigin="anonymous"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ""}
      <div class="card-poster-fallback" style="color:var(--text-muted);opacity:0.4;${item.poster ? "display:none;" : ""}">${UI_IC.film}</div>
      <div class="card-overlay">
        <span class="card-type-badge badge-${item.type}">${item.type}</span>
        ${item.favorite ? `<span class="card-fav-badge">${UI_IC.heartFill}</span>` : ""}
        ${item.watched ? `<span class="card-watched-badge">${UI_IC.check}</span>` : ""}
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h3>
      <div class="card-meta">
        <span class="card-year">${item.year || "N/A"}</span>
        <span class="card-rating">${UI_IC.starFill} ${item.rating || "N/A"}</span>
      </div>
      ${item.category ? `<span class="card-category">${item.category}</span>` : ""}
      <p class="card-desc">${truncate(item.description || "", 80)}</p>
    </div>
    <div class="card-quick-actions">
      <button class="quick-btn qb-watch" title="${item.watched ? "Unmark watched" : "Mark watched"}">
        ${item.watched ? UI_IC.undo : UI_IC.check}
      </button>
      <button class="quick-btn qb-fav" title="${item.favorite ? "Remove favorite" : "Add favorite"}">
        ${item.favorite ? UI_IC.heartFill : UI_IC.heart}
      </button>
      <button class="quick-btn qb-del" title="Remove">${UI_IC.x}</button>
    </div>
  `;

  // Click to open detail
  card.querySelector(".card-body").onclick = () => openDetail(item, onItemsChange);
  card.querySelector(".card-poster").onclick = () => openDetail(item, onItemsChange);

  // Quick actions
  card.querySelector(".qb-watch").onclick = async (e) => {
    e.stopPropagation();
    item.watched = !item.watched;
    await updateItem(item);
    if (onItemsChange) onItemsChange();
    showToast(item.watched ? "Marked as watched" : "Marked as unwatched", "success");
  };

  card.querySelector(".qb-fav").onclick = async (e) => {
    e.stopPropagation();
    item.favorite = !item.favorite;
    await updateItem(item);
    if (onItemsChange) onItemsChange();
    showToast(item.favorite ? "Added to favorites" : "Removed from favorites", "info");
  };

  card.querySelector(".qb-del").onclick = async (e) => {
    e.stopPropagation();
    card.classList.add("card-removing");
    setTimeout(async () => {
      await deleteItem(item.id);
      if (onItemsChange) onItemsChange();
      showToast("Removed from watchlist", "warning");
    }, 350);
  };

  // Drag and drop
  card.addEventListener("dragstart", (e) => {
    dragSrcIndex = index;
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  card.addEventListener("dragover", (e) => { e.preventDefault(); card.classList.add("drag-over"); });
  card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
  card.addEventListener("drop", async (e) => {
    e.preventDefault();
    card.classList.remove("drag-over");
    if (onItemsChange) onItemsChange(dragSrcIndex, index);
  });

  return card;
}

function openDetail(item, onItemsChange) {
  showDetailPopup(item, {
    onToggleWatched: async () => {
      item.watched = !item.watched;
      await updateItem(item);
      closePopup();
      if (onItemsChange) onItemsChange();
      showToast(item.watched ? "Marked as watched" : "Marked as unwatched", "success");
    },
    onToggleFav: async () => {
      item.favorite = !item.favorite;
      await updateItem(item);
      closePopup();
      if (onItemsChange) onItemsChange();
      showToast(item.favorite ? "Added to favorites" : "Removed from favorites", "info");
    },
    onSaveNotes: async (notes) => {
      item.notes = notes;
      await updateItem(item);
      showToast("Notes saved", "success");
    },
    onRate: async (rating) => {
      item.userRating = rating;
      await updateItem(item);
      showToast(`Rated ${rating}/5`, "success");
    },
    onEpisodeUpdate: async (count) => {
      item.episodesWatched = count;
      await updateItem(item);
    },
    onRemove: async () => {
      await deleteItem(item.id);
      if (onItemsChange) onItemsChange();
      showToast("Removed from watchlist", "warning");
    }
  });
}

export function renderSearchResults(results, container, onAdd, existingIds) {
  container.innerHTML = "";
  if (!results.length) {
    container.innerHTML = `<div class="search-empty"><p>No results found. Try a different query.</p></div>`;
    return;
  }
  results.forEach(result => {
    const alreadyAdded = existingIds.has(result.imdbID || result.Title);
    const card = document.createElement("div");
    card.className = "search-result-card glass-panel";
    card.innerHTML = `
      <div class="sr-poster">
        ${result.Poster && result.Poster !== "N/A"
          ? `<img src="${result.Poster}" alt="${escapeHtml(result.Title)}" loading="lazy"
               referrerpolicy="no-referrer" crossorigin="anonymous"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ""
        }
        <div class="sr-poster-fallback" style="color:var(--text-muted);opacity:0.5;${result.Poster && result.Poster !== "N/A" ? "display:none;" : ""}">${UI_IC.filmSm}</div>
      </div>
      <div class="sr-info">
        <div class="sr-header">
          <h4>${escapeHtml(result.Title)}</h4>
          <span class="badge badge-${result.Type || "movie"}">${result.Type || "movie"}</span>
        </div>
        <div class="sr-meta">
          <span>${result.Year || "N/A"}</span>
          ${result.imdbRating && result.imdbRating !== "N/A" ? `<span>${UI_IC.starFill} ${result.imdbRating}</span>` : ""}
          ${result.Genre ? `<span>${result.Genre.split(",")[0]}</span>` : ""}
        </div>
        <p class="sr-plot">${truncate(result.Plot || "", 120)}</p>
      </div>
      <button class="cv-btn ${alreadyAdded ? "btn-ghost" : "btn-primary"} sr-add-btn" ${alreadyAdded ? "disabled" : ""} style="gap:6px;flex-shrink:0;">
        ${alreadyAdded ? `${UI_IC.checkAdded} Added` : `${UI_IC.plus} Add`}
      </button>
    `;
    if (!alreadyAdded) {
      card.querySelector(".sr-add-btn").onclick = () => onAdd(result);
    }
    container.appendChild(card);
  });
}

export function renderStats(items) {
  const byType = { movie: 0, series: 0 };
  const byCategory = {};
  const byYear = {};
  let totalRating = 0, ratedCount = 0;

  items.forEach(item => {
    byType[item.type] = (byType[item.type] || 0) + 1;
    if (item.category) byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    if (item.year && item.year !== "N/A") {
      const decade = Math.floor(parseInt(item.year) / 10) * 10 + "s";
      byYear[decade] = (byYear[decade] || 0) + 1;
    }
    if (item.userRating) { totalRating += item.userRating; ratedCount++; }
  });

  const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : "N/A";
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const statsContainer = document.getElementById("stats-detail");
  if (!statsContainer) return;
  statsContainer.innerHTML = `
    <div class="stats-grid">
      <div class="stat-detail-card glass-panel">
        <div class="sdc-label">Avg Your Rating</div>
        <div class="sdc-value">${avgRating}${ratedCount > 0 ? ` ${UI_IC.starFill}` : ""}</div>
      </div>
      <div class="stat-detail-card glass-panel">
        <div class="sdc-label">Top Category</div>
        <div class="sdc-value">${topCategory ? topCategory[0] : "N/A"}</div>
      </div>
      <div class="stat-detail-card glass-panel">
        <div class="sdc-label">Movies vs Series</div>
        <div class="sdc-value">${byType.movie || 0} / ${byType.series || 0}</div>
      </div>
      <div class="stat-detail-card glass-panel">
        <div class="sdc-label">Completion Rate</div>
        <div class="sdc-value">${items.length ? Math.round((items.filter(i=>i.watched).length/items.length)*100) : 0}%</div>
      </div>
    </div>
    <div class="stats-breakdown glass-panel">
      <h4>By Category</h4>
      ${Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([cat, count]) => `
        <div class="breakdown-row">
          <span>${cat}</span>
          <div class="breakdown-bar-wrap">
            <div class="breakdown-bar" style="width:${Math.round(count/items.length*100)}%"></div>
          </div>
          <span>${count}</span>
        </div>
      `).join("") || "<p>No categories yet</p>"}
    </div>
  `;
}

function animateCounter(el, target) {
  const start = parseInt(el.textContent) || 0;
  const duration = 600;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
