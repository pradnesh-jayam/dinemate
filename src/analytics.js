import { state } from './state.js';
import { qs } from './utils.js';

export function renderAnalytics() {
  const hosted = state.slots.filter(slot => (slot.hostId || slot.createdBy) === state.user.uid);
  const joined = state.slots.filter(slot => (slot.hostId || slot.createdBy) !== state.user.uid
    && (slot.attendees || []).some(person => person.uid === state.user.uid));
  const peopleMet = new Set(joined.flatMap(slot => (slot.attendees || []).map(person => person.uid)).filter(uid => uid !== state.user.uid));
  const cuisines = {};
  joined.concat(hosted).forEach(slot => {
    const cuisine = slot.restaurantCuisine || 'Dining';
    cuisines[cuisine] = (cuisines[cuisine] || 0) + 1;
  });
  const favoriteCuisine = Object.entries(cuisines).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not enough data';
  const visited = new Set(joined.concat(hosted).map(slot => slot.restaurantId)).size;
  const attendanceRate = joined.length || hosted.length ? Math.round((joined.length / Math.max(joined.length + hosted.length, 1)) * 100) : 0;

  const cards = [
    ['Meals Hosted', hosted.length],
    ['Meals Joined', joined.length],
    ['People Met', peopleMet.size],
    ['Restaurants Visited', visited],
    ['Favorite Cuisine', favoriteCuisine],
    ['Attendance Rate', `${attendanceRate}%`]
  ];

  qs('#analyticsGrid').innerHTML = cards.map(([label, value]) => `
    <div class="metric-card">
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `).join('');
}
