// ========================================
// DineMate Landing Page - Production Grade
// Google OAuth + Supabase Integration
// ========================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let supabaseClient = null;
let currentUser = null;

// ========================================
// INITIALIZATION
// ========================================

async function init() {
  try {
    await setupSupabase();
    checkAuthState();
    bindEvents();
  } catch (error) {
    console.error('Init error:', error);
    showToast('Setup error. Please refresh.');
  }
}

async function setupSupabase() {
  const url = window.DINEMATE_SUPABASE_URL?.trim();
  const anonKey = window.DINEMATE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    console.warn('Supabase not configured');
    return;
  }

  try {
    await loadSupabaseScript();
    supabaseClient = window.supabase.createClient(url, anonKey);
  } catch (error) {
    console.error('Supabase setup failed:', error);
  }
}

function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Supabase SDK failed'));
    document.head.appendChild(script);
  });
}

async function checkAuthState() {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      console.log('Already authenticated, redirecting to dashboard');
      currentUser = data.session.user;
      window.location.href = '/dashboard-final.html';
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// ========================================
// GOOGLE OAUTH
// ========================================

async function signInWithGoogle() {
  if (!supabaseClient) {
    showToast('Supabase not configured. Please check settings.');
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard-final.html`
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Google signin error:', error);
    showToast('Google sign in failed: ' + error.message);
  }
}

// ========================================
// EVENT BINDING
// ========================================

function bindEvents() {
  const signInBtn = $('#signInBtn');
  const signUpBtn = $('#signUpBtn');

  if (signInBtn) {
    signInBtn.addEventListener('click', signInWithGoogle);
  }

  if (signUpBtn) {
    signUpBtn.addEventListener('click', signInWithGoogle);
  }
}

// ========================================
// UTILITIES
// ========================================

function showToast(message, duration = 3000) {
  const toast = $('#toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
}

// ========================================
// START
// ========================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
