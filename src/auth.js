// Authentication & Onboarding Module
import { authServices, serverTimestamp, db, doc, getDoc, setDoc } from './firebase.js';
import { showModal, closeModal, setInputValue, show, hide } from './ui.js';
import { showToast } from './ui.js';
import { setStorageItem, getStorageItem } from './utils.js';
import * as locations from './locations.js';
import * as notifications from './notifications.js';
import { DEMO_USER, enableDemoMode, disableDemoMode, isDemoModeActive } from './demoData.js';

let currentUser = null;

/**
 * Sets up Firebase authentication state listener
 */
export async function setupAuth() {
  authServices.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadUserData();
      checkOnboarding();
      notifications.setupNotificationsListener();
      showApp();
    } else {
      currentUser = null;
      showLogin();
    }
  });
}

/**
 * Signs out the current user
 */
export function signOut() {
  if (confirm('Are you sure you want to sign out?')) {
    authServices.signOut().catch(err => {
      showToast('Sign out failed: ' + err.message, 'error');
    });
  }
}

/**
 * Gets the currently authenticated user
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
  if (isDemoModeActive()) {
    return DEMO_USER;
  }
  return currentUser;
}

async function checkOnboarding() {
  // Skip onboarding in demo mode
  if (isDemoModeActive()) {
    setStorageItem('dinemate-onboarded', true);
    return;
  }

  if (getStorageItem('dinemate-onboarded')) return;
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists() && userDoc.data().onboarded) {
      setStorageItem('dinemate-onboarded', true);
      return;
    }
  } catch {
    // Fall through to show onboarding
  }
  showOnboarding();
}

function showOnboarding() {
  const onboardingModal = document.getElementById('onboardingModal');
  if (onboardingModal && !onboardingModal.classList.contains('show')) {
    onboardingModal.classList.add('show');

    document.getElementById('onboardingName').textContent = currentUser.displayName || 'User';
    const locationSelect = document.getElementById('onboardingLocation');

    locations.getLocationsList().then(locsList => {
      locationSelect.innerHTML = locsList
        .map(loc => `<option value="${loc}">${loc}</option>`)
        .join('');
    });

    let step = 1;
    updateOnboardingStep(step);

    const nextBtn = document.getElementById('onboardingNextBtn');
    const backBtn = document.getElementById('onboardingBackBtn');

    nextBtn.onclick = async () => {
      if (step === 2) {
        locations.setCurrentLocation(locationSelect.value);
      }
      if (step < 3) {
        step++;
        updateOnboardingStep(step);
      } else {
        await completeOnboarding();
      }
    };

    backBtn.onclick = () => {
      if (step > 1) {
        step--;
        updateOnboardingStep(step);
      }
    };
  }
}

function updateOnboardingStep(step) {
  document.querySelectorAll('.onboarding-step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
  });
  document.querySelectorAll('.onboarding-dot').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
  });

  const backBtn = document.getElementById('onboardingBackBtn');
  const nextBtn = document.getElementById('onboardingNextBtn');
  if (backBtn) backBtn.style.display = step === 1 ? 'none' : 'block';
  if (nextBtn) nextBtn.textContent = step === 3 ? "Let's go!" : 'Next';
}

async function completeOnboarding() {
  try {
    await authServices.getCurrentUser()?.reload();

    await setDoc(doc(db, 'users', currentUser.uid), { onboarded: true }, { merge: true });
    setStorageItem('dinemate-onboarded', true);

    closeModal('onboardingModal');
    showToast('Welcome to DineMate!', 'success');
  } catch (error) {
    showToast('Onboarding failed: ' + error.message, 'error');
  }
}

async function loadUserData() {
  try {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    const initials = getInitials(currentUser.displayName);
    if (userAvatar) userAvatar.textContent = initials;
    if (userName) userName.textContent = currentUser.displayName || 'User';
    if (profileAvatar) profileAvatar.textContent = initials;
    if (profileName) profileName.textContent = currentUser.displayName || 'User';
    if (profileEmail) profileEmail.textContent = currentUser.email;
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appContainer').classList.add('active');

  // Show demo banner if in demo mode
  if (isDemoModeActive()) {
    showDemoBanner();
  }

  // Load all data
  locations.initializeLocations();
}

function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('appContainer').classList.remove('active');
}

function showDemoBanner() {
  const banner = document.getElementById('demoBanner');
  if (banner) {
    banner.style.display = 'flex';
  }
}

function hideDemoBanner() {
  const banner = document.getElementById('demoBanner');
  if (banner) {
    banner.style.display = 'none';
  }
}

window.exitDemo = () => {
  disableDemoMode();
  currentUser = null;
  hideDemoBanner();
  showLogin();
};

/**
 * Sets up the Google sign-in button event listener
 */
export function setupGoogleSignInButton() {
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
      try {
        await authServices.signInWithGoogle();
        showToast('Signed in successfully!', 'success');
      } catch (error) {
        console.error('Sign-in error:', error);
        showToast('Sign in failed: ' + error.message, 'error');
      }
    });
  }

  const demoBtn = document.getElementById('demoModeBtn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      enableDemoMode();
      currentUser = DEMO_USER;
      showApp();
      showToast('👀 Demo mode — explore freely, nothing is saved', 'info');
    });
  }
}
