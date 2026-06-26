/**
 * Demo Mode Implementation
 * Bypasses OAuth and loads seeded data without writing to Firestore
 */

import { setDemoMode, getDemoMode, isDemoModeActive, DEMO_USER, DEMO_RESTAURANTS, DEMO_SLOTS, DEMO_CHATS } from './demoData.js';

// Demo mode state
let demoUser = null;
let demoRestaurants = [];
let demoSlots = [];
let demoChats = [];

/**
 * Initialize demo mode
 */
export function initDemoMode() {
  demoUser = DEMO_USER;
  demoRestaurants = DEMO_RESTAURANTS;
  demoSlots = DEMO_SLOTS;
  demoChats = DEMO_CHATS;
  
  setDemoMode(true);
  
  // Show demo banner
  const banner = document.getElementById('demoBanner');
  if (banner) {
    banner.style.display = 'flex';
  }
  
  // Hide login page and show app
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  
  // Load demo data into UI
  loadDemoData();
}

/**
 * Exit demo mode
 */
export function exitDemoMode() {
  setDemoMode(false);
  
  // Hide demo banner
  const banner = document.getElementById('demoBanner');
  if (banner) {
    banner.style.display = 'none';
  }
  
  // Show login page and hide app
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('appContainer').style.display = 'none';
  
  // Clear demo data
  demoUser = null;
  demoRestaurants = [];
  demoSlots = [];
  demoChats = [];
}

/**
 * Load demo data into UI
 */
function loadDemoData() {
  // Set user info
  if (window.updateUserInfo) {
    window.updateUserInfo(demoUser);
  }
  
  // Load restaurants
  if (window.renderRestaurants) {
    window.renderRestaurants(demoRestaurants);
  }
  
  // Load slots
  if (window.renderSlots) {
    window.renderSlots(demoSlots);
  }
  
  // Load profile stats
  if (window.updateProfileStats) {
    window.updateProfileStats(demoUser.stats);
  }
}

/**
 * Demo mode Firestore wrapper - prevents writes
 */
export function demoFirestoreWrapper(collection, operation, data) {
  if (!isDemoModeActive()) {
    // Not in demo mode, proceed with normal Firestore operations
    return null; // Let the original function handle it
  }
  
  // In demo mode, prevent all writes
  if (operation === 'add' || operation === 'update' || operation === 'delete') {
    console.warn('Demo Mode: Write operations are disabled');
    return Promise.reject(new Error('Demo mode does not allow write operations'));
  }
  
  // Read operations return demo data
  if (operation === 'get') {
    switch (collection) {
      case 'restaurants':
        return Promise.resolve(demoRestaurants);
      case 'slots':
        return Promise.resolve(demoSlots);
      case 'users':
        return Promise.resolve([demoUser]);
      default:
        return Promise.resolve([]);
    }
  }
  
  return Promise.resolve([]);
}

/**
 * Check if operation should be blocked in demo mode
 */
export function shouldBlockOperation(operation) {
  return isDemoModeActive() && ['add', 'update', 'delete'].includes(operation);
}

/**
 * Get demo user
 */
export function getDemoUser() {
  return demoUser;
}

/**
 * Get demo restaurants
 */
export function getDemoRestaurants() {
  return demoRestaurants;
}

/**
 * Get demo slots
 */
export function getDemoSlots() {
  return demoSlots;
}

/**
 * Get demo chats
 */
export function getDemoChats() {
  return demoChats;
}
