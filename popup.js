// CineVault - Popup & Modal System

let activePopup = null;

export function showPopup(config) {
  closePopup();
  const overlay = document.createElement("div");
  overlay.className = "cv-overlay";
  overlay.innerHTML = `
    <div class="cv-modal glass-panel" role="dialog" aria-modal="true">
      <div class="cv-modal-header">
        <h2 class="cv-modal-title">${config.title || ""}</h2>
        <button class="cv-modal-close" id="modal-close-btn" aria-label="Close">✕</button>
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
  const posterFallback = `<div class="popup-poster-fallback" style="${item.poster ? "display:none" : ""}">🎬</div>`;

  const body = `
    <div class="popup-detail">
      <div class="popup-media">
        ${posterHtml}${posterFallback}
        <div class="popup-badges">
          <span class="badge badge-type badge-${item.type}">${item.type}</span>
          ${item.favorite ? '<span class="badge badge-fav">⭐ Favorite</span>' : ""}
          <span class="badge badge-${item.watched ? "watched" : "unwatched"}">${item.watched ? "✓ Watched" : "○ Unwatched"}</span>
        </div>
      </div>
      <div class="popup-info">
        <div class="popup-meta">
          <span class="popup-year">${item.year || "N/A"}</span>
          ${item.runtime ? `<span class="popup-runtime">⏱ ${item.runtime}</span>` : ""}
          ${item.genre ? `<span class="popup-genre">🏷 ${item.genre}</span>` : ""}
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
          <label for="item-notes">📝 Notes</label>
          <textarea id="item-notes" class="glass-input" placeholder="Add your notes here..." rows="3">${item.notes || ""}</textarea>
        </div>
        <p class="popup-date">Added: ${formatDate(item.dateAdded)}</p>
      </div>
    </div>
  `;

  const footer = `
    <div class="popup-actions">
      <button class="cv-btn btn-primary" id="toggle-watched">${item.watched ? "Mark Unwatched" : "Mark Watched"}</button>
      <button class="cv-btn btn-fav" id="toggle-fav">${item.favorite ? "Remove Favorite" : "Add Favorite"}</button>
      <button class="cv-btn btn-save" id="save-notes">Save Notes</button>
      <button class="cv-btn btn-danger" id="remove-item">Remove</button>
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
      <div class="confirm-icon">⚠️</div>
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
            <option value="movie">🎬 Movie</option>
            <option value="series">📺 Series</option>
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
    footer: `<button class="cv-btn btn-primary" id="manual-add-submit">Add to Watchlist</button>`,
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
    `<button class="star-btn ${i <= current ? "active" : ""}" data-val="${i}" ${interactive ? "" : "disabled"}>★</button>`
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
  const icons = { info: "ℹ️", success: "✅", error: "❌", warning: "⚠️" };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
