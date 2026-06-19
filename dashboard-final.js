// ========================================
// DineMate Dashboard - Clean Production Version
// ========================================

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// State
let currentUser = null;
let currentLocation = 'New Delhi';
let supabaseClient = null;
let allRestaurants = [];
let allSlots = [];

const STORAGE_USER = 'dinemate-user-v2';
const STORAGE_LOCATION = 'dinemate-location-v2';

// ========================================
// INITIALIZATION
// ========================================

async function init() {
  try {
    console.log('🚀 Initializing DineMate Dashboard...');
    
    await setupSupabase();
    await checkAndLoadUser();
    setupEventListeners();
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
    console.log('✅ Supabase configured');
  } catch (error) {
    console.error('Supabase setup failed:', error);
    throw error;
  }
}

function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Supabase'));
    document.head.appendChild(script);
  });
}

async function checkAndLoadUser() {
  if (!supabaseClient) throw new Error('Supabase not ready');

  try {
    // First, check Supabase session (for fresh OAuth)
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.log('Session check error:', sessionError);
    }

    // If we have an active session, use it
    if (session?.user) {
      console.log('✅ Found active Supabase session');
      currentUser = {
        id: session.user.id,
        email: session.user.email,
        isAuthenticated: true,
        profile: {
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        }
      };
      
      // Save to localStorage
      localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser));
      return;
    }

    // Otherwise, try to load from localStorage
    const stored = localStorage.getItem(STORAGE_USER);
    if (stored) {
      currentUser = JSON.parse(stored);
      console.log('✅ Loaded user from localStorage');
      return;
    }

    // No user found anywhere
    throw new Error('User not authenticated');
  } catch (error) {
    console.error('User load error:', error);
    logout();
    throw error;
  }
}

async function loadLocation() {
  try {
    const stored = localStorage.getItem(STORAGE_LOCATION);
    if (stored) {
      currentLocation = stored;
      console.log('📍 Location loaded:', currentLocation);
      return;
    }

    // Try geolocation
    try {
      showToast('📍 Detecting your location...');
      const location = await detectUserLocation();
      if (location) {
        currentLocation = location;
        localStorage.setItem(STORAGE_LOCATION, location);
        updateLocationDisplay();
        console.log('📍 Location detected:', location);
        return;
      }
    } catch (geoError) {
      console.log('Geolocation failed, using default');
    }

    // Default location
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

    if (typeof searchRestaurantsByLocation === 'function') {
      const real = await searchRestaurantsByLocation(currentLocation);
      allRestaurants = real;
      console.log(`✅ Loaded ${real.length} restaurants`);
    } else {
      console.warn('searchRestaurantsByLocation not available');
      allRestaurants = [];
    }
  } catch (error) {
    console.error('Restaurant load error:', error);
    allRestaurants = [];
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
    updateLocationDisplay();
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

function renderCreateTab() {
  const container = $('#createRestaurantsGrid');
  if (!container) return;

  container.innerHTML = '';

  if (allRestaurants.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🍽️</div><p>No restaurants found. Try another location.</p></div>';
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
          ➕ Add First Restaurant
        </button>
      </div>
    `;
    return;
  }

  allRestaurants.forEach(restaurant => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="restaurant-image">${restaurant.emoji || '🍽️'}</div>
      <div class="restaurant-info">
        <div class="restaurant-name">${restaurant.name}</div>
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

    // Join your own slot
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
    const notes = $('#restaurantNotes')?.value || '';

    if (!name || !cuisine) {
      showToast('Please fill required fields');
      return;
    }

    // Create restaurant in a simple restaurants table (if you add it)
    // For now, add it to allRestaurants locally and show it
    const newRestaurant = {
      id: `user-${Date.now()}`,
      name: name,
      cuisine: cuisine,
      rating: rating,
      distance: `${distance} km`,
      emoji: getRandomFoodEmoji(),
      created_by: currentUser.id,
      location: currentLocation,
      notes: notes
    };

    // Add to local array
    allRestaurants.unshift(newRestaurant);

    // Clear form
    $('#createRestaurantForm').reset();
    closeModal('createRestaurantModal');
    
    showToast('✅ Restaurant added! Now create a slot.');
    
    // Re-render to show the new restaurant
    renderRestaurantsTab();
  } catch (error) {
    console.error('Create restaurant error:', error);
    showToast('Error: ' + error.message);
  }
}

// ========================================
// UI HELPERS
// ========================================

function setupEventListeners() {
  $('#toggleSidebarBtn')?.addEventListener('click', toggleSidebar);
  $('#sidebarToggleBtn')?.addEventListener('click', toggleSidebar);
  $('#geoLocationBtn')?.addEventListener('click', changeLocation);
  $('#createSlotForm')?.addEventListener('submit', handleCreateSlot);
  $('#joinSlotForm')?.addEventListener('submit', handleJoinSlot);
  $('#createRestaurantForm')?.addEventListener('submit', handleCreateRestaurant);

  // Setup tab button listeners
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

  // Update sidebar items active state
  $$('.sidebar-item').forEach((item) => {
    item.classList.remove('active');
  });

  $(`#${tabMap[tabName]}`)?.classList.add('active');
  
  // Find and mark the corresponding button as active
  const tabOrder = ['restaurants', 'create', 'browse', 'profile'];
  const btnIdx = tabOrder.indexOf(tabName);
  if (btnIdx >= 0) {
    $$('.tab-btn')[btnIdx]?.classList.add('active');
    $$('.sidebar-item')[btnIdx]?.classList.add('active');
  }
}

function updateLocationDisplay() {
  const display = $('#locationDisplay');
  if (display) display.textContent = `📍 ${currentLocation}`;
}

async function changeLocation() {
  const locations = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'];
  
  // Create a simple location selector modal
  const choice = prompt(
    `Current location: ${currentLocation}\n\nSelect a location:\n${locations.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\nEnter number or location name:`,
    currentLocation
  );
  
  if (!choice) return;
  
  let selectedLocation = choice;
  
  // If user entered a number, convert to location name
  if (!isNaN(choice)) {
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < locations.length) {
      selectedLocation = locations[idx];
    } else {
      showToast('Invalid location number');
      return;
    }
  }
  
  // If location not in predefined list, allow custom entry
  if (!locations.includes(selectedLocation) && selectedLocation !== currentLocation) {
    // Allow custom locations
  }
  
  if (selectedLocation && selectedLocation !== currentLocation) {
    currentLocation = selectedLocation;
    localStorage.setItem(STORAGE_LOCATION, selectedLocation);
    updateLocationDisplay();
    showToast(`📍 Location changed to ${selectedLocation}`);
    await renderDashboard();
  }
}

async function detectUserLocation() {
  if (typeof getCityFromCoords === 'function') {
    try {
      const { lat, lon } = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          (err) => reject(err)
        );
      });
      
      const geoInfo = await getCityFromCoords(lat, lon);
      return geoInfo?.city;
    } catch (error) {
      console.log('Geolocation not available');
      return null;
    }
  }
  return null;
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
