import {
  addDoc,
  collection,
  db,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from './firebase.js';
import { categoryIcons, state } from './state.js';
import { escapeHtml, icon, qs, refreshIcons } from './utils.js';
import { openModal, renderSkeleton, showToast } from './ui.js';

export function bindRestaurantEvents() {
  qs('#addRestaurantBtn').addEventListener('click', () => openModal('addRestaurantModal'));
  qs('#placeCategoryFilter').addEventListener('change', renderRestaurants);
  qs('#globalSearchInput').addEventListener('input', renderRestaurants);

  qs('#addRestaurantForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = qs('#newRestaurantName').value.trim();
    const cuisine = qs('#newRestaurantCuisine').value;

    if (!name || !cuisine) {
      showToast('Please add the place name and category.', 'error');
      return;
    }

    const place = {
      id: `demo-restaurant-${Date.now()}`,
      name,
      cuisine,
      category: cuisine,
      rating: Number(qs('#newRestaurantRating').value || 4),
      reviewCount: 0,
      distance: Number(qs('#newRestaurantDistance').value || 0),
      address: qs('#newRestaurantAddress').value.trim(),
      notes: qs('#newRestaurantNotes').value.trim(),
      location: state.currentLocation,
      createdBy: state.user.uid
    };

    if (state.isDemo) {
      state.restaurants.unshift(place);
      renderRestaurants();
      renderCreateRestaurants();
      populateCuisineFilter();
      form.reset();
      document.getElementById('addRestaurantModal').classList.remove('show');
      showToast('Demo place added locally');
      return;
    }

    await addDoc(collection(db, 'restaurants'), {
      ...place,
      createdAt: serverTimestamp()
    });

    form.reset();
    document.getElementById('addRestaurantModal').classList.remove('show');
    showToast('Place added');
  });

  qs('#ratingForm').addEventListener('submit', saveRating);
}

export function listenForRestaurants() {
  if (state.isDemo) {
    renderRestaurants();
    renderCreateRestaurants();
    populateCuisineFilter();
    return;
  }
  if (state.listeners.restaurants) state.listeners.restaurants();
  renderSkeleton('#restaurantGrid');

  const q = query(collection(db, 'restaurants'), where('location', '==', state.currentLocation));
  state.listeners.restaurants = onSnapshot(q, snapshot => {
    state.restaurants = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderRestaurants();
    renderCreateRestaurants();
    populateCuisineFilter();
  });
}

export function renderRestaurants() {
  const search = qs('#globalSearchInput').value.trim().toLowerCase();
  const category = qs('#placeCategoryFilter').value;
  const restaurants = state.restaurants.filter(place => {
    const text = `${place.name} ${place.cuisine} ${place.address || ''}`.toLowerCase();
    return (!search || text.includes(search)) && (!category || place.cuisine === category || place.category === category);
  });

  const grid = qs('#restaurantGrid');
  if (!restaurants.length) {
    grid.innerHTML = emptyPlaceState();
    return;
  }

  grid.innerHTML = restaurants.map(cardTemplate).join('');
  grid.querySelectorAll('[data-create-slot]').forEach(btn => {
    btn.addEventListener('click', () => window.openCreateSlotModal(btn.dataset.id, btn.dataset.name));
  });
  grid.querySelectorAll('[data-rate-place]').forEach(btn => {
    btn.addEventListener('click', () => openRateModal(btn.dataset.id, btn.dataset.name));
  });
  refreshIcons();
}

export function renderCreateRestaurants() {
  const grid = qs('#createRestaurantGrid');
  if (!state.restaurants.length) {
    grid.innerHTML = emptyPlaceState();
    return;
  }
  grid.innerHTML = state.restaurants.map(cardTemplate).join('');
  grid.querySelectorAll('[data-create-slot]').forEach(btn => {
    btn.addEventListener('click', () => window.openCreateSlotModal(btn.dataset.id, btn.dataset.name));
  });
  grid.querySelectorAll('[data-rate-place]').forEach(btn => {
    btn.addEventListener('click', () => openRateModal(btn.dataset.id, btn.dataset.name));
  });
  refreshIcons();
}

function cardTemplate(place) {
  const rating = Number(place.rating || 0);
  return `
    <article class="restaurant-card">
      <div class="card-topline">
        <span class="cuisine-tag cuisine-${escapeHtml(String(place.cuisine || 'Dining').toLowerCase().replaceAll(' ', '-'))}">${icon('utensils', 14)}${escapeHtml(place.cuisine || 'Dining')}</span>
        <span>${icon('map-pin', 14)}${escapeHtml(place.distance ? `${Number(place.distance).toFixed(1)} km` : place.category || place.cuisine)}</span>
      </div>
      <h2>${escapeHtml(place.name)}</h2>
      <p>${escapeHtml(place.address || place.cuisine || 'Dining place')}</p>
      <div class="rating-line"><strong>${icon('star', 15)}${rating.toFixed(1)}</strong><span>${Number(place.reviewCount || 0)} reviews</span></div>
      <p class="card-note">${escapeHtml(place.notes || 'A good place to start a shared meal.')}</p>
      <div class="card-actions">
        <button class="btn btn-primary" data-create-slot data-id="${place.id}" data-name="${escapeHtml(place.name)}" type="button">${icon('calendar-plus', 16)}Create slot</button>
        <button class="btn btn-ghost" data-rate-place data-id="${place.id}" data-name="${escapeHtml(place.name)}" type="button">${icon('star', 16)}Rate</button>
      </div>
    </article>
  `;
}

function emptyPlaceState() {
  return `
    <div class="empty-state wide">
      <h2>No places here yet</h2>
      <p>Add a restaurant or use location discovery to pull nearby food spots.</p>
      <button class="btn btn-primary" onclick="document.getElementById('addRestaurantModal').classList.add('show')" type="button">Add place</button>
    </div>
  `;
}

function populateCuisineFilter() {
  const cuisines = [...new Set(state.restaurants.map(item => item.cuisine).filter(Boolean))].sort();
  qs('#cuisineFilter').innerHTML = '<option value="">All cuisines</option>'
    + cuisines.map(cuisine => `<option value="${escapeHtml(cuisine)}">${escapeHtml(cuisine)}</option>`).join('');
}

function openRateModal(id, name) {
  state.ratingRestaurantId = id;
  qs('#rateRestaurantName').textContent = name;
  qs('#ratingValue').value = 5;
  qs('#ratingReview').value = '';
  openModal('rateRestaurantModal');
}

async function saveRating(event) {
  event.preventDefault();
  const rating = Number(qs('#ratingValue').value);
  const review = qs('#ratingReview').value.trim();
  const restaurantId = state.ratingRestaurantId;

  if (!restaurantId || rating < 1 || rating > 5) {
    showToast('Choose a rating from 1 to 5.', 'error');
    return;
  }

  if (state.isDemo) {
    const place = state.restaurants.find(item => item.id === restaurantId);
    if (place) {
      place.reviewCount = Number(place.reviewCount || 0) + 1;
      place.rating = Number((((Number(place.rating || 0) * (place.reviewCount - 1)) + rating) / place.reviewCount).toFixed(1));
    }
    document.getElementById('rateRestaurantModal').classList.remove('show');
    renderRestaurants();
    renderCreateRestaurants();
    showToast('Demo rating saved locally');
    return;
  }

  await setDoc(doc(db, 'restaurants', restaurantId, 'ratings', state.user.uid), {
    rating,
    review,
    uid: state.user.uid,
    name: state.userDoc?.name || state.user.displayName || 'User',
    createdAt: serverTimestamp()
  }, { merge: true });

  const ratings = await getDocs(collection(db, 'restaurants', restaurantId, 'ratings'));
  const values = ratings.docs.map(item => Number(item.data().rating || 0));
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  await updateDoc(doc(db, 'restaurants', restaurantId), {
    rating: Number(average.toFixed(1)),
    reviewCount: values.length
  });

  document.getElementById('rateRestaurantModal').classList.remove('show');
  showToast('Rating saved');
}
