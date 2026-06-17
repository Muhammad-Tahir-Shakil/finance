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

  // New users go straight to the onboarding wizard.
  window.location.href = 'onboarding.html';
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
  window.location.href = data.profile.onboarded ? 'dashboard.html' : 'onboarding.html';
}

function logout() {
  clearSession();
  window.location.href = '../index.html';
}



// Toggle Password Visibility Logic
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", function () {
            // Check current input status
            const isPassword = passwordInput.getAttribute("type") === "password";
            
            // Switch the type
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            
            // Toggle your style state attribute
            toggleBtn.setAttribute("aria-pressed", isPassword ? "true" : "false");
            
            // Swap out the Font Awesome icon look
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                if (isPassword) {
                    icon.classList.remove("fa-eye");
                    icon.classList.add("fa-eye-slash");
                } else {
                    icon.classList.remove("fa-eye-slash");
                    icon.classList.add("fa-eye");
                }
            }
        });
    }
});