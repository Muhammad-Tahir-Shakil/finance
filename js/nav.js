/* nav.js — makes marketing-page nav + CTAs aware of the login session.
   Requires storage.js to be loaded first. */
(function () {
  // Subpages live in /pages/; the home page lives at the root.
  const inPages = location.pathname.includes('/pages/');
  const path = (file) => (inPages ? '' : 'pages/') + file;
  const user = typeof currentUser === 'function' ? currentUser() : null;

  // Call-to-action buttons: dashboard if logged in, otherwise sign up.
  document.querySelectorAll('[data-cta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      location.href = user ? path('dashboard.html') : path('signup.html');
    });
  });

  // Navbar auth buttons.
  const loginBtn = document.querySelector('[data-auth="login"]');
  const signupBtn = document.querySelector('[data-auth="signup"]');

  if (user) {
    if (loginBtn) {
      loginBtn.textContent = 'Dashboard';
      loginBtn.onclick = () => { location.href = path('dashboard.html'); };
    }
    if (signupBtn) {
      signupBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out';
      signupBtn.onclick = () => { clearSession(); location.reload(); };
    }
  } else {
    if (loginBtn) loginBtn.onclick = () => { location.href = path('login.html'); };
    if (signupBtn) signupBtn.onclick = () => { location.href = path('signup.html'); };
  }
})();
