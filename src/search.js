// Global Search Module
import { showToast } from './ui.js';

let cachedRestaurants = [];
let cachedSlots = [];
let cachedUsers = [];

export function setCachedData(restaurants, slots, users = []) {
  cachedRestaurants = restaurants || [];
  cachedSlots = slots || [];
  cachedUsers = users || [];
}

export async function performSearch(query) {
  if (!query || query.length < 2) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }

  try {
    const q = query.toLowerCase();

    const restaurantResults = cachedRestaurants.filter(r =>
      r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q)
    );

    const slotResults = cachedSlots.filter(s =>
      s.restaurantName?.toLowerCase().includes(q) || s.hostName?.toLowerCase().includes(q)
    );

    const results = {
      users: cachedUsers.filter(u => u.name?.toLowerCase().includes(q)),
      restaurants: restaurantResults,
      slots: slotResults
    };

    renderSearchResults(results);
  } catch (error) {
    showToast('Search failed: ' + error.message, 'error');
  }
}

function renderSearchResults(results) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  if (results.users.length === 0 && results.restaurants.length === 0 && results.slots.length === 0) {
    container.innerHTML = '<div class="empty-state">No results found</div>';
    return;
  }

  let html = '';

  if (results.users.length > 0) {
    html += '<h3>Users</h3>';
    html += results.users.map(u => `<div class="panel-item">${u.name}</div>`).join('');
  }

  if (results.restaurants.length > 0) {
    html += '<h3 style="margin-top: var(--spacing-lg);">Restaurants</h3>';
    html += results.restaurants.map(r => `
      <div class="panel-item" style="cursor: pointer;" onclick="window.openCreateSlotModal('${r.id}', '${r.name}')">
        <div>${r.name}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${r.cuisine}</div>
      </div>
    `).join('');
  }

  if (results.slots.length > 0) {
    html += '<h3 style="margin-top: var(--spacing-lg);">Dining Slots</h3>';
    html += results.slots.map(s => `
      <div class="panel-item" style="cursor: pointer;" onclick="window.openChatModal('${s.id}', '${s.restaurantName}')">
        <div>${s.restaurantName}</div>
        <div style="font-size: 12px; color: var(--text-muted);">Host: ${s.hostName}</div>
      </div>
    `).join('');
  }

  container.innerHTML = html;
}
