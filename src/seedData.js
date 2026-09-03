// Demo Data Generator - populates Firestore with sample data on first run
// Checks if database is empty, then seeds restaurants, slots, users, and notifications

import { db, auth, collection, query, getDocs, doc, setDoc, addDoc, serverTimestamp } from './firebase.js';

// Fixed anchor date for 2028 demo mode
const DEMO_ANCHOR_DATE = new Date('2028-06-15T00:00:00');

const CUISINES = ['🍛 South Indian', '🍛 North Indian', '🍛 Hyderabadi', '🍛 Karnataka', '🍛 Punjabi', '🍛 Tamil'];

const DEMO_RESTAURANTS = [
  { name: 'Krishna Hotel', cuisine: '🍛 South Indian', location: 'T. Nagar, Chennai' },
  { name: 'Shanmugha Cafe', cuisine: '🍛 South Indian', location: 'Mylapore, Chennai' },
  { name: 'Southern Canopy', cuisine: '🍛 South Indian', location: 'Adyar, Chennai' },
  { name: 'Greenleaf Restaurant', cuisine: '🍛 North Indian', location: 'Connaught Place, New Delhi' },
  { name: 'Paradise Biryani', cuisine: '🍛 Hyderabadi', location: 'Secunderabad, Hyderabad' },
  { name: 'MTR Restaurant', cuisine: '🍛 Karnataka', location: 'Lalbagh, Bangalore' },
  { name: 'Saravana Bhavan', cuisine: '🍛 South Indian', location: 'Anna Nagar, Chennai' },
  { name: 'Haldiram\'s', cuisine: '🍛 North Indian', location: 'Karol Bagh, New Delhi' },
  { name: 'Chutneys', cuisine: '🍛 South Indian', location: 'Jubilee Hills, Hyderabad' },
  { name: 'Pind Balluchi', cuisine: '🍛 Punjabi', location: 'Vasant Kunj, New Delhi' },
  { name: 'Vidyarthi Bhavan', cuisine: '🍛 Karnataka', location: 'Basavanagudi, Bangalore' },
  { name: 'Bukhara', cuisine: '🍛 North Indian', location: 'Chanakyapuri, New Delhi' },
];

const DEMO_USERS = [
  { name: 'Arjun Kumar', email: 'arjun@example.com', id: 'user_arjun' },
  { name: 'Priya Sharma', email: 'priya@example.com', id: 'user_priya' },
  { name: 'Rahul Verma', email: 'rahul@example.com', id: 'user_rahul' },
  { name: 'Anita Desai', email: 'anita@example.com', id: 'user_anita' },
  { name: 'Suresh Kumar', email: 'suresh@example.com', id: 'user_suresh' },
  { name: 'Meera Kapoor', email: 'meera@example.com', id: 'user_meera' },
  { name: 'Vikram Singh', email: 'vikram@example.com', id: 'user_vikram' },
  { name: 'Lakshmi Narayanan', email: 'lakshmi@example.com', id: 'user_lakshmi' },
];

async function isFeedingEmpty() {
  try {
    const restaurantDocs = await getDocs(collection(db, 'restaurants'));
    return restaurantDocs.empty;
  } catch (error) {
    console.warn('Could not check if database is empty:', error);
    return false;
  }
}

async function seedRestaurants() {
  console.log('🌱 Seeding restaurants...');

  for (const restaurant of DEMO_RESTAURANTS) {
    try {
      await addDoc(collection(db, 'restaurants'), {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        location: restaurant.location,
        lat: 12.9716 + Math.random() * 0.1,
        lng: 77.5946 + Math.random() * 0.1,
        rating: Math.floor(Math.random() * 30) / 10 + 3.5,
        reviewCount: Math.floor(Math.random() * 50),
        createdBy: DEMO_USERS[0].id,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Could not seed restaurant:', error);
    }
  }
}

async function seedSlots() {
  console.log('🌱 Seeding dining slots...');

  const restaurants = await getDocs(collection(db, 'restaurants'));
  const restaurantList = restaurants.docs.slice(0, 6);

  // Use 2028 anchor date for consistency
  const tomorrow = new Date(DEMO_ANCHOR_DATE);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < restaurantList.length; i++) {
    const restaurant = restaurantList[i].data();
    const slotTime = ['18:00', '19:00', '20:00', '18:30', '19:30', '20:30'][i % 6];
    const daysOffset = i + 1; // Spread slots across multiple days

    const slotDate = new Date(DEMO_ANCHOR_DATE);
    slotDate.setDate(slotDate.getDate() + daysOffset);

    try {
      await addDoc(collection(db, 'slots'), {
        restaurantId: restaurantList[i].id,
        restaurantName: restaurant.name,
        date: slotDate.toISOString().split('T')[0],
        time: slotTime,
        maxCapacity: 4 + Math.floor(Math.random() * 4),
        participants: [DEMO_USERS[0].id, DEMO_USERS[1].id].slice(0, 1 + Math.floor(Math.random() * 2)),
        createdBy: DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].id,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Could not seed slot:', error);
    }
  }
}

async function seedNotifications() {
  console.log('🌱 Seeding sample notifications...');

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await addDoc(collection(db, 'notifications'), {
      toUid: currentUser.uid,
      fromName: DEMO_USERS[1].name,
      message: `${DEMO_USERS[1].name} sent you a friend request`,
      type: 'request',
      read: false,
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'notifications'), {
      toUid: currentUser.uid,
      fromName: DEMO_USERS[2].name,
      message: `${DEMO_USERS[2].name} joined your dining slot`,
      type: 'join',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Could not seed notifications:', error);
  }
}

async function seedLocations() {
  console.log('🌱 Seeding default locations...');

  try {
    await setDoc(doc(db, 'meta', 'locations'), {
      locations: [
        { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      ],
    });
  } catch (error) {
    console.warn('Could not seed locations:', error);
  }
}

export async function seedDemoData() {
  try {
    const isEmpty = await isFeedingEmpty();

    if (isEmpty) {
      console.log('📊 Database empty - seeding demo data...');
      await seedLocations();
      await seedRestaurants();
      await seedSlots();
      await seedNotifications();
      console.log('✅ Demo data seeded successfully');
    } else {
      console.log('📊 Database already populated - skipping seed');
    }
  } catch (error) {
    console.error('Failed to seed demo data:', error);
  }
}
