// Type Definitions for DineMate

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  isPublic?: boolean;
  location?: string;
  createdAt?: Date;
  lastLogin?: Date;
  badges?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  lat?: number;
  lng?: number;
  createdBy: string;
  rating: number;
  reviewCount?: number;
  distance?: number;
  notes?: string;
  createdAt?: Date;
}

export interface Slot {
  id: string;
  restaurantId: string;
  restaurantName: string;
  host: string;
  hostName: string;
  hostPhoto?: string;
  date: string;
  time: string;
  partySize: number;
  maxCapacity: number;
  participants: Participant[];
  notes?: string;
  location: string;
  createdBy: string;
  createdAt?: Date;
  cuisine?: string;
}

export interface Participant {
  uid: string;
  name: string;
  photoURL?: string;
  partySize: number;
}

export interface Notification {
  id: string;
  toUid: string;
  fromName: string;
  message: string;
  type: 'join' | 'request' | 'message' | 'reminder';
  slotId?: string;
  read: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  uid: string;
  name: string;
  text: string;
  createdAt: Date;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Analytics {
  slotsHosted: number;
  slotsJoined: number;
  restaurantsAdded: number;
  peopleMet: number;
  cuisinesExplored: string[];
  totalMeals: number;
}

export interface SearchResult {
  type: 'user' | 'restaurant' | 'slot';
  id: string;
  name: string;
  subtitle?: string;
 avatar?: string;
}

export type Theme = 'light' | 'dark';

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
