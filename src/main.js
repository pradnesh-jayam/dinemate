// DineMate Main Entry Point - Orchestrates all modules
import * as ui from './ui.js';
import * as auth from './auth.js';
import * as locations from './locations.js';
import * as restaurants from './restaurants.js';
import * as slots from './slots.js';
import * as chat from './chat.js';
import * as notifications from './notifications.js';
import * as profiles from './profiles.js';
import * as friends from './friends.js';
import * as badges from './badges.js';
import * as search from './search.js';
import * as analytics from './analytics.js';
import { initDemoMode, exitDemoMode, shouldBlockOperation } from './demoMode.js';
import { closeModal, closePanel, showToast, closeAllModals, closeAllPanels } from './ui.js';
import { db, collection, addDoc, getDocs, query, where } from './firebase.js';
import { auth } from './firebase.js';

// Migration data
const INDIAN_RESTAURANTS = {
  'New Delhi': [
    { name: 'Haldiram\'s', cuisine: 'Indian', rating: 4.5, distance: 1.2, notes: 'Famous for chaat and sweets' },
    { name: 'Karim\'s', cuisine: 'Mughlai', rating: 4.7, distance: 2.1, notes: 'Legendary Mughlai cuisine' },
    { name: 'Bukhara', cuisine: 'North Indian', rating: 4.8, distance: 3.5, notes: 'Fine dining Indian cuisine' },
    { name: 'Moti Mahal', cuisine: 'North Indian', rating: 4.4, distance: 1.8, notes: 'Butter chicken originators' },
    { name: 'Saravana Bhavan', cuisine: 'South Indian', rating: 4.3, distance: 2.3, notes: 'Authentic South Indian' }
  ],
  'Mumbai': [
    { name: 'Trishna', cuisine: 'Seafood', rating: 4.6, distance: 1.5, notes: 'Famous for seafood' },
    { name: 'Cafe Leopold', cuisine: 'Continental', rating: 4.2, distance: 0.8, notes: 'Iconic Mumbai cafe' },
    { name: 'Bademiya', cuisine: 'Mughlai', rating: 4.5, distance: 1.1, notes: 'Late night kebabs' },
    { name: 'Mahesh Lunch Home', cuisine: 'Seafood', rating: 4.4, distance: 2.0, notes: 'Konkan seafood' },
    { name: 'Cafe Mondegar', cuisine: 'Continental', rating: 4.1, distance: 0.9, notes: 'Historic cafe' }
  ],
  'Bangalore': [
    { name: 'MTR', cuisine: 'South Indian', rating: 4.7, distance: 1.3, notes: 'Legendary dosa and idli' },
    { name: 'Vidyarthi Bhavan', cuisine: 'South Indian', rating: 4.5, distance: 1.0, notes: 'Famous masala dosa' },
    { name: 'Chutney', cuisine: 'South Indian', rating: 4.3, distance: 2.1, notes: 'Variety of chutneys' },
    { name: 'Peshwa', cuisine: 'North Indian', rating: 4.2, distance: 1.8, notes: 'Peshwai cuisine' },
    { name: 'Nandini', cuisine: 'South Indian', rating: 4.1, distance: 1.5, notes: 'Andhra style' }
  ],
  'Hyderabad': [
    { name: 'Paradise Biryani', cuisine: 'Hyderabadi', rating: 4.8, distance: 1.2, notes: 'World famous biryani' },
    { name: 'Chutneys', cuisine: 'South Indian', rating: 4.5, distance: 2.0, notes: 'Variety of dosas' },
    { name: 'Bawarchi', cuisine: 'Hyderabadi', rating: 4.6, distance: 1.8, notes: 'Traditional biryani' },
    { name: 'Hotel Shadab', cuisine: 'Mughlai', rating: 4.4, distance: 1.5, notes: 'Old Hyderabad flavors' },
    { name: 'Kritunga', cuisine: 'Andhra', rating: 4.3, distance: 2.2, notes: 'Spicy Andhra cuisine' }
  ],
  'Chennai': [
    { name: 'Murugan Idli Shop', cuisine: 'South Indian', rating: 4.5, distance: 1.1, notes: 'Famous idlis' },
    { name: 'Saravana Bhavan', cuisine: 'South Indian', rating: 4.6, distance: 1.8, notes: 'Authentic Tamil cuisine' },
    { name: 'Anjappar', cuisine: 'Chettinad', rating: 4.4, distance: 2.0, notes: 'Chettinad specialties' },
    { name: 'Ponnusamy', cuisine: 'South Indian', rating: 4.3, distance: 1.6, notes: 'Non-veg specialties' },
    { name: 'Ratna Cafe', cuisine: 'South Indian', rating: 4.2, distance: 1.3, notes: 'Historic eatery' }
  ],
  'Trichy': [
    { name: 'Sree Akshaya', cuisine: 'South Indian', rating: 4.3, distance: 1.0, notes: 'Local favorite' },
    { name: 'Muniyandi Vilas', cuisine: 'South Indian', rating: 4.2, distance: 1.5, notes: 'Traditional meals' },
    { name: 'Hotel Tamil Nadu', cuisine: 'South Indian', rating: 4.1, distance: 0.8, notes: 'Government hotel' },
    { name: 'Chennai Silks', cuisine: 'South Indian', rating: 4.0, distance: 1.2, notes: 'Budget friendly' },
    { name: 'Thillai', cuisine: 'South Indian', rating: 4.2, distance: 1.8, notes: 'Local cuisine' }
  ],
  'Thanjavur': [
    { name: 'Sivakami', cuisine: 'South Indian', rating: 4.2, distance: 0.9, notes: 'Local specialty' },
    { name: 'Hotel Parisutham', cuisine: 'South Indian', rating: 4.1, distance: 1.1, notes: 'Traditional meals' },
    { name: 'Thevar\'s', cuisine: 'South Indian', rating: 4.3, distance: 1.4, notes: 'Authentic flavors' },
    { name: 'Sangam', cuisine: 'South Indian', rating: 4.0, distance: 1.0, notes: 'Budget option' },
    { name: 'Maruthi', cuisine: 'South Indian', rating: 4.1, distance: 1.6, notes: 'Local favorite' }
  ]
};

const DUMMY_USERS = [
  { displayName: 'Arjun Kumar', email: 'arjun.kumar@example.com' },
  { displayName: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { displayName: 'Rahul Verma', email: 'rahul.verma@example.com' },
  { displayName: 'Anita Desai', email: 'anita.desai@example.com' },
  { displayName: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { displayName: 'Meera Nair', email: 'meera.nair@example.com' },
  { displayName: 'Rajesh Iyer', email: 'rajesh.iyer@example.com' },
  { displayName: 'Kavita Reddy', email: 'kavita.reddy@example.com' },
  { displayName: 'Suresh Patel', email: 'suresh.patel@example.com' },
  { displayName: 'Divya Menon', email: 'divya.menon@example.com' }
];

const SLOT_DATES_2028 = [
  '2028-06-16', '2028-06-17', '2028-06-18', '2028-06-19', '2028-06-20',
  '2028-06-21', '2028-06-22', '2028-06-23', '2028-06-24', '2028-06-25'
];

const SLOT_TIMES = ['12:00', '13:00', '19:00', '20:00', '21:00'];

async function runMigration() {
  if (!auth.currentUser) {
    showToast('Please sign in first', 'error');
    return;
  }

  try {
    showToast('Starting migration...', 'info');
    console.log('🚀 Starting migration...');

    const restaurantIds = {};
    let restaurantCount = 0;
    let userCount = 0;
    let slotCount = 0;

    // Add restaurants
    for (const [location, restaurants] of Object.entries(INDIAN_RESTAURANTS)) {
      for (const restaurant of restaurants) {
        try {
          const snapshot = await getDocs(
            query(collection(db, 'restaurants'),
              where('name', '==', restaurant.name),
              where('location', '==', location))
          );
          
          if (snapshot.empty) {
            const docRef = await addDoc(collection(db, 'restaurants'), {
              ...restaurant,
              location: location,
              createdAt: new Date(),
              createdBy: 'migration-tool'
            });
            restaurantIds[restaurant.name] = docRef.id;
            restaurantCount++;
            console.log(`✓ Added ${restaurant.name} to ${location}`);
          } else {
            restaurantIds[restaurant.name] = snapshot.docs[0].id;
          }
        } catch (error) {
          console.error(`❌ Failed ${restaurant.name}:`, error);
        }
      }
    }

    // Add users
    for (const user of DUMMY_USERS) {
      try {
        const snapshot = await getDocs(
          query(collection(db, 'users'), where('email', '==', user.email))
        );
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'users'), {
            ...user,
            createdAt: new Date(),
            isDummy: true
          });
          userCount++;
        }
      } catch (error) {
        console.error(`❌ Failed ${user.displayName}:`, error);
      }
    }

    // Add slots
    const locations = Object.keys(INDIAN_RESTAURANTS);
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const restaurants = INDIAN_RESTAURANTS[location];
      
      if (restaurants.length === 0) continue;
      
      const restaurant = restaurants[i % restaurants.length];
      const restaurantId = restaurantIds[restaurant.name];
      
      if (!restaurantId) continue;
      
      const date = SLOT_DATES_2028[i % SLOT_DATES_2028.length];
      const time = SLOT_TIMES[i % SLOT_TIMES.length];
      const dummyUser = DUMMY_USERS[i % DUMMY_USERS.length];
      
      try {
        const snapshot = await getDocs(
          query(collection(db, 'slots'),
            where('restaurantId', '==', restaurantId),
            where('date', '==', date),
            where('time', '==', time))
        );
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'slots'), {
            restaurantId: restaurantId,
            restaurantName: restaurant.name,
            date: date,
            time: time,
            partySize: Math.floor(Math.random() * 3) + 1,
            notes: 'Looking for dining companions!',
            location: location,
            hostName: dummyUser.displayName,
            hostPhoto: null,
            createdBy: 'migration-tool',
            participants: [],
            maxCapacity: 4,
            createdAt: new Date(),
            isDummy: true
          });
          slotCount++;
        }
      } catch (error) {
        console.error(`❌ Failed slot:`, error);
      }
    }

    showToast(`Migration complete: ${restaurantCount} restaurants, ${userCount} users, ${slotCount} slots`, 'success');
    console.log('✅ Migration complete!');
    
  } catch (error) {
    showToast('Migration failed: ' + error.message, 'error');
    console.error('❌ Migration failed:', error);
  }
}

// Global exports for onclick handlers
window.closeModal = closeModal;
window.closePanel = closePanel;
window.showToast = showToast;
window.runMigration = runMigration;

// Initialize Application
async function initializeApp() {
  console.log('🍽️ DineMate v4 - Modern Edition');

  // Setup global window references for module functions
  setupGlobalReferences();

  // Setup Auth
  auth.setupAuth();
  auth.setupGoogleSignInButton();

  // Setup Navigation
  setupNavigation();

  // Setup Event Listeners
  setupEventListeners();

  // Setup Dark Mode
  setupDarkMode();

  console.log('✅ Application initialized');
}

function setupGlobalReferences() {
  // Auth
  window.signOut = auth.signOut;

  // Locations
  window.switchLocation = locations.setCurrentLocation;

  // Restaurants
  window.openCreateSlotModal = slots.openCreateSlotModal;
  window.openRateModal = restaurants.openRateModal;

  // Slots
  window.openJoinModal = slots.openJoinModal;
  window.shareSlot = slots.shareSlot;
  window.cancelSlot = slots.cancelSlot;

  // Chat
  window.openChatModal = chat.openChatModal;

  // Navigation & UI
  window.showSection = ui.showSection;

  // Demo Mode Support
  window.updateUserInfo = profiles.updateUserInfo;
  window.renderRestaurants = restaurants.renderRestaurants;
  window.renderSlots = slots.renderSlots;
  window.updateProfileStats = profiles.updateProfileStats;
}

function setupNavigation() {
  // Nav Links
  document.querySelectorAll('.nav-link, .tab-bar-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
      closeAllPanels();
      ui.showSection(link.dataset.section);
    });
  });
}

function setupEventListeners() {
  // Sidebar Toggle
  document.getElementById('locationBtn')?.addEventListener('click', locations.showLocationPanel);
  document.getElementById('notificationsBtn')?.addEventListener('click', notifications.showNotificationsPanel);
  document.getElementById('messagesBtn')?.addEventListener('click', chat.showMessagesPanel);

  // Migration Button
  document.getElementById('runMigrationBtn')?.addEventListener('click', runMigration);

  // Restaurant Management
  document.getElementById('addRestaurantBtn')?.addEventListener('click', restaurants.showAddRestaurantModal);
  document.getElementById('addRestaurantForm')?.addEventListener('submit', restaurants.handleAddRestaurant);

  // Slot Creation
  document.getElementById('slotPartySize')?.addEventListener('change', (e) => {
    const extra = document.getElementById('partySizeExtra');
    if (extra) extra.classList.toggle('show', e.target.value === '6');
  });
  document.getElementById('quickSlotBtn')?.addEventListener('click', slots.createQuickSlot);
  document.getElementById('createSlotForm')?.addEventListener('submit', slots.handleCreateSlot);

  // Slot Joining
  document.getElementById('joinPartySize')?.addEventListener('change', (e) => {
    const extra = document.getElementById('joinPartySizeExtra');
    if (extra) extra.classList.toggle('show', e.target.value === '6');
  });
  document.getElementById('joinSlotForm')?.addEventListener('submit', slots.handleJoinSlot);
  document.getElementById('joinChatFirstBtn')?.addEventListener('click', chat.chatBeforeJoin);

  // Slot Browsing - Filters
  document.getElementById('upcomingToggle')?.addEventListener('click', () => {
    slots.setShowPastSlots(false);
    updateFilterButtons();
  });
  document.getElementById('pastToggle')?.addEventListener('click', () => {
    slots.setShowPastSlots(true);
    updateFilterButtons();
  });
  document.getElementById('cuisineFilter')?.addEventListener('change', slots.applyFilters);
  document.getElementById('dateFilter')?.addEventListener('change', slots.applyFilters);
  document.getElementById('partySizeFilter')?.addEventListener('change', slots.applyFilters);
  document.getElementById('clearFiltersBtn')?.addEventListener('click', slots.clearFilters);

  // Ratings
  document.querySelectorAll('.rating-star').forEach(star => {
    star.addEventListener('click', restaurants.selectRating);
  });
  document.getElementById('submitRatingBtn')?.addEventListener('click', restaurants.submitRating);

  // Location Management
  document.getElementById('addLocationBtn')?.addEventListener('click', locations.showAddLocationModal);
  document.getElementById('addLocationForm')?.addEventListener('submit', locations.handleAddLocation);

  // Notifications
  document.getElementById('markAllReadBtn')?.addEventListener('click', notifications.markAllAsRead);

  // Chats
  document.getElementById('chatForm')?.addEventListener('submit', chat.handleSendMessage);

  // Profile
  document.getElementById('editNameBtn')?.addEventListener('click', profiles.editName);
  document.getElementById('togglePastMeals')?.addEventListener('click', profiles.togglePastMeals);

  // Demo Mode
  document.getElementById('demoModeBtn')?.addEventListener('click', initDemoMode);
  document.getElementById('exitDemoBtn')?.addEventListener('click', exitDemoMode);

  // User Menu
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenu = document.getElementById('userMenu');
  if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target)) {
        userMenu.classList.remove('show');
      }
    });
  }

  // Sign Out
  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    auth.signOut();
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      search.performSearch(e.target.value);
    });
  }
}

function setupDarkMode() {
  const darkModeBtn = document.getElementById('darkModeBtn');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
      const newTheme = ui.toggleTheme();
      localStorage.setItem('dinemate-theme', newTheme);
      darkModeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Set initial icon
    const theme = ui.getTheme();
    darkModeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function updateFilterButtons() {
  const upcomingBtn = document.getElementById('upcomingToggle');
  const pastBtn = document.getElementById('pastToggle');
  if (upcomingBtn && pastBtn) {
    const isPast = slots.getShowPastSlots();
    upcomingBtn.classList.toggle('active', !isPast);
    pastBtn.classList.toggle('active', isPast);
  }
}

// Start Application
document.addEventListener('DOMContentLoaded', initializeApp);
