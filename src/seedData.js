// Demo Data Generator - populates Firestore with sample data on first run
// Checks if database is empty, then seeds restaurants, slots, users, and notifications

import { db, auth, collection, query, getDocs, doc, setDoc, addDoc, serverTimestamp } from './firebase.js';

const CUISINES = ['🍛 Indian', '🍝 Italian', '🍱 Japanese', '🌮 Mexican', '🍔 American', '🥟 Chinese'];

const DEMO_RESTAURANTS = [
  { name: 'Spice Route', cuisine: '🍛 Indian', location: 'Downtown' },
  { name: 'Pasta Perfetto', cuisine: '🍝 Italian', location: 'North Beach' },
  { name: 'Tokyo Kitchen', cuisine: '🍱 Japanese', location: 'Mission' },
  { name: 'Taco Fiesta', cuisine: '🌮 Mexican', location: 'Castro' },
  { name: 'Burger Bar', cuisine: '🍔 American', location: 'Soma' },
  { name: 'Dragon House', cuisine: '🥟 Chinese', location: 'Chinatown' },
  { name: 'Mediterranean Table', cuisine: '🍝 Italian', location: 'Downtown' },
  { name: 'Ramen Champion', cuisine: '🍱 Japanese', location: 'Hayes Valley' },
];

const DEMO_USERS = [
  { name: 'Alice Chen', email: 'alice@example.com', id: 'user_alice' },
  { name: 'Bob Johnson', email: 'bob@example.com', id: 'user_bob' },
  { name: 'Carol Smith', email: 'carol@example.com', id: 'user_carol' },
  { name: 'David Lee', email: 'david@example.com', id: 'user_david' },
  { name: 'Emma Wilson', email: 'emma@example.com', id: 'user_emma' },
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
        lat: 37.7749 + Math.random() * 0.05,
        lng: -122.4194 + Math.random() * 0.05,
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
  const restaurantList = restaurants.docs.slice(0, 4);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < restaurantList.length; i++) {
    const restaurant = restaurantList[i].data();
    const slotTime = ['18:00', '19:00', '20:00'][i % 3];

    try {
      await addDoc(collection(db, 'slots'), {
        restaurantId: restaurantList[i].id,
        restaurantName: restaurant.name,
        date: tomorrow.toISOString().split('T')[0],
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
        { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
        { name: 'Oakland', lat: 37.8044, lng: -122.2712 },
        { name: 'Berkeley', lat: 37.8716, lng: -122.2727 },
        { name: 'Silicon Valley', lat: 37.3954, lng: -122.0781 },
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
