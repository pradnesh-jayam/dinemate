/**
 * Demo Mode Data
 * Seeded data for demo mode - never writes to Firestore
 */

export const DEMO_RESTAURANTS = [
  {
    id: 'demo-rest-1',
    name: 'The Spice Route',
    cuisine: 'Indian',
    rating: 4.5,
    location: 'Connaught Place, New Delhi',
    distance: '2.3 km',
    notes: 'Authentic North Indian cuisine with modern twist',
    photoURL: null
  },
  {
    id: 'demo-rest-2',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    rating: 4.8,
    location: 'Hauz Khas, New Delhi',
    distance: '3.1 km',
    notes: 'Fresh sushi and sashimi, omakase available',
    photoURL: null
  },
  {
    id: 'demo-rest-3',
    name: 'Bella Italia',
    cuisine: 'Italian',
    rating: 4.3,
    location: 'Khan Market, New Delhi',
    distance: '1.8 km',
    notes: 'Wood-fired pizzas and handmade pasta',
    photoURL: null
  },
  {
    id: 'demo-rest-4',
    name: 'Dragon Wok',
    cuisine: 'Chinese',
    rating: 4.2,
    location: 'Chanakyapuri, New Delhi',
    distance: '4.5 km',
    notes: 'Sichuan and Cantonese specialties',
    photoURL: null
  },
  {
    id: 'demo-rest-5',
    name: 'El Mexicano',
    cuisine: 'Mexican',
    rating: 4.6,
    location: 'Saket, New Delhi',
    distance: '5.2 km',
    notes: 'Tacos, burritos, and craft margaritas',
    photoURL: null
  },
  {
    id: 'demo-rest-6',
    name: 'Le Petit Bistro',
    cuisine: 'French',
    rating: 4.7,
    location: 'Greater Kailash, New Delhi',
    distance: '3.8 km',
    notes: 'Classic French bistro with seasonal menu',
    photoURL: null
  },
  {
    id: 'demo-rest-7',
    name: 'Thai Orchid',
    cuisine: 'Thai',
    rating: 4.4,
    location: 'Nehru Place, New Delhi',
    distance: '6.1 km',
    notes: 'Authentic Thai street food and curries',
    photoURL: null
  },
  {
    id: 'demo-rest-8',
    name: 'BBQ Smokehouse',
    cuisine: 'American',
    rating: 4.5,
    location: 'Rajouri Garden, New Delhi',
    distance: '7.3 km',
    notes: 'Slow-smoked meats and craft beers',
    photoURL: null
  }
];

export const DEMO_SLOTS = [
  {
    id: 'demo-slot-1',
    restaurantId: 'demo-rest-1',
    restaurantName: 'The Spice Route',
    restaurantCuisine: 'Indian',
    hostName: 'Priya Sharma',
    hostPhoto: null,
    date: '2024-06-27',
    time: '19:30',
    partySize: 4,
    maxCapacity: 4,
    participants: [
      { uid: 'demo-user-6', name: 'Meera Kapoor', photoURL: null, partySize: 1 }
    ],
    notes: 'Looking for foodies to try their new tasting menu!',
    location: 'Connaught Place, New Delhi',
    createdBy: 'demo-user-1'
  },
  {
    id: 'demo-slot-2',
    restaurantId: 'demo-rest-2',
    restaurantName: 'Sakura Sushi',
    restaurantCuisine: 'Japanese',
    hostName: 'Rahul Verma',
    hostPhoto: null,
    date: '2024-06-26',
    time: '20:00',
    partySize: 3,
    maxCapacity: 3,
    participants: [],
    notes: 'First time trying omakase, excited to share!',
    location: 'Hauz Khas, New Delhi',
    createdBy: 'demo-user-2'
  },
  {
    id: 'demo-slot-3',
    restaurantId: 'demo-rest-3',
    restaurantName: 'Bella Italia',
    restaurantCuisine: 'Italian',
    hostName: 'Anita Desai',
    hostPhoto: null,
    date: '2024-06-28',
    time: '18:45',
    partySize: 6,
    maxCapacity: 6,
    participants: [
      { uid: 'demo-user-1', name: 'Priya Sharma', photoURL: null, partySize: 2 },
      { uid: 'demo-user-4', name: 'Vikram Singh', photoURL: null, partySize: 2 }
    ],
    notes: 'Celebrating a promotion - join us for pizza!',
    location: 'Khan Market, New Delhi',
    createdBy: 'demo-user-3'
  },
  {
    id: 'demo-slot-4',
    restaurantId: 'demo-rest-5',
    restaurantName: 'El Mexicano',
    restaurantCuisine: 'Mexican',
    hostName: 'Vikram Singh',
    hostPhoto: null,
    date: '2024-06-26',
    time: '19:00',
    partySize: 4,
    maxCapacity: 4,
    participants: [
      { uid: 'demo-user-3', name: 'Anita Desai', photoURL: null, partySize: 1 }
    ],
    notes: 'Taco Tuesday! Let\'s try their new taco platter.',
    location: 'Saket, New Delhi',
    createdBy: 'demo-user-4'
  }
];

export const DEMO_CHATS = [
  {
    slotId: 'demo-slot-1',
    messages: [
      {
        id: 'msg-1',
        senderId: 'demo-user-1',
        senderName: 'Priya Sharma',
        text: 'Hey everyone! Looking forward to meeting you all at The Spice Route 🌶️',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-2',
        senderId: 'demo-user-5',
        senderName: 'Demo User',
        text: 'Excited to try the tasting menu! What time should we arrive?',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'msg-3',
        senderId: 'demo-user-1',
        senderName: 'Priya Sharma',
        text: 'Let\'s meet at 7:15 PM, the reservation is for 7:30',
        timestamp: new Date(Date.now() - 900000).toISOString()
      }
    ]
  },
  {
    slotId: 'demo-slot-2',
    messages: [
      {
        id: 'msg-4',
        senderId: 'demo-user-2',
        senderName: 'Rahul Verma',
        text: 'Has anyone been to Sakura Sushi before? Any recommendations?',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'msg-5',
        senderId: 'demo-user-6',
        senderName: 'Meera Kapoor',
        text: 'Their uni is amazing! Definitely try that',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  }
];

export const DEMO_USER = {
  uid: 'demo-user-5',
  displayName: 'Demo User',
  email: 'demo@dinemate.com',
  photoURL: null,
  bio: 'Food enthusiast exploring Delhi\'s dining scene',
  location: 'New Delhi',
  stats: {
    slotsHosted: 3,
    slotsJoined: 5,
    cuisinesExplored: 12,
    totalMeals: 8
  },
  memberSince: '2024-01-15',
  diningStreak: 5
};

export const DEMO_USER_SLOTS = {
  hosted: [
    {
      id: 'demo-slot-5',
      restaurantName: 'Thai Orchid',
      date: '2024-06-20',
      time: '19:00',
      partySize: 4,
      cuisine: 'Thai'
    },
    {
      id: 'demo-slot-6',
      restaurantName: 'Le Petit Bistro',
      date: '2024-06-15',
      time: '20:00',
      partySize: 3,
      cuisine: 'French'
    },
    {
      id: 'demo-slot-7',
      restaurantName: 'Dragon Wok',
      date: '2024-06-10',
      time: '18:30',
      partySize: 5,
      cuisine: 'Chinese'
    }
  ],
  joined: [
    {
      id: 'demo-slot-8',
      restaurantName: 'BBQ Smokehouse',
      date: '2024-06-22',
      time: '19:30',
      partySize: 4,
      cuisine: 'American'
    },
    {
      id: 'demo-slot-9',
      restaurantName: 'Bella Italia',
      date: '2024-06-18',
      time: '20:00',
      partySize: 3,
      cuisine: 'Italian'
    },
    {
      id: 'demo-slot-10',
      restaurantName: 'El Mexicano',
      date: '2024-06-14',
      time: '18:45',
      partySize: 4,
      cuisine: 'Mexican'
    },
    {
      id: 'demo-slot-11',
      restaurantName: 'Sakura Sushi',
      date: '2024-06-08',
      time: '19:00',
      partySize: 2,
      cuisine: 'Japanese'
    },
    {
      id: 'demo-slot-12',
      restaurantName: 'The Spice Route',
      date: '2024-06-02',
      time: '20:30',
      partySize: 4,
      cuisine: 'Indian'
    }
  ]
};

export const DEMO_NOTIFICATIONS = [
  {
    id: 'demo-notif-1',
    toUid: 'demo-user-5',
    fromName: 'Priya Sharma',
    message: 'Priya Sharma sent you a friend request',
    type: 'friend_request',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo-notif-2',
    toUid: 'demo-user-5',
    fromName: 'Rahul Verma',
    message: 'Rahul Verma joined your slot at Sakura Sushi',
    type: 'join',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'demo-notif-3',
    toUid: 'demo-user-5',
    fromName: 'Anita Desai',
    message: 'Anita Desai: "Looking forward to dinner!"',
    type: 'message',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const DEMO_ANALYTICS = {
  mealsHosted: 3,
  mealsJoined: 8,
  peopleMetCount: 12,
  uniqueRestaurants: 5,
  cuisineCount: 4,
  favoriteCuisine: 'Indian',
  restaurantsVisited: 8
};

/**
 * Checks if demo mode is currently active via sessionStorage
 * @returns {boolean} True if demo mode is active
 */
export function isDemoModeActive() {
  return sessionStorage.getItem('dinemate-demo') === 'true';
}

/**
 * Sets demo mode state via sessionStorage
 * @param {boolean} enabled Whether demo mode should be active
 */
export function setDemoMode(enabled) {
  if (enabled) {
    enableDemoMode();
  } else {
    disableDemoMode();
  }
}

/**
 * Gets the current demo mode state
 * @returns {boolean} True if demo mode is active
 */
export function getDemoMode() {
  return isDemoModeActive();
}

/**
 * Enables demo mode by setting sessionStorage
 */
export function enableDemoMode() {
  sessionStorage.setItem('dinemate-demo', 'true');
}

/**
 * Disables demo mode by clearing sessionStorage
 */
export function disableDemoMode() {
  sessionStorage.removeItem('dinemate-demo');
}
