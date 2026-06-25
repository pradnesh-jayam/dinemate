import {
  addDoc,
  collection,
  db,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from './firebase.js';
import { state } from './state.js';
import { escapeHtml, initials, qs } from './utils.js';
import { showToast } from './ui.js';

export function bindFriendEvents() {
  qs('#userSearchInput').addEventListener('input', searchUsers);
}

export function listenForFriends() {
  if (state.isDemo) {
    renderFriends();
    renderFriendRequests();
    return;
  }
  if (state.listeners.friends) state.listeners.friends();
  if (state.listeners.requests) state.listeners.requests();

  state.listeners.friends = onSnapshot(
    query(collection(db, 'friends'), where('users', 'array-contains', state.user.uid)),
    snapshot => {
      state.friends = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      renderFriends();
    }
  );

  state.listeners.requests = onSnapshot(
    query(collection(db, 'friendRequests'), where('toUid', '==', state.user.uid), where('status', '==', 'pending')),
    snapshot => {
      state.requests = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      renderFriendRequests();
    }
  );
}

async function searchUsers() {
  const term = qs('#userSearchInput').value.trim().toLowerCase();
  if (term.length < 2) {
    qs('#userSearchResults').innerHTML = '<div class="empty-mini">Type at least 2 characters</div>';
    return;
  }

  if (state.isDemo) {
    const users = [
      { id: 'host-maya', name: 'Maya Kapoor', email: 'maya@dinemate.demo' },
      { id: 'host-kabir', name: 'Kabir Sethi', email: 'kabir@dinemate.demo' },
      { id: 'user-neel', name: 'Neel Shah', email: 'neel@dinemate.demo' }
    ].filter(user => `${user.name} ${user.email}`.toLowerCase().includes(term));
    renderUserResults(users);
    return;
  }

  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .filter(user => user.id !== state.user.uid)
    .filter(user => `${user.name || ''} ${user.email || ''}`.toLowerCase().includes(term))
    .slice(0, 8);

  renderUserResults(users);
}

function renderUserResults(users) {
  if (!users.length) {
    qs('#userSearchResults').innerHTML = '<div class="empty-mini">No people found</div>';
    return;
  }
  qs('#userSearchResults').innerHTML = users.map(user => `
    <div class="person-row">
      <span class="avatar small-avatar">${initials(user.name || user.email)}</span>
      <div><strong>${escapeHtml(user.name || 'DineMate User')}</strong><small>${escapeHtml(user.email || '')}</small></div>
      <button class="btn btn-ghost" data-request="${user.id}" data-name="${escapeHtml(user.name || 'User')}" type="button">Request</button>
    </div>
  `).join('');

  qs('#userSearchResults').querySelectorAll('[data-request]').forEach(button => {
    button.addEventListener('click', () => sendFriendRequest(button.dataset.request, button.dataset.name));
  });
}

async function sendFriendRequest(toUid, toName) {
  if (state.isDemo) {
    showToast(`Demo request queued for ${toName}`);
    return;
  }
  await addDoc(collection(db, 'friendRequests'), {
    fromUid: state.user.uid,
    fromName: state.userDoc?.name || state.user.displayName || 'User',
    toUid,
    toName,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  await addDoc(collection(db, 'notifications'), {
    toUid,
    fromUid: state.user.uid,
    fromName: state.userDoc?.name || state.user.displayName || 'User',
    message: `${state.userDoc?.name || 'Someone'} sent you a friend request`,
    read: false,
    createdAt: serverTimestamp()
  });
  showToast('Friend request sent');
}

export function renderFriendRequests() {
  if (!state.requests.length) {
    qs('#friendRequestsList').innerHTML = '<div class="empty-mini">No pending requests</div>';
    return;
  }

  qs('#friendRequestsList').innerHTML = state.requests.map(request => `
    <div class="person-row">
      <span class="avatar small-avatar">${initials(request.fromName)}</span>
      <div><strong>${escapeHtml(request.fromName)}</strong><small>wants to connect</small></div>
      <button class="btn btn-primary" data-accept="${request.id}" type="button">Accept</button>
      <button class="btn btn-ghost" data-reject="${request.id}" type="button">Reject</button>
    </div>
  `).join('');

  qs('#friendRequestsList').querySelectorAll('[data-accept]').forEach(btn => btn.addEventListener('click', () => acceptRequest(btn.dataset.accept)));
  qs('#friendRequestsList').querySelectorAll('[data-reject]').forEach(btn => btn.addEventListener('click', () => rejectRequest(btn.dataset.reject)));
}

async function acceptRequest(id) {
  const request = state.requests.find(item => item.id === id);
  if (!request) return;
  if (state.isDemo) {
    state.friends.push({
      id: `demo-friend-${id}`,
      users: [state.user.uid, request.fromUid],
      names: {
        [state.user.uid]: state.userDoc?.name || state.user.displayName || 'Demo User',
        [request.fromUid]: request.fromName
      }
    });
    state.requests = state.requests.filter(item => item.id !== id);
    renderFriendRequests();
    renderFriends();
    showToast('Demo friend added locally');
    return;
  }
  await setDoc(doc(db, 'friends', [request.fromUid, request.toUid].sort().join('_')), {
    users: [request.fromUid, request.toUid],
    names: {
      [request.fromUid]: request.fromName,
      [request.toUid]: state.userDoc?.name || state.user.displayName || 'User'
    },
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'friendRequests', id), { status: 'accepted' });
  showToast('Friend added');
}

async function rejectRequest(id) {
  if (state.isDemo) {
    state.requests = state.requests.filter(item => item.id !== id);
    renderFriendRequests();
    showToast('Demo request rejected locally');
    return;
  }
  await updateDoc(doc(db, 'friendRequests', id), { status: 'rejected' });
  showToast('Request rejected');
}

export function renderFriends() {
  qs('#statFriends').textContent = state.friends.length;
  if (!state.friends.length) {
    qs('#friendsList').innerHTML = '<div class="empty-mini">No friends yet</div>';
    return;
  }
  qs('#friendsList').innerHTML = state.friends.map(friend => {
    const otherUid = friend.users.find(uid => uid !== state.user.uid);
    const name = friend.names?.[otherUid] || 'DineMate User';
    return `
      <div class="person-row">
        <span class="avatar small-avatar">${initials(name)}</span>
        <div><strong>${escapeHtml(name)}</strong><small>Mutual dining friend</small></div>
      </div>
    `;
  }).join('');
}
