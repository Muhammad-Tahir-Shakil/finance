/* ui.js — shared toast + "coming soon" helper used across pages */

let _toastTimer;

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
