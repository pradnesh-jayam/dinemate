import { TOAST_TIMEOUT } from './config.js';

// Toast Notification
export const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, TOAST_TIMEOUT);
};

// Modal Management
export const showModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
};

export const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
};

export const isModalOpen = (modalId) => {
  const modal = document.getElementById(modalId);
  return modal ? modal.classList.contains('show') : false;
};

// Panel Management
export const showPanel = (panelId) => {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.add('show');
  }
};

export const closePanel = (panelId) => {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.remove('show');
  }
};

export const isPanelOpen = (panelId) => {
  const panel = document.getElementById(panelId);
  return panel ? panel.classList.contains('show') : false;
};

// Section Navigation
export const showSection = (sectionId) => {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });

  // Show target section
  const section = document.getElementById(`${sectionId}Section`);
  if (section) {
    section.classList.add('active');
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });

  // Update tab bar
  document.querySelectorAll('.tab-bar-item').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === sectionId);
  });
};

export const getCurrentSection = () => {
  const active = document.querySelector('.section.active');
  return active ? active.id.replace('Section', '') : 'restaurants';
};

// Badge Count Update
export const updateBadgeCount = (badgeId, count) => {
  const badge = document.getElementById(badgeId);
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }
};

// Generic List Renderer
export const renderList = (containerId, items, templateFn, emptyState = '') => {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = emptyState;
    return;
  }

  container.innerHTML = items.map(templateFn).join('');
};

// Form Helpers
export const getFormData = (formId) => {
  const form = document.getElementById(formId);
  if (!form) return {};

  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
};

export const resetForm = (formId) => {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
};

export const setFormData = (formId, data) => {
  const form = document.getElementById(formId);
  if (!form) return;

  for (const [key, value] of Object.entries(data)) {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      input.value = value;
    }
  }
};

export const disableForm = (formId, disabled = true) => {
  const form = document.getElementById(formId);
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea, button');
  inputs.forEach(input => {
    input.disabled = disabled;
  });
};

// Input Helpers
export const getInputValue = (inputId) => {
  const input = document.getElementById(inputId);
  return input ? input.value : '';
};

export const setInputValue = (inputId, value) => {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = value;
  }
};

export const clearInput = (inputId) => {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = '';
  }
};

// Select Helpers
export const populateSelect = (selectId, options, valueKey = 'value', labelKey = 'label') => {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = options
    .map(opt => `<option value="${opt[valueKey]}">${opt[labelKey]}</option>`)
    .join('');
};

export const addSelectOptions = (selectId, options, valueKey = 'value', labelKey = 'label') => {
  const select = document.getElementById(selectId);
  if (!select) return;

  const html = options
    .map(opt => `<option value="${opt[valueKey]}">${opt[labelKey]}</option>`)
    .join('');

  select.innerHTML += html;
};

// Visibility Helpers
export const show = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) el.style.display = '';
};

export const hide = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'none';
};

export const toggle = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.display = el.style.display === 'none' ? '' : 'none';
  }
};

// Class Toggling
export const addClass = (elementId, className) => {
  const el = document.getElementById(elementId);
  if (el) el.classList.add(className);
};

export const removeClass = (elementId, className) => {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove(className);
};

export const toggleClass = (elementId, className) => {
  const el = document.getElementById(elementId);
  if (el) el.classList.toggle(className);
};

export const hasClass = (elementId, className) => {
  const el = document.getElementById(elementId);
  return el ? el.classList.contains(className) : false;
};

// Content Helpers
export const setHTML = (elementId, html) => {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = html;
};

export const setText = (elementId, text) => {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
};

export const getHTML = (elementId) => {
  const el = document.getElementById(elementId);
  return el ? el.innerHTML : '';
};

export const getText = (elementId) => {
  const el = document.getElementById(elementId);
  return el ? el.textContent : '';
};

// Event Helpers
export const onClick = (elementId, handler) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.addEventListener('click', handler);
  }
};

export const onSubmit = (formId, handler) => {
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handler(e);
    });
  }
};

export const onChange = (elementId, handler) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.addEventListener('change', handler);
  }
};

// Attribute Helpers
export const setAttribute = (elementId, attr, value) => {
  const el = document.getElementById(elementId);
  if (el) el.setAttribute(attr, value);
};

export const getAttribute = (elementId, attr) => {
  const el = document.getElementById(elementId);
  return el ? el.getAttribute(attr) : null;
};

export const getDataAttribute = (elementId, attr) => {
  const el = document.getElementById(elementId);
  return el ? el.dataset[attr] : null;
};

export const setDataAttribute = (elementId, attr, value) => {
  const el = document.getElementById(elementId);
  if (el) el.dataset[attr] = value;
};

// Loading State
export const showLoading = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.classList.add('loading');
  }
};

export const hideLoading = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.classList.remove('loading');
  }
};

// Theme Helpers
export const setTheme = (theme) => {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

export const getTheme = () => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const toggleTheme = () => {
  const current = getTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
};

// Close All Modals
export const closeAllModals = () => {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('show');
  });
  document.body.style.overflow = '';
};

// Close All Panels
export const closeAllPanels = () => {
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('show');
  });
};

// Scroll to Element
export const scrollToElement = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Scroll to Bottom
export const scrollToBottom = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
  }
};
