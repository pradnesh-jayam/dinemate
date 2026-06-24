// User Profiles Module
import { auth, slotServices, getDoc, doc, db, query, collection, where, getDocs } from './firebase.js';
import { showToast, setInputValue, setText } from './ui.js';
import { updateDoc } from './firebase.js';
import { getInitials } from './utils.js';

let showPastSlots = false;

export function setupProfileListener() {
  if (auth.currentUser) {
    updateProfileStats();
    renderUpcomingSlots();
  }
}

export async function editName() {
  const nameEl = document.getElementById('profileName');
  if (!nameEl) return;

  const currentName = nameEl.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.style.cssText = 'font-size: 24px; font-weight: 700; background: none; border: none; border-bottom: 1px solid var(--primary); color: var(--text); width: 200px; padding: var(--spacing-sm) 0;';

  nameEl.textContent = '';
  nameEl.appendChild(input);
  input.focus();
  input.select();

  const saveName = async () => {
    const newName = input.value.trim();
    if (newName && newName !== currentName && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { name: newName });
        nameEl.textContent = newName;
        document.getElementById('userName').textContent = newName;
        showToast('Name updated!', 'success');
      } catch (error) {
        showToast('Failed to update name: ' + error.message, 'error');
        nameEl.textContent = currentName;
      }
    } else {
      nameEl.textContent = currentName;
    }
  };

  input.addEventListener('blur', saveName);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    }
  });
}

export function togglePastMeals() {
  const pastSlots = document.getElementById('pastSlots');
  const btn = document.getElementById('togglePastMeals');

  if (!pastSlots || !btn) return;

  const isHidden = pastSlots.style.display === 'none';
  pastSlots.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? 'Hide' : 'Show';
}

export async function updateProfileStats() {
  if (!auth.currentUser) return;

  try {
    const q = query(collection(db, 'slots'), where('createdBy', '==', auth.currentUser.uid));
    const hostedSnap = await getDocs(q);
    const hostedCount = hostedSnap.size;

    const q2 = query(collection(db, 'slots'), where('participants', 'array-contains', {uid: auth.currentUser.uid}));
    const joinedSnap = await getDocs(q2);
    let joinedCount = 0;
    joinedSnap.forEach(doc => {
      if (doc.data().participants?.some(p => p.uid === auth.currentUser.uid)) {
        joinedCount++;
      }
    });

    const q3 = query(collection(db, 'restaurants'), where('createdBy', '==', auth.currentUser.uid));
    const restaurantsSnap = await getDocs(q3);
    const addedCount = restaurantsSnap.size;

    document.getElementById('statHosted').textContent = hostedCount;
    document.getElementById('statJoined').textContent = joinedCount;
    document.getElementById('statAdded').textContent = addedCount;
  } catch (error) {
    console.error('Failed to update profile stats:', error);
    document.getElementById('statHosted').textContent = '0';
    document.getElementById('statJoined').textContent = '0';
    document.getElementById('statAdded').textContent = '0';
  }
}

export async function renderUpcomingSlots() {
  if (!auth.currentUser) return;

  try {
    const container = document.getElementById('upcomingSlots');
    if (!container) return;

    const today = new Date().toISOString().slice(0, 10);
    const q = query(
      collection(db, 'slots'),
      where('participants', 'array-contains', {uid: auth.currentUser.uid})
    );
    const snapshot = await getDocs(q);

    let upcomingSlots = [];
    snapshot.forEach(doc => {
      const slot = doc.data();
      if (slot.date >= today && slot.participants?.some(p => p.uid === auth.currentUser.uid)) {
        upcomingSlots.push({ id: doc.id, ...slot });
      }
    });

    upcomingSlots = upcomingSlots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    if (upcomingSlots.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">No upcoming slots</p>';
      return;
    }

    container.innerHTML = upcomingSlots.map(slot => {
      const d = new Date(slot.date + 'T12:00:00');
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const [h, m] = slot.time.split(':');
      const time = new Date();
      time.setHours(parseInt(h), parseInt(m));
      const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      return `
        <div style="padding: var(--spacing-md); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: var(--spacing-md);">
          <div style="font-weight: 600; margin-bottom: var(--spacing-sm);">${slot.restaurantName}</div>
          <div style="font-size: 14px; color: var(--text-muted);">${dateStr} at ${timeStr}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to render upcoming slots:', error);
    const container = document.getElementById('upcomingSlots');
    if (container) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Failed to load slots</p>';
    }
  }
}

// Setup on load
document.addEventListener('DOMContentLoaded', () => {
  setupProfileListener();
});
