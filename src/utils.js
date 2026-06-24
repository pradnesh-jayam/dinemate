import { dateFormats } from './config.js';

// Date Formatting
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', dateFormats.shortDate);
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatFullDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return '';
  return `${formatDate(dateStr)} at ${formatTime(timeStr)}`;
};

// Relative Time
export const timeAgo = (date) => {
  if (!date) return 'Just now';
  const d = date instanceof Date ? date : new Date(date.seconds * 1000);
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
};

// Get Today's Date (YYYY-MM-DD)
export const getToday = () => new Date().toISOString().slice(0, 10);

// User Initials
export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate Email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Party Size Validation & Formatting
export const validatePartySize = (size) => {
  const n = parseInt(size);
  return n >= 1 && n <= 1000;
};

export const formatPartySize = (size) => {
  const n = parseInt(size);
  if (n === 1) return '1 person';
  return n + ' people';
};

// Distance Formatting
export const formatDistance = (km) => {
  const d = parseFloat(km);
  if (d < 1) return Math.round(d * 1000) + ' m';
  return d.toFixed(1) + ' km';
};

// Rating Formatting
export const formatRating = (rating) => {
  return parseFloat(rating).toFixed(1);
};

export const renderStars = (rating, max = 5) => {
  const filled = Math.round(rating);
  return '★'.repeat(filled) + '☆'.repeat(Math.max(0, max - filled));
};

// String Utilities
export const truncate = (str, length) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-');
};

// Array Utilities
export const unique = (array, key) => {
  if (key) {
    return [...new Map(array.map(item => [item[key], item])).values()];
  }
  return [...new Set(array)];
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Filtering
export const filterBy = (array, key, value) => {
  if (!value) return array;
  return array.filter(item => item[key] === value);
};

export const searchArray = (array, query, searchKeys) => {
  if (!query) return array;
  const q = query.toLowerCase();
  return array.filter(item =>
    searchKeys.some(key =>
      String(item[key] || '').toLowerCase().includes(q)
    )
  );
};

// Debounce
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// localStorage Helpers
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage:', key);
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn('Failed to remove from localStorage:', key);
  }
};

// Deep Clone
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Merge Objects
export const merge = (target, source) => {
  return { ...target, ...source };
};

// Calculate Distance (Haversine)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate UUID (for client-side use only)
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Copy to Clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Wait/Sleep
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Memoize Function
export const memoize = (func) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};
