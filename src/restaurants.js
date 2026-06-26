// Restaurant Management Module
import { restaurantServices, serverTimestamp, auth } from './firebase.js';
import { showModal, closeModal, showToast, renderList, getInputValue, setInputValue } from './ui.js';
import { cuisineEmojis } from './config.js';
import { debounce } from './utils.js';
import * as locations from './locations.js';
import { isDemoModeActive, DEMO_RESTAURANTS } from './demoData.js';

let restaurants = [];
let restaurantsListener = null;
let selectedRating = 0;
let ratingRestaurantId = null;
let setupRestaurantsListenerDebounced = null;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initListenerDebounce() {
  if (!setupRestaurantsListenerDebounced) {
    setupRestaurantsListenerDebounced = debounce(setupRestaurantsListenerImmediate, 300);
  }
}

function setupRestaurantsListenerImmediate() {
  if (restaurantsListener) restaurantsListener();

  // In demo mode, use demo data instead of Firestore
  if (isDemoModeActive()) {
    restaurants = DEMO_RESTAURANTS;
    renderRestaurants();
    renderCreateRestaurants();
    populateCuisineFilter();
    return;
  }

  const location = locations.getCurrentLocation();
  restaurantsListener = restaurantServices.onRestaurantsChanged(
    location,
    (data) => {
      restaurants = data;
      renderRestaurants();
      renderCreateRestaurants();
      populateCuisineFilter();
    },
    (error) => {
      showToast('Failed to load restaurants: ' + error.message, 'error');
      console.error('Restaurants listener error:', error);
    }
  );
}

export function setupRestaurantsListener() {
  initListenerDebounce();

  const grid = document.getElementById('restaurantGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }

  setupRestaurantsListenerDebounced();
}

function renderRestaurants() {
  const grid = document.getElementById('restaurantGrid');
  if (!grid) return;

  if (restaurants.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-emoji">🍽️</div>
        <p>No restaurants yet. Be the first to add one!</p>
        <button class="btn btn-primary" onclick="document.getElementById('addRestaurantModal').classList.add('show')">Add Restaurant</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = restaurants.map(r => `
    <div class="restaurant-card">
      <div class="restaurant-emoji">${cuisineEmojis[r.cuisine] || '🍽️'}</div>
      <div class="restaurant-name">${escapeHtml(r.name)}</div>
      <div class="restaurant-cuisine">${escapeHtml(r.cuisine)}</div>
      <div class="restaurant-rating">
        <span>${'★'.repeat(Math.round(r.rating))}</span>
        <span>${(r.rating || 0).toFixed(1)}</span>
      </div>
      <div class="restaurant-distance">${r.distance ? r.distance + ' km' : ''}</div>
      <div class="restaurant-notes">${escapeHtml(r.notes || '')}</div>
      <div class="restaurant-actions">
        <button class="btn btn-primary" onclick="window.openCreateSlotModal('${escapeHtml(r.id)}', '${escapeHtml(r.name)}')">Create Slot</button>
        <button class="btn btn-ghost" onclick="window.openRateModal('${escapeHtml(r.id)}', '${escapeHtml(r.name)}')">Rate</button>
      </div>
    </div>
  `).join('');
}

function renderCreateRestaurants() {
  const grid = document.getElementById('createRestaurantGrid');
  if (!grid) return;

  grid.innerHTML = restaurants.map(r => `
    <div class="restaurant-card">
      <div class="restaurant-emoji">${cuisineEmojis[r.cuisine] || '🍽️'}</div>
      <div class="restaurant-name">${escapeHtml(r.name)}</div>
      <div class="restaurant-cuisine">${escapeHtml(r.cuisine)}</div>
      <div class="restaurant-rating">
        <span>${'★'.repeat(Math.round(r.rating))}</span>
        <span>${(r.rating || 0).toFixed(1)}</span>
      </div>
      <div class="restaurant-actions">
        <button class="btn btn-primary" onclick="window.openCreateSlotModal('${escapeHtml(r.id)}', '${escapeHtml(r.name)}')">Create Slot</button>
      </div>
    </div>
  `).join('');
}

function populateCuisineFilter() {
  const cuisines = [...new Set(restaurants.map(r => r.cuisine))];
  const select = document.getElementById('cuisineFilter');
  if (select) {
    select.innerHTML = '<option value="">All Cuisines</option>' +
      cuisines.map(c => `<option value="${c}">${c}</option>`).join('');
  }
}

export function showAddRestaurantModal() {
  showModal('addRestaurantModal');
}

export async function handleAddRestaurant(e) {
  e.preventDefault();
  const name = document.getElementById('newRestaurantName').value.trim();
  const cuisine = document.getElementById('newRestaurantCuisine').value;
  let rating = parseFloat(document.getElementById('newRestaurantRating').value) || 4.0;
  rating = Math.min(5, Math.max(1, rating));
  const distance = parseFloat(document.getElementById('newRestaurantDistance').value) || 0;
  const notes = document.getElementById('newRestaurantNotes').value.trim();
  const location = locations.getCurrentLocation();

  if (!name || !cuisine) {
    showToast('Please fill required fields', 'error');
    return;
  }

  try {
    await restaurantServices.createRestaurant({
      name, cuisine, rating, distance, notes, location,
      createdBy: auth.currentUser?.uid,
      createdAt: serverTimestamp()
    });
    closeModal('addRestaurantModal');
    showToast('Restaurant added!', 'success');
    document.getElementById('addRestaurantForm').reset();
  } catch (error) {
    showToast('Failed to add restaurant: ' + error.message, 'error');
  }
}

export function openRateModal(restaurantId, restaurantName) {
  ratingRestaurantId = restaurantId;
  selectedRating = 0;
  document.getElementById('rateRestaurantName').textContent = restaurantName;
  showModal('rateRestaurantModal');
  updateRatingStars();
}

export function selectRating(e) {
  selectedRating = parseInt(e.target.dataset.rating);
  updateRatingStars();
}

function updateRatingStars() {
  document.querySelectorAll('.rating-star').forEach(star => {
    star.classList.toggle('active', parseInt(star.dataset.rating) <= selectedRating);
  });
}

export async function submitRating() {
  if (selectedRating === 0) {
    showToast('Please select a rating', 'error');
    return;
  }

  try {
    await restaurantServices.addRating(ratingRestaurantId, auth.currentUser?.uid, selectedRating);

    // Recalculate average
    const ratings = await restaurantServices.getRating(ratingRestaurantId);
    if (ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      await restaurantServices.updateAverageRating(ratingRestaurantId, ratings);
    }

    closeModal('rateRestaurantModal');
    showToast('Rating submitted!', 'success');
  } catch (error) {
    showToast('Failed to submit rating: ' + error.message, 'error');
  }
}
