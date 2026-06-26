// Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyCJncY4-RAtb8jWW_IMnAEktgZ9Ej8v-xY",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "dinemate07.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "dinemate07",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "dinemate07.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "194248381333",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:194248381333:web:c648f5f5ef016077d09c9c"
};

// Cuisine Emoji Mapping
export const cuisineEmojis = {
  'Indian': '🍛',
  'Italian': '🍝',
  'Chinese': '🥡',
  'Japanese': '🍣',
  'Thai': '🍜',
  'Mexican': '🌮',
  'American': '🍔',
  'French': '🥐',
  'Cafe': '☕',
  'Fast Food': '🍟',
  'Other': '🍽️'
};

// Cuisine Options List
export const cuisines = [
  'Indian', 'Italian', 'Chinese', 'Japanese', 'Thai',
  'Mexican', 'American', 'French', 'Cafe', 'Fast Food', 'Other'
];

// Default Cities
export const defaultCities = [
  'New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Trichy', 'Thanjavur'
];

// Search Radius Options (km)
export const searchRadii = [1, 3, 5, 10];

// Party Size Options
export const partySizes = [1, 2, 3, 4, 5, 6];

// Place Categories for OSM Search
export const placeCategories = {
  'restaurants': 'amenity=restaurant',
  'cafes': 'amenity=cafe',
  'hotels': 'tourism=hotel',
  'fast_food': 'amenity=fast_food',
  'food_court': 'amenity=food_court',
  'dining': 'amenity=dining',
  'coffee_shops': 'amenity=cafe AND cuisine=coffee'
};

// Badge Definitions
export const badges = [
  {
    id: 'first_meal',
    title: 'First Meal',
    emoji: '🍽️',
    description: 'Host your first dining slot',
    condition: (stats) => stats.mealsHosted >= 1
  },
  {
    id: 'social_explorer',
    title: 'Social Explorer',
    emoji: '🗺️',
    description: 'Join 5 different restaurants',
    condition: (stats) => stats.uniqueRestaurants >= 5
  },
  {
    id: 'food_enthusiast',
    title: 'Food Enthusiast',
    emoji: '🌶️',
    description: 'Try 3+ different cuisines',
    condition: (stats) => stats.cuisineCount >= 3
  },
  {
    id: 'top_host',
    title: 'Top Host',
    emoji: '👑',
    description: 'Host 10+ dining slots',
    condition: (stats) => stats.mealsHosted >= 10
  },
  {
    id: 'frequent_diner',
    title: 'Frequent Diner',
    emoji: '🔥',
    description: 'Join 50+ meals',
    condition: (stats) => stats.mealsJoined >= 50
  },
  {
    id: 'popular',
    title: 'Popular',
    emoji: '🤝',
    description: 'Make 10+ friends',
    condition: (stats) => stats.friendsCount >= 10
  },
  {
    id: 'highly_rated',
    title: 'Highly Rated',
    emoji: '⭐',
    description: 'Achieve 4.5+ rating from others',
    condition: (stats) => stats.averageRating >= 4.5
  }
];

// Toast Timeout (ms)
export const TOAST_TIMEOUT = 3000;

// Modal Z-Index
export const MODAL_Z_INDEX = 1000;
export const PANEL_Z_INDEX = 1000;

// API Endpoints
export const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';
export const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Date Formats
export const dateFormats = {
  shortDate: { weekday: 'short', month: 'short', day: 'numeric' },
  longDate: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  time: { hour: 'numeric', minute: '2-digit' },
  fullDateTime: { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
};
