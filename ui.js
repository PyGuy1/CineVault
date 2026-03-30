// CineVault - UI Rendering Layer
import { showDetailPopup, showToast, closePopup } from "./popup.js";
import { updateItem, deleteItem } from "./db.js";

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
        <div class="empty-icon">🎬</div>
        <h3>Your watchlist is empty</h3>
        <p>Search for movies & series or add them manually</p>
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

  const posterStyle = item.poster
    ? `background-image: url('${item.poster}'); background-size: cover; background-position: center;`
    : "";

  card.innerHTML = `
    <div class="card-poster" style="${posterStyle}">
      ${!item.poster ? '<div class="card-poster-fallback">🎬</div>' : ""}
      <div class="card-overlay">
        <span class="card-type-badge badge-${item.type}">${item.type}</span>
        ${item.favorite ? '<span class="card-fav-badge">⭐</span>' : ""}
        ${item.watched ? '<span class="card-watched-badge">✓</span>' : ""}
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h3>
      <div class="card-meta">
        <span class="card-year">${item.year || "N/A"}</span>
        <span class="card-rating">⭐ ${item.rating || "N/A"}</span>
      </div>
      ${item.category ? `<span class="card-category">${item.category}</span>` : ""}
      <p class="card-desc">${truncate(item.description || "", 80)}</p>
    </div>
    <div class="card-quick-actions">
      <button class="quick-btn qb-watch" title="${item.watched ? "Unmark" : "Mark watched"}">
        ${item.watched ? "↩" : "✓"}
      </button>
      <button class="quick-btn qb-fav" title="${item.favorite ? "Remove favorite" : "Favorite"}">
        ${item.favorite ? "💛" : "♡"}
      </button>
      <button class="quick-btn qb-del" title="Remove">✕</button>
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
    showToast(item.watched ? "Marked as watched ✓" : "Marked as unwatched", "success");
  };

  card.querySelector(".qb-fav").onclick = async (e) => {
    e.stopPropagation();
    item.favorite = !item.favorite;
    await updateItem(item);
    if (onItemsChange) onItemsChange();
    showToast(item.favorite ? "Added to favorites ⭐" : "Removed from favorites", "info");
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
      showToast(item.watched ? "Marked as watched ✓" : "Marked as unwatched", "success");
    },
    onToggleFav: async () => {
      item.favorite = !item.favorite;
      await updateItem(item);
      closePopup();
      if (onItemsChange) onItemsChange();
      showToast(item.favorite ? "Added to favorites ⭐" : "Removed from favorites", "info");
    },
    onSaveNotes: async (notes) => {
      item.notes = notes;
      await updateItem(item);
      showToast("Notes saved", "success");
    },
    onRate: async (rating) => {
      item.userRating = rating;
      await updateItem(item);
      showToast(`Rated ${rating}/5 ⭐`, "success");
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
          ? `<img src="${result.Poster}" alt="${escapeHtml(result.Title)}" loading="lazy" onerror="this.style.display='none'">`
          : `<div class="sr-poster-fallback">🎬</div>`
        }
      </div>
      <div class="sr-info">
        <div class="sr-header">
          <h4>${escapeHtml(result.Title)}</h4>
          <span class="badge badge-${result.Type || "movie"}">${result.Type || "movie"}</span>
        </div>
        <div class="sr-meta">
          <span>${result.Year || "N/A"}</span>
          ${result.imdbRating && result.imdbRating !== "N/A" ? `<span>⭐ ${result.imdbRating}</span>` : ""}
          ${result.Genre ? `<span>🏷 ${result.Genre.split(",")[0]}</span>` : ""}
        </div>
        <p class="sr-plot">${truncate(result.Plot || "", 120)}</p>
      </div>
      <button class="cv-btn ${alreadyAdded ? "btn-ghost" : "btn-primary"} sr-add-btn" ${alreadyAdded ? "disabled" : ""}>
        ${alreadyAdded ? "✓ Added" : "+ Add"}
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
        <div class="sdc-value">${avgRating}${ratedCount > 0 ? " ⭐" : ""}</div>
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
