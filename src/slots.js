// Dining Slots Management Module
import { slotServices, notificationServices, serverTimestamp, auth } from './firebase.js';
import { showModal, closeModal, showToast } from './ui.js';
import { formatDate, formatTime, getToday, debounce } from './utils.js';
import * as locations from './locations.js';

let slots = [];
let slotsListener = null;
let showPastSlots = false;
let currentSlotId = null;
let setupSlotsListenerDebounced = null;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initListenerDebounce() {
  if (!setupSlotsListenerDebounced) {
    setupSlotsListenerDebounced = debounce(setupSlotsListenerImmediate, 300);
  }
}

function setupSlotsListenerImmediate() {
  if (slotsListener) slotsListener();

  const location = locations.getCurrentLocation();
  slotsListener = slotServices.onSlotsChanged(
    location,
    (data) => {
      slots = data;
      renderSlots();
    },
    (error) => {
      showToast('Failed to load slots: ' + error.message, 'error');
      console.error('Slots listener error:', error);
    }
  );
}

export function setupSlotsListener() {
  initListenerDebounce();

  const list = document.getElementById('slotList');
  if (list) {
    list.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }

  setupSlotsListenerDebounced();
}

export function getShowPastSlots() {
  return showPastSlots;
}

export function setShowPastSlots(value) {
  showPastSlots = value;
}

export function openCreateSlotModal(restaurantId, restaurantName) {
  document.getElementById('slotRestaurant').value = restaurantName;
  document.getElementById('slotRestaurant').dataset.id = restaurantId;
  document.getElementById('slotDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('slotDate').min = new Date().toISOString().slice(0, 10);
  document.getElementById('slotTime').value = '19:30';
  document.getElementById('slotPartySize').value = '1';
  document.getElementById('partySizeExtra').classList.remove('show');
  document.getElementById('slotNotes').value = '';
  showModal('createSlotModal');
}

export async function createQuickSlot() {
  const restaurantId = document.getElementById('slotRestaurant').dataset.id;
  const restaurantName = document.getElementById('slotRestaurant').value;

  if (!restaurantId) {
    showToast('Select a restaurant first', 'error');
    return;
  }

  try {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);

    await slotServices.createSlot({
      restaurantId,
      restaurantName,
      date: now.toISOString().slice(0, 10),
      time: later.toTimeString().slice(0, 5),
      partySize: 1,
      notes: '',
      location: locations.getCurrentLocation(),
      hostName: auth.currentUser?.displayName || 'User',
      hostPhoto: auth.currentUser?.photoURL,
      createdBy: auth.currentUser?.uid,
      participants: [],
      maxCapacity: 1
    });

    closeModal('createSlotModal');
    showToast('Quick slot created!', 'success');
  } catch (error) {
    showToast('Failed to create quick slot: ' + error.message, 'error');
  }
}

export async function handleCreateSlot(e) {
  e.preventDefault();
  const restaurantId = document.getElementById('slotRestaurant').dataset.id;
  const restaurantName = document.getElementById('slotRestaurant').value;
  const date = document.getElementById('slotDate').value;
  const time = document.getElementById('slotTime').value;
  let partySize = parseInt(document.getElementById('slotPartySize').value);
  const notes = document.getElementById('slotNotes').value.trim();

  if (partySize === 6) {
    const exact = parseInt(document.getElementById('partySizeExact').value);
    if (exact < 6) {
      showToast('Party size must be at least 6', 'error');
      return;
    }
    partySize = exact;
  }

  if (!restaurantId || !date || !time) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  try {
    await slotServices.createSlot({
      restaurantId,
      restaurantName,
      date,
      time,
      partySize,
      notes,
      location: locations.getCurrentLocation(),
      hostName: auth.currentUser?.displayName || 'User',
      hostPhoto: auth.currentUser?.photoURL,
      createdBy: auth.currentUser?.uid,
      participants: [],
      maxCapacity: partySize
    });

    closeModal('createSlotModal');
    showToast('Slot created! Others can now find you.', 'success');
  } catch (error) {
    showToast('Failed to create slot: ' + error.message, 'error');
  }
}

function renderSlots() {
  const list = document.getElementById('slotList');
  if (!list) return;

  const today = getToday();

  // Apply filters
  const cuisineFilter = document.getElementById('cuisineFilter')?.value || '';
  const dateFilter = document.getElementById('dateFilter')?.value || '';
  const partySizeFilter = document.getElementById('partySizeFilter')?.value || '';

  let filtered = slots.filter(slot => {
    if (showPastSlots && slot.date >= today) return false;
    if (!showPastSlots && slot.date < today) return false;
    if (cuisineFilter && slot.cuisine !== cuisineFilter) return false;
    if (dateFilter && slot.date !== dateFilter) return false;
    if (partySizeFilter && slot.partySize < parseInt(partySizeFilter)) return false;
    return true;
  });

  // Show/hide clear filters
  const hasFilters = cuisineFilter || dateFilter || partySizeFilter;
  const clearBtn = document.getElementById('clearFiltersBtn');
  if (clearBtn) clearBtn.style.display = hasFilters ? 'inline-block' : 'none';

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-emoji">📅</div>
        <p>No slots available. Create one and invite others!</p>
        <button class="btn btn-primary" onclick="window.showSection('create')">Create Slot</button>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(slot => {
    const isHost = slot.createdBy === auth.currentUser?.uid;
    const isJoined = slot.participants?.some(p => p.uid === auth.currentUser?.uid);
    const isPast = slot.date < today;

    return `
      <div class="slot-card ${isPast ? 'past' : ''}">
        <div class="slot-info">
          <div class="slot-restaurant">${escapeHtml(slot.restaurantName)}</div>
          <div class="slot-datetime">${formatDate(slot.date)} at ${formatTime(slot.time)}</div>
          <div class="slot-host">Host: ${escapeHtml(slot.hostName)}</div>
          ${slot.notes ? `<div class="slot-notes">${escapeHtml(slot.notes)}</div>` : ''}
          <div class="slot-badges">
            ${isHost ? '<span class="badge-blue">Your slot</span>' : ''}
            ${isJoined ? '<span class="badge-green">Joined ✓</span>' : ''}
            <span class="badge-pink">${slot.partySize} seat${slot.partySize > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="slot-actions">
          ${isPast ? `
            <button class="btn btn-secondary">View</button>
          ` : isHost ? `
            <button class="btn btn-ghost" onclick="window.openChatModal('${escapeHtml(slot.id)}', '${escapeHtml(slot.restaurantName)}')">Chat</button>
            <button class="btn btn-danger" onclick="window.cancelSlot('${escapeHtml(slot.id)}')">Cancel</button>
          ` : isJoined ? `
            <button class="btn btn-ghost" onclick="window.openChatModal('${escapeHtml(slot.id)}', '${escapeHtml(slot.restaurantName)}')">Open Chat</button>
          ` : `
            <button class="btn btn-ghost" onclick="window.openChatModal('${escapeHtml(slot.id)}', '${escapeHtml(slot.restaurantName)}')">💬 Chat</button>
            <button class="btn btn-primary" onclick="window.openJoinModal('${escapeHtml(slot.id)}')">Join</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

export async function openJoinModal(slotId) {
  try {
    const slotDoc = await slotServices.getSlot(slotId);
    const slot = slotDoc.data();

    document.getElementById('joinRestaurant').value = slot.restaurantName;
    document.getElementById('joinDateTime').value = `${formatDate(slot.date)} at ${formatTime(slot.time)}`;
    document.getElementById('joinHost').value = slot.hostName;
    const currentSize = 1 + (slot.participants?.length || 0);
    document.getElementById('joinGroupSize').value = `${currentSize} person${currentSize > 1 ? 's' : ''} already going`;
    document.getElementById('joinPartySize').value = '1';
    document.getElementById('joinPartySizeExtra').classList.remove('show');
    document.getElementById('joinSlotModal').dataset.slotId = slotId;
    showModal('joinSlotModal');
  } catch (error) {
    showToast('Failed to load slot: ' + error.message, 'error');
  }
}

export async function handleJoinSlot(e) {
  e.preventDefault();
  const slotId = document.getElementById('joinSlotModal').dataset.slotId;
  let partySize = parseInt(document.getElementById('joinPartySize').value);

  if (partySize === 6) {
    const exact = parseInt(document.getElementById('joinPartySizeExact').value);
    if (exact < 6) {
      showToast('Party size must be at least 6', 'error');
      return;
    }
    partySize = exact;
  }

  try {
    const slotDoc = await slotServices.getSlot(slotId);
    const slot = slotDoc.data();

    const currentCount = slot.participants?.reduce((sum, p) => sum + (p.partySize || 1), 0) || 0;
    if (currentCount + partySize > slot.maxCapacity) {
      showToast('Sorry, this slot is full!', 'error');
      return;
    }

    await slotServices.joinSlot(slotId, {
      uid: auth.currentUser?.uid,
      name: auth.currentUser?.displayName || 'User',
      photoURL: auth.currentUser?.photoURL,
      partySize
    });

    const updatedSlot = await slotServices.getSlot(slotId);

    await notificationServices.createNotification({
      toUid: slot.createdBy,
      fromName: auth.currentUser?.displayName || 'User',
      message: `${auth.currentUser?.displayName || 'Someone'} joined your slot at ${slot.restaurantName}`,
      slotId,
      read: false
    });

    closeModal('joinSlotModal');
    showToast("You're in! Have a great meal 🍽️", 'success');
    window.openChatModal(slotId, slot.restaurantName);
  } catch (error) {
    showToast('Failed to join slot: ' + error.message, 'error');
  }
}

export function shareSlot(restaurant, date, time) {
  const text = `Join me for dinner at ${restaurant} on ${formatDate(date)} at ${formatTime(time)}! Find me on DineMate 🍽️`;
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!', 'success');
}

export async function cancelSlot(slotId) {
  if (!confirm('Cancel this slot?')) return;

  try {
    const slotDoc = await slotServices.getSlot(slotId);
    const slot = slotDoc.data();

    if (slot.createdBy !== auth.currentUser?.uid) {
      showToast('Not authorized to cancel this slot', 'error');
      return;
    }

    await slotServices.deleteSlot(slotId);
    showToast('Slot cancelled', 'success');
  } catch (error) {
    showToast('Failed to cancel slot: ' + error.message, 'error');
  }
}

export function applyFilters() {
  renderSlots();
}

export function clearFilters() {
  document.getElementById('cuisineFilter').value = '';
  document.getElementById('dateFilter').value = '';
  document.getElementById('partySizeFilter').value = '';
  renderSlots();
}
