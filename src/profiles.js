import {
  collection,
  db,
  onSnapshot,
  query,
  where
} from './firebase.js';
import { state } from './state.js';
import { escapeHtml, formatDate, formatTime, icon, initials, qs, refreshIcons, timeUntil, todayString } from './utils.js';

export function listenForProfileStats() {
  if (state.isDemo) {
    renderProfile(state.slots);
    return;
  }
  if (state.listeners.profile) state.listeners.profile();
  state.listeners.profile = onSnapshot(
    query(collection(db, 'slots'), where('location', '==', state.currentLocation)),
    snapshot => {
      const slots = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      renderProfile(slots);
    }
  );
}

export function renderProfile(slots) {
  const today = todayString();
  const userSlots = slots.filter(slot => {
    const attendees = slot.attendees || [];
    return (slot.hostId || slot.createdBy) === state.user.uid || attendees.some(person => person.uid === state.user.uid);
  });
  const hosted = slots.filter(slot => (slot.hostId || slot.createdBy) === state.user.uid);
  const joined = userSlots.filter(slot => (slot.hostId || slot.createdBy) !== state.user.uid);
  const upcoming = userSlots.filter(slot => slot.date >= today && slot.status !== 'cancelled');
  const past = userSlots.filter(slot => slot.date < today || slot.status === 'completed');
  const added = state.restaurants.filter(place => place.createdBy === state.user.uid).length;

  qs('#statHosted').textContent = hosted.length;
  qs('#statJoined').textContent = joined.length;
  qs('#statAdded').textContent = added;
  qs('#statFriends').textContent = state.friends.length;
  qs('#profileMemberSince').textContent = state.demoActivity.memberSince || 'Today';
  qs('#profileStreak').textContent = `${state.demoActivity.streak || Math.min(hosted.length + joined.length, 7)} meals`;
  qs('#activityRing').style.setProperty('--value', Math.min((hosted.length + joined.length) * 10, 100));
  qs('#activitySummary').textContent = `${hosted.length} hosted, ${joined.length} joined`;
  qs('#upcomingSlots').innerHTML = listSlots(upcoming, 'No upcoming slots');
  qs('#pastSlots').innerHTML = listSlots(past, 'No past meals yet');
  qs('#badgesList').innerHTML = renderBadges(hosted.length, joined.length, added);
  refreshIcons();
}

function listSlots(slots, emptyText) {
  if (!slots.length) return `<div class="empty-mini">${emptyText}</div>`;
  return slots.slice(0, 5).map(slot => `
    <div class="profile-slot rich">
      <span class="avatar small-avatar">${initials(slot.hostName || 'Host')}</span>
      <div>
        <strong>${escapeHtml(slot.restaurantName)}</strong>
        <span>${formatDate(slot.date)} at ${formatTime(slot.time)} · ${escapeHtml(slot.restaurantCuisine || 'Dining')}</span>
      </div>
      <em>${icon('clock-3', 14)}${timeUntil(slot.date, slot.time)}</em>
    </div>
  `).join('');
}

function renderBadges(hosted, joined, added) {
  const badges = [];
  if (hosted + joined > 0) badges.push('First Meal');
  if (hosted >= 3) badges.push('Top Host');
  if (joined >= 3) badges.push('Social Explorer');
  if (added >= 3) badges.push('Food Scout');
  if (!badges.length) badges.push('Getting Started');
  return badges.map(badge => `<span>${badge}</span>`).join('');
}
