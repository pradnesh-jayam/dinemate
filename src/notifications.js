// Notifications Module
import { notificationServices, auth } from './firebase.js';
import { showPanel, closePanel, showToast, updateBadgeCount } from './ui.js';
import { timeAgo } from './utils.js';
import { isDemoModeActive, DEMO_NOTIFICATIONS, DEMO_USER } from './demoData.js';

let notificationsListener = null;

export function setupNotificationsListener() {
  if (!auth.currentUser) return;

  if (notificationsListener) notificationsListener();

  // In demo mode, use demo data instead of Firestore
  if (isDemoModeActive()) {
    renderNotifications(DEMO_NOTIFICATIONS);
    const unreadCount = DEMO_NOTIFICATIONS.filter(n => !n.read).length;
    updateBadgeCount('notificationBadge', unreadCount);
    return;
  }

  notificationsListener = notificationServices.onNotificationsChanged(
    auth.currentUser.uid,
    (notifications) => {
      renderNotifications(notifications);

      const unreadCount = notifications.filter(n => !n.read).length;
      updateBadgeCount('notificationBadge', unreadCount);
    },
    (error) => {
      console.error('Notifications listener error:', error);
      showToast('Failed to load notifications', 'error');
    }
  );
}

export function showNotificationsPanel() {
  setupNotificationsListener();
  showPanel('notificationsPanel');
}

function renderNotifications(notifications) {
  const list = document.getElementById('notificationsList');
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = '<div class="panel-empty">🔔 No notifications yet</div>';
    return;
  }

  list.innerHTML = notifications.map(notif => `
    <div class="panel-item ${notif.read ? '' : 'unread'}" onclick="window.markNotificationRead('${notif.id}')">
      <div class="panel-item-text">${notif.message}</div>
      <div class="panel-item-time">${timeAgo(notif.createdAt)}</div>
    </div>
  `).join('');
}

export async function markAsRead(notificationId) {
  try {
    await notificationServices.markAsRead(notificationId);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export async function markAllAsRead() {
  if (!auth.currentUser) return;

  try {
    await notificationServices.markAllAsRead(auth.currentUser.uid);
    showToast('All notifications marked as read', 'success');
  } catch (error) {
    showToast('Failed to mark as read: ' + error.message, 'error');
  }
}

window.markNotificationRead = (id) => markAsRead(id);
