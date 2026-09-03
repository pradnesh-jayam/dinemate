/**
 * Firestore Migration Script
 * Adds Indian-themed data to existing Firestore database
 * - Adds Indian restaurants to existing locations
 * - Adds dummy users with Indian names
 * - Adds 2028 slots to every location
 * - Preserves all existing data
 */

import { db, collection, addDoc, getDocs, query, where, getDoc, doc } from './firebase.js';
import { serverTimestamp } from './firebase.js';

// Indian-themed restaurants to add to each location
const INDIAN_RESTAURANTS = {
  'New Delhi': [
    { name: 'Haldiram\'s', cuisine: 'Indian', rating: 4.5, distance: 1.2, notes: 'Famous for chaat and sweets' },
    { name: 'Karim\'s', cuisine: 'Mughlai', rating: 4.7, distance: 2.1, notes: 'Legendary Mughlai cuisine' },
    { name: 'Bukhara', cuisine: 'North Indian', rating: 4.8, distance: 3.5, notes: 'Fine dining Indian cuisine' },
    { name: 'Moti Mahal', cuisine: 'North Indian', rating: 4.4, distance: 1.8, notes: 'Butter chicken originators' },
    { name: 'Saravana Bhavan', cuisine: 'South Indian', rating: 4.3, distance: 2.3, notes: 'Authentic South Indian' }
  ],
  'Mumbai': [
    { name: 'Trishna', cuisine: 'Seafood', rating: 4.6, distance: 1.5, notes: 'Famous for seafood' },
    { name: 'Cafe Leopold', cuisine: 'Continental', rating: 4.2, distance: 0.8, notes: 'Iconic Mumbai cafe' },
    { name: 'Bademiya', cuisine: 'Mughlai', rating: 4.5, distance: 1.1, notes: 'Late night kebabs' },
    { name: 'Mahesh Lunch Home', cuisine: 'Seafood', rating: 4.4, distance: 2.0, notes: 'Konkan seafood' },
    { name: 'Cafe Mondegar', cuisine: 'Continental', rating: 4.1, distance: 0.9, notes: 'Historic cafe' }
  ],
  'Bangalore': [
    { name: 'MTR', cuisine: 'South Indian', rating: 4.7, distance: 1.3, notes: 'Legendary dosa and idli' },
    { name: 'Vidyarthi Bhavan', cuisine: 'South Indian', rating: 4.5, distance: 1.0, notes: 'Famous masala dosa' },
    { name: 'Chutney', cuisine: 'South Indian', rating: 4.3, distance: 2.1, notes: 'Variety of chutneys' },
    { name: 'Peshwa', cuisine: 'North Indian', rating: 4.2, distance: 1.8, notes: 'Peshwai cuisine' },
    { name: 'Nandini', cuisine: 'South Indian', rating: 4.1, distance: 1.5, notes: 'Andhra style' }
  ],
  'Hyderabad': [
    { name: 'Paradise Biryani', cuisine: 'Hyderabadi', rating: 4.8, distance: 1.2, notes: 'World famous biryani' },
    { name: 'Chutneys', cuisine: 'South Indian', rating: 4.5, distance: 2.0, notes: 'Variety of dosas' },
    { name: 'Bawarchi', cuisine: 'Hyderabadi', rating: 4.6, distance: 1.8, notes: 'Traditional biryani' },
    { name: 'Hotel Shadab', cuisine: 'Mughlai', rating: 4.4, distance: 1.5, notes: 'Old Hyderabad flavors' },
    { name: 'Kritunga', cuisine: 'Andhra', rating: 4.3, distance: 2.2, notes: 'Spicy Andhra cuisine' }
  ],
  'Chennai': [
    { name: 'Murugan Idli Shop', cuisine: 'South Indian', rating: 4.5, distance: 1.1, notes: 'Famous idlis' },
    { name: 'Saravana Bhavan', cuisine: 'South Indian', rating: 4.6, distance: 1.8, notes: 'Authentic Tamil cuisine' },
    { name: 'Anjappar', cuisine: 'Chettinad', rating: 4.4, distance: 2.0, notes: 'Chettinad specialties' },
    { name: 'Ponnusamy', cuisine: 'South Indian', rating: 4.3, distance: 1.6, notes: 'Non-veg specialties' },
    { name: 'Ratna Cafe', cuisine: 'South Indian', rating: 4.2, distance: 1.3, notes: 'Historic eatery' }
  ],
  'Trichy': [
    { name: 'Sree Akshaya', cuisine: 'South Indian', rating: 4.3, distance: 1.0, notes: 'Local favorite' },
    { name: 'Muniyandi Vilas', cuisine: 'South Indian', rating: 4.2, distance: 1.5, notes: 'Traditional meals' },
    { name: 'Hotel Tamil Nadu', cuisine: 'South Indian', rating: 4.1, distance: 0.8, notes: 'Government hotel' },
    { name: 'Chennai Silks', cuisine: 'South Indian', rating: 4.0, distance: 1.2, notes: 'Budget friendly' },
    { name: 'Thillai', cuisine: 'South Indian', rating: 4.2, distance: 1.8, notes: 'Local cuisine' }
  ],
  'Thanjavur': [
    { name: 'Sivakami', cuisine: 'South Indian', rating: 4.2, distance: 0.9, notes: 'Local specialty' },
    { name: 'Hotel Parisutham', cuisine: 'South Indian', rating: 4.1, distance: 1.1, notes: 'Traditional meals' },
    { name: 'Thevar\'s', cuisine: 'South Indian', rating: 4.3, distance: 1.4, notes: 'Authentic flavors' },
    { name: 'Sangam', cuisine: 'South Indian', rating: 4.0, distance: 1.0, notes: 'Budget option' },
    { name: 'Maruthi', cuisine: 'South Indian', rating: 4.1, distance: 1.6, notes: 'Local favorite' }
  ]
};

// Dummy users with Indian names
const DUMMY_USERS = [
  { displayName: 'Arjun Kumar', email: 'arjun.kumar@example.com' },
  { displayName: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { displayName: 'Rahul Verma', email: 'rahul.verma@example.com' },
  { displayName: 'Anita Desai', email: 'anita.desai@example.com' },
  { displayName: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { displayName: 'Meera Nair', email: 'meera.nair@example.com' },
  { displayName: 'Rajesh Iyer', email: 'rajesh.iyer@example.com' },
  { displayName: 'Kavita Reddy', email: 'kavita.reddy@example.com' },
  { displayName: 'Suresh Patel', email: 'suresh.patel@example.com' },
  { displayName: 'Divya Menon', email: 'divya.menon@example.com' }
];

// 2028 slot dates for visibility
const SLOT_DATES_2028 = [
  '2028-06-16', '2028-06-17', '2028-06-18', '2028-06-19', '2028-06-20',
  '2028-06-21', '2028-06-22', '2028-06-23', '2028-06-24', '2028-06-25'
];

const SLOT_TIMES = ['12:00', '13:00', '19:00', '20:00', '21:00'];

/**
 * Main migration function
 */
export async function runMigration() {
  console.log('🚀 Starting Firestore migration...');
  
  try {
    // Step 1: Add Indian restaurants to existing locations
    console.log('📍 Adding Indian restaurants to locations...');
    await addIndianRestaurants();
    
    // Step 2: Add dummy users
    console.log('👥 Adding dummy users...');
    await addDummyUsers();
    
    // Step 3: Add 2028 slots to every location
    console.log('📅 Adding 2028 slots to locations...');
    await add2028Slots();
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Add Indian restaurants to existing locations
 */
async function addIndianRestaurants() {
  const locations = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Trichy', 'Thanjavur'];
  
  for (const location of locations) {
    const restaurants = INDIAN_RESTAURANTS[location] || [];
    
    for (const restaurant of restaurants) {
      // Check if restaurant already exists in this location
      const existingQuery = query(
        collection(db, 'restaurants'),
        where('name', '==', restaurant.name),
        where('location', '==', location)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        await addDoc(collection(db, 'restaurants'), {
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          distance: restaurant.distance,
          notes: restaurant.notes,
          location: location,
          createdAt: serverTimestamp(),
          createdBy: 'migration-script'
        });
        console.log(`✓ Added ${restaurant.name} to ${location}`);
      } else {
        console.log(`- Skipped ${restaurant.name} (already exists in ${location})`);
      }
    }
  }
}

/**
 * Add dummy users
 */
async function addDummyUsers() {
  for (const user of DUMMY_USERS) {
    // Check if user already exists
    const existingQuery = query(
      collection(db, 'users'),
      where('email', '==', user.email)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (existingSnapshot.empty) {
      await addDoc(collection(db, 'users'), {
        displayName: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
        isDummy: true
      });
      console.log(`✓ Added user ${user.displayName}`);
    } else {
      console.log(`- Skipped user ${user.displayName} (already exists)`);
    }
  }
}

/**
 * Add 2028 slots to every location
 */
async function add2028Slots() {
  const locations = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Trichy', 'Thanjavur'];
  
  // Get restaurants for each location
  for (const location of locations) {
    const restaurantsQuery = query(
      collection(db, 'restaurants'),
      where('location', '==', location)
    );
    const restaurantsSnapshot = await getDocs(restaurantsQuery);
    const restaurants = restaurantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (restaurants.length === 0) {
      console.log(`- No restaurants found in ${location}, skipping slots`);
      continue;
    }
    
    // Add 3-5 slots per location with 2028 dates
    const slotsToAdd = Math.min(5, restaurants.length);
    
    for (let i = 0; i < slotsToAdd; i++) {
      const restaurant = restaurants[i % restaurants.length];
      const date = SLOT_DATES_2028[i % SLOT_DATES_2028.length];
      const time = SLOT_TIMES[i % SLOT_TIMES.length];
      
      // Check if similar slot already exists
      const existingQuery = query(
        collection(db, 'slots'),
        where('restaurantId', '==', restaurant.id),
        where('date', '==', date),
        where('time', '==', time)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        const dummyUser = DUMMY_USERS[i % DUMMY_USERS.length];
        await addDoc(collection(db, 'slots'), {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          date: date,
          time: time,
          partySize: Math.floor(Math.random() * 3) + 1,
          notes: 'Looking for dining companions!',
          location: location,
          hostName: dummyUser.displayName,
          hostPhoto: null,
          createdBy: 'migration-script',
          participants: [],
          maxCapacity: 4,
          createdAt: serverTimestamp(),
          isDummy: true
        });
        console.log(`✓ Added slot at ${restaurant.name} in ${location} on ${date}`);
      } else {
        console.log(`- Skipped slot at ${restaurant.name} (already exists)`);
      }
    }
  }
}

/**
 * Run migration from browser console
 * Call: import('./src/migration.js').then(m => m.runMigration())
 */
if (typeof window !== 'undefined') {
  window.runMigration = runMigration;
}
