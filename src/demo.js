import {
  addDoc,
  collection,
  db,
  getDocs,
  query,
  serverTimestamp,
  where
} from './firebase.js';
import { state } from './state.js';

const restaurantSeed = [
  ['r1', 'Lodhi Garden Table', 'Indian', 4.8, 1.2, 'Lodhi Road, New Delhi', 'Garden-side North Indian plates with calm outdoor seating.'],
  ['r2', 'Blue Tokai Coffee Roasters', 'Cafe', 4.6, 0.8, 'Khan Market, New Delhi', 'Low-pressure coffee chats, croissants, and quick meetups.'],
  ['r3', 'Yum Yum Cha', 'Japanese', 4.7, 2.4, 'Saket, New Delhi', 'Sushi, dim sum, and a bright room for group dinners.'],
  ['r4', 'Big Chill Cafe', 'Italian', 4.5, 3.1, 'Khan Market, New Delhi', 'Comfort pasta, cheesecakes, and an easy first-meal pick.'],
  ['r5', 'Biryani Blues', 'Fast Food', 4.3, 1.6, 'Connaught Place, New Delhi', 'Casual, affordable, and easy to coordinate for larger groups.'],
  ['r6', 'Carnatic Cafe', 'South Indian', 4.8, 2.2, 'Lodhi Colony, New Delhi', 'Crisp dosas, filter coffee, and great vegetarian options.'],
  ['r7', 'Mamagoto', 'Thai', 4.4, 2.9, 'Select Citywalk, New Delhi', 'Colorful Asian plates and a lively table for new people.'],
  ['r8', 'Taco Bell Cantina', 'Mexican', 4.1, 1.9, 'Janpath, New Delhi', 'Quick tacos, mocktails, and casual post-class hangouts.']
];

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildDemoData() {
  const user = {
    uid: 'demo-user',
    displayName: 'Aarav Mehta',
    email: 'demo@dinemate.app',
    photoURL: ''
  };

  const restaurants = restaurantSeed.map(([id, name, cuisine, rating, distance, address, notes], index) => ({
    id,
    name,
    cuisine,
    category: cuisine,
    rating,
    reviewCount: 24 + index * 7,
    distance,
    address,
    notes,
    location: 'New Delhi',
    createdBy: index < 3 ? user.uid : `host-${index}`,
    demo: true
  }));

  const slots = [
    {
      id: 's1',
      hostId: 'host-maya',
      createdBy: 'host-maya',
      hostName: 'Maya Kapoor',
      restaurantId: 'r3',
      restaurantName: 'Yum Yum Cha',
      restaurantCuisine: 'Japanese',
      date: dateOffset(0),
      time: '20:00',
      maxCapacity: 4,
      currentCapacity: 2,
      attendees: [{ uid: 'host-maya', name: 'Maya Kapoor', partySize: 1 }, { uid: 'user-rio', name: 'Ritvik Rao', partySize: 1 }],
      participants: [],
      waitlist: [],
      status: 'open',
      notes: 'Trying sushi rolls and talking startup ideas.',
      location: 'New Delhi'
    },
    {
      id: 's2',
      hostId: user.uid,
      createdBy: user.uid,
      hostName: 'Aarav Mehta',
      restaurantId: 'r6',
      restaurantName: 'Carnatic Cafe',
      restaurantCuisine: 'South Indian',
      date: dateOffset(1),
      time: '09:30',
      maxCapacity: 3,
      currentCapacity: 2,
      attendees: [{ uid: user.uid, name: 'Aarav Mehta', partySize: 1 }, { uid: 'user-isha', name: 'Isha Nair', partySize: 1 }],
      participants: [],
      waitlist: [],
      status: 'open',
      notes: 'Breakfast slot before college. Filter coffee mandatory.',
      location: 'New Delhi'
    },
    {
      id: 's3',
      hostId: 'host-zoya',
      createdBy: 'host-zoya',
      hostName: 'Zoya Khan',
      restaurantId: 'r4',
      restaurantName: 'Big Chill Cafe',
      restaurantCuisine: 'Italian',
      date: dateOffset(2),
      time: '19:15',
      maxCapacity: 6,
      currentCapacity: 4,
      attendees: [
        { uid: 'host-zoya', name: 'Zoya Khan', partySize: 1 },
        { uid: user.uid, name: 'Aarav Mehta', partySize: 1 },
        { uid: 'user-dev', name: 'Dev Arora', partySize: 1 },
        { uid: 'user-neel', name: 'Neel Shah', partySize: 1 }
      ],
      participants: [],
      waitlist: [],
      status: 'open',
      notes: 'Pasta, desserts, and a casual tech-careers chat.',
      location: 'New Delhi'
    },
    {
      id: 's4',
      hostId: 'host-kabir',
      createdBy: 'host-kabir',
      hostName: 'Kabir Sethi',
      restaurantId: 'r1',
      restaurantName: 'Lodhi Garden Table',
      restaurantCuisine: 'Indian',
      date: dateOffset(3),
      time: '20:30',
      maxCapacity: 5,
      currentCapacity: 3,
      attendees: [{ uid: 'host-kabir', name: 'Kabir Sethi', partySize: 1 }, { uid: 'user-ana', name: 'Ananya Sen', partySize: 1 }, { uid: 'user-om', name: 'Om Prakash', partySize: 1 }],
      participants: [],
      waitlist: [],
      status: 'open',
      notes: 'North Indian dinner, friendly for first-time joiners.',
      location: 'New Delhi'
    },
    {
      id: 's5',
      hostId: user.uid,
      createdBy: user.uid,
      hostName: 'Aarav Mehta',
      restaurantId: 'r2',
      restaurantName: 'Blue Tokai Coffee Roasters',
      restaurantCuisine: 'Cafe',
      date: dateOffset(-2),
      time: '17:00',
      maxCapacity: 4,
      currentCapacity: 4,
      attendees: [{ uid: user.uid, name: 'Aarav Mehta', partySize: 1 }, { uid: 'user-dev', name: 'Dev Arora', partySize: 1 }, { uid: 'user-isha', name: 'Isha Nair', partySize: 1 }, { uid: 'user-rio', name: 'Ritvik Rao', partySize: 1 }],
      status: 'completed',
      location: 'New Delhi'
    },
    {
      id: 's6',
      hostId: user.uid,
      createdBy: user.uid,
      hostName: 'Aarav Mehta',
      restaurantId: 'r5',
      restaurantName: 'Biryani Blues',
      restaurantCuisine: 'Fast Food',
      date: dateOffset(-5),
      time: '20:00',
      maxCapacity: 5,
      currentCapacity: 5,
      attendees: [{ uid: user.uid, name: 'Aarav Mehta', partySize: 1 }, { uid: 'user-neel', name: 'Neel Shah', partySize: 1 }],
      status: 'completed',
      location: 'New Delhi'
    },
    {
      id: 's7',
      hostId: 'host-maya',
      createdBy: 'host-maya',
      hostName: 'Maya Kapoor',
      restaurantId: 'r7',
      restaurantName: 'Mamagoto',
      restaurantCuisine: 'Thai',
      date: dateOffset(-8),
      time: '19:30',
      maxCapacity: 4,
      currentCapacity: 4,
      attendees: [{ uid: 'host-maya', name: 'Maya Kapoor', partySize: 1 }, { uid: user.uid, name: 'Aarav Mehta', partySize: 1 }],
      status: 'completed',
      location: 'New Delhi'
    },
    {
      id: 's8',
      hostId: 'host-zoya',
      createdBy: 'host-zoya',
      hostName: 'Zoya Khan',
      restaurantId: 'r4',
      restaurantName: 'Big Chill Cafe',
      restaurantCuisine: 'Italian',
      date: dateOffset(-15),
      time: '19:00',
      maxCapacity: 6,
      currentCapacity: 6,
      attendees: [{ uid: 'host-zoya', name: 'Zoya Khan', partySize: 1 }, { uid: user.uid, name: 'Aarav Mehta', partySize: 1 }],
      status: 'completed',
      location: 'New Delhi'
    },
    {
      id: 's9',
      hostId: 'host-kabir',
      createdBy: 'host-kabir',
      hostName: 'Kabir Sethi',
      restaurantId: 'r8',
      restaurantName: 'Taco Bell Cantina',
      restaurantCuisine: 'Mexican',
      date: dateOffset(-19),
      time: '18:45',
      maxCapacity: 4,
      currentCapacity: 4,
      attendees: [{ uid: 'host-kabir', name: 'Kabir Sethi', partySize: 1 }, { uid: user.uid, name: 'Aarav Mehta', partySize: 1 }],
      status: 'completed',
      location: 'New Delhi'
    },
    {
      id: 's10',
      hostId: 'host-ana',
      createdBy: 'host-ana',
      hostName: 'Ananya Sen',
      restaurantId: 'r1',
      restaurantName: 'Lodhi Garden Table',
      restaurantCuisine: 'Indian',
      date: dateOffset(-27),
      time: '20:15',
      maxCapacity: 5,
      currentCapacity: 5,
      attendees: [{ uid: 'host-ana', name: 'Ananya Sen', partySize: 1 }, { uid: user.uid, name: 'Aarav Mehta', partySize: 1 }],
      status: 'completed',
      location: 'New Delhi'
    }
  ];

  return {
    user,
    userDoc: {
      name: user.displayName,
      email: user.email,
      bio: 'Third-year CSE student who uses food meetups to find new project partners.',
      joinedAt: dateOffset(-46)
    },
    restaurants,
    slots,
    messages: {
      s1: [
        { id: 'm1', uid: 'host-maya', name: 'Maya Kapoor', text: 'Hey! I booked this for 8 PM. Anyone vegetarian?', createdAt: new Date(Date.now() - 1000 * 60 * 34) },
        { id: 'm2', uid: 'user-rio', name: 'Ritvik Rao', text: 'I am good with anything. Looking forward to trying the ramen.', createdAt: new Date(Date.now() - 1000 * 60 * 28) },
        { id: 'm3', uid: user.uid, name: user.displayName, text: 'Demo user here. I would probably ask about group size before joining.', createdAt: new Date(Date.now() - 1000 * 60 * 20) }
      ],
      s3: [
        { id: 'm4', uid: 'host-zoya', name: 'Zoya Khan', text: 'This is a low-pressure table. Come hungry.', createdAt: new Date(Date.now() - 1000 * 60 * 74) },
        { id: 'm5', uid: user.uid, name: user.displayName, text: 'Perfect. I am joining after lab.', createdAt: new Date(Date.now() - 1000 * 60 * 68) }
      ]
    },
    notifications: [
      { id: 'n1', message: 'Maya replied in the Yum Yum Cha chat', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 12) },
      { id: 'n2', message: 'Your Carnatic Cafe breakfast slot has 1 new diner', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 55) },
      { id: 'n3', message: 'Zoya accepted your friend request', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9) }
    ],
    friends: [
      { id: 'f1', users: [user.uid, 'host-zoya'], names: { [user.uid]: user.displayName, 'host-zoya': 'Zoya Khan' } },
      { id: 'f2', users: [user.uid, 'user-dev'], names: { [user.uid]: user.displayName, 'user-dev': 'Dev Arora' } },
      { id: 'f3', users: [user.uid, 'user-isha'], names: { [user.uid]: user.displayName, 'user-isha': 'Isha Nair' } }
    ],
    requests: [{ id: 'q1', fromUid: 'host-kabir', fromName: 'Kabir Sethi', toUid: user.uid, status: 'pending' }],
    demoActivity: {
      memberSince: 'May 2026',
      streak: 4
    }
  };
}

export async function seedDemoData() {
  if (state.isDemo) return;
  const existing = await getDocs(query(
    collection(db, 'restaurants'),
    where('location', '==', state.currentLocation)
  ));

  if (!existing.empty) return;

  for (const [, name, cuisine, rating, distance, address, notes] of restaurantSeed.slice(0, 5)) {
    await addDoc(collection(db, 'restaurants'), {
      name,
      cuisine,
      category: cuisine,
      rating,
      reviewCount: 3,
      distance,
      notes,
      address,
      location: state.currentLocation,
      createdBy: state.user.uid,
      demo: true,
      createdAt: serverTimestamp()
    });
  }
}
