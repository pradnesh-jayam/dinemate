/**
 * Demo Mode Data
 * Seeded data for demo mode - never writes to Firestore
 */

// Fixed anchor date for 2028 demo mode
const DEMO_ANCHOR_DATE = new Date('2028-06-15T00:00:00');

export const DEMO_RESTAURANTS = [
  {
    id: 'demo-rest-1',
    name: 'Krishna Hotel',
    cuisine: 'South Indian',
    rating: 4.5,
    location: 'T. Nagar, Chennai',
    distance: '2.3 km',
    notes: 'Authentic dosas and filter coffee since 1965',
    photoURL: null
  },
  {
    id: 'demo-rest-2',
    name: 'Shanmugha Cafe',
    cuisine: 'South Indian',
    rating: 4.8,
    location: 'Mylapore, Chennai',
    distance: '3.1 km',
    notes: 'Famous for crispy ghee roast and chutneys',
    photoURL: null
  },
  {
    id: 'demo-rest-3',
    name: 'Southern Canopy',
    cuisine: 'South Indian',
    rating: 4.3,
    location: 'Adyar, Chennai',
    distance: '1.8 km',
    notes: 'Modern twist on traditional Tamil cuisine',
    photoURL: null
  },
  {
    id: 'demo-rest-4',
    name: 'Greenleaf Restaurant',
    cuisine: 'North Indian',
    rating: 4.2,
    location: 'Connaught Place, New Delhi',
    distance: '4.5 km',
    notes: 'Paneer specialties and Mughlai dishes',
    photoURL: null
  },
  {
    id: 'demo-rest-5',
    name: 'Paradise Biryani',
    cuisine: 'Hyderabadi',
    rating: 4.6,
    location: 'Secunderabad, Hyderabad',
    distance: '5.2 km',
    notes: 'Legendary dum biryani with aromatic spices',
    photoURL: null
  },
  {
    id: 'demo-rest-6',
    name: 'MTR Restaurant',
    cuisine: 'Karnataka',
    rating: 4.7,
    location: 'Lalbagh, Bangalore',
    distance: '3.8 km',
    notes: 'Iconic masala dosa and traditional thali',
    photoURL: null
  },
  {
    id: 'demo-rest-7',
    name: 'Saravana Bhavan',
    cuisine: 'South Indian',
    rating: 4.4,
    location: 'Anna Nagar, Chennai',
    distance: '6.1 km',
    notes: 'World-famous vegetarian South Indian cuisine',
    photoURL: null
  },
  {
    id: 'demo-rest-8',
    name: 'Haldiram\'s',
    cuisine: 'North Indian',
    rating: 4.5,
    location: 'Karol Bagh, New Delhi',
    distance: '7.3 km',
    notes: 'Street food favorites and sweets',
    photoURL: null
  },
  {
    id: 'demo-rest-9',
    name: 'Chutneys',
    cuisine: 'South Indian',
    rating: 4.6,
    location: 'Jubilee Hills, Hyderabad',
    distance: '4.2 km',
    notes: '70+ varieties of chutney with every meal',
    photoURL: null
  },
  {
    id: 'demo-rest-10',
    name: 'Pind Balluchi',
    cuisine: 'Punjabi',
    rating: 4.3,
    location: 'Vasant Kunj, New Delhi',
    distance: '5.8 km',
    notes: 'Rustlic village ambiance with authentic flavors',
    photoURL: null
  },
  {
    id: 'demo-rest-11',
    name: 'Vidyarthi Bhavan',
    cuisine: 'Karnataka',
    rating: 4.8,
    location: 'Basavanagudi, Bangalore',
    distance: '3.5 km',
    notes: 'Historic eatery known for masala dosa',
    photoURL: null
  },
  {
    id: 'demo-rest-12',
    name: 'Bukhara',
    cuisine: 'North Indian',
    rating: 4.9,
    location: 'Chanakyapuri, New Delhi',
    distance: '6.7 km',
    notes: 'Signature tandoori and dal Bukhara',
    photoURL: null
  }
];

// Helper function to get date relative to anchor
function getRelativeDate(daysOffset) {
  const date = new Date(DEMO_ANCHOR_DATE);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

export const DEMO_SLOTS = [
  {
    id: 'demo-slot-1',
    restaurantId: 'demo-rest-1',
    restaurantName: 'Krishna Hotel',
    restaurantCuisine: 'South Indian',
    hostName: 'Priya Sharma',
    hostPhoto: null,
    date: getRelativeDate(2),
    time: '19:30',
    partySize: 4,
    maxCapacity: 4,
    participants: [
      { uid: 'demo-user-6', name: 'Meera Kapoor', photoURL: null, partySize: 1 }
    ],
    notes: 'Looking for foodies to try their famous ghee roast!',
    location: 'T. Nagar, Chennai',
    createdBy: 'demo-user-1'
  },
  {
    id: 'demo-slot-2',
    restaurantId: 'demo-rest-2',
    restaurantName: 'Shanmugha Cafe',
    restaurantCuisine: 'South Indian',
    hostName: 'Rahul Verma',
    hostPhoto: null,
    date: getRelativeDate(1),
    time: '20:00',
    partySize: 3,
    maxCapacity: 3,
    participants: [],
    notes: 'First time trying their signature dosa, excited to share!',
    location: 'Mylapore, Chennai',
    createdBy: 'demo-user-2'
  },
  {
    id: 'demo-slot-3',
    restaurantId: 'demo-rest-3',
    restaurantName: 'Southern Canopy',
    restaurantCuisine: 'South Indian',
    hostName: 'Anita Desai',
    hostPhoto: null,
    date: getRelativeDate(3),
    time: '18:45',
    partySize: 6,
    maxCapacity: 6,
    participants: [
      { uid: 'demo-user-1', name: 'Priya Sharma', photoURL: null, partySize: 2 },
      { uid: 'demo-user-4', name: 'Vikram Singh', photoURL: null, partySize: 2 }
    ],
    notes: 'Celebrating a promotion - join us for traditional thali!',
    location: 'Adyar, Chennai',
    createdBy: 'demo-user-3'
  },
  {
    id: 'demo-slot-4',
    restaurantId: 'demo-rest-5',
    restaurantName: 'Paradise Biryani',
    restaurantCuisine: 'Hyderabadi',
    hostName: 'Vikram Singh',
    hostPhoto: null,
    date: getRelativeDate(1),
    time: '19:00',
    partySize: 4,
    maxCapacity: 4,
    participants: [
      { uid: 'demo-user-3', name: 'Anita Desai', photoURL: null, partySize: 1 }
    ],
    notes: 'Biryani Tuesday! Let\'s try their legendary mutton biryani.',
    location: 'Secunderabad, Hyderabad',
    createdBy: 'demo-user-4'
  },
  {
    id: 'demo-slot-5',
    restaurantId: 'demo-rest-6',
    restaurantName: 'MTR Restaurant',
    restaurantCuisine: 'Karnataka',
    hostName: 'Suresh Kumar',
    hostPhoto: null,
    date: getRelativeDate(4),
    time: '18:30',
    partySize: 5,
    maxCapacity: 6,
    participants: [
      { uid: 'demo-user-2', name: 'Rahul Verma', photoURL: null, partySize: 2 }
    ],
    notes: 'Weekend brunch at the iconic MTR - join us!',
    location: 'Lalbagh, Bangalore',
    createdBy: 'demo-user-5'
  },
  {
    id: 'demo-slot-6',
    restaurantId: 'demo-rest-9',
    restaurantName: 'Chutneys',
    restaurantCuisine: 'South Indian',
    hostName: 'Lakshmi Narayanan',
    hostPhoto: null,
    date: getRelativeDate(2),
    time: '20:15',
    partySize: 3,
    maxCapacity: 4,
    participants: [],
    notes: 'Want to experience the 70+ chutney varieties?',
    location: 'Jubilee Hills, Hyderabad',
    createdBy: 'demo-user-6'
  }
];

// Helper function to get timestamp relative to anchor
function getRelativeTime(hoursOffset) {
  const time = new Date(DEMO_ANCHOR_DATE);
  time.setHours(time.getHours() + hoursOffset);
  return time.toISOString();
}

export const DEMO_CHATS = [
  {
    slotId: 'demo-slot-1',
    messages: [
      {
        id: 'msg-1',
        senderId: 'demo-user-1',
        senderName: 'Priya Sharma',
        text: 'Hey everyone! Looking forward to meeting you all at Krishna Hotel 🌶️',
        timestamp: getRelativeTime(-2)
      },
      {
        id: 'msg-2',
        senderId: 'demo-user-5',
        senderName: 'Demo User',
        text: 'Excited to try the ghee roast! What time should we arrive?',
        timestamp: getRelativeTime(-1)
      },
      {
        id: 'msg-3',
        senderId: 'demo-user-1',
        senderName: 'Priya Sharma',
        text: 'Let\'s meet at 7:15 PM, the reservation is for 7:30',
        timestamp: getRelativeTime(-0.5)
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
        text: 'Has anyone been to Shanmugha Cafe before? Any recommendations?',
        timestamp: getRelativeTime(-4)
      },
      {
        id: 'msg-5',
        senderId: 'demo-user-6',
        senderName: 'Meera Kapoor',
        text: 'Their crispy dosa is amazing! Definitely try that',
        timestamp: getRelativeTime(-2)
      }
    ]
  },
  {
    slotId: 'demo-slot-4',
    messages: [
      {
        id: 'msg-6',
        senderId: 'demo-user-4',
        senderName: 'Vikram Singh',
        text: 'The mutton biryani at Paradise is legendary! Can\'t wait',
        timestamp: getRelativeTime(-3)
      },
      {
        id: 'msg-7',
        senderId: 'demo-user-3',
        senderName: 'Anita Desai',
        text: 'I\'ve heard their chicken biryani is even better!',
        timestamp: getRelativeTime(-1.5)
      }
    ]
  }
];

export const DEMO_USER = {
  uid: 'demo-user-5',
  displayName: 'Arjun Kumar',
  email: 'arjun@dinemate.com',
  photoURL: null,
  bio: 'Food enthusiast exploring India\'s diverse cuisine',
  location: 'Chennai',
  stats: {
    slotsHosted: 3,
    slotsJoined: 5,
    cuisinesExplored: 12,
    totalMeals: 8
  },
  memberSince: '2028-01-15',
  diningStreak: 5
};

export const DEMO_USER_SLOTS = {
  hosted: [
    {
      id: 'demo-slot-5',
      restaurantName: 'Saravana Bhavan',
      date: getRelativeDate(-25),
      time: '19:00',
      partySize: 4,
      cuisine: 'South Indian'
    },
    {
      id: 'demo-slot-6',
      restaurantName: 'Pind Balluchi',
      date: getRelativeDate(-30),
      time: '20:00',
      partySize: 3,
      cuisine: 'Punjabi'
    },
    {
      id: 'demo-slot-7',
      restaurantName: 'Haldiram\'s',
      date: getRelativeDate(-35),
      time: '18:30',
      partySize: 5,
      cuisine: 'North Indian'
    }
  ],
  joined: [
    {
      id: 'demo-slot-8',
      restaurantName: 'MTR Restaurant',
      date: getRelativeDate(-23),
      time: '19:30',
      partySize: 4,
      cuisine: 'Karnataka'
    },
    {
      id: 'demo-slot-9',
      restaurantName: 'Southern Canopy',
      date: getRelativeDate(-27),
      time: '20:00',
      partySize: 3,
      cuisine: 'South Indian'
    },
    {
      id: 'demo-slot-10',
      restaurantName: 'Paradise Biryani',
      date: getRelativeDate(-31),
      time: '18:45',
      partySize: 4,
      cuisine: 'Hyderabadi'
    },
    {
      id: 'demo-slot-11',
      restaurantName: 'Chutneys',
      date: getRelativeDate(-37),
      time: '19:00',
      partySize: 2,
      cuisine: 'South Indian'
    },
    {
      id: 'demo-slot-12',
      restaurantName: 'Krishna Hotel',
      date: getRelativeDate(-43),
      time: '20:30',
      partySize: 4,
      cuisine: 'South Indian'
    },
    {
      id: 'demo-slot-13',
      restaurantName: 'Vidyarthi Bhavan',
      date: getRelativeDate(-50),
      time: '19:15',
      partySize: 3,
      cuisine: 'Karnataka'
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
    createdAt: getRelativeTime(-2)
  },
  {
    id: 'demo-notif-2',
    toUid: 'demo-user-5',
    fromName: 'Rahul Verma',
    message: 'Rahul Verma joined your slot at Shanmugha Cafe',
    type: 'join',
    read: false,
    createdAt: getRelativeTime(-4)
  },
  {
    id: 'demo-notif-3',
    toUid: 'demo-user-5',
    fromName: 'Anita Desai',
    message: 'Anita Desai: "Looking forward to the biryani!"',
    type: 'message',
    read: true,
    createdAt: getRelativeTime(-24)
  },
  {
    id: 'demo-notif-4',
    toUid: 'demo-user-5',
    fromName: 'Suresh Kumar',
    message: 'Suresh Kumar invited you to join at MTR Restaurant',
    type: 'invite',
    read: false,
    createdAt: getRelativeTime(-6)
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
