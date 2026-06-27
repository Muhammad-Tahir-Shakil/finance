/* nav.js — marketing nav + session-aware CTAs (requires storage.js + loader.js) */
(function () {
  const inPages = location.pathname.includes('/pages/');
  const path = (file) => (inPages ? '' : 'pages/') + file;
  const user = typeof currentUser === 'function' ? currentUser() : null;

  function go(url) {
    if (typeof showTransition === 'function') showTransition('Loading...', url);
    else window.location.href = url;
  }

  document.querySelectorAll('[data-cta]').forEach((btn) => {
    btn.addEventListener('click', () => go(user ? path('dashboard.html') : path('signup.html')));
  });

  const loginBtn = document.querySelector('[data-auth="login"]');
  const signupBtn = document.querySelector('[data-auth="signup"]');

  if (user) {
    if (loginBtn) {
      loginBtn.textContent = 'Dashboard';
      loginBtn.onclick = () => go(path('dashboard.html'));
    }
    if (signupBtn) {
      signupBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out';
      signupBtn.onclick = () => { clearSession(); location.reload(); };
    }
  } else {
    if (loginBtn) loginBtn.onclick = () => go(path('login.html'));
    if (signupBtn) signupBtn.onclick = () => go(path('signup.html'));
  }
})();
