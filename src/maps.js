import {
  addDoc,
  collection,
  db,
  serverTimestamp
} from './firebase.js';
import { state } from './state.js';
import { distanceKm, escapeHtml, qs } from './utils.js';
import { renderRestaurants } from './restaurants.js';
import { closePanel, openPanel, showSection, showToast, updateLocationText } from './ui.js';

let map;
let markerLayer;

const categories = {
  Restaurant: ['amenity=restaurant'],
  Cafe: ['amenity=cafe'],
  Hotel: ['tourism=hotel'],
  'Fast Food': ['amenity=fast_food'],
  FoodCourt: ['amenity=food_court'],
  Coffee: ['shop=coffee']
};

export function bindMapEvents() {
  qs('#locationBtn').addEventListener('click', () => {
    renderLocationList();
    openPanel('locationPanel');
  });
  qs('#detectLocationBtn').addEventListener('click', detectUserLocation);
  qs('#discoverNearbyBtn').addEventListener('click', async () => {
    await detectUserLocation();
    showSection('map');
  });
  qs('#mapRefreshBtn').addEventListener('click', searchNearbyPlaces);
  qs('#mapRadius').addEventListener('change', searchNearbyPlaces);
  qs('#locationSearchForm').addEventListener('submit', async event => {
    event.preventDefault();
    const query = qs('#locationSearchInput').value.trim();
    if (query) await searchByLocation(query);
  });
}

export function setupMap() {
  if (map || !window.L) return;
  map = L.map('map', { zoomControl: true }).setView([28.6139, 77.2090], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

export async function detectUserLocation() {
  if (!navigator.geolocation) {
    showToast('Location is not available in this browser.', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    state.coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    map?.setView([state.coordinates.lat, state.coordinates.lng], 14);
    await reverseGeocode();
    await searchNearbyPlaces();
    closePanel('locationPanel');
  }, () => {
    showToast('Could not detect your location.', 'error');
  }, { enableHighAccuracy: true, timeout: 10000 });
}

export async function searchByLocation(placeName) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`;
  const response = await fetch(url);
  const results = await response.json();
  if (!results.length) {
    showToast('Location not found', 'error');
    return;
  }
  const place = results[0];
  state.coordinates = { lat: Number(place.lat), lng: Number(place.lon) };
  state.currentLocation = place.display_name.split(',').slice(0, 2).join(', ');
  localStorage.setItem('dinemate-current-location', state.currentLocation);
  updateLocationText();
  map?.setView([state.coordinates.lat, state.coordinates.lng], 13);
  await searchNearbyPlaces();
  closePanel('locationPanel');
}

export async function searchNearbyPlaces() {
  setupMap();
  if (!state.coordinates) {
    await searchByLocation(state.currentLocation);
    return;
  }

  const radius = Number(qs('#mapRadius').value || 3000);
  const places = await searchByCategory(Object.keys(categories), radius);
  renderMapPlaces(places);
  renderMapResults(places);
}

export async function searchByCategory(categoryNames, radius) {
  const around = `around:${radius},${state.coordinates.lat},${state.coordinates.lng}`;
  const blocks = categoryNames.flatMap(category => {
    return categories[category].map(tag => {
      const [key, value] = tag.split('=');
      return `node["${key}"="${value}"](${around});way["${key}"="${value}"](${around});`;
    });
  }).join('');

  const body = `[out:json][timeout:25];(${blocks});out center 40;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body
  });
  const data = await response.json();

  return data.elements
    .map(item => normalizeOsmPlace(item))
    .filter(place => place.name)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 30);
}

function normalizeOsmPlace(item) {
  const lat = item.lat || item.center?.lat;
  const lng = item.lon || item.center?.lon;
  const tags = item.tags || {};
  const category = categoryFromTags(tags);
  const distance = distanceKm(state.coordinates, { lat, lng });

  return {
    osmId: item.id,
    name: tags.name,
    category,
    cuisine: category,
    address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', '),
    coordinates: { lat, lng },
    distance: distance || 0,
    rating: 4.2,
    notes: tags.cuisine ? `Known for ${tags.cuisine}` : `Found near ${state.currentLocation}`
  };
}

function categoryFromTags(tags) {
  if (tags.amenity === 'cafe') return 'Cafe';
  if (tags.amenity === 'fast_food') return 'Fast Food';
  if (tags.amenity === 'food_court') return 'Restaurant';
  if (tags.tourism === 'hotel') return 'Hotel';
  return 'Restaurant';
}

function renderMapPlaces(places) {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();
  L.marker([state.coordinates.lat, state.coordinates.lng]).addTo(markerLayer).bindPopup('You are here');

  places.forEach(place => {
    L.marker([place.coordinates.lat, place.coordinates.lng])
      .addTo(markerLayer)
      .bindPopup(`
        <strong>${escapeHtml(place.name)}</strong><br>
        ${escapeHtml(place.category)} - ${place.distance.toFixed(1)} km<br>
        <a target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}">Open in Google Maps</a>
      `);
  });
}

function renderMapResults(places) {
  const results = qs('#mapResults');
  if (!places.length) {
    results.innerHTML = '<div class="empty-mini">No nearby dining places found. Try a wider radius.</div>';
    return;
  }

  results.innerHTML = places.map(place => `
    <div class="map-result">
      <strong>${escapeHtml(place.name)}</strong>
      <span>${escapeHtml(place.category)} - ${place.distance.toFixed(1)} km</span>
      <small>${escapeHtml(place.address || state.currentLocation)}</small>
      <button class="btn btn-ghost" data-save-place="${place.osmId}" type="button">Save</button>
    </div>
  `).join('');

  results.querySelectorAll('[data-save-place]').forEach(button => {
    button.addEventListener('click', () => savePlace(places.find(place => String(place.osmId) === button.dataset.savePlace)));
  });
}

async function savePlace(place) {
  if (state.isDemo) {
    state.restaurants.unshift({
      ...place,
      id: `demo-map-${Date.now()}`,
      location: state.currentLocation,
      createdBy: state.user.uid,
      favoriteBy: [state.user.uid]
    });
    renderRestaurants();
    showToast('Demo place saved locally');
    return;
  }
  await addDoc(collection(db, 'restaurants'), {
    ...place,
    location: state.currentLocation,
    createdBy: state.user.uid,
    favoriteBy: [state.user.uid],
    createdAt: serverTimestamp()
  });
  showToast('Place saved');
}

async function reverseGeocode() {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${state.coordinates.lat}&lon=${state.coordinates.lng}`;
  const response = await fetch(url);
  const data = await response.json();
  const address = data.address || {};
  state.currentLocation = address.city || address.town || address.suburb || address.state || state.currentLocation;
  localStorage.setItem('dinemate-current-location', state.currentLocation);
  updateLocationText();
}

function renderLocationList() {
  const recent = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Trichy', 'Thanjavur'];
  qs('#locationList').innerHTML = recent.map(city => `
    <button class="panel-item ${city === state.currentLocation ? 'unread' : ''}" data-city="${city}" type="button">
      <span>${city}</span>
    </button>
  `).join('');
  qs('#locationList').querySelectorAll('[data-city]').forEach(button => {
    button.addEventListener('click', async () => searchByLocation(button.dataset.city));
  });
}
