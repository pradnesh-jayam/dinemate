// ========================================
// Restaurant Search Service
// Fetches real-time data from Mappls via backend proxy
// ========================================

const LOCATION_COORDS = {
  'New Delhi': '28.6139,77.2090',
  'Mumbai': '19.0760,72.8777',
  'Bangalore': '12.9716,77.5946',
  'Hyderabad': '17.3850,78.4867',
  'Pune': '18.5204,73.8567',
  'Chennai': '13.0827,80.2707'
};

async function searchRestaurantsByLocation(location) {
  console.log(`🔍 Searching restaurants in ${location}...`);
  
  try {
    const coords = LOCATION_COORDS[location] || LOCATION_COORDS['New Delhi'];
    const response = await fetch(`/api/restaurants?location=${coords}&keyword=restaurant`);
    
    if (!response.ok) {
      console.warn(`⚠️ API error: ${response.status}, using demo data`);
      return getDemoRestaurants(location);
    }
    
    const data = await response.json();
    
    // Parse Mappls response
    if (data.results && Array.isArray(data.results)) {
      const restaurants = data.results.slice(0, 12).map((place, idx) => ({
        id: place.placeId || `${location}-${idx}`,
        name: place.placeName || 'Unknown Restaurant',
        emoji: getRandomFoodEmoji(),
        rating: place.rating ? parseFloat(place.rating) : 4.5,
        distance: place.distance ? `${(place.distance / 1000).toFixed(1)} km` : '1 km',
        cuisine: place.placeTypeCode || 'Restaurant',
        lat: place.latitude,
        lng: place.longitude
      }));
      
      console.log(`✅ Found ${restaurants.length} real restaurants for ${location}`);
      return restaurants;
    }
    
    return getDemoRestaurants(location);
  } catch (error) {
    console.error('❌ Search error:', error);
    return getDemoRestaurants(location);
  }
}

function getDemoRestaurants(location) {
  const restaurants = {
    'New Delhi': [
      { id: '1', name: 'The Spice Route', emoji: '🍛', rating: 4.8, distance: '0.5 km', cuisine: 'Indian' },
      { id: '2', name: 'Pizza Perfetto', emoji: '🍕', rating: 4.6, distance: '0.8 km', cuisine: 'Italian' },
      { id: '3', name: 'Sushi Paradise', emoji: '🍣', rating: 4.7, distance: '1.2 km', cuisine: 'Japanese' },
      { id: '4', name: 'Burger Haven', emoji: '🍔', rating: 4.5, distance: '1.5 km', cuisine: 'American' },
      { id: '5', name: 'Biryani House', emoji: '🍲', rating: 4.9, distance: '0.3 km', cuisine: 'Hyderabadi' },
      { id: '6', name: 'Pasta Italiana', emoji: '🍝', rating: 4.7, distance: '1.0 km', cuisine: 'Italian' },
      { id: '7', name: 'Dragon Wok', emoji: '🥡', rating: 4.6, distance: '0.7 km', cuisine: 'Chinese' },
      { id: '8', name: 'Kebab Palace', emoji: '🍖', rating: 4.7, distance: '0.9 km', cuisine: 'Middle Eastern' },
      { id: '9', name: 'Taco Fiesta', emoji: '🌮', rating: 4.4, distance: '1.1 km', cuisine: 'Mexican' },
      { id: '10', name: 'Curry Express', emoji: '🥘', rating: 4.7, distance: '0.6 km', cuisine: 'Indian' },
      { id: '11', name: 'Steak House', emoji: '🥩', rating: 4.8, distance: '1.3 km', cuisine: 'American' },
      { id: '12', name: 'Coffee Haven', emoji: '☕', rating: 4.5, distance: '0.4 km', cuisine: 'Cafe' }
    ],
    'Mumbai': [
      { id: '13', name: 'Mumbai Spice', emoji: '🍛', rating: 4.8, distance: '0.5 km', cuisine: 'Indian' },
      { id: '14', name: 'Pizzeria Milano', emoji: '🍕', rating: 4.7, distance: '0.8 km', cuisine: 'Italian' },
      { id: '15', name: 'Tokyo Sushi', emoji: '🍣', rating: 4.8, distance: '1.2 km', cuisine: 'Japanese' },
      { id: '16', name: 'Burger King Local', emoji: '🍔', rating: 4.6, distance: '1.5 km', cuisine: 'American' },
      { id: '17', name: 'Hyderabadi Biryani', emoji: '🍲', rating: 4.9, distance: '0.3 km', cuisine: 'Hyderabadi' },
      { id: '18', name: 'Pasta Paradise', emoji: '🍝', rating: 4.8, distance: '1.0 km', cuisine: 'Italian' },
      { id: '19', name: 'Shanghai Kitchen', emoji: '🥡', rating: 4.7, distance: '0.7 km', cuisine: 'Chinese' },
      { id: '20', name: 'Middle East Grill', emoji: '🍖', rating: 4.6, distance: '0.9 km', cuisine: 'Middle Eastern' },
      { id: '21', name: 'Taco Mexican', emoji: '🌮', rating: 4.5, distance: '1.1 km', cuisine: 'Mexican' },
      { id: '22', name: 'Curry Central', emoji: '🥘', rating: 4.8, distance: '0.6 km', cuisine: 'Indian' },
      { id: '23', name: 'Prime Steaks', emoji: '🥩', rating: 4.9, distance: '1.3 km', cuisine: 'American' },
      { id: '24', name: 'Morning Cafe', emoji: '☕', rating: 4.6, distance: '0.4 km', cuisine: 'Cafe' }
    ],
    'Bangalore': [
      { id: '25', name: 'South Indian Kitchen', emoji: '🥘', rating: 4.8, distance: '0.4 km', cuisine: 'South Indian' },
      { id: '26', name: 'Gourmet Burger', emoji: '🍔', rating: 4.7, distance: '0.6 km', cuisine: 'American' },
      { id: '27', name: 'Thai Emerald', emoji: '🥗', rating: 4.6, distance: '0.9 km', cuisine: 'Thai' },
      { id: '28', name: 'Biryani Express', emoji: '🍲', rating: 4.9, distance: '0.5 km', cuisine: 'Hyderabadi' },
      { id: '29', name: 'Cafe Mocha', emoji: '☕', rating: 4.5, distance: '0.3 km', cuisine: 'Cafe' },
      { id: '30', name: 'Seafood Bay', emoji: '🦐', rating: 4.8, distance: '1.1 km', cuisine: 'Seafood' },
      { id: '31', name: 'Chinese Wok', emoji: '🥡', rating: 4.7, distance: '0.8 km', cuisine: 'Chinese' },
      { id: '32', name: 'Italian Trattoria', emoji: '🍝', rating: 4.7, distance: '1.0 km', cuisine: 'Italian' },
      { id: '33', name: 'Tandoor Palace', emoji: '🍛', rating: 4.8, distance: '0.7 km', cuisine: 'Indian' },
      { id: '34', name: 'Fusion Bites', emoji: '🍜', rating: 4.6, distance: '0.5 km', cuisine: 'Asian Fusion' },
      { id: '35', name: 'Street Eats', emoji: '🌮', rating: 4.5, distance: '1.2 km', cuisine: 'Street Food' },
      { id: '36', name: 'Vegan Paradise', emoji: '🥗', rating: 4.7, distance: '0.9 km', cuisine: 'Vegan' }
    ]
  };

  const list = restaurants[location] || restaurants['New Delhi'];
  console.log(`📦 Using ${list.length} demo restaurants for ${location}`);
  return list;
}

function getRandomFoodEmoji() {
  const emojis = ['🍛', '🍕', '🍣', '🍔', '🍲', '🍝', '🥗', '🦐', '🌮', '🥟', '☕', '🍜'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
