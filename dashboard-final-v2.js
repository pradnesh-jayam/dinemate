// ========================================
// DineMate Dashboard v2 - Enhanced Location System
// ========================================

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// State
let currentUser = null;
let currentLocation = 'New Delhi';
let supabaseClient = null;
let allRestaurants = [];
let allSlots = [];
let availableLocations = [];
let currentSlotContext = null;

const STORAGE_USER = 'dinemate-user-v2';
const STORAGE_LOCATION = 'dinemate-location-v2';

// DEFAULT LOCATIONS & DEMO RESTAURANTS
const DEFAULT_LOCATIONS = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'];

const DEMO_RESTAURANTS = {
  'New Delhi': [
    { id: '1', name: 'The Spice Route', emoji: '🍛', rating: 4.8, distance: '0.5 km', cuisine: 'Indian', isDummy: true },
    { id: '2', name: 'Pizza Perfetto', emoji: '🍕', rating: 4.6, distance: '0.8 km', cuisine: 'Italian', isDummy: true },
    { id: '3', name: 'Sushi Paradise', emoji: '🍣', rating: 4.7, distance: '1.2 km', cuisine: 'Japanese', isDummy: true },
    { id: '4', name: 'Burger Haven', emoji: '🍔', rating: 4.5, distance: '1.5 km', cuisine: 'American', isDummy: true },
    { id: '5', name: 'Biryani House', emoji: '🍲', rating: 4.9, distance: '0.3 km', cuisine: 'Hyderabadi', isDummy: true },
    { id: '6', name: 'Pasta Italiana', emoji: '🍝', rating: 4.7, distance: '1.0 km', cuisine: 'Italian', isDummy: true },
    { id: '7', name: 'Dragon Wok', emoji: '🥡', rating: 4.6, distance: '0.7 km', cuisine: 'Chinese', isDummy: true },
    { id: '8', name: 'Kebab Palace', emoji: '🍖', rating: 4.7, distance: '0.9 km', cuisine: 'Middle Eastern', isDummy: true },
    { id: '9', name: 'Taco Fiesta', emoji: '🌮', rating: 4.4, distance: '1.1 km', cuisine: 'Mexican', isDummy: true },
    { id: '10', name: 'Curry Express', emoji: '🥘', rating: 4.7, distance: '0.6 km', cuisine: 'Indian', isDummy: true },
    { id: '11', name: 'Steak House', emoji: '🥩', rating: 4.8, distance: '1.3 km', cuisine: 'American', isDummy: true },
    { id: '12', name: 'Coffee Haven', emoji: '☕', rating: 4.5, distance: '0.4 km', cuisine: 'Cafe', isDummy: true }
  ],
  'Mumbai': [
    { id: '13', name: 'Mumbai Spice', emoji: '🍛', rating: 4.8, distance: '0.5 km', cuisine: 'Indian', isDummy: true },
    { id: '14', name: 'Pizzeria Milano', emoji: '🍕', rating: 4.7, distance: '0.8 km', cuisine: 'Italian', isDummy: true },
    { id: '15', name: 'Tokyo Sushi', emoji: '🍣', rating: 4.8, distance: '1.2 km', cuisine: 'Japanese', isDummy: true },
    { id: '16', name: 'Burger King Local', emoji: '🍔', rating: 4.6, distance: '1.5 km', cuisine: 'American', isDummy: true },
    { id: '17', name: 'Hyderabadi Biryani', emoji: '🍲', rating: 4.9, distance: '0.3 km', cuisine: 'Hyderabadi', isDummy: true },
    { id: '18', name: 'Pasta Paradise', emoji: '🍝', rating: 4.8, distance: '1.0 km', cuisine: 'Italian', isDummy: true },
    { id: '19', name: 'Shanghai Kitchen', emoji: '🥡', rating: 4.7, distance: '0.7 km', cuisine: 'Chinese', isDummy: true },
    { id: '20', name: 'Middle East Grill', emoji: '🍖', rating: 4.6, distance: '0.9 km', cuisine: 'Middle Eastern', isDummy: true },
    { id: '21', name: 'Taco Mexican', emoji: '🌮', rating: 4.5, distance: '1.1 km', cuisine: 'Mexican', isDummy: true },
    { id: '22', name: 'Curry Central', emoji: '🥘', rating: 4.8, distance: '0.6 km', cuisine: 'Indian', isDummy: true },
    { id: '23', name: 'Prime Steaks', emoji: '🥩', rating: 4.9, distance: '1.3 km', cuisine: 'American', isDummy: true },
    { id: '24', name: 'Morning Cafe', emoji: '☕', rating: 4.6, distance: '0.4 km', cuisine: 'Cafe', isDummy: true }
  ],
  'Bangalore': [
    { id: '25', name: 'South Indian Kitchen', emoji: '🥘', rating: 4.8, distance: '0.4 km', cuisine: 'South Indian', isDummy: true },
    { id: '26', name: 'Gourmet Burger', emoji: '🍔', rating: 4.7, distance: '0.6 km', cuisine: 'American', isDummy: true },
    { id: '27', name: 'Thai Emerald', emoji: '🥗', rating: 4.6, distance: '0.9 km', cuisine: 'Thai', isDummy: true },
    { id: '28', name: 'Biryani Express', emoji: '🍲', rating: 4.9, distance: '0.5 km', cuisine: 'Hyderabadi', isDummy: true },
    { id: '29', name: 'Cafe Mocha', emoji: '☕', rating: 4.5, distance: '0.3 km', cuisine: 'Cafe', isDummy: true },
    { id: '30', name: 'Seafood Bay', emoji: '🦐', rating: 4.8, distance: '1.1 km', cuisine: 'Seafood', isDummy: true },
    { id: '31', name: 'Chinese Wok', emoji: '🥡', rating: 4.7, distance: '0.8 km', cuisine: 'Chinese', isDummy: true },
    { id: '32', name: 'Italian Trattoria', emoji: '🍝', rating: 4.7, distance: '1.0 km', cuisine: 'Italian', isDummy: true },
    { id: '33', name: 'Tandoor Palace', emoji: '🍛', rating: 4.8, distance: '0.7 km', cuisine: 'Indian', isDummy: true },
    { id: '34', name: 'Fusion Bites', emoji: '🍜', rating: 4.6, distance: '0.5 km', cuisine: 'Asian Fusion', isDummy: true },
    { id: '35', name: 'Street Eats', emoji: '🌮', rating: 4.5, distance: '1.2 km', cuisine: 'Street Food', isDummy: true },
    { id: '36', name: 'Vegan Paradise', emoji: '🥗', rating: 4.7, distance: '0.9 km', cuisine: 'Vegan', isDummy: true }
  ]
};

// ========================================
// INITIALIZATION
// ========================================

async function init() {
  try {
    console.log('🚀 Initializing DineMate Dashboard v2...');
    
    await setupSupabase();
    await checkAndLoadUser();
    setupEventListeners();
    await loadLocationData();
    await loadLocation();
    await renderDashboard();
    
    showToast('Welcome to DineMate! 🍽️');
    console.log('✅ Dashboard ready');
  } catch (error) {
    console.error('Init error:', error);
    showToast('Error loading dashboard');
  }
}

async function setupSupabase() {
  const url = window.DINEMATE_SUPABASE_URL?.trim();
  const anonKey = window.DINEMATE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error('Supabase credentials missing');
  }

  try {
    await loadSupabaseScript();
    supabaseClient = window.supabase.createClient(url, anonKey);
    console.log('✅ Supabase connected');
  } catch (error) {
    console.error('Supabase setup error:', error);
    throw error;
  }
}

async function loadSupabaseScript() {
  if (window.supabase) return;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function checkAndLoadUser() {
  try {
    if (supabaseClient) {
      const { data } = await supabaseClient.auth.getSession();
      if (data?.session?.user) {
        currentUser = {
          id: data.session.user.id,
          email: data.session.user.email,
          isAuthenticated: true
        };
        localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser));
        console.log('✅ Loaded user from Supabase session');
        return;
      }
    }

    const stored = localStorage.getItem(STORAGE_USER);
    if (stored) {
      currentUser = JSON.parse(stored);
      console.log('✅ Loaded user from localStorage');
      return;
    }

    throw new Error('User not authenticated');
  } catch (error) {
    console.error('User load error:', error);
    logout();
    throw error;
  }
}

async function loadLocationData() {
  try {
    availableLocations = DEFAULT_LOCATIONS;
    
    // Load custom locations from Supabase
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('locations')
        .select('name')
        .limit(50);
      
      if (!error && data) {
        const customLocations = data.map(l => l.name);
        availableLocations = [...new Set([...DEFAULT_LOCATIONS, ...customLocations])];
        console.log(`✅ Loaded ${availableLocations.length} locations`);
      }
    }

    updateLocationDropdown();
  } catch (error) {
    console.error('Location data error:', error);
    availableLocations = DEFAULT_LOCATIONS;
  }
}

function updateLocationDropdown() {
  const select = $('#locationSelect');
  if (!select) return;

  select.innerHTML = '';
  availableLocations.forEach(loc => {
    const option = document.createElement('option');
    option.value = loc;
    option.textContent = `📍 ${loc}`;
    if (loc === currentLocation) option.selected = true;
    select.appendChild(option);
  });
}

async function loadLocation() {
  try {
    const stored = localStorage.getItem(STORAGE_LOCATION);
    if (stored && availableLocations.includes(stored)) {
      currentLocation = stored;
      console.log('📍 Location loaded:', currentLocation);
      return;
    }

    currentLocation = 'New Delhi';
    localStorage.setItem(STORAGE_LOCATION, currentLocation);
  } catch (error) {
    console.error('Location error:', error);
    currentLocation = 'New Delhi';
  }
}

// ========================================
// DATA LOADING
// ========================================

async function loadRestaurants() {
  try {
    console.log(`🔍 Loading restaurants for ${currentLocation}...`);

    allRestaurants = [];

    // Load user-added real restaurants
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('user_restaurants')
        .select('*')
        .eq('location', currentLocation)
        .eq('is_real', true);

      if (!error && data) {
        allRestaurants = data.map(r => ({
          id: r.id,
          name: r.name,
          emoji: r.emoji || getRandomFoodEmoji(),
          rating: r.rating,
          distance: `${r.distance_km} km`,
          cuisine: r.cuisine,
          isDummy: false
        }));
        console.log(`✅ Loaded ${allRestaurants.length} real restaurants`);
      }
    }

    // Add dummy restaurants to fill up to 12
    const dummies = DEMO_RESTAURANTS[currentLocation] || DEMO_RESTAURANTS['New Delhi'];
    const slotsNeeded = Math.max(0, 12 - allRestaurants.length);
    
    if (slotsNeeded > 0) {
      const selectedDummies = dummies.slice(0, slotsNeeded);
      allRestaurants = [...allRestaurants, ...selectedDummies];
      console.log(`✅ Added ${slotsNeeded} demo restaurants (total: ${allRestaurants.length})`);
    } else {
      allRestaurants = allRestaurants.slice(0, 12);
    }

  } catch (error) {
    console.error('Restaurant load error:', error);
    const dummies = DEMO_RESTAURANTS[currentLocation] || DEMO_RESTAURANTS['New Delhi'];
    allRestaurants = dummies.slice(0, 12);
  }
}

async function loadSlots() {
  try {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
      .from('dining_slots')
      .select('*')
      .eq('location', currentLocation)
      .limit(15);

    if (error) throw error;
    allSlots = data || [];
    console.log(`✅ Loaded ${allSlots.length} slots`);
  } catch (error) {
    console.error('Slots load error:', error);
    allSlots = [];
  }
}

// ========================================
// RENDERING
// ========================================

async function renderDashboard() {
  try {
    updateLocationDropdown();
    await loadRestaurants();
    await loadSlots();
    
    renderRestaurantsTab();
    renderCreateTab();
    renderBrowseTab();
    renderProfileTab();
    
    console.log('✅ Dashboard rendered');
  } catch (error) {
    console.error('Render error:', error);
    showToast('Error rendering dashboard');
  }
}

function renderRestaurantsTab() {
  const container = $('#restaurantsGrid');
  if (!container) return;

  container.innerHTML = '';

  if (allRestaurants.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🏘️</div>
        <p style="margin: 16px 0;">No restaurants found in <strong>${currentLocation}</strong></p>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Be the first to add a restaurant here!</p>
        <button class="btn-submit" onclick="openCreateRestaurantModal()" style="width: 100%; max-width: 300px;">
          ➕ Add Restaurant
        </button>
      </div>
    `;
    return;
  }

  allRestaurants.forEach(restaurant => {
    const badge = restaurant.isDummy ? '<span style="font-size: 11px; background: #f0f0f0; padding: 2px 8px; border-radius: 12px; color: #666;">Demo</span>' : '';
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="restaurant-image">${restaurant.emoji || '🍽️'}</div>
      <div class="restaurant-info">
        <div class="restaurant-name">${restaurant.name} ${badge}</div>
        <div class="restaurant-meta">
          <span class="rating">⭐ ${restaurant.rating || 4.5}</span>
          <span>${restaurant.distance || '1 km'}</span>
          <span>🏷️ ${restaurant.cuisine || 'Restaurant'}</span>
        </div>
        <button class="restaurant-btn" onclick="openCreateSlotModal('${restaurant.id}', '${restaurant.name.replace(/'/g, "\\'")}')">
          📝 Create Slot Here
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCreateTab() {
  const container = $('#createRestaurantsGrid');
  if (!container) return;

  container.innerHTML = '';

  if (allRestaurants.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🍽️</div><p>No restaurants found. Add one first!</p></div>';
    return;
  }

  allRestaurants.slice(0, 12).forEach(restaurant => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="restaurant-image">${restaurant.emoji || '🍽️'}</div>
      <div class="restaurant-info">
        <div class="restaurant-name">${restaurant.name}</div>
        <div class="restaurant-meta">
          <span class="rating">⭐ ${restaurant.rating || 4.5}</span>
          <span>${restaurant.distance || '1 km'}</span>
        </div>
        <button class="restaurant-btn" onclick="openCreateSlotModal('${restaurant.id}', '${restaurant.name.replace(/'/g, "\\'")}')">
          + Create Slot
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBrowseTab() {
  const container = $('#browseSlotsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (allSlots.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No slots available. Create one to get started!</p></div>';
    return;
  }

  allSlots.forEach(slot => {
    const card = document.createElement('div');
    card.className = 'slot-card';
    card.innerHTML = `
      <div class="slot-info">
        <div class="slot-restaurant">${slot.restaurant_name}</div>
        <div class="slot-details">
          📅 ${formatDate(slot.slot_date)} at ${slot.slot_time}
        </div>
        <div class="slot-location">📍 ${slot.location}</div>
      </div>
      <button class="slot-action" onclick="openJoinSlotModal('${slot.id}', '${slot.restaurant_name.replace(/'/g, "\\'")}')">
        Join
      </button>
    `;
    container.appendChild(card);
  });
}

function renderProfileTab() {
  const container = $('#profileContainer');
  if (!container || !currentUser) return;

  const profile = currentUser.profile || {};
  container.innerHTML = `
    <div class="profile-view">
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-info">
          <h2>${profile.name || 'User'}</h2>
          <p>${currentUser.email || 'No email'}</p>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>Current Location</h3>
        <p>${currentLocation}</p>
      </div>
      
      <button class="btn-secondary" onclick="logout()" style="width: 100%; margin-top: 20px;">
        🚪 Logout
      </button>
    </div>
  `;
}

// ========================================
// MODALS
// ========================================

function openCreateSlotModal(restaurantId, restaurantName) {
  const modal = $('#createSlotModal');
  if (!modal) return;

  $('#createRestaurant').value = restaurantName;
  currentSlotContext = { restaurantId, restaurantName };
  openModal('createSlotModal');
}

function openJoinSlotModal(slotId, restaurantName) {
  const modal = $('#joinSlotModal');
  if (!modal) return;

  $('#joinRestaurant').value = restaurantName;
  currentSlotContext = { slotId, restaurantName };
  openModal('joinSlotModal');
}

function openCreateRestaurantModal() {
  const locationName = $('#restaurantLocationName');
  if (locationName) locationName.textContent = currentLocation;
  openModal('createRestaurantModal');
}

function openModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) modal.classList.remove('show');
}

// ========================================
// HANDLERS
// ========================================

async function handleLocationChange() {
  const select = $('#locationSelect');
  const newLocation = select?.value;

  if (newLocation && newLocation !== currentLocation) {
    currentLocation = newLocation;
    localStorage.setItem(STORAGE_LOCATION, newLocation);
    showToast(`📍 Location changed to ${newLocation}`);
    await renderDashboard();
  }
}

async function handleCreateSlot(e) {
  e.preventDefault();

  if (!currentSlotContext || !supabaseClient) {
    showToast('Error: Missing data');
    return;
  }

  try {
    const date = $('#createDate')?.value;
    const time = $('#createTime')?.value;
    const notes = $('#createNotes')?.value || '';
    const partySize = parseInt($('#createPartySize')?.value || '1');

    if (!date || !time) {
      showToast('Please fill all fields');
      return;
    }

    const { data, error } = await supabaseClient
      .from('dining_slots')
      .insert([{
        restaurant_id: currentSlotContext.restaurantId,
        restaurant_name: currentSlotContext.restaurantName,
        location: currentLocation,
        slot_date: date,
        slot_time: time,
        created_by: currentUser.id,
        capacity: 6,
        notes: notes
      }])
      .select();

    if (error) throw error;

    if (data && data[0]) {
      await supabaseClient
        .from('slot_members')
        .insert([{
          slot_id: data[0].id,
          user_id: currentUser.id,
          party_size: partySize
        }]);
    }

    closeModal('createSlotModal');
    showToast('✅ Slot created!');
    await renderDashboard();
  } catch (error) {
    console.error('Create slot error:', error);
    showToast('Error: ' + error.message);
  }
}

async function handleJoinSlot(e) {
  e.preventDefault();

  if (!currentSlotContext || !supabaseClient) {
    showToast('Error: Missing data');
    return;
  }

  try {
    const partySize = parseInt($('#joinPartySize')?.value || '1');

    const { error } = await supabaseClient
      .from('slot_members')
      .insert([{
        slot_id: currentSlotContext.slotId,
        user_id: currentUser.id,
        party_size: partySize
      }]);

    if (error) throw error;

    closeModal('joinSlotModal');
    showToast('✅ Joined the slot!');
    await renderDashboard();
  } catch (error) {
    console.error('Join slot error:', error);
    showToast('Error: ' + error.message);
  }
}

async function handleCreateRestaurant(e) {
  e.preventDefault();

  if (!supabaseClient || !currentUser) {
    showToast('Error: Missing data');
    return;
  }

  try {
    const name = $('#restaurantName')?.value?.trim();
    const cuisine = $('#restaurantCuisine')?.value;
    const rating = parseFloat($('#restaurantRating')?.value || '4.5');
    const distance = parseFloat($('#restaurantDistance')?.value || '1.0');

    if (!name || !cuisine) {
      showToast('Please fill required fields');
      return;
    }

    // Save to Supabase
    const { data, error } = await supabaseClient
      .from('user_restaurants')
      .insert([{
        name: name,
        location: currentLocation,
        cuisine: cuisine,
        rating: rating,
        distance_km: distance,
        emoji: getRandomFoodEmoji(),
        created_by: currentUser.id,
        is_real: true
      }])
      .select();

    if (error) throw error;

    $('#createRestaurantForm').reset();
    closeModal('createRestaurantModal');
    
    showToast('✅ Restaurant added! Now create a slot.');
    await renderDashboard();
  } catch (error) {
    console.error('Create restaurant error:', error);
    showToast('Error: ' + error.message);
  }
}

async function handleAddLocation(e) {
  e.preventDefault();

  if (!supabaseClient) {
    showToast('Error: Supabase not connected');
    return;
  }

  try {
    const name = $('#locationName')?.value?.trim();
    const lat = parseFloat($('#locationLat')?.value || null);
    const lng = parseFloat($('#locationLng')?.value || null);

    if (!name) {
      showToast('Please enter location name');
      return;
    }

    if (availableLocations.includes(name)) {
      showToast('This location already exists');
      return;
    }

    const { data, error } = await supabaseClient
      .from('locations')
      .insert([{
        name: name,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        created_by: currentUser.id
      }])
      .select();

    if (error) throw error;

    availableLocations.push(name);
    updateLocationDropdown();

    $('#addLocationForm').reset();
    closeModal('addLocationModal');
    
    showToast(`✅ Location ${name} added!`);
  } catch (error) {
    console.error('Add location error:', error);
    showToast('Error: ' + error.message);
  }
}

// ========================================
// UI HELPERS
// ========================================

function setupEventListeners() {
  $('#toggleSidebarBtn')?.addEventListener('click', toggleSidebar);
  $('#sidebarToggleBtn')?.addEventListener('click', toggleSidebar);
  $('#addLocationBtn')?.addEventListener('click', () => openModal('addLocationModal'));
  $('#createSlotForm')?.addEventListener('submit', handleCreateSlot);
  $('#joinSlotForm')?.addEventListener('submit', handleJoinSlot);
  $('#createRestaurantForm')?.addEventListener('submit', handleCreateRestaurant);
  $('#addLocationForm')?.addEventListener('submit', handleAddLocation);

  $$('.tab-btn').forEach((btn, idx) => {
    const tabNames = ['restaurants', 'create', 'browse', 'profile'];
    if (idx < tabNames.length) {
      btn.addEventListener('click', () => showTab(tabNames[idx]));
    }
  });
}

function toggleSidebar() {
  const sidebar = $('#sidebar');
  const main = $('#mainContent');
  sidebar?.classList.toggle('closed');
  main?.classList.toggle('expanded');
}

function showTab(tabName) {
  const tabs = ['restaurants', 'create', 'browse', 'profile'];
  const tabMap = { restaurants: 'restaurantsTab', create: 'createTab', browse: 'browseTab', profile: 'profileTab' };
  
  tabs.forEach(t => {
    $(`#${tabMap[t]}`)?.classList.remove('active');
  });

  $$('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  $$('.sidebar-item').forEach((item) => {
    item.classList.remove('active');
  });

  $(`#${tabMap[tabName]}`)?.classList.add('active');
  
  const tabOrder = ['restaurants', 'create', 'browse', 'profile'];
  const btnIdx = tabOrder.indexOf(tabName);
  if (btnIdx >= 0) {
    $$('.tab-btn')[btnIdx]?.classList.add('active');
    $$('.sidebar-item')[btnIdx]?.classList.add('active');
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(message, duration = 3000) {
  const toast = $('#toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
}

function getRandomFoodEmoji() {
  const emojis = ['🍛', '🍕', '🍣', '🍔', '🍲', '🍝', '🥗', '🦐', '🌮', '🥟', '☕', '🍜'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function logout() {
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_LOCATION);
  window.location.href = '/landing.html';
}

// ========================================
// START APP
// ========================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
