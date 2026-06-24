// Chat Module - Real-time Messaging
import { chatServices, notificationServices, serverTimestamp, auth, db, query, collection, where } from './firebase.js';
import { showModal, closeModal, showPanel, closePanel, showToast, scrollToBottom } from './ui.js';
import { timeAgo } from './utils.js';

let currentSlotId = null;
let chatListener = null;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function openChatModal(slotId, restaurantName) {
  currentSlotId = slotId;
  document.getElementById('chatTitle').textContent = restaurantName;
  showModal('chatModal');
  document.getElementById('chatMessages').innerHTML = '<div class="loading">Loading messages</div>';

  if (chatListener) chatListener();

  chatListener = chatServices.onMessagesChanged(slotId, (messages) => {
    renderChatMessages(messages);
  });
}

function renderChatMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = '<div class="empty-state">No messages yet. Say hello! 👋</div>';
    return;
  }

  container.innerHTML = messages.map(msg => {
    const isOwn = msg.uid === auth.currentUser?.uid;
    return `
      <div class="chat-message ${isOwn ? 'own' : 'other'}">
        ${!isOwn ? `<div class="chat-message-name">${msg.name}</div>` : ''}
        <div class="chat-message-bubble">${escapeHtml(msg.text)}</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${timeAgo(msg.createdAt)}</div>
      </div>
    `;
  }).join('');

  scrollToBottom('chatMessages');
}

export function showMessagesPanel() {
  renderMessagesList();
  showPanel('messagesPanel');
}

async function renderMessagesList() {
  const list = document.getElementById('messagesList');
  if (!list) return;

  try {
    list.innerHTML = '<div class="panel-empty">💬 No conversations yet</div>';
  } catch (error) {
    console.error('Failed to load messages:', error);
    list.innerHTML = '<div class="panel-empty">Failed to load messages</div>';
  }
}

export async function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();

  if (!text || !currentSlotId) return;

  try {
    await chatServices.sendMessage(currentSlotId, {
      text,
      uid: auth.currentUser?.uid,
      name: auth.currentUser?.displayName || 'User',
      createdAt: serverTimestamp()
    });
    input.value = '';
  } catch (error) {
    showToast('Failed to send message: ' + error.message, 'error');
  }
}

export function chatBeforeJoin() {
  const slotId = document.getElementById('joinSlotModal').dataset.slotId;
  const restaurantName = document.getElementById('joinRestaurant').value;
  closeModal('joinSlotModal');
  openChatModal(slotId, restaurantName);
}

export function closeChatModal() {
  if (chatListener) {
    chatListener();
    chatListener = null;
  }
  closeModal('chatModal');
}
