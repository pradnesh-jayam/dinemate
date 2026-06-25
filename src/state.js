export const state = {
  isDemo: false,
  user: null,
  userDoc: null,
  currentLocation: localStorage.getItem('dinemate-current-location') || 'New Delhi',
  coordinates: null,
  restaurants: [],
  slots: [],
  messages: {},
  notifications: [],
  friends: [],
  requests: [],
  demoActivity: {
    memberSince: '',
    streak: 0
  },
  currentSlotId: null,
  ratingRestaurantId: null,
  showPastSlots: false,
  listeners: {
    restaurants: null,
    slots: null,
    chat: null,
    notifications: null,
    messages: null,
    profile: null,
    friends: null,
    requests: null
  }
};

export const demoCities = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Trichy', 'Thanjavur'];

export const categoryIcons = {
  Restaurant: 'RST',
  Cafe: 'CFE',
  Hotel: 'HTL',
  'Fast Food': 'FFD',
  Indian: 'IND',
  Italian: 'ITA',
  Chinese: 'CHN',
  Japanese: 'JPN',
  Thai: 'THA',
  Mexican: 'MEX',
  Other: 'DIN'
};
