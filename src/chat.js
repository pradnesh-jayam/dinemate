import {
  addDoc,
  collection,
  db,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from './firebase.js';
import { state } from './state.js';
import { escapeHtml, formatDate, formatTime, icon, qs, refreshIcons, timeAgo } from './utils.js';
import { openModal, openPanel } from './ui.js';

export function bindChatEvents() {
  qs('#messagesBtn').addEventListener('click', () => openPanel('messagesPanel'));
  qs('#chatForm').addEventListener('submit', sendMessage);
  qs('#chatInput').addEventListener('input', updateTyping);
}

export function renderConversations() {
  const list = qs('#messagesList');
  const conversations = state.slots.filter(slot => {
    const attendees = slot.attendees || [];
    return (slot.hostId || slot.createdBy) === state.user.uid || attendees.some(person => person.uid === state.user.uid);
  });

  if (!conversations.length) {
    list.innerHTML = '<div class="empty-mini">No conversations yet. Join or create a slot to start chatting.</div>';
    return;
  }

  list.innerHTML = conversations.map(slot => `
    <button class="panel-item" data-chat-slot="${slot.id}" data-name="${escapeHtml(slot.restaurantName)}" type="button">
      <span>${escapeHtml(slot.restaurantName)}</span>
      <small>${formatDate(slot.date)} at ${formatTime(slot.time)}</small>
    </button>
  `).join('');

  list.querySelectorAll('[data-chat-slot]').forEach(button => {
    button.addEventListener('click', () => openChatModal(button.dataset.chatSlot, button.dataset.name));
  });
}

export function openChatModal(slotId, restaurantName) {
  state.currentSlotId = slotId;
  qs('#chatTitle').textContent = restaurantName;
  qs('#chatMessages').innerHTML = '<div class="loading">Loading messages</div>';
  openModal('chatModal');

  if (state.isDemo) {
    renderMessages(state.messages[slotId] || []);
    return;
  }

  if (state.listeners.chat) state.listeners.chat();
  const q = query(collection(db, 'slots', slotId, 'messages'), orderBy('createdAt', 'asc'));
  state.listeners.chat = onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderMessages(messages);
  });
}

async function sendMessage(event) {
  event.preventDefault();
  const input = qs('#chatInput');
  const text = input.value.trim();
  if (!text || !state.currentSlotId) return;

  if (state.isDemo) {
    const message = {
      id: `demo-message-${Date.now()}`,
      text,
      uid: state.user.uid,
      name: state.userDoc?.name || state.user.displayName || 'Demo User',
      createdAt: new Date()
    };
    state.messages[state.currentSlotId] = [...(state.messages[state.currentSlotId] || []), message];
    input.value = '';
    renderMessages(state.messages[state.currentSlotId]);
    return;
  }

  await addDoc(collection(db, 'slots', state.currentSlotId, 'messages'), {
    text,
    uid: state.user.uid,
    name: state.userDoc?.name || state.user.displayName || 'User',
    readBy: [state.user.uid],
    createdAt: serverTimestamp()
  });

  input.value = '';
  await updateTyping(false);
}

async function updateTyping(isTyping = true) {
  if (!state.currentSlotId || !state.user || state.isDemo) return;
  await setDoc(doc(db, 'slots', state.currentSlotId, 'typing', state.user.uid), {
    name: state.userDoc?.name || state.user.displayName || 'User',
    isTyping,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

function renderMessages(messages) {
  const container = qs('#chatMessages');
  if (!messages.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-illustration">${icon('message-circle-plus', 42)}</div><h2>No messages yet</h2><p>Say hello before joining the table.</p></div>`;
    refreshIcons();
    return;
  }

  container.innerHTML = messages.map(message => {
    const isOwn = message.uid === state.user.uid;
    const createdAt = message.createdAt?.toDate ? message.createdAt.toDate() : message.createdAt || null;
    return `
      <div class="chat-message ${isOwn ? 'own' : 'other'}">
        ${isOwn ? '' : `<span>${escapeHtml(message.name || 'User')}</span>`}
        <div class="chat-bubble">${escapeHtml(message.text)}</div>
        <small>${timeAgo(createdAt)}</small>
      </div>
    `;
  }).join('');
  refreshIcons();
  container.scrollTop = container.scrollHeight;
}
