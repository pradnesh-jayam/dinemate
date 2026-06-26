// Analytics Dashboard Module
import { showToast } from './ui.js';
import { isDemoModeActive, DEMO_ANALYTICS } from './demoData.js';

export async function loadAnalytics() {
  const container = document.getElementById('analyticsContent');
  if (!container) return;

  try {
    // In demo mode, use demo data
    if (isDemoModeActive()) {
      renderAnalyticsDashboard(DEMO_ANALYTICS);
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
        <h2>Coming Soon</h2>
        <p style="color: var(--text-muted); margin-top: 8px;">Analytics dashboard is coming in a future update</p>
      </div>
    `;
  } catch (error) {
    showToast('Failed to load analytics: ' + error.message, 'error');
  }
}

async function fetchUserStats() {
  return {
    mealsHosted: 0,
    mealsJoined: 0,
    peopleMet: 0,
    restaurantsVisited: 0,
    favoriteCuisine: 'Not determined',
    monthlyActivity: []
  };
}

function renderAnalyticsDashboard(stats) {
  const container = document.getElementById('analyticsContent');
  if (!container) return;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
      <div class="stat-box">
        <div class="stat-number">${stats.mealsHosted}</div>
        <div class="stat-label">Meals Hosted</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${stats.mealsJoined}</div>
        <div class="stat-label">Meals Joined</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${stats.peopleMet}</div>
        <div class="stat-label">People Met</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${stats.restaurantsVisited}</div>
        <div class="stat-label">Restaurants Visited</div>
      </div>
    </div>
    <div class="card">
      <h3>Your Favorite Cuisine</h3>
      <p style="font-size: 32px; margin: var(--spacing-lg) 0;">${stats.favoriteCuisine}</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const section = document.getElementById('analyticsSection');
    if (section && section.classList.contains('active')) {
      loadAnalytics();
    }
  }, 500);
});
