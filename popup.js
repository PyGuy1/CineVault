// CineVault - Popup & Modal System

// Inline Lucide SVG helpers (no dependency on lucide lib for dynamic content)
const IC = {
  x:          `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  star:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starEmpty:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  clock:      `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  tag:        `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  film:       `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  check:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  eyeOff:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  heartFill:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  heart:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  notepad:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  trash:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
  warning:    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  infoCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  alertTri:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  save:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  plus:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
};

let activePopup = null;

export function showPopup(config) {
  closePopup();
  const overlay = document.createElement("div");
  overlay.className = "cv-overlay";
  overlay.innerHTML = `
    <div class="cv-modal glass-panel" role="dialog" aria-modal="true">
      <div class="cv-modal-header">
        <h2 class="cv-modal-title">${config.title || ""}</h2>
        <button class="cv-modal-close" id="modal-close-btn" aria-label="Close">${IC.x}</button>
      </div>
      <div class="cv-modal-body">${config.body || ""}</div>
      ${config.footer ? `<div class="cv-modal-footer">${config.footer}</div>` : ""}
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
  activePopup = overlay;

  overlay.querySelector("#modal-close-btn").onclick = closePopup;
  overlay.addEventListener("click", e => { if (e.target === overlay) closePopup(); });
  document.addEventListener("keydown", handleEsc);

  if (config.onMount) config.onMount(overlay);
  return overlay;
}

export function closePopup() {
  if (!activePopup) return;
  activePopup.classList.remove("visible");
  const el = activePopup;
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
  activePopup = null;
  document.removeEventListener("keydown", handleEsc);
}

function handleEsc(e) { if (e.key === "Escape") closePopup(); }

export function showDetailPopup(item, callbacks) {
  const stars = renderStars(item.userRating || 0, true);
  const posterHtml = item.poster
    ? `<img src="${item.poster}" alt="${item.name}" class="popup-poster" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : "";
  const posterFallback = `<div class="popup-poster-fallback" style="${item.poster ? "display:none" : ""}">${IC.film}</div>`;

  const body = `
    <div class="popup-detail">
      <div class="popup-media">
        ${posterHtml}${posterFallback}
        <div class="popup-badges">
          <span class="badge badge-type badge-${item.type}">${item.type}</span>
          ${item.favorite ? `<span class="badge badge-fav">${IC.star} Favorite</span>` : ""}
          <span class="badge badge-${item.watched ? "watched" : "unwatched"}">${item.watched ? `${IC.check} Watched` : "Unwatched"}</span>
        </div>
      </div>
      <div class="popup-info">
        <div class="popup-meta">
          <span class="popup-year">${item.year || "N/A"}</span>
          ${item.runtime ? `<span class="popup-runtime">${IC.clock} ${item.runtime}</span>` : ""}
          ${item.genre ? `<span class="popup-genre">${IC.tag} ${item.genre}</span>` : ""}
        </div>
        <div class="popup-rating-row">
          <span class="imdb-badge">IMDb ${item.rating || "N/A"}</span>
          <div class="user-rating-wrap" data-id="${item.id}">
            <span class="rating-label">Your rating:</span>
            ${stars}
          </div>
        </div>
        <p class="popup-desc">${item.description || "No description available."}</p>
        ${item.director ? `<p class="popup-meta-line"><strong>Director:</strong> ${item.director}</p>` : ""}
        ${item.actors ? `<p class="popup-meta-line"><strong>Cast:</strong> ${item.actors}</p>` : ""}
        ${item.type === "series" && item.totalSeasons ? `
          <div class="series-progress-wrap">
            <label>Episodes watched: <strong id="ep-count">${item.episodesWatched || 0}</strong></label>
            <input type="range" id="ep-slider" min="0" max="${item.totalSeasons * 10}" value="${item.episodesWatched || 0}" class="ep-slider">
          </div>
        ` : ""}
        <div class="notes-wrap">
          <label for="item-notes">${IC.notepad} Notes</label>
          <textarea id="item-notes" class="glass-input" placeholder="Add your notes here..." rows="3">${item.notes || ""}</textarea>
        </div>
        <p class="popup-date">Added: ${formatDate(item.dateAdded)}</p>
      </div>
    </div>
  `;

  const footer = `
    <div class="popup-actions">
      <button class="cv-btn btn-primary popup-action-btn" id="toggle-watched">
        ${item.watched ? `${IC.eyeOff}<span>Unwatch</span>` : `${IC.check}<span>Watched</span>`}
      </button>
      <button class="cv-btn btn-fav popup-action-btn" id="toggle-fav">
        ${item.favorite ? `${IC.heartFill}<span>Unfav</span>` : `${IC.heart}<span>Favorite</span>`}
      </button>
      <button class="cv-btn btn-save popup-action-btn" id="save-notes">
        ${IC.save}<span>Save Notes</span>
      </button>
      <button class="cv-btn btn-danger popup-action-btn" id="remove-item">
        ${IC.trash}<span>Remove</span>
      </button>
    </div>
  `;

  showPopup({
    title: item.name,
    body,
    footer,
    onMount: (overlay) => {
      // Star rating
      overlay.querySelectorAll(".star-btn").forEach(star => {
        star.onclick = () => {
          const val = parseInt(star.dataset.val);
          overlay.querySelectorAll(".star-btn").forEach((s, i) => {
            s.classList.toggle("active", i < val);
          });
          if (callbacks.onRate) callbacks.onRate(val);
        };
      });

      // Episode slider
      const slider = overlay.querySelector("#ep-slider");
      const epCount = overlay.querySelector("#ep-count");
      if (slider) {
        slider.oninput = () => {
          epCount.textContent = slider.value;
          if (callbacks.onEpisodeUpdate) callbacks.onEpisodeUpdate(parseInt(slider.value));
        };
      }

      overlay.querySelector("#toggle-watched").onclick = () => {
        if (callbacks.onToggleWatched) callbacks.onToggleWatched();
      };
      overlay.querySelector("#toggle-fav").onclick = () => {
        if (callbacks.onToggleFav) callbacks.onToggleFav();
      };
      overlay.querySelector("#save-notes").onclick = () => {
        const notes = overlay.querySelector("#item-notes").value;
        if (callbacks.onSaveNotes) callbacks.onSaveNotes(notes);
      };
      overlay.querySelector("#remove-item").onclick = () => {
        showConfirm("Remove from watchlist?", "This cannot be undone.", () => {
          closePopup();
          if (callbacks.onRemove) callbacks.onRemove();
        });
      };
    }
  });
}

export function showConfirm(title, message, onConfirm, onCancel) {
  closePopup();
  const overlay = document.createElement("div");
  overlay.className = "cv-overlay confirm-overlay";
  overlay.innerHTML = `
    <div class="cv-confirm glass-panel">
      <div class="confirm-icon" style="color:var(--amber)">${IC.warning}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="cv-btn btn-danger" id="confirm-yes">Confirm</button>
        <button class="cv-btn btn-ghost" id="confirm-no">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
  activePopup = overlay;

  overlay.querySelector("#confirm-yes").onclick = () => { closePopup(); if (onConfirm) onConfirm(); };
  overlay.querySelector("#confirm-no").onclick = () => { closePopup(); if (onCancel) onCancel(); };
  overlay.addEventListener("click", e => { if (e.target === overlay) closePopup(); });
  document.addEventListener("keydown", handleEsc);
}

export function showAddForm(onAdd) {
  const body = `
    <form id="manual-add-form" class="add-form" onsubmit="return false">
      <div class="form-row">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" id="fa-title" class="glass-input" placeholder="Movie or series title" required>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="fa-type" class="glass-input">
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Year</label>
          <input type="text" id="fa-year" class="glass-input" placeholder="2024">
        </div>
        <div class="form-group">
          <label>Rating (1-10)</label>
          <input type="number" id="fa-rating" class="glass-input" min="1" max="10" step="0.1" placeholder="8.5">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <select id="fa-category" class="glass-input">
            <option value="General">General</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Romance">Romance</option>
            <option value="Thriller">Thriller</option>
            <option value="Animation">Animation</option>
            <option value="Documentary">Documentary</option>
          </select>
        </div>
        <div class="form-group">
          <label>Cover Image URL</label>
          <input type="url" id="fa-poster" class="glass-input" placeholder="https://...">
        </div>
      </div>
      <div class="form-group full-width">
        <label>Description</label>
        <textarea id="fa-desc" class="glass-input" rows="3" placeholder="Brief description..."></textarea>
      </div>
    </form>
  `;

  showPopup({
    title: "Add Manually",
    body,
    footer: `<button class="cv-btn btn-primary" id="manual-add-submit" style="gap:6px;">${IC.plus} Add to Watchlist</button>`,
    onMount: (overlay) => {
      overlay.querySelector("#manual-add-submit").onclick = () => {
        const title = overlay.querySelector("#fa-title").value.trim();
        if (!title) { showToast("Title is required", "error"); return; }
        onAdd({
          name: title,
          type: overlay.querySelector("#fa-type").value,
          year: overlay.querySelector("#fa-year").value || "N/A",
          rating: overlay.querySelector("#fa-rating").value || "N/A",
          category: overlay.querySelector("#fa-category").value,
          poster: overlay.querySelector("#fa-poster").value || null,
          description: overlay.querySelector("#fa-desc").value || "",
        });
        closePopup();
      };
    }
  });
}

function renderStars(current, interactive) {
  return `<div class="star-rating">${[1,2,3,4,5].map(i =>
    `<button class="star-btn ${i <= current ? "active" : ""}" data-val="${i}" ${interactive ? "" : "disabled"}>${IC.star}</button>`
  ).join("")}</div>`;
}

function formatDate(iso) {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Toast notification system
export function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `cv-toast toast-${type}`;
  const icons = { info: IC.infoCircle, success: IC.checkCircle, error: IC.xCircle, warning: IC.alertTri };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || IC.infoCircle}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
