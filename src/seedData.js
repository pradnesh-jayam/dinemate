// Demo Data Generator - populates Firestore with sample data on first run
// Checks if database is empty, then seeds restaurants, slots, users, and notifications

import { db, auth, collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from './firebase.js';

// Dynamic anchor date - always 2 years in the future from when script runs
const DEMO_ANCHOR_DATE = new Date();
DEMO_ANCHOR_DATE.setFullYear(DEMO_ANCHOR_DATE.getFullYear() + 2);

const CUISINES = ['🍛 South Indian', '🍛 North Indian', '🍛 Hyderabadi', '🍛 Karnataka', '🍛 Punjabi', '🍛 Tamil', '🍛 Maharashtrian', '🍛 Gujarati', '🍛 Bengali'];

const CITIES = ['Chennai', 'New Delhi', 'Bangalore', 'Hyderabad', 'Mumbai'];

const DEMO_RESTAURANTS = [
  // Chennai Restaurants (7)
  { name: 'Krishna Hotel', cuisine: '🍛 South Indian', area: 'T. Nagar', city: 'Chennai' },
  { name: 'Shanmugha Cafe', cuisine: '🍛 South Indian', area: 'Mylapore', city: 'Chennai' },
  { name: 'Southern Canopy', cuisine: '🍛 South Indian', area: 'Adyar', city: 'Chennai' },
  { name: 'Saravana Bhavan', cuisine: '🍛 South Indian', area: 'Anna Nagar', city: 'Chennai' },
  { name: 'Murugan Idli Shop', cuisine: '🍛 South Indian', area: 'T. Nagar', city: 'Chennai' },
  { name: 'Ponnusamy Hotel', cuisine: '🍛 South Indian', area: 'Ashok Nagar', city: 'Chennai' },
  { name: 'Anjappar', cuisine: '🍛 South Indian', area: 'Nungambakkam', city: 'Chennai' },
  
  // New Delhi Restaurants (7)
  { name: 'Greenleaf Restaurant', cuisine: '🍛 North Indian', area: 'Connaught Place', city: 'New Delhi' },
  { name: 'Haldiram\'s', cuisine: '🍛 North Indian', area: 'Karol Bagh', city: 'New Delhi' },
  { name: 'Pind Balluchi', cuisine: '🍛 Punjabi', area: 'Vasant Kunj', city: 'New Delhi' },
  { name: 'Bukhara', cuisine: '🍛 North Indian', area: 'Chanakyapuri', city: 'New Delhi' },
  { name: 'Moti Mahal', cuisine: '🍛 North Indian', area: 'Daryaganj', city: 'New Delhi' },
  { name: 'Indian Accent', cuisine: '🍛 North Indian', area: 'Lodhi Road', city: 'New Delhi' },
  { name: 'Karim\'s', cuisine: '🍛 North Indian', area: 'Jama Masjid', city: 'New Delhi' },
  
  // Bangalore Restaurants (7)
  { name: 'MTR Restaurant', cuisine: '🍛 Karnataka', area: 'Lalbagh', city: 'Bangalore' },
  { name: 'Vidyarthi Bhavan', cuisine: '🍛 Karnataka', area: 'Basavanagudi', city: 'Bangalore' },
  { name: 'CTR', cuisine: '🍛 Karnataka', area: 'Malleswaram', city: 'Bangalore' },
  { name: 'Mavalli Tiffin Rooms', cuisine: '🍛 Karnataka', area: 'Indiranagar', city: 'Bangalore' },
  { name: 'Vasanta Bhavan', cuisine: '🍛 South Indian', area: 'Shivajinagar', city: 'Bangalore' },
  { name: 'Dasaprakash', cuisine: '🍛 South Indian', area: 'Gandhinagar', city: 'Bangalore' },
  { name: 'Namma SLV', cuisine: '🍛 Karnataka', area: 'Jayanagar', city: 'Bangalore' },
  
  // Hyderabad Restaurants (7)
  { name: 'Paradise Biryani', cuisine: '🍛 Hyderabadi', area: 'Secunderabad', city: 'Hyderabad' },
  { name: 'Chutneys', cuisine: '🍛 South Indian', area: 'Jubilee Hills', city: 'Hyderabad' },
  { name: 'Bawarchi', cuisine: '🍛 Hyderabadi', area: 'RTC Crossroads', city: 'Hyderabad' },
  { name: ' Paradise Hotel', cuisine: '🍛 Hyderabadi', area: 'Basheerbagh', city: 'Hyderabad' },
  { name: 'Kritunga', cuisine: '🍛 South Indian', area: 'Kukatpally', city: 'Hyderabad' },
  { name: 'Ulava Curry', cuisine: '🍛 South Indian', area: 'Madhapur', city: 'Hyderabad' },
  { name: 'Alpha Hotel', cuisine: '🍛 Hyderabadi', area: 'Abids', city: 'Hyderabad' },
  
  // Mumbai Restaurants (7)
  { name: 'Cafe Leopold', cuisine: '🍛 North Indian', area: 'Colaba', city: 'Mumbai' },
  { name: 'Britannia & Co', cuisine: '🍛 North Indian', area: 'Ballard Estate', city: 'Mumbai' },
  { name: 'Mahesh Lunch Home', cuisine: '🍛 South Indian', area: 'Fort', city: 'Mumbai' },
  { name: 'Trishna', cuisine: '🍛 North Indian', area: 'Fort', city: 'Mumbai' },
  { name: 'Aaswad', cuisine: '🍛 Maharashtrian', area: 'Dadar', city: 'Mumbai' },
  { name: 'Mumbai Chowpatty', cuisine: '🍛 North Indian', area: 'Marine Drive', city: 'Mumbai' },
  { name: 'Khyber', cuisine: '🍛 North Indian', area: 'Bandra', city: 'Mumbai' },
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
  { name: 'Deepak Iyer', email: 'deepak@example.com', id: 'user_deepak' },
  { name: 'Kavita Reddy', email: 'kavita@example.com', id: 'user_kavita' },
  { name: 'Rajesh Menon', email: 'rajesh@example.com', id: 'user_rajesh' },
  { name: 'Sneha Patel', email: 'sneha@example.com', id: 'user_sneha' },
  { name: 'Amit Joshi', email: 'amit@example.com', id: 'user_amit' },
  { name: 'Pooja Nair', email: 'pooja@example.com', id: 'user_pooja' },
  { name: 'Karthik Srinivasan', email: 'karthik@example.com', id: 'user_karthik' },
  { name: 'Divya Sharma', email: 'divya@example.com', id: 'user_divya' },
  { name: 'Nikhil Agarwal', email: 'nikhil@example.com', id: 'user_nikhil' },
  { name: 'Ritu Chauhan', email: 'ritu@example.com', id: 'user_ritu' },
  { name: 'Gaurav Kumar', email: 'gaurav@example.com', id: 'user_gaurav' },
  { name: 'Anjali Verma', email: 'anjali@example.com', id: 'user_anjali' },
];

async function getCityRestaurantCount(city) {
  try {
    const q = query(collection(db, 'restaurants'), where('location', '==', city));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.warn(`Could not check restaurant count for ${city}:`, error);
    return 0;
  }
}

async function getCitySlotCount(city) {
  try {
    const q = query(collection(db, 'slots'), where('location', '==', city));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.warn(`Could not check slot count for ${city}:`, error);
    return 0;
  }
}

async function seedRestaurants() {
  console.log('🌱 Seeding restaurants per city...');

  for (const city of CITIES) {
    const currentCount = await getCityRestaurantCount(city);
    const cityRestaurants = DEMO_RESTAURANTS.filter(r => r.city === city);
    const targetCount = Math.max(6, cityRestaurants.length);
    
    if (currentCount >= targetCount) {
      console.log(`✅ ${city}: Already has ${currentCount} restaurants (target: ${targetCount})`);
      continue;
    }
    
    console.log(`🌱 ${city}: Seeding ${targetCount - currentCount} more restaurants (current: ${currentCount}, target: ${targetCount})`);
    
    for (const restaurant of cityRestaurants) {
      try {
        // Check if restaurant already exists to avoid duplicates
        const existingQuery = query(collection(db, 'restaurants'), where('name', '==', restaurant.name), where('area', '==', restaurant.area));
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          console.log(`⏭️  Skipping existing restaurant: ${restaurant.name}`);
          continue;
        }
        
        await addDoc(collection(db, 'restaurants'), {
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          location: restaurant.city,
          area: restaurant.area,
          lat: 12.9716 + Math.random() * 0.1,
          lng: 77.5946 + Math.random() * 0.1,
          rating: Math.floor(Math.random() * 30) / 10 + 3.5,
          reviewCount: Math.floor(Math.random() * 50),
          createdBy: auth.currentUser?.uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn('Could not seed restaurant:', error);
      }
    }
  }
}

async function seedSlots() {
  console.log('🌱 Seeding dining slots per city...');

  for (const city of CITIES) {
    const currentCount = await getCitySlotCount(city);
    const targetCount = 10;
    
    if (currentCount >= targetCount) {
      console.log(`✅ ${city}: Already has ${currentCount} slots (target: ${targetCount})`);
      continue;
    }
    
    console.log(`🌱 ${city}: Seeding ${targetCount - currentCount} more slots (current: ${currentCount}, target: ${targetCount})`);
    
    // Get restaurants for this city
    const cityRestaurantsQuery = query(collection(db, 'restaurants'), where('location', '==', city));
    const restaurantSnapshot = await getDocs(cityRestaurantsQuery);
    const restaurantList = restaurantSnapshot.docs;
    
    if (restaurantList.length === 0) {
      console.log(`⚠️  ${city}: No restaurants found, skipping slot seeding`);
      continue;
    }
    
    const slotsToCreate = targetCount - currentCount;
    const slotTimes = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
    
    for (let i = 0; i < slotsToCreate; i++) {
      const restaurant = restaurantList[i % restaurantList.length];
      const restaurantData = restaurant.data();
      const slotTime = slotTimes[i % slotTimes.length];
      
      // Spread slots across different dates from the dynamic anchor
      const daysOffset = Math.floor(i / slotTimes.length) + 1;
      const slotDate = new Date(DEMO_ANCHOR_DATE);
      slotDate.setDate(slotDate.getDate() + daysOffset);
      
      // Create real participants with user IDs
      const participantCount = Math.floor(Math.random() * 3);
      const participants = [];
      for (let j = 0; j < participantCount; j++) {
        const randomUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
        participants.push({
          uid: randomUser.id,
          name: randomUser.name,
          photoURL: null,
          partySize: 1
        });
      }
      
      const maxCapacity = participantCount + 1 + Math.floor(Math.random() * 3);
      
      try {
        await addDoc(collection(db, 'slots'), {
          restaurantId: restaurant.id,
          restaurantName: restaurantData.name,
          restaurantCuisine: restaurantData.cuisine,
          date: slotDate.toISOString().split('T')[0],
          time: slotTime,
          maxCapacity: maxCapacity,
          participants: participants,
          partySize: 1,
          location: city,
          hostName: DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].name,
          hostPhoto: null,
          createdBy: DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].id,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn('Could not seed slot:', error);
      }
    }
  }
}

async function seedUsers() {
  console.log('🌱 Seeding user profiles...');

  for (const user of DEMO_USERS) {
    try {
      // Check if user profile already exists
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.id)));
      if (!userDoc.empty) {
        console.log(`⏭️  Skipping existing user: ${user.name}`);
        continue;
      }
      
      // Create user profile in users collection
      await setDoc(doc(db, 'users', user.id), {
        uid: user.id,
        displayName: user.name,
        email: user.email,
        photoURL: null,
        bio: 'Food enthusiast enjoying dining out',
        location: CITIES[Math.floor(Math.random() * CITIES.length)],
        createdAt: serverTimestamp(),
      });
      
      // Also create in profiles collection for search compatibility
      await setDoc(doc(db, 'profiles', user.id), {
        uid: user.id,
        displayName: user.name,
        email: user.email,
        photoURL: null,
        bio: 'Food enthusiast enjoying dining out',
        location: CITIES[Math.floor(Math.random() * CITIES.length)],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Could not seed user:', error);
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
    console.log('📊 Starting top-up seed data check...');
    
    // Always seed user profiles (idempotent)
    await seedUsers();
    
    // Always seed locations (idempotent)
    await seedLocations();
    
    // Top-up restaurants per city
    await seedRestaurants();
    
    // Top-up slots per city
    await seedSlots();
    
    // Seed notifications for current user
    await seedNotifications();
    
    console.log('✅ Seed data check completed');
  } catch (error) {
    console.error('Failed to seed demo data:', error);
  }
}
