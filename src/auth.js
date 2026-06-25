import {
  auth,
  db,
  doc,
  getDoc,
  googleProvider,
  onAuthStateChanged,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signOut,
  updateDoc
} from './firebase.js';
import { buildDemoData, seedDemoData } from './demo.js';
import { state } from './state.js';
import { initials, qs } from './utils.js';
import { showApp, showLogin, showToast, updateLocationText } from './ui.js';

export function bindAuth(onReady) {
  qs('#tryDemoBtn').addEventListener('click', () => startDemoSession(onReady));

  qs('#googleSignInBtn').addEventListener('click', async () => {
    try {
      state.isDemo = false;
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  qs('#signOutBtn').addEventListener('click', async () => {
    if (state.isDemo) {
      endDemoSession();
      return;
    }
    await signOut(auth);
  });

  onAuthStateChanged(auth, async user => {
    if (state.isDemo) return;
    if (!user) {
      state.user = null;
      state.userDoc = null;
      showLogin();
      return;
    }

    state.user = user;
    await upsertUser(user);
    await loadUserProfile();
    await seedDemoData();
    renderUserShell();
    showApp();
    updateLocationText();
    onReady();
  });
}

function startDemoSession(onReady) {
  const demo = buildDemoData();
  state.isDemo = true;
  state.user = demo.user;
  state.userDoc = demo.userDoc;
  state.currentLocation = 'New Delhi';
  state.coordinates = { lat: 28.6139, lng: 77.2090 };
  state.restaurants = demo.restaurants;
  state.slots = demo.slots;
  state.messages = demo.messages;
  state.notifications = demo.notifications;
  state.friends = demo.friends;
  state.requests = demo.requests;
  state.demoActivity = demo.demoActivity;
  renderUserShell();
  showApp();
  qs('#demoBanner').classList.add('show');
  updateLocationText();
  onReady();
  showToast('Demo mode loaded');
}

function endDemoSession() {
  state.isDemo = false;
  state.user = null;
  state.userDoc = null;
  state.restaurants = [];
  state.slots = [];
  state.messages = {};
  state.notifications = [];
  state.friends = [];
  state.requests = [];
  qs('#demoBanner').classList.remove('show');
  showLogin();
}

async function upsertUser(user) {
  await setDoc(doc(db, 'users', user.uid), {
    name: user.displayName || 'DineMate User',
    email: user.email,
    photoURL: user.photoURL || '',
    bio: 'Looking for good food and better conversations.',
    onboarded: true,
    updatedAt: serverTimestamp(),
    joinedAt: serverTimestamp()
  }, { merge: true });
}

export async function loadUserProfile() {
  const snap = await getDoc(doc(db, 'users', state.user.uid));
  state.userDoc = snap.exists() ? snap.data() : {};
}

export function renderUserShell() {
  const name = state.userDoc?.name || state.user.displayName || 'DineMate User';
  qs('#userAvatar').textContent = initials(name);
  qs('#userName').textContent = name;
  qs('#profileAvatar').textContent = initials(name);
  qs('#profileName').textContent = name;
  qs('#profileEmail').textContent = state.user.email || '';
  qs('#profileBio').textContent = state.userDoc?.bio || 'Looking for good food and better conversations.';
}

export function bindProfileEditing() {
  qs('#editNameBtn').addEventListener('click', () => {
    const currentName = qs('#profileName').textContent;
    qs('#profileName').innerHTML = `<input class="inline-edit" id="editNameInput" value="${currentName}">`;
    const input = qs('#editNameInput');
    input.focus();
    input.select();

    async function saveName() {
      const nextName = input.value.trim();
      if (!nextName) {
        renderUserShell();
        return;
      }
      if (state.isDemo) {
        state.userDoc.name = nextName;
        state.user.displayName = nextName;
        renderUserShell();
        showToast('Demo profile updated locally');
        return;
      }
      await updateDoc(doc(db, 'users', state.user.uid), { name: nextName, updatedAt: serverTimestamp() });
      state.userDoc.name = nextName;
      renderUserShell();
      showToast('Profile updated');
    }

    input.addEventListener('blur', saveName, { once: true });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') input.blur();
    });
  });
}
