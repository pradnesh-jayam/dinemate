import { bindAuth } from './auth.js';
import { renderAnalytics } from './analytics.js';
import { bindChatEvents, openChatModal } from './chat.js';
import { bindFriendEvents, listenForFriends } from './friends.js';
import { bindMapEvents, setupMap } from './maps.js';
import { bindNotificationEvents, listenForNotifications } from './notifications.js';
import { listenForProfileStats, renderProfile } from './profiles.js';
import { bindRestaurantEvents, listenForRestaurants, renderRestaurants, renderCreateRestaurants } from './restaurants.js';
import { bindSlotEvents, cancelSlot, listenForSlots, openCreateSlotModal, openJoinModal } from './slots.js';
import { bindGlobalUi, showSection, updateLocationText } from './ui.js';
import { renderConversations } from './chat.js';
import { renderFriends, renderFriendRequests } from './friends.js';
import { renderNotifications } from './notifications.js';
import { renderSlots } from './slots.js';
import { state } from './state.js';
import { refreshIcons } from './utils.js';

function bindPage() {
  bindGlobalUi();
  bindRestaurantEvents();
  bindSlotEvents();
  bindChatEvents();
  bindNotificationEvents();
  bindMapEvents();
  bindFriendEvents();
  setupMap();
}

function startRealtimeWork() {
  updateLocationText();
  if (state.isDemo) {
    renderRestaurants();
    renderCreateRestaurants();
    renderSlots();
    renderNotifications(state.notifications);
    renderFriends();
    renderFriendRequests();
    renderProfile(state.slots);
    renderAnalytics();
    renderConversations();
    refreshIcons();
    return;
  }
  listenForRestaurants();
  listenForSlots();
  listenForNotifications();
  listenForFriends();
  listenForProfileStats();
  renderAnalytics();
}

bindPage();
bindAuth(startRealtimeWork);

window.showSection = showSection;
window.openCreateSlotModal = openCreateSlotModal;
window.openJoinModal = openJoinModal;
window.openChatModal = openChatModal;
window.cancelSlot = cancelSlot;
