// Location Management Module
import { locationServices } from './firebase.js';
import { showModal, closeModal, showPanel, closePanel, showToast, renderList } from './ui.js';
import { setStorageItem, getStorageItem } from './utils.js';
import * as restaurants from './restaurants.js';
import * as slots from './slots.js';

let currentLocation = 'New Delhi';
let locations = [];

export async function initializeLocations() {
  try {
    await loadLocations();
    currentLocation = getStorageItem('dinemate-current-location') || 'New Delhi';
    updateLocationDisplays();
    restaurants.setupRestaurantsListener();
    slots.setupSlotsListener();
  } catch (error) {
    showToast('Failed to load locations', 'error');
  }
}

export async function loadLocations() {
  try {
    locations = await locationServices.getLocations();
    if (locations.length === 0) {
      locations = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Trichy', 'Thanjavur'];
    }
  } catch (error) {
    console.error('Failed to load locations:', error);
    locations = ['New Delhi'];
  }
}

export function getLocationsList() {
  return Promise.resolve(locations);
}

export function getCurrentLocation() {
  return currentLocation;
}

export function setCurrentLocation(location) {
  currentLocation = location;
  setStorageItem('dinemate-current-location', location);
  updateLocationDisplays();
  closePanel('locationPanel');
  restaurants.setupRestaurantsListener();
  slots.setupSlotsListener();
}

function updateLocationDisplays() {
  document.querySelectorAll('.location-display').forEach(el => {
    el.textContent = currentLocation;
  });
}

export function showLocationPanel() {
  renderLocationList();
  showPanel('locationPanel');
}

function renderLocationList() {
  const list = document.getElementById('locationList');
  list.innerHTML = locations.map(loc => `
    <div class="panel-item ${loc === currentLocation ? 'unread' : ''}" style="cursor: pointer;" data-location="${loc}">
      <div class="panel-item-text">${loc === currentLocation ? '📍 ' : ''}${loc}</div>
    </div>
  `).join('');

  list.querySelectorAll('.panel-item').forEach(item => {
    item.addEventListener('click', () => {
      setCurrentLocation(item.dataset.location);
    });
  });
}

export function showAddLocationModal() {
  showModal('addLocationModal');
}

export async function handleAddLocation(e) {
  e.preventDefault();
  const name = document.getElementById('newLocationName').value.trim();

  if (!name || locations.includes(name)) {
    showToast('Location already exists or invalid', 'error');
    return;
  }

  try {
    await locationServices.addLocation(name);
    locations.push(name);
    closeModal('addLocationModal');
    showToast('Location added!', 'success');
    renderLocationList();
    document.getElementById('addLocationForm').reset();
  } catch (error) {
    showToast('Failed to add location: ' + error.message, 'error');
  }
}
