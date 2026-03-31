// CineVault - Theme System
import { saveSetting, getSetting } from "./db.js";

const THEME_KEY = "drk_pyguy";

let currentTheme = "dark";

export async function initTheme() {
  const saved = await getSetting(THEME_KEY);
  currentTheme = saved || "dark";
  applyTheme(currentTheme, false);
}

export function applyTheme(theme, animate = true) {
  currentTheme = theme;
  const root = document.documentElement;
  if (animate) root.classList.add("theme-transitioning");
  root.setAttribute("data-theme", theme);
  if (animate) setTimeout(() => root.classList.remove("theme-transitioning"), 600);
  saveSetting(THEME_KEY, theme);
  updateThemeButton(theme);
}

export function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

export function getTheme() { return currentTheme; }

function updateThemeButton(theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const icon = btn.querySelector(".theme-icon");
  if (icon) {
    icon.innerHTML = theme === "dark"
      ? `<i data-lucide="sun"></i>`
      : `<i data-lucide="moon"></i>`;
    if (window.cvInitIcons) window.cvInitIcons();
  }
  btn.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
}
