/* ============================================================
   auth.js  —  signup / login / logout (localStorage simulated)
   NOTE: This is a client-side demo. Passwords are NOT secure.
   ============================================================ */

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const err = document.getElementById('formError');
  err.textContent = '';

  if (!name || !email || !password) {
    err.textContent = 'Please fill in all fields.';
    return;
  }
  if (password.length < 4) {
    err.textContent = 'Password must be at least 4 characters.';
    return;
  }
  if (findUserByEmail(email)) {
    err.textContent = 'An account with this email already exists.';
    return;
  }

  const users = getUsers();
  const user = { id: uid(), name, email, password };
  users.push(user);
  saveUsers(users);
  setSession(user.id);
  showTransition('Setting up your account...', 'onboarding.html');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const err = document.getElementById('formError');
  err.textContent = '';

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    err.textContent = 'Invalid email or password.';
    return;
  }

  setSession(user.id);
  const data = getData();
  const dest = data.profile.onboarded ? 'dashboard.html' : 'onboarding.html';
  showTransition('Welcome back...', dest);
}

function logout() {
  clearSession();
  showTransition('Signing out...', '../index.html');
}
