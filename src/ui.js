import { state } from './state.js';
import { icon, qsa, qs, refreshIcons } from './utils.js';

export function showLogin() {
  qs('#loginPage').style.display = 'grid';
  qs('#appContainer').classList.remove('active');
  qs('#demoBanner')?.classList.remove('show');
  refreshIcons();
}

export function showApp() {
  qs('#loginPage').style.display = 'none';
  qs('#appContainer').classList.add('active');
  qs('#demoBanner')?.classList.toggle('show', state.isDemo);
  refreshIcons();
}

export function showSection(section) {
  qsa('.section').forEach(el => el.classList.remove('active'));
  qs(`#${section}Section`)?.classList.add('active');
  qsa('.nav-link, .tab-bar-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });
  refreshIcons();
}

export function openModal(id) {
  qs(`#${id}`)?.classList.add('show');
  refreshIcons();
}

export function closeModal(id) {
  qs(`#${id}`)?.classList.remove('show');
  if (id === 'chatModal' && state.listeners.chat) {
    state.listeners.chat();
    state.listeners.chat = null;
  }
}

export function openPanel(id) {
  qs(`#${id}`)?.classList.add('show');
}

export function closePanel(id) {
  qs(`#${id}`)?.classList.remove('show');
}

export function showToast(message, type = 'success') {
  const toast = qs('#toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

export function setTheme(theme) {
  const isDark = theme !== 'light';
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('dinemate-theme', isDark ? 'dark' : 'light');
  qs('#themeBtn').innerHTML = icon(isDark ? 'sun' : 'moon', 18);
  refreshIcons();
}

export function toggleTheme() {
  setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
}

export function updateLocationText() {
  qsa('#currentLocationDisplay, #browseLocationDisplay, #addRestaurantLocation').forEach(el => {
    el.textContent = state.currentLocation;
  });
}

export function renderSkeleton(target, count = 4) {
  qs(target).innerHTML = Array.from({ length: count }, () => '<div class="skeleton-card"><span></span><strong></strong><p></p></div>').join('');
}

export function bindGlobalUi() {
  qsa('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
  qsa('[data-panel-close]').forEach(btn => btn.addEventListener('click', () => closePanel(btn.dataset.panelClose)));
  qsa('.nav-link, .tab-bar-item').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  qs('#themeBtn').addEventListener('click', toggleTheme);
  qs('#userMenuBtn').addEventListener('click', event => {
    event.stopPropagation();
    qs('#userMenu').classList.toggle('show');
  });
  document.addEventListener('click', () => qs('#userMenu').classList.remove('show'));
  setTheme(localStorage.getItem('dinemate-theme') || 'dark');
}
