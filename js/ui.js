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
