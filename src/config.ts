import type { FirebaseConfig } from './types.js';

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const appConfig = {
  appName: 'DineMate',
  version: '2.0.0',
  defaultLocation: 'New Delhi',
  maxPartySize: 20,
  slotPaginationLimit: 20,
  notificationBadgeLimit: 99
};
