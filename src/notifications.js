import {
  collection,
  db,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from './firebase.js';
import { state } from './state.js';
import { escapeHtml, qs, timeAgo } from './utils.js';
import { openPanel, showToast } from './ui.js';

export function bindNotificationEvents() {
  qs('#notificationsBtn').addEventListener('click', () => openPanel('notificationsPanel'));
  qs('#markAllReadBtn').addEventListener('click', markAllRead);
}

export function listenForNotifications() {
  if (state.isDemo) {
    renderNotifications(state.notifications);
    return;
  }
  if (state.listeners.notifications) state.listeners.notifications();
  const q = query(
    collection(db, 'notifications'),
    where('toUid', '==', state.user.uid),
    orderBy('createdAt', 'desc')
  );

  state.listeners.notifications = onSnapshot(q, snapshot => {
    const notifications = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderNotifications(notifications);
  });
}

export function renderNotifications(notifications = state.notifications) {
  const unread = notifications.filter(item => !item.read).length;
  qs('#notificationBadge').textContent = unread;
  qs('#notificationBadge').classList.toggle('show', unread > 0);

  if (!notifications.length) {
    qs('#notificationsList').innerHTML = '<div class="empty-mini">No notifications yet</div>';
    return;
  }

  qs('#notificationsList').innerHTML = notifications.map(item => {
    const createdAt = item.createdAt?.toDate ? item.createdAt.toDate() : null;
    return `
      <button class="panel-item ${item.read ? '' : 'unread'}" data-id="${item.id}" type="button">
        <span>${escapeHtml(item.message)}</span>
        <small>${timeAgo(createdAt)}</small>
      </button>
    `;
  }).join('');

  qs('#notificationsList').querySelectorAll('[data-id]').forEach(button => {
    button.addEventListener('click', () => {
      if (state.isDemo) {
        const item = state.notifications.find(notification => notification.id === button.dataset.id);
        if (item) item.read = true;
        renderNotifications();
        return;
      }
      updateDoc(doc(db, 'notifications', button.dataset.id), { read: true });
    });
  });
}

async function markAllRead() {
  if (state.isDemo) {
    state.notifications.forEach(item => {
      item.read = true;
    });
    renderNotifications();
    showToast('Demo notifications cleared locally');
    return;
  }
  const q = query(collection(db, 'notifications'), where('toUid', '==', state.user.uid), where('read', '==', false));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map(item => updateDoc(item.ref, { read: true })));
  showToast('Notifications cleared');
}
