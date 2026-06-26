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

// Error handler
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

// Auth Services
export const authServices = {
  getCurrentUser: () => auth.currentUser,

  signInWithGoogle: () => signInWithPopup(auth, googleProvider),

  signOut: () => signOut(auth),

  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),

  getIdToken: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }
};

// User Services
export const userServices = {
  getUser: (userId) => getDoc(doc(db, 'users', userId)),

  createUser: (userId, userData) => {
    checkDemoMode();
    return setDoc(doc(db, 'users', userId), userData, { merge: true });
  },

  updateUser: (userId, updates) => {
    checkDemoMode();
    return updateDoc(doc(db, 'users', userId), updates);
  },

  getUserProfile: (userId) => getDoc(doc(db, 'users', userId)),

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

// Restaurant Services
export const restaurantServices = {
  getRestaurants: (location) =>
    query(collection(db, 'restaurants'), where('location', '==', location)),

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

  createRestaurant: (data) => {
    checkDemoMode();
    return addDoc(collection(db, 'restaurants'), {
      ...data,
      createdAt: serverTimestamp(),
      rating: parseFloat(data.rating) || 4.0,
      distance: parseFloat(data.distance) || 0
    });
  },

  getRating: async (restaurantId) => {
    const snapshot = await getDocs(
      collection(db, 'restaurants', restaurantId, 'ratings')
    );
    return snapshot.docs.map(doc => doc.data());
  },

  addRating: (restaurantId, userId, rating) => {
    checkDemoMode();
    return setDoc(
      doc(db, 'restaurants', restaurantId, 'ratings', userId),
      { rating, uid: userId, createdAt: serverTimestamp() },
      { merge: true }
    );
  },

  updateAverageRating: (restaurantId, ratings) => {
    checkDemoMode();
    const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
    return updateDoc(doc(db, 'restaurants', restaurantId), { rating: avg });
  }
};

// Slot Services
export const slotServices = {
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

  getSlot: (slotId) => getDoc(doc(db, 'slots', slotId)),

  joinSlot: (slotId, participant) => {
    checkDemoMode();
    return updateDoc(doc(db, 'slots', slotId), {
      participants: arrayUnion(participant)
    });
  },

  leaveSlot: (slotId, userId) => {
    checkDemoMode();
    // Requires reading current participants, filtering, and updating
    return getDoc(doc(db, 'slots', slotId)).then(docSnap => {
      const slot = docSnap.data();
      const updated = slot.participants.filter(p => p.uid !== userId);
      return updateDoc(doc(db, 'slots', slotId), { participants: updated });
    });
  },

  updateSlot: (slotId, updates) => {
    checkDemoMode();
    return updateDoc(doc(db, 'slots', slotId), updates);
  },

  cancelSlot: (slotId) => {
    checkDemoMode();
    return updateDoc(doc(db, 'slots', slotId), { status: 'cancelled' });
  },

  deleteSlot: (slotId) => {
    checkDemoMode();
    return deleteDoc(doc(db, 'slots', slotId));
  }
};

// Chat Services
export const chatServices = {
  sendMessage: (slotId, message) => {
    checkDemoMode();
    return addDoc(collection(db, 'slots', slotId, 'messages'), {
      ...message,
      createdAt: serverTimestamp()
    });
  },

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

// Notification Services
export const notificationServices = {
  createNotification: (data) => {
    checkDemoMode();
    return addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
  },

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

  markAsRead: (notificationId) => {
    checkDemoMode();
    return updateDoc(doc(db, 'notifications', notificationId), { read: true });
  },

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

// Friend Services
export const friendServices = {
  sendFriendRequest: (fromId, toId) => {
    checkDemoMode();
    return addDoc(collection(db, 'users', toId, 'friendRequests'), {
      fromId,
      toId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

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

  rejectFriendRequest: (toId, requestId) => {
    checkDemoMode();
    return deleteDoc(doc(db, 'users', toId, 'friendRequests', requestId));
  },

  removeFriend: async (userId, friendId) => {
    checkDemoMode();
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', userId, 'friends', friendId));
    batch.delete(doc(db, 'users', friendId, 'friends', userId));
    return batch.commit();
  },

  getFriends: (userId) =>
    getDocs(collection(db, 'users', userId, 'friends')),

  getFriendRequests: (userId) =>
    getDocs(collection(db, 'users', userId, 'friendRequests')),

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

// Badge Services
export const badgeServices = {
  updateBadges: (userId, badges) =>
    updateDoc(doc(db, 'users', userId), { badges }),

  addBadge: (userId, badgeId) =>
    updateDoc(doc(db, 'users', userId), {
      badges: arrayUnion(badgeId)
    })
};

// Batch Operations
export const batchOperations = {
  writeBatch: () => writeBatch(db),

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
