import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  writeBatch,
  collectionGroup,
  limit,
  startAfter,
  QueryConstraint
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { firebaseConfig } from './config.js';
import { isDemoModeActive } from './demoData.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Handles Firebase errors and returns a standardized error object
 * @param {Error} error - Firebase error object
 * @returns {Object} Standardized error with code and message
 */
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error.code, error.message);
  return {
    code: error.code,
    message: error.message || 'An error occurred'
  };
};

// Demo mode check - blocks write operations
const checkDemoMode = () => {
  if (isDemoModeActive()) {
    console.warn('Demo Mode: Write operations are disabled');
    throw new Error('Demo mode does not allow write operations');
  }
};

/**
 * Firebase authentication services
 */
export const authServices = {
  /** Gets the current authenticated user */
  getCurrentUser: () => auth.currentUser,

  /** Signs in with Google OAuth popup */
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),

  /** Signs out the current user */
  signOut: () => signOut(auth),

  /** Sets up auth state change listener */
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),

  /** Gets the ID token for the current user */
  getIdToken: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }
};

/**
 * User document services
 */
export const userServices = {
  /** Gets a user document by ID */
  getUser: (userId) => getDoc(doc(db, 'users', userId)),

  /** Creates or updates a user document */
  createUser: (userId, userData) => {
    checkDemoMode();
    return setDoc(doc(db, 'users', userId), userData, { merge: true });
  },

  /** Updates a user document */
  updateUser: (userId, updates) => {
    checkDemoMode();
    return updateDoc(doc(db, 'users', userId), updates);
  },

  /** Gets a user profile */
  getUserProfile: (userId) => getDoc(doc(db, 'users', userId)),

  /** Searches users (basic implementation) */
  searchUsers: (searchTerm) => {
    // Note: Full-text search requires Cloud Search or frontend filtering
    // For now, this returns all users (TODO: implement proper search)
    return getDocs(collection(db, 'users'));
  }
};

// Location Services
export const locationServices = {
  getLocations: async () => {
    const docRef = doc(db, 'meta', 'locations');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().cities || [] : [];
  },

  addLocation: (city) => {
    checkDemoMode();
    return setDoc(doc(db, 'meta', 'locations'),
      { cities: arrayUnion(city) },
      { merge: true }
    );
  },

  onLocationsChanged: (callback) =>
    onSnapshot(doc(db, 'meta', 'locations'), (doc) => {
      callback(doc.exists() ? doc.data().cities || [] : []);
    })
};

/**
 * Restaurant document services
 */
export const restaurantServices = {
  /** Gets restaurants query for a location */
  getRestaurants: (location) =>
    query(collection(db, 'restaurants'), where('location', '==', location)),

  /** Sets up real-time listener for restaurants */
  onRestaurantsChanged: (location, callback, onError = null) =>
    onSnapshot(
      query(collection(db, 'restaurants'), where('location', '==', location)),
      (snapshot) => {
        const restaurants = [];
        snapshot.forEach(doc => restaurants.push({ id: doc.id, ...doc.data() }));
        callback(restaurants);
      },
      (error) => {
        console.error('Firestore restaurants query error:', error.code, error.message);
        if (onError) onError(error);
      }
    ),

  /** Creates a new restaurant document */
  createRestaurant: (data) => {
    checkDemoMode();
    return addDoc(collection(db, 'restaurants'), {
      ...data,
      createdAt: serverTimestamp(),
      rating: parseFloat(data.rating) || 4.0,
      distance: parseFloat(data.distance) || 0
    });
  },

  /** Gets all ratings for a restaurant */
  getRating: async (restaurantId) => {
    const snapshot = await getDocs(
      collection(db, 'restaurants', restaurantId, 'ratings')
    );
    return snapshot.docs.map(doc => doc.data());
  },

  /** Adds or updates a user's rating for a restaurant */
  addRating: (restaurantId, userId, rating) => {
    checkDemoMode();
    return setDoc(
      doc(db, 'restaurants', restaurantId, 'ratings', userId),
      { rating, uid: userId, createdAt: serverTimestamp() },
      { merge: true }
    );
  },

  /** Updates the average rating for a restaurant */
  updateAverageRating: (restaurantId, ratings) => {
    checkDemoMode();
    const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
    return updateDoc(doc(db, 'restaurants', restaurantId), { rating: avg });
  }
};

/**
 * Dining slot services
 */
export const slotServices = {
  /** Creates a new dining slot */
  createSlot: (data) => {
    checkDemoMode();
    return addDoc(collection(db, 'slots'), {
      ...data,
      createdAt: serverTimestamp(),
      participants: data.participants || [],
      partySize: parseInt(data.partySize) || 1,
      maxCapacity: parseInt(data.maxCapacity) || parseInt(data.partySize) || 1
    });
  },

  /** Sets up real-time listener for slots */
  onSlotsChanged: (location, callback, onError = null, ...constraints) =>
    onSnapshot(
      query(
        collection(db, 'slots'),
        where('location', '==', location),
        orderBy('date', 'asc'),
        orderBy('time', 'asc'),
        ...constraints
      ),
      (snapshot) => {
        const slots = [];
        snapshot.forEach(doc => slots.push({ id: doc.id, ...doc.data() }));
        callback(slots);
      },
      (error) => {
        console.error('Firestore slots query error:', error.code, error.message);
        if (onError) onError(error);
      }
    ),

  /** Gets a slot document by ID */
  getSlot: (slotId) => getDoc(doc(db, 'slots', slotId)),

  /** Joins a user to a slot */
  joinSlot: (slotId, participant) => {
    checkDemoMode();
    return updateDoc(doc(db, 'slots', slotId), {
      participants: arrayUnion(participant)
    });
  },

  /** Removes a user from a slot */
  leaveSlot: (slotId, userId) => {
    checkDemoMode();
    // Requires reading current participants, filtering, and updating
    return getDoc(doc(db, 'slots', slotId)).then(docSnap => {
      const slot = docSnap.data();
      const updated = slot.participants.filter(p => p.uid !== userId);
      return updateDoc(doc(db, 'slots', slotId), { participants: updated });
    });
  },

  /** Updates a slot document */
  updateSlot: (slotId, updates) => {
    checkDemoMode();
    return updateDoc(doc(db, 'slots', slotId), updates);
  },

  /** Cancels a slot by setting status */
  cancelSlot: (slotId) => {
    checkDemoMode();
    return updateDoc(doc(db, 'slots', slotId), { status: 'cancelled' });
  },

  /** Deletes a slot document */
  deleteSlot: (slotId) => {
    checkDemoMode();
    return deleteDoc(doc(db, 'slots', slotId));
  }
};

/**
 * Chat message services
 */
export const chatServices = {
  /** Sends a message to a slot's chat */
  sendMessage: (slotId, message) => {
    checkDemoMode();
    return addDoc(collection(db, 'slots', slotId, 'messages'), {
      ...message,
      createdAt: serverTimestamp()
    });
  },

  /** Sets up real-time listener for slot messages */
  onMessagesChanged: (slotId, callback) =>
    onSnapshot(
      query(
        collection(db, 'slots', slotId, 'messages'),
        orderBy('createdAt', 'asc')
      ),
      (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
        callback(messages);
      }
    )
};

/**
 * Notification services
 */
export const notificationServices = {
  /** Creates a new notification */
  createNotification: (data) => {
    checkDemoMode();
    return addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
  },

  /** Sets up real-time listener for user notifications */
  onNotificationsChanged: (userId, callback, onError = null) =>
    onSnapshot(
      query(
        collection(db, 'notifications'),
        where('toUid', '==', userId),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const notifications = [];
        snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
        callback(notifications);
      },
      (error) => {
        console.error('Firestore notifications query error:', error.code, error.message);
        if (onError) onError(error);
      }
    ),

  /** Marks a notification as read */
  markAsRead: (notificationId) => {
    checkDemoMode();
    return updateDoc(doc(db, 'notifications', notificationId), { read: true });
  },

  /** Marks all notifications for a user as read */
  markAllAsRead: async (userId) => {
    checkDemoMode();
    const snapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('toUid', '==', userId),
        where('read', '==', false)
      )
    );
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    return batch.commit();
  }
};

/**
 * Friend services
 */
export const friendServices = {
  /** Sends a friend request */
  sendFriendRequest: (fromId, toId) => {
    checkDemoMode();
    return addDoc(collection(db, 'users', toId, 'friendRequests'), {
      fromId,
      toId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  /** Accepts a friend request */
  acceptFriendRequest: async (fromId, toId, requestId) => {
    checkDemoMode();
    const batch = writeBatch(db);

    // Add to both users' friends collections
    batch.set(doc(db, 'users', toId, 'friends', fromId), {
      uid: fromId,
      createdAt: serverTimestamp()
    });
    batch.set(doc(db, 'users', fromId, 'friends', toId), {
      uid: toId,
      createdAt: serverTimestamp()
    });

    // Delete request
    batch.delete(doc(db, 'users', toId, 'friendRequests', requestId));

    return batch.commit();
  },

  /** Rejects a friend request */
  rejectFriendRequest: (toId, requestId) => {
    checkDemoMode();
    return deleteDoc(doc(db, 'users', toId, 'friendRequests', requestId));
  },

  /** Removes a friend connection */
  removeFriend: async (userId, friendId) => {
    checkDemoMode();
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', userId, 'friends', friendId));
    batch.delete(doc(db, 'users', friendId, 'friends', userId));
    return batch.commit();
  },

  /** Gets a user's friends list */
  getFriends: (userId) =>
    getDocs(collection(db, 'users', userId, 'friends')),

  /** Gets a user's friend requests */
  getFriendRequests: (userId) =>
    getDocs(collection(db, 'users', userId, 'friendRequests')),

  /** Sets up real-time listener for friend requests */
  onFriendRequestsChanged: (userId, callback) =>
    onSnapshot(
      collection(db, 'users', userId, 'friendRequests'),
      (snapshot) => {
        const requests = [];
        snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
        callback(requests);
      }
    )
};

/**
 * Badge and achievement services
 */
export const badgeServices = {
  /** Updates a user's badges list */
  updateBadges: (userId, badges) =>
    updateDoc(doc(db, 'users', userId), { badges }),

  /** Adds a badge to a user's badges */
  addBadge: (userId, badgeId) =>
    updateDoc(doc(db, 'users', userId), {
      badges: arrayUnion(badgeId)
    })
};

/**
 * Batch write operations
 */
export const batchOperations = {
  /** Creates a new write batch */
  writeBatch: () => writeBatch(db),

  /** Commits a batch operation */
  commit: (batch) => batch.commit()
};

export { auth, db, googleProvider };

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  writeBatch,
  collectionGroup,
  limit,
  startAfter
};
