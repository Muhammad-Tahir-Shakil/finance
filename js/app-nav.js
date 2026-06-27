/* app-nav.js — shared sidebar for all authenticated app pages */

const APP_NAV_LINKS = [
  { page: 'dashboard', href: 'dashboard.html', icon: 'fa-gauge-high', label: 'Overview' },
  { page: 'transactions', href: 'transactions.html', icon: 'fa-list', label: 'Transactions' },
  { page: 'goals', href: 'goals.html', icon: 'fa-bullseye', label: 'Goals' },
  { page: 'budgets', href: 'budgets.html', icon: 'fa-wallet', label: 'Budgets' },
  { page: 'subscriptions', href: 'subscriptions.html', icon: 'fa-rotate', label: 'Subscriptions' },
  { page: 'notifications', href: 'notifications.html', icon: 'fa-bell', label: 'Notifications' },
  { page: 'reports', href: 'reports.html', icon: 'fa-file-lines', label: 'Reports' },
  { page: 'networth', href: 'networth.html', icon: 'fa-chart-pie', label: 'Net Worth' },
];

function renderAppNav(activePage) {
  const el = document.getElementById('appSidebar');
  if (!el) return;

  const links = APP_NAV_LINKS.map((l) =>
    `<a href="${l.href}"${l.page === activePage ? ' class="active"' : ''}><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`
  ).join('');

  el.innerHTML = `
    <div class="logo" onclick="location.href='../index.html'">
      <div class="logo-icon"><i class="fa-solid fa-chart-line"></i></div>
      <div class="logo-text">Fin<span>Track</span></div>
    </div>
    <nav class="side-nav">${links}</nav>
    <button class="side-logout" onclick="logout()"><i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out</button>`;
}

function initAppNav() {
  const el = document.getElementById('appSidebar');
  if (!el || el.dataset.navInit === '1') return;
  el.dataset.navInit = '1';
  renderAppNav(el.dataset.page || '');
  if (typeof bindTransitionLinks === 'function') {
    bindTransitionLinks('.side-nav a, .sidebar .logo');
  }
}

// Scripts load at end of body — sidebar exists; render immediately (not only on DOMContentLoaded)
initAppNav();
document.addEventListener('DOMContentLoaded', initAppNav);
