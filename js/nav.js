// Initialization Entrance Controller
document.addEventListener("DOMContentLoaded", function () {
  const splash = document.getElementById("initial-splash");

  if (splash) {
    // Check SessionStorage to see if they already watched the opening credits this session
    const viewedIntro = sessionStorage.getItem("fintrack_intro_viewed");

    if (viewedIntro) {
      // Instantly wipe the splash container without delay if already viewed
      splash.style.display = "none";
    } else {
      // Brand New Visitor: Run full high-end animation block, then slide away
      setTimeout(() => {
        splash.classList.add("dismissed");
        // Mark session as complete so it skips future reloads
        sessionStorage.setItem("fintrack_intro_viewed", "true");
      }, 2500); // 2.5 Seconds presentation timing looks deliberate and premium
    }
  }
});




// js/nav.js

document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("page-loader");
  const statusText = document.querySelector(".status-text");

  // Array of premium fintech loading messages
  const loadMessages = [
    "Securing workspace...",
    "Encrypting financial vault...",
    "Parsing budget frameworks...",
    "Rendering analytical charts..."
  ];
  
  let messageIndex = 0;
  let messageInterval;

  // Function to smoothly change text sub-captions
  function startStatusCycle() {
    if (!statusText) return;
    messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadMessages.length;
      
      // Add a brief fade-out effect during text switch
      statusText.style.opacity = 0;
      setTimeout(() => {
        statusText.textContent = loadMessages[messageIndex];
        statusText.style.opacity = 1;
      }, 200);

    }, 1200);
  }

  // 1. INBOUND FADE OUT (When page arrives/finishes loading)
  if (statusText) statusText.textContent = loadMessages[0];
  startStatusCycle();

  setTimeout(() => {
    if (loader) {
      loader.classList.add("fade-out");
      clearInterval(messageInterval);
    }
  }, 600); // 600ms showcase looks crisp and deliberate

  // 2. OUTBOUND INTERCEPTOR (When clicking links to go somewhere else)
  const links = document.querySelectorAll("a, .logo, .auth-logo");

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      let targetUrl = "";

      if (this.tagName === "A") {
        targetUrl = this.getAttribute("href");
      } else if (this.hasAttribute("onclick")) {
        const matches = this.getAttribute("onclick").match(/'([^']+)'/);
        if (matches && matches[1]) targetUrl = matches[1];
      }

      // Safeguards for system/external references
      if (
        !targetUrl || 
        targetUrl.startsWith("#") || 
        targetUrl.startsWith("http") || 
        this.getAttribute("target") === "_blank"
      ) {
        return; 
      }

      e.preventDefault();

      // Trigger status sequence on outbound exit
      if (statusText) statusText.textContent = "Packing assets...";
      
      if (loader) {
        loader.classList.remove("fade-out");
      }

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 450); 
    });
  });
});






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
