const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const LOGIN_API_URL = '/auth/login';

document.addEventListener('DOMContentLoaded', async () => {
  bindLoginForm();
  bindRegisterForm();

  const currentUser = await hydrateCurrentUser();
  await protectRoute(currentUser);
});


// ================= LOGIN =================

function bindLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('msg');
    const btn = document.getElementById('loginSubmitBtn');

    msg.textContent = '';

    if (!email || !password) {
      msg.textContent = 'Please fill in all fields.';
      return;
    }

    try {
      btn.disabled = true;

      const res = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ✅ DEBUG (ADDED HERE)
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const token = data.access_token || data.token;
      if (!token) throw new Error('No token');

      const user = resolveLoginUser(data, token, email);

      console.log("FINAL USER:", user);

      // ✅ SAVE SESSION
      saveSession(token, user);

      // ✅ REDIRECT
      redirectToDashboard(user);

    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Login failed';
    } finally {
      btn.disabled = false;
    }
  });
}


// ================= REGISTER =================

function bindRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const msg = document.getElementById('registerMsg');

    msg.textContent = '';

    if (!name || !email || !password) {
      msg.textContent = 'Complete all fields';
      return;
    }

    if (password !== confirm) {
      msg.textContent = 'Passwords do not match';
      return;
    }

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      window.location.href = 'login.html';

    } catch (err) {
      msg.textContent = err.message;
    }
  });
}


// ================= SESSION =================

function saveSession(token, user) {
  localStorage.setItem('session', JSON.stringify({
    token,
    user: normalizeUser(user),
  }));
}

function getSession() {
  const raw = localStorage.getItem('session');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('session');
}

function getStoredUser() {
  const user = getSession()?.user || null;
  return user ? normalizeUser(user) : null;
}

function getToken() {
  return getSession()?.token || null;
}


// ================= REDIRECT =================

function redirectToDashboard(user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const role = getUserRole(user);

  console.log("REDIRECT ROLE:", role);

  if (role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'user-dashboard.html';
  }
}


// ================= ROUTE PROTECTION =================

async function protectRoute(user) {
  const protectedPages = [
    'user-dashboard.html',
    'admin-dashboard.html'
  ];

  if (protectedPages.includes(currentPage)) {
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }

    const role = getUserRole(user);

    if (currentPage === 'admin-dashboard.html' && role !== 'admin') {
      window.location.href = 'user-dashboard.html';
      return false;
    }

    if (currentPage === 'user-dashboard.html' && role === 'admin') {
      window.location.href = 'admin-dashboard.html';
      return false;
    }
  }

  return true;
}


// ================= API =================

async function apiFetch(url, options = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}


// ================= USER =================

async function hydrateCurrentUser() {
  return getStoredUser();
}

function resolveLoginUser(data, token, fallbackEmail) {
  const tokenUser = decodeJwtPayload(token);
  const userData = data.user || {};

  return normalizeUser({
    id: userData.id || tokenUser?.sub || null,
    name: userData.name || tokenUser?.name || fallbackEmail.split('@')[0],
    email: userData.email || tokenUser?.email || fallbackEmail,
    role: userData.role || data.role || tokenUser?.role || 'user',
  });
}

function normalizeUser(user) {
  return {
    ...user,
    role: getUserRole(user),
  };
}

function getUserRole(user) {
  return String(user?.role || 'user').toLowerCase().trim();
}

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
