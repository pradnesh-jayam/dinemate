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
import { closeModal, closePanel, showToast, closeAllModals, closeAllPanels } from './ui.js';

// Global exports for onclick handlers
window.closeModal = closeModal;
window.closePanel = closePanel;
window.showToast = showToast;

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
