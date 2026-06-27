/* ui.js — shared toast, form validation, and alert focus helpers */

let _toastTimer;

const MAX_FORM_AMOUNT = 100000000;

function parseFormAmount(value) {
  if (value === '' || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function setFormFieldError(fieldId, errorId, message) {
  const field = fieldId ? document.getElementById(fieldId) : null;
  const error = errorId ? document.getElementById(errorId) : null;
  if (field) field.classList.toggle('field-invalid', Boolean(message));
  if (error) error.textContent = message || '';
}

function clearFormErrors(pairs, formErrorId) {
  (pairs || []).forEach(({ field, error }) => setFormFieldError(field, error, ''));
  if (formErrorId) {
    const el = document.getElementById(formErrorId);
    if (el) el.textContent = '';
  }
}

function validateRequiredAmount(raw, label) {
  if (raw === '' || raw == null) return `${label} is required.`;
  const amount = parseFormAmount(String(raw).trim());
  if (amount == null || amount <= 0) return `${label} must be greater than 0.`;
  if (amount > MAX_FORM_AMOUNT) return `Enter a realistic ${label.toLowerCase()}.`;
  return '';
}

function validateOptionalAmount(raw, label, maxRef) {
  if (raw === '' || raw == null) return '';
  const amount = parseFormAmount(String(raw).trim());
  if (amount == null || amount < 0) return `${label} cannot be negative.`;
  if (amount > MAX_FORM_AMOUNT) return `Enter a realistic ${label.toLowerCase()}.`;
  if (maxRef != null && amount > maxRef) return `${label} cannot exceed the target amount.`;
  return '';
}

function validateRequiredText(value, label, opts = {}) {
  const min = opts.min ?? 1;
  const max = opts.max ?? 120;
  const trimmed = (value || '').trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < min) return `${label} must be at least ${min} characters.`;
  if (trimmed.length > max) return `${label} must be ${max} characters or fewer.`;
  return '';
}

function validateOptionalText(value, label, max = 200) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (trimmed.length > max) return `${label} must be ${max} characters or fewer.`;
  return '';
}

function validateOptionalDate(value) {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date.';
  return '';
}

function focusFirstFormInvalid(scope) {
  const root = scope ? document.querySelector(scope) : document;
  const first = root?.querySelector('input.field-invalid, select.field-invalid, textarea.field-invalid');
  if (first) first.focus();
}

function bindFormInputClear(pairs, formErrorId) {
  pairs.forEach(({ field, error }) => {
    const el = document.getElementById(field);
    if (!el) return;
    el.addEventListener('input', () => {
      setFormFieldError(field, error, '');
      if (formErrorId) {
        const fe = document.getElementById(formErrorId);
        if (fe) fe.textContent = '';
      }
    });
    el.addEventListener('change', () => {
      setFormFieldError(field, error, '');
      if (formErrorId) {
        const fe = document.getElementById(formErrorId);
        if (fe) fe.textContent = '';
      }
    });
  });
}

function showFormErrors(errors, formErrorId, scope) {
  const messages = errors.filter(Boolean);
  if (formErrorId) {
    const el = document.getElementById(formErrorId);
    if (el) el.textContent = messages.length ? 'Please fix the highlighted fields before continuing.' : '';
  }
  if (messages.length) focusFirstFormInvalid(scope);
  return messages.length === 0;
}

function showToast(message, icon) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid ${icon || 'fa-circle-info'}"></i><span></span>`;
  toast.querySelector('span').textContent = message;

  // Force reflow so the transition replays on rapid repeat clicks.
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function comingSoon(feature) {
  showToast(`${feature || 'This feature'} is coming soon — FinTrack is a demo for now.`, 'fa-clock');
}

const ALERT_FOCUS_KEY = 'fintrack_alert_focus';

function stashAlertFocus(payload) {
  sessionStorage.setItem(ALERT_FOCUS_KEY, JSON.stringify(payload));
}

function takeAlertFocus() {
  const raw = sessionStorage.getItem(ALERT_FOCUS_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(ALERT_FOCUS_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function highlightAlertTarget(el, message, icon) {
  if (!el) {
    if (message) showToast(message, icon || 'fa-bell');
    return;
  }
  el.classList.add('alert-focus');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (message) showToast(message, icon || 'fa-bell');
  setTimeout(() => el.classList.remove('alert-focus'), 4200);
}

function applyAlertFocusFromSession() {
  const focus = takeAlertFocus();
  const params = new URLSearchParams(window.location.search);
  const msg = focus?.title ? `Review: ${focus.title}` : 'Review this alert';

  const budgetCat = focus?.focus?.category || params.get('focusCat');
  if (budgetCat || focus?.type === 'budget') {
    const cat = budgetCat;
    if (cat) {
      const select = document.getElementById('budgetCat');
      if (select) select.value = cat;
      highlightAlertTarget(
        document.querySelector(`[data-budget-cat="${CSS.escape(cat)}"]`),
        msg,
        'fa-chart-pie',
      );
      return;
    }
    highlightAlertTarget(document.getElementById('budgetRows'), msg, 'fa-chart-pie');
    return;
  }

  const goalId = focus?.focus?.goalId || params.get('focusGoal');
  if (goalId || focus?.type === 'goal') {
    highlightAlertTarget(
      document.querySelector(`[data-goal-id="${CSS.escape(goalId)}"]`),
      msg,
      'fa-bullseye',
    );
    return;
  }

  const subId = focus?.focus?.subId || params.get('focusSub');
  if (subId || focus?.type === 'subscription') {
    highlightAlertTarget(
      document.querySelector(`[data-sub-id="${CSS.escape(subId)}"]`),
      msg,
      'fa-rotate',
    );
    return;
  }

  if (focus?.type === 'insight' || params.get('focus') === 'spending') {
    showToast(msg, 'fa-bell');
    return;
  }

  if (focus) showToast(msg, 'fa-bell');
}
