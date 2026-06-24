// Friends & Social System Module
import { friendServices } from './firebase.js';
import { showToast } from './ui.js';

export async function loadFriendsSection() {
  const container = document.getElementById('friendsSection');
  if (container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
        <h2>Coming Soon</h2>
        <p style="color: var(--text-muted); margin-top: 8px;">Friends feature is coming in a future update</p>
      </div>
    `;
  }
}

export async function sendFriendRequest(toUserId) {
  try {
    showToast('Friends feature coming soon!', 'info');
  } catch (error) {
    showToast('Failed to send request: ' + error.message, 'error');
  }
}

export async function acceptFriendRequest(fromUserId, requestId) {
  try {
    showToast('Friends feature coming soon!', 'info');
  } catch (error) {
    showToast('Failed to accept request: ' + error.message, 'error');
  }
}

export async function rejectFriendRequest(requestId) {
  try {
    showToast('Friends feature coming soon!', 'info');
  } catch (error) {
    showToast('Failed to reject request: ' + error.message, 'error');
  }
}

export async function removeFriend(friendId) {
  try {
    showToast('Friends feature coming soon!', 'info');
  } catch (error) {
    showToast('Failed to remove friend: ' + error.message, 'error');
  }
}
