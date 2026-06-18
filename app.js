const storageKey = "dinemate-state-v1";
const userStorageKey = "dinemate-user-v1";
const page = document.body.dataset.page;

const today = new Date().toISOString().slice(0, 10);

const defaultState = {
  restaurants: [
    {
      id: "rest-saffron",
      name: "Saffron Table",
      cuisine: "North Indian",
      area: "Indiranagar",
      distance: 0.7,
      rating: 4.6,
      vibe: "Warm, relaxed dinner spot",
      color: "#c4562a"
    },
    {
      id: "rest-nori",
      name: "Nori & Rice",
      cuisine: "Japanese",
      area: "Koramangala",
      distance: 1.3,
      rating: 4.8,
      vibe: "Counter seats and quiet tables",
      color: "#087f8c"
    },
    {
      id: "rest-green",
      name: "The Green Fork",
      cuisine: "Vegetarian",
      area: "HSR Layout",
      distance: 1.9,
      rating: 4.4,
      vibe: "Casual, bright, conversation-friendly",
      color: "#4f7d38"
    },
    {
      id: "rest-casa",
      name: "Casa Fresca",
      cuisine: "Italian",
      area: "MG Road",
      distance: 2.4,
      rating: 4.7,
      vibe: "Pasta bar with shared tables",
      color: "#9b3d52"
    }
  ],
  availability: [
    {
      id: "slot-aisha",
      restaurantId: "rest-saffron",
      restaurantName: "Saffron Table",
      guest: "Aisha Raman",
      date: today,
      time: "19:30",
      partySize: 1,
      note: "Open to a casual dinner and food recommendations."
    },
    {
      id: "slot-vikram",
      restaurantId: "rest-nori",
      restaurantName: "Nori & Rice",
      guest: "Vikram Sen",
      date: today,
      time: "20:00",
      partySize: 1,
      note: "Trying the tasting menu after work."
    }
  ],
  updates: [
    {
      id: "update-welcome",
      message: "Two DineMate guests are free for dinner tonight.",
      timestamp: new Date().toISOString()
    }
  ]
};

const state = loadState();
let currentUser = loadLocalUser();
let supabaseClient = null;
let activeCuisine = "all";

const toast = document.querySelector("#toast");

function $(selector) {
  return document.querySelector(selector);
}

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function loadLocalUser() {
  try {
    const saved = localStorage.getItem(userStorageKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function saveLocalUser(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem(userStorageKey, JSON.stringify(user));
  } else {
    localStorage.removeItem(userStorageKey);
  }
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(value) {
  const [hour, minute] = String(value || "19:00").split(":").map(Number);
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 0, 1, hour, minute));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function getInitials(name) {
  return String(name || "Guest")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getDisplayName() {
  return currentUser?.name || currentUser?.email?.split("@")[0] || "Guest diner";
}

function getRestaurantById(id) {
  return state.restaurants.find((restaurant) => restaurant.id === id);
}

function goTo(path) {
  window.location.href = path;
}

function requireUser() {
  if (page !== "auth" && !currentUser) {
    goTo("index.html");
  }
}

function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Supabase SDK could not be loaded"));
    document.head.appendChild(script);
  });
}

async function setupSupabase() {
  const url = window.DINEMATE_SUPABASE_URL?.trim();
  const anonKey = window.DINEMATE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return;

  try {
    await loadSupabaseScript();
  } catch {
    setSyncStatus("Supabase error", "SDK did not load.", false);
    return;
  }

  supabaseClient = window.supabase.createClient(url, anonKey);
  setSyncStatus("Supabase live", "Auth and dining availability connect to Supabase.", true);

  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    saveLocalUser(mapSupabaseUser(data.session.user));
    await syncAvailabilityFromSupabase();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      saveLocalUser(mapSupabaseUser(session.user));
      await syncAvailabilityFromSupabase();
      if (page === "auth") goTo("choice.html");
    }
  });
}

function setSyncStatus(title, text, isLive) {
  const dot = $("#syncDot");
  const mode = $("#syncMode");
  const syncText = $("#syncText");
  if (dot && isLive) dot.classList.add("live");
  if (mode) mode.textContent = title;
  if (syncText) syncText.textContent = text;
}

function mapSupabaseUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "DineMate guest"
  };
}

async function upsertProfile(user) {
  if (!supabaseClient || !user?.id) return;
  const { error } = await supabaseClient.from("profiles").upsert({
    id: user.id,
    full_name: user.name,
    email: user.email,
    updated_at: new Date().toISOString()
  });
  if (error) showToast(`Profile database error: ${error.message}`);
}

async function syncAvailabilityFromSupabase() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("availability")
    .select("id,restaurant_id,restaurant_name,guest,date,time,party_size,note")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    showToast(`Availability database error: ${error.message}`);
    return;
  }

  state.availability = data.map((slot) => ({
    id: slot.id,
    restaurantId: slot.restaurant_id,
    restaurantName: slot.restaurant_name,
    guest: slot.guest,
    date: slot.date,
    time: slot.time?.slice(0, 5) || "19:00",
    partySize: slot.party_size || 1,
    note: slot.note || ""
  }));
  saveState();
}

async function storeAvailability(slot) {
  if (!supabaseClient) return true;
  const { error } = await supabaseClient.from("availability").insert({
    id: slot.id,
    restaurant_id: slot.restaurantId,
    restaurant_name: slot.restaurantName,
    guest: slot.guest,
    date: slot.date,
    time: slot.time,
    party_size: slot.partySize,
    note: slot.note,
    created_by: currentUser?.id || null
  });
  if (error) {
    showToast(`Availability database error: ${error.message}`);
    return false;
  }
  return true;
}

function addUpdate(message) {
  state.updates.unshift({
    id: crypto.randomUUID(),
    message,
    timestamp: new Date().toISOString()
  });
  saveState();
  renderAll();
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return hours * 60 + minutes;
}

function findMatches() {
  const currentName = getDisplayName();
  return state.availability
    .filter((slot) => slot.guest !== currentName)
    .map((slot) => {
      const samePlace = state.availability.some(
        (ownSlot) =>
          ownSlot.guest === currentName &&
          ownSlot.restaurantId === slot.restaurantId &&
          ownSlot.date === slot.date &&
          Math.abs(timeToMinutes(ownSlot.time) - timeToMinutes(slot.time)) <= 60
      );
      return { ...slot, samePlace };
    })
    .sort((a, b) => Number(b.samePlace) - Number(a.samePlace) || a.time.localeCompare(b.time));
}

function renderMetrics() {
  if (!$("#restaurantCount")) return;
  const todaySlots = state.availability.filter((slot) => slot.date === today);
  $("#restaurantCount").textContent = state.restaurants.length;
  $("#availabilityCount").textContent = todaySlots.length;
  $("#matchCount").textContent = findMatches().length;
  $("#nearestRestaurant").textContent = [...state.restaurants].sort((a, b) => a.distance - b.distance)[0]?.name || "--";
}

function renderRestaurants() {
  const restaurantList = $("#restaurantList");
  if (!restaurantList) return;

  const restaurants = state.restaurants
    .filter((restaurant) => activeCuisine === "all" || restaurant.cuisine === activeCuisine)
    .sort((a, b) => a.distance - b.distance);

  restaurantList.innerHTML = restaurants
    .map((restaurant) => {
      const slots = state.availability.filter((slot) => slot.restaurantId === restaurant.id);
      return `
        <article class="program-card">
          <div class="time-block" style="--card-color:${escapeHtml(restaurant.color)}">${escapeHtml(restaurant.distance)} km</div>
          <div class="program-copy">
            <h3>${escapeHtml(restaurant.name)}</h3>
            <div class="program-meta">${escapeHtml(restaurant.cuisine)} | ${escapeHtml(restaurant.area)} | ${escapeHtml(restaurant.vibe)}</div>
          </div>
          <span class="track-pill">${escapeHtml(restaurant.rating)} star</span>
          <div class="card-actions">
            <a class="secondary-button link-button" href="create-meeting.html?restaurant=${encodeURIComponent(restaurant.id)}">Add time</a>
          </div>
          <div class="participant-list restaurant-slots">${renderSlotPills(slots)}</div>
        </article>
      `;
    })
    .join("");

  if (!restaurants.length) {
    restaurantList.innerHTML = `<article class="program-card">No restaurants found for this cuisine.</article>`;
  }
}

function renderSlotPills(slots) {
  if (!slots.length) return `<span class="participant-pill">No diners yet</span>`;
  return slots
    .slice(0, 4)
    .map(
      (slot) =>
        `<span class="participant-pill">${escapeHtml(slot.guest)} ${escapeHtml(formatDate(slot.date))}, ${escapeHtml(formatTime(slot.time))}</span>`
    )
    .join("");
}

function renderAvailability() {
  const availabilityList = $("#availabilityList");
  if (!availabilityList) return;

  const slots = [...state.availability].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  availabilityList.innerHTML = slots
    .map(
      (slot) => `
        <article class="meeting-card">
          <div class="card-top">
            <div>
              <h3>${escapeHtml(slot.restaurantName)}</h3>
              <span class="small-text">${escapeHtml(slot.guest)} is available ${escapeHtml(formatDate(slot.date))} at ${escapeHtml(formatTime(slot.time))}</span>
            </div>
            <span class="meeting-room">${escapeHtml(slot.partySize)} seat</span>
          </div>
          <div class="participant-list">
            <span class="participant-pill">${escapeHtml(slot.note || "Open to meeting someone new")}</span>
          </div>
        </article>
      `
    )
    .join("");

  if (!slots.length) {
    availabilityList.innerHTML = `<article class="meeting-card">No dining availability has been posted yet.</article>`;
  }
}

function renderMatches() {
  const matchList = $("#matchList");
  if (!matchList) return;

  const matches = findMatches();
  matchList.innerHTML = matches
    .map(
      (match) => `
        <article class="speaker-card">
          <div class="speaker-avatar">${escapeHtml(getInitials(match.guest))}</div>
          <div>
            <h3>${escapeHtml(match.guest)}</h3>
            <span class="small-text">${escapeHtml(match.restaurantName)} | ${escapeHtml(formatDate(match.date))}, ${escapeHtml(formatTime(match.time))}</span>
            <span class="match-badge">${match.samePlace ? "Best match" : "Nearby diner"}</span>
          </div>
        </article>
      `
    )
    .join("");

  if (!matches.length) {
    matchList.innerHTML = `<article class="speaker-card">No possible dining partners yet.</article>`;
  }
}

function renderUpdates() {
  const updateList = $("#updateList");
  if (!updateList) return;

  updateList.innerHTML = state.updates
    .slice(0, 6)
    .map(
      (update) => `
        <article class="update-card">
          <strong>${escapeHtml(update.message)}</strong>
          <span class="small-text">${new Date(update.timestamp).toLocaleString()}</span>
        </article>
      `
    )
    .join("");
}

function renderChoice() {
  const title = $("#choiceTitle");
  if (title) title.textContent = `Hi ${getDisplayName()}, what would you like to do?`;
}

function populateRestaurantSelect() {
  const restaurantSelect = $("#restaurantSelect");
  if (!restaurantSelect) return;

  restaurantSelect.innerHTML = state.restaurants
    .map((restaurant) => `<option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)} - ${escapeHtml(restaurant.area)}</option>`)
    .join("");

  const selectedRestaurant = new URLSearchParams(window.location.search).get("restaurant");
  if (selectedRestaurant && state.restaurants.some((restaurant) => restaurant.id === selectedRestaurant)) {
    restaurantSelect.value = selectedRestaurant;
  }
}

function setDefaultDateTimes() {
  ["#slotDate", "#joinDate"].forEach((selector) => {
    const input = $(selector);
    if (input && !input.value) input.value = today;
  });
  ["#slotTime", "#joinTime"].forEach((selector) => {
    const input = $(selector);
    if (input && !input.value) input.value = "19:30";
  });
}

function renderAll() {
  renderChoice();
  renderMetrics();
  renderRestaurants();
  renderAvailability();
  renderMatches();
  renderUpdates();
  populateRestaurantSelect();
  setDefaultDateTimes();
}

async function authenticate(mode) {
  const form = new FormData($("#authForm"));
  const name = form.get("name").trim();
  const email = form.get("email").trim();
  const password = form.get("password");

  if (!supabaseClient) {
    saveLocalUser({
      id: crypto.randomUUID(),
      name: name || email.split("@")[0],
      email
    });
    goTo("choice.html");
    return;
  }

  const result =
    mode === "signup"
      ? await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || email.split("@")[0] } }
        })
      : await supabaseClient.auth.signInWithPassword({ email, password });

  if (result.error) {
    showToast(result.error.message);
    return;
  }

  if (!result.data.user) {
    showToast("Check your email to confirm the account, then sign in.");
    return;
  }

  const user = mapSupabaseUser(result.data.user);
  saveLocalUser(user);
  await upsertProfile(user);
  await syncAvailabilityFromSupabase();
  goTo("choice.html");
}

function bindAuthPage() {
  const authForm = $("#authForm");
  if (!authForm) return;

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    authenticate("signup");
  });

  $("#signInBtn")?.addEventListener("click", () => authenticate("signin"));

  $("#demoLoginBtn")?.addEventListener("click", () => {
    saveLocalUser({
      id: crypto.randomUUID(),
      name: "Demo Diner",
      email: "demo@dinemate.local"
    });
    goTo("choice.html");
  });
}

function bindSharedAppActions() {
  $("#signOutBtn")?.addEventListener("click", async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    saveLocalUser(null);
    goTo("index.html");
  });

  $("#quickUpdateBtn")?.addEventListener("click", () => {
    const restaurant = [...state.restaurants].sort((a, b) => a.distance - b.distance)[0];
    const message = restaurant
      ? `${restaurant.name} has active DineMate availability near ${restaurant.area}.`
      : "Nearby dining availability has been refreshed.";
    addUpdate(message);
    showToast("Dining update published.");
  });

  $("#cuisineFilter")?.addEventListener("change", (event) => {
    activeCuisine = event.target.value;
    renderRestaurants();
  });
}

function bindAvailabilityForm() {
  $("#availabilityForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const restaurant = getRestaurantById(form.get("restaurantId"));
    if (!restaurant) {
      showToast("Choose a restaurant first.");
      return;
    }

    const slot = {
      id: crypto.randomUUID(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      guest: form.get("guest").trim() || getDisplayName(),
      date: form.get("date"),
      time: form.get("time"),
      partySize: Number(form.get("partySize") || 1),
      note: form.get("note").trim()
    };

    const saved = await storeAvailability(slot);
    if (!saved) return;

    state.availability.push(slot);
    saveState();
    addUpdate(`${slot.guest} is available at ${slot.restaurantName} on ${formatDate(slot.date)} at ${formatTime(slot.time)}.`);
    event.currentTarget.reset();
    showToast("Availability added.");
    window.setTimeout(() => goTo("meetings.html"), 900);
  });
}

function bindJoinForm() {
  $("#joinForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const restaurant = getRestaurantById(form.get("restaurantId"));
    if (!restaurant) return;

    const slot = {
      id: crypto.randomUUID(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      guest: getDisplayName(),
      date: form.get("date"),
      time: form.get("time"),
      partySize: 1,
      note: "Available for a random DineMate match."
    };

    const saved = await storeAvailability(slot);
    if (!saved) return;

    state.availability.push(slot);
    saveState();
    addUpdate(`${slot.guest} joined the dining list for ${slot.restaurantName}.`);
    event.currentTarget.reset();
    showToast("You are on the dining list.");
    window.setTimeout(() => goTo("speakers.html"), 900);
  });
}

async function init() {
  await setupSupabase();
  requireUser();

  if (currentUser && supabaseClient) await upsertProfile(currentUser);
  if (page === "auth" && currentUser) {
    goTo("choice.html");
    return;
  }

  bindAuthPage();
  bindSharedAppActions();
  bindAvailabilityForm();
  bindJoinForm();
  renderAll();
}

init();
