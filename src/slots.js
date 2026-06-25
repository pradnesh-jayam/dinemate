import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from './firebase.js';
import { state } from './state.js';
import { escapeHtml, formatDate, formatTime, icon, initials, qs, refreshIcons, timeUntil, todayString } from './utils.js';
import { openModal, renderSkeleton, showSection, showToast } from './ui.js';
import { renderAnalytics } from './analytics.js';
import { renderConversations } from './chat.js';
import { renderProfile } from './profiles.js';

export function bindSlotEvents() {
  qs('#createSlotForm').addEventListener('submit', createSlot);
  qs('#joinSlotForm').addEventListener('submit', joinSlot);
  qs('#joinChatFirstBtn').addEventListener('click', () => {
    document.getElementById('joinSlotModal').classList.remove('show');
    window.openChatModal(qs('#joinSlotModal').dataset.slotId, qs('#joinRestaurant').value);
  });

  ['cuisineFilter', 'dateFilter', 'partySizeFilter'].forEach(id => qs(`#${id}`).addEventListener('change', renderSlots));
  qs('#clearFiltersBtn').addEventListener('click', () => {
    qs('#cuisineFilter').value = '';
    qs('#dateFilter').value = '';
    qs('#partySizeFilter').value = '';
    renderSlots();
  });
  qs('#upcomingToggle').addEventListener('click', () => togglePast(false));
  qs('#pastToggle').addEventListener('click', () => togglePast(true));
}

export function listenForSlots() {
  if (state.isDemo) {
    renderSlots();
    renderAnalytics();
    renderConversations();
    return;
  }
  if (state.listeners.slots) state.listeners.slots();
  renderSkeleton('#slotList', 3);

  const q = query(
    collection(db, 'slots'),
    where('location', '==', state.currentLocation),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  state.listeners.slots = onSnapshot(q, snapshot => {
    state.slots = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    expireOldSlots();
    renderSlots();
    renderAnalytics();
    renderConversations();
  });
}

export function openCreateSlotModal(restaurantId, restaurantName) {
  const restaurant = state.restaurants.find(item => item.id === restaurantId);
  qs('#createSlotModal').dataset.restaurantId = restaurantId;
  qs('#createSlotModal').dataset.restaurantCuisine = restaurant?.cuisine || '';
  qs('#slotRestaurant').value = restaurantName;
  qs('#slotDate').value = todayString();
  qs('#slotTime').value = '19:30';
  qs('#slotCapacity').value = 4;
  qs('#slotNotes').value = '';
  openModal('createSlotModal');
}

async function createSlot(event) {
  event.preventDefault();
  const modal = qs('#createSlotModal');
  const restaurantId = modal.dataset.restaurantId;
  const restaurant = state.restaurants.find(item => item.id === restaurantId);

  if (!restaurant) {
    showToast('Choose a restaurant first.', 'error');
    return;
  }

  const slot = {
    id: `demo-slot-${Date.now()}`,
    hostId: state.user.uid,
    createdBy: state.user.uid,
    hostName: state.userDoc?.name || state.user.displayName || 'User',
    restaurantId,
    restaurantName: restaurant.name,
    restaurantCuisine: restaurant.cuisine,
    date: qs('#slotDate').value,
    time: qs('#slotTime').value,
    maxCapacity: Number(qs('#slotCapacity').value),
    currentCapacity: 1,
    attendees: [{
      uid: state.user.uid,
      name: state.userDoc?.name || state.user.displayName || 'User',
      partySize: 1
    }],
    participants: [],
    waitlist: [],
    isFull: false,
    status: 'open',
    notes: qs('#slotNotes').value.trim(),
    location: state.currentLocation,
  };

  if (state.isDemo) {
    state.slots.unshift(slot);
    document.getElementById('createSlotModal').classList.remove('show');
    showToast('Demo slot created locally');
    showSection('browse');
    renderSlots();
    renderAnalytics();
    renderProfile(state.slots);
    renderConversations();
    return;
  }

  await addDoc(collection(db, 'slots'), {
    ...slot,
    createdAt: serverTimestamp()
  });

  document.getElementById('createSlotModal').classList.remove('show');
  showToast('Slot created');
  showSection('browse');
}

export async function openJoinModal(slotId) {
  let slot;
  if (state.isDemo) {
    slot = state.slots.find(item => item.id === slotId);
  } else {
    const snap = await getDoc(doc(db, 'slots', slotId));
    if (!snap.exists()) return;
    slot = { id: snap.id, ...snap.data() };
  }
  if (!slot) return;
  qs('#joinSlotModal').dataset.slotId = slotId;
  qs('#joinRestaurant').value = slot.restaurantName;
  qs('#joinDateTime').value = `${formatDate(slot.date)} at ${formatTime(slot.time)}`;
  qs('#joinHost').value = `Host: ${slot.hostName || 'DineMate user'}`;
  qs('#joinGroupSize').value = `${slot.currentCapacity || 1}/${slot.maxCapacity || slot.partySize || 4} seats taken`;
  qs('#joinPartySize').value = 1;
  openModal('joinSlotModal');
}

async function joinSlot(event) {
  event.preventDefault();
  const slotId = qs('#joinSlotModal').dataset.slotId;
  const partySize = Number(qs('#joinPartySize').value || 1);
  const slotRef = doc(db, 'slots', slotId);
  let waitlisted = false;

  if (state.isDemo) {
    const slot = state.slots.find(item => item.id === slotId);
    if (!slot) return;
    const attendees = slot.attendees || [];
    const waitlist = slot.waitlist || [];
    const alreadyJoined = attendees.some(person => person.uid === state.user.uid)
      || waitlist.some(person => person.uid === state.user.uid);
    if (!alreadyJoined) {
      const maxCapacity = Number(slot.maxCapacity || slot.partySize || 4);
      const currentCapacity = Number(slot.currentCapacity || attendees.length || 1);
      const person = {
        uid: state.user.uid,
        name: state.userDoc?.name || state.user.displayName || 'Demo User',
        partySize
      };
      if (currentCapacity + partySize <= maxCapacity) {
        slot.attendees = [...attendees, person];
        slot.participants = [...(slot.participants || []), person];
        slot.currentCapacity = currentCapacity + partySize;
        slot.isFull = slot.currentCapacity >= maxCapacity;
        slot.status = slot.isFull ? 'full' : 'open';
      } else {
        waitlisted = true;
        slot.waitlist = [...waitlist, person];
      }
    }
    document.getElementById('joinSlotModal').classList.remove('show');
    renderSlots();
    renderAnalytics();
    renderProfile(state.slots);
    renderConversations();
    showToast(waitlisted ? 'Demo waitlist updated locally' : 'Demo join updated locally');
    window.openChatModal(slotId, slot.restaurantName);
    return;
  }

  await runTransaction(db, async transaction => {
    const snap = await transaction.get(slotRef);
    if (!snap.exists()) throw new Error('This slot no longer exists.');
    const slot = snap.data();
    const attendees = slot.attendees || [];
    const waitlist = slot.waitlist || [];
    const alreadyJoined = attendees.some(person => person.uid === state.user.uid)
      || waitlist.some(person => person.uid === state.user.uid);

    if (alreadyJoined) return;

    const maxCapacity = Number(slot.maxCapacity || slot.partySize || 4);
    const currentCapacity = Number(slot.currentCapacity || attendees.length || 1);
    const person = {
      uid: state.user.uid,
      name: state.userDoc?.name || state.user.displayName || 'User',
      partySize
    };

    if (currentCapacity + partySize <= maxCapacity) {
      const nextCapacity = currentCapacity + partySize;
      transaction.update(slotRef, {
        attendees: [...attendees, person],
        participants: [...(slot.participants || []), person],
        currentCapacity: nextCapacity,
        isFull: nextCapacity >= maxCapacity,
        status: nextCapacity >= maxCapacity ? 'full' : 'open'
      });
    } else {
      waitlisted = true;
      transaction.update(slotRef, {
        waitlist: [...waitlist, person]
      });
    }
  });

  const slotSnap = await getDoc(slotRef);
  const slot = slotSnap.data();
  await addDoc(collection(db, 'notifications'), {
    toUid: slot.hostId || slot.createdBy,
    fromUid: state.user.uid,
    fromName: state.userDoc?.name || state.user.displayName || 'Someone',
    message: waitlisted
      ? `${state.userDoc?.name || 'Someone'} joined the waitlist for ${slot.restaurantName}`
      : `${state.userDoc?.name || 'Someone'} joined your slot at ${slot.restaurantName}`,
    slotId,
    read: false,
    createdAt: serverTimestamp()
  });

  document.getElementById('joinSlotModal').classList.remove('show');
  showToast(waitlisted ? 'Slot is full. You are on the waitlist.' : "You're in");
  window.openChatModal(slotId, slot.restaurantName);
}

export async function cancelSlot(slotId) {
  const slot = state.slots.find(item => item.id === slotId);
  if (!slot || slot.hostId !== state.user.uid && slot.createdBy !== state.user.uid) {
    showToast('Only the host can cancel this slot.', 'error');
    return;
  }
  if (state.isDemo) {
    slot.status = 'cancelled';
    slot.isFull = false;
    renderSlots();
    renderAnalytics();
    renderProfile(state.slots);
    showToast('Demo slot cancelled locally');
    return;
  }
  await updateDoc(doc(db, 'slots', slotId), { status: 'cancelled', isFull: false });
  showToast('Slot cancelled');
}

export function renderSlots() {
  const list = qs('#slotList');
  const today = todayString();
  const cuisine = qs('#cuisineFilter').value;
  const date = qs('#dateFilter').value;
  const partySize = Number(qs('#partySizeFilter').value || 0);

  const filtered = state.slots.filter(slot => {
    const isPast = slot.date < today || slot.status === 'completed';
    if (state.showPastSlots !== isPast) return false;
    if (cuisine && slot.restaurantCuisine !== cuisine) return false;
    if (date && slot.date !== date) return false;
    if (partySize && Number(slot.maxCapacity || slot.partySize || 0) < partySize) return false;
    return slot.status !== 'cancelled';
  });

  qs('#clearFiltersBtn').style.display = cuisine || date || partySize ? 'inline-flex' : 'none';

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <h2>No ${state.showPastSlots ? 'past' : 'upcoming'} slots</h2>
        <p>Create a table and invite people nearby.</p>
        <button class="btn btn-primary" onclick="showSection('create')" type="button">Create slot</button>
      </div>
    `;
    return;
  }

  const topPickId = getRecommendedSlotId(filtered);
  list.innerHTML = filtered.map(slot => slotTemplate(slot, slot.id === topPickId)).join('');
  list.querySelectorAll('[data-join-slot]').forEach(btn => btn.addEventListener('click', () => openJoinModal(btn.dataset.id)));
  list.querySelectorAll('[data-chat-slot]').forEach(btn => btn.addEventListener('click', () => window.openChatModal(btn.dataset.id, btn.dataset.name)));
  list.querySelectorAll('[data-cancel-slot]').forEach(btn => btn.addEventListener('click', () => cancelSlot(btn.dataset.id)));
  list.querySelectorAll('[data-share-slot]').forEach(btn => btn.addEventListener('click', () => shareSlot(btn.dataset.id)));
  refreshIcons();
}

function slotTemplate(slot, isRecommended = false) {
  const isHost = (slot.hostId || slot.createdBy) === state.user.uid;
  const attendees = slot.attendees || [];
  const waitlist = slot.waitlist || [];
  const isJoined = attendees.some(person => person.uid === state.user.uid);
  const capacity = `${slot.currentCapacity || attendees.length || 1}/${slot.maxCapacity || slot.partySize || 4}`;
  const status = slot.isFull ? 'Full' : slot.status || 'Open';
  const cuisineClass = String(slot.restaurantCuisine || 'Dining').toLowerCase().replaceAll(' ', '-');

  return `
    <article class="slot-card ${isRecommended ? 'recommended' : ''}">
      <div class="slot-info">
        <div class="card-topline">
          <span class="status-pill">${icon(isRecommended ? 'sparkles' : 'circle-dot', 14)}${isRecommended ? 'Top Pick' : escapeHtml(status)}</span>
          <span class="time-pill">${icon('clock-3', 14)}${timeUntil(slot.date, slot.time)}</span>
        </div>
        <h2>${escapeHtml(slot.restaurantName)}</h2>
        <p>${formatDate(slot.date)} at ${formatTime(slot.time)}</p>
        <div class="host-line">
          <span class="avatar small-avatar">${initials(slot.hostName || 'Host')}</span>
          <span>Hosted by <strong>${escapeHtml(slot.hostName || 'a host')}</strong></span>
          <span class="cuisine-tag cuisine-${escapeHtml(cuisineClass)}">${icon('utensils', 14)}${escapeHtml(slot.restaurantCuisine || 'Dining')}</span>
        </div>
        ${slot.notes ? `<p class="card-note">${escapeHtml(slot.notes)}</p>` : ''}
        <div class="slot-badges">
          ${isHost ? '<span>Your slot</span>' : ''}
          ${isJoined ? '<span>Joined</span>' : ''}
          <span>${capacity} seats</span>
          ${waitlist.length ? `<span>${waitlist.length} waitlisted</span>` : ''}
        </div>
      </div>
      <div class="slot-actions">
        <button class="btn btn-ghost" data-share-slot data-id="${slot.id}" type="button">${icon('share-2', 16)}Share</button>
        <button class="btn btn-ghost" data-chat-slot data-id="${slot.id}" data-name="${escapeHtml(slot.restaurantName)}" type="button">${icon('messages-square', 16)}Chat</button>
        ${isHost ? `<button class="btn btn-danger" data-cancel-slot data-id="${slot.id}" type="button">${icon('x-circle', 16)}Cancel</button>` : ''}
        ${!isHost && !isJoined ? `<button class="btn btn-primary join-cta" data-join-slot data-id="${slot.id}" type="button">${icon(slot.isFull ? 'list-plus' : 'user-plus', 16)}${slot.isFull ? 'Waitlist' : 'Join'}</button>` : ''}
      </div>
    </article>
  `;
}

function getRecommendedSlotId(slots) {
  const userSlots = state.slots.filter(slot => {
    const attendees = slot.attendees || [];
    return (slot.hostId || slot.createdBy) === state.user.uid || attendees.some(person => person.uid === state.user.uid);
  });
  const cuisineCounts = userSlots.reduce((counts, slot) => {
    const cuisine = slot.restaurantCuisine;
    if (cuisine) counts[cuisine] = (counts[cuisine] || 0) + 1;
    return counts;
  }, {});
  const favoriteCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const byCuisine = favoriteCuisine ? slots.find(slot => slot.restaurantCuisine === favoriteCuisine && (slot.hostId || slot.createdBy) !== state.user.uid) : null;
  return (byCuisine || [...slots].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0])?.id;
}

function togglePast(showPast) {
  state.showPastSlots = showPast;
  qs('#pastToggle').classList.toggle('active', showPast);
  qs('#upcomingToggle').classList.toggle('active', !showPast);
  renderSlots();
}

function shareSlot(slotId) {
  const slot = state.slots.find(item => item.id === slotId);
  const text = `Join me at ${slot.restaurantName} on ${formatDate(slot.date)} at ${formatTime(slot.time)}. Find the slot on DineMate.`;
  navigator.clipboard?.writeText(text);
  showToast('Invite copied');
}

function expireOldSlots() {
  if (state.isDemo) return;
  const today = todayString();
  state.slots
    .filter(slot => slot.date < today && slot.status === 'open')
    .slice(0, 5)
    .forEach(slot => updateDoc(doc(db, 'slots', slot.id), { status: 'completed' }));
}
