/* ============================================================
   storage.js  —  localStorage data layer for FinTrack
   All app data is namespaced per logged-in user.
   ============================================================ */

const DB = {
  USERS: 'fintrack_users',
  SESSION: 'fintrack_session',
  dataKey: (userId) => `fintrack_data_${userId}`,
};

/* ---------- users ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem(DB.USERS) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(DB.USERS, JSON.stringify(users));
}

function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/* ---------- session ---------- */
function getSession() {
  return localStorage.getItem(DB.SESSION);
}

function setSession(userId) {
  localStorage.setItem(DB.SESSION, userId);
}

function clearSession() {
  localStorage.removeItem(DB.SESSION);
}

function currentUser() {
  const id = getSession();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}

/* ---------- per-user financial data ---------- */
function emptyData() {
  return {
    profile: {
      onboarded: false,
      income: 0,
      categories: [],
      bills: [],
      goalType: '',
      moneyStyle: '',
    },
    transactions: [], // { id, type, amount, category, date, note }
    budgets: {},      // { category: limit }
    goals: [],        // { id, name, target, saved, deadline }
    subscriptions: [],// { id, name, amount, renewDate }
  };
}

function getData() {
  const user = currentUser();
  if (!user) return emptyData();
  const raw = localStorage.getItem(DB.dataKey(user.id));
  return raw ? JSON.parse(raw) : emptyData();
}

function saveData(data) {
  const user = currentUser();
  if (!user) return;
  localStorage.setItem(DB.dataKey(user.id), JSON.stringify(data));
}

/* ---------- helpers ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function money(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const CAT_ICONS = {
  Food: 'fa-utensils', Rent: 'fa-house', Transport: 'fa-car', Shopping: 'fa-bag-shopping',
  Bills: 'fa-file-invoice', Health: 'fa-heart-pulse', Entertainment: 'fa-film',
  Salary: 'fa-wallet', Income: 'fa-wallet', Other: 'fa-ellipsis',
};

function catIcon(category) {
  return CAT_ICONS[category] || 'fa-circle-dollar-to-slot';
}

/* Current month key, YYYY-MM */
function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

/* Redirect to login if not authenticated. Call on protected pages. */
function requireAuth() {
  if (!currentUser()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
