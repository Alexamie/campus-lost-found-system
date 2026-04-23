const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.addEventListener('DOMContentLoaded', async () => {
  await hydrateCurrentUser();
  injectSidebar();
  bindLoginForm();
  bindRegisterForm();
  await protectRoute();
  await loadDashboardProfile();
  await bindReportForm();
  await loadItemsPage('lost', 'lostItemsList', 'No lost items reported yet.');
  await loadItemsPage('found', 'foundItemsList', 'No found items reported yet.');
  await setupClaimForm();
  bindHelpForm();
});

function getToken() {
  return localStorage.getItem('token');
}

function getStoredUser() {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to parse authUser:', error);
    localStorage.removeItem('authUser');
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', user.role);
  localStorage.setItem('authUser', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('authUser');
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      response.statusText ||
      'Request failed';
    throw new Error(message);
  }

  return data;
}

async function hydrateCurrentUser() {
  if (!getToken()) {
    clearSession();
    return null;
  }

  const storedUser = getStoredUser();
  if (storedUser && storedUser.role) {
    return storedUser;
  }

  try {
    const user = await apiFetch('/auth/profile');
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('role', user.role);
    return user;
  } catch (error) {
    clearSession();
    return null;
  }
}

async function requireUser() {
  const user = await hydrateCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  return user;
}

async function protectRoute() {
  const authPages = ['dashboard.html', 'report-item.html', 'claim-item.html', 'profile.html'];
  if (authPages.includes(currentPage)) {
    await requireUser();
  }

  if (currentPage === 'admin.html') {
    const user = await requireUser();
    if (!user) return;

    if (user.role !== 'admin') {
      alert('Access denied. Admins only.');
      window.location.href = 'dashboard.html';
    }
  }
}

function injectSidebar() {
  if (document.getElementById('appSidebar')) return;
  if (['login.html', 'register.html'].includes(currentPage)) return;

  const currentUser = getStoredUser();
  const userName = currentUser ? currentUser.name : 'Guest';
  const adminLink =
    currentUser && currentUser.role === 'admin'
      ? '<a href="admin.html">Admin Dashboard</a>'
      : '';

  const sidebarHtml = `
    <button id="sidebarToggle" class="sidebar-toggle" title="Toggle Sidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
      </svg>
    </button>
    <aside id="appSidebar" class="sidebar">
      <div class="sidebar-content">
        <div class="profile-section">
          <h6>Welcome, ${userName}</h6>
        </div>
        <div class="sidebar-links">
          <a href="dashboard.html">Dashboard</a>
          <a href="found-items.html">Found Items</a>
          <a href="lost-items.html">Lost Items</a>
          <a href="claim-item.html">Claim Item</a>
          <a href="report-item.html">Report Item</a>
          <a href="resources.html">Resources</a>
          <a href="help.html">Help</a>
          ${adminLink}
        </div>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHtml);

  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('appSidebar');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-open', !sidebar.classList.contains('collapsed'));
    document.body.classList.toggle('sidebar-closed', sidebar.classList.contains('collapsed'));
  });

  document.body.classList.add('sidebar-open');
}

function bindLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      saveSession(data.access_token, data.user);
      window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    } catch (error) {
      alert(error.message || 'Login failed');
    }
  });
}

function bindRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !password) {
      alert('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      alert('Registration successful. Please log in.');
      window.location.href = 'login.html';
    } catch (error) {
      alert(error.message || 'Registration failed');
    }
  });
}

async function loadDashboardProfile() {
  if (currentPage !== 'dashboard.html') return;

  const userInfo = document.getElementById('userInfo');
  if (!userInfo) return;

  try {
    const user = await apiFetch('/user/profile');
    userInfo.innerHTML = `
      <div class="alert alert-info">
        <strong>Welcome, ${user.name}!</strong> You are signed in as a ${user.role}.
      </div>
    `;
  } catch (error) {
    userInfo.innerHTML = `
      <div class="alert alert-danger">
        Unable to load your profile right now.
      </div>
    `;
  }
}

async function bindReportForm() {
  if (currentPage !== 'report-item.html') return;

  const reportForm = document.getElementById('reportForm');
  if (!reportForm) return;

  reportForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('itemName').value.trim(),
      description: document.getElementById('itemDescription').value.trim(),
      status: document.getElementById('itemCategory').value,
      location: document.getElementById('itemLocation').value.trim(),
      contact: document.getElementById('contactInfo').value.trim(),
    };

    try {
      const currentUser = await requireUser();
      if (!currentUser) return;

      const item = await apiFetch('/items/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const message =
        item.approvalStatus === 'approved'
          ? 'Item posted successfully.'
          : 'Item submitted successfully and is waiting for admin approval.';

      alert(message);
      window.location.href = payload.status === 'found' ? 'found-items.html' : 'lost-items.html';
    } catch (error) {
      alert(error.message || 'Unable to submit report');
    }
  });
}

async function loadItemsPage(status, containerId, emptyMessage) {
  if (
    !(
      (status === 'lost' && currentPage === 'lost-items.html') ||
      (status === 'found' && currentPage === 'found-items.html')
    )
  ) {
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const items = await apiFetch('/items');
    const filteredItems = items.filter((item) => item.status === status);

    if (!filteredItems.length) {
      container.innerHTML = `<p>${emptyMessage}</p>`;
      return;
    }

    container.innerHTML = filteredItems
      .map(
        (item) => `
          <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${escapeHtml(item.title)}</h5>
              <small>${escapeHtml(item.approvalStatus)}</small>
            </div>
            <p class="mb-1">${escapeHtml(item.description)}</p>
            <small><strong>Location:</strong> ${escapeHtml(item.location)} | <strong>Contact:</strong> ${escapeHtml(item.contact)}</small>
          </div>
        `,
      )
      .join('');
  } catch (error) {
    container.innerHTML = '<p>Unable to load items right now.</p>';
  }
}

async function setupClaimForm() {
  if (currentPage !== 'claim-item.html') return;

  await populateFoundItemsSelect();

  const claimForm = document.getElementById('claimForm');
  if (!claimForm) return;

  claimForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const selectedItemId = document.getElementById('foundItemSelect').value;
    const claimerName = document.getElementById('claimerName').value.trim();
    const claimerContact = document.getElementById('claimerContact').value.trim();

    if (!selectedItemId || !claimerName || !claimerContact) {
      alert('Please fill in all fields.');
      return;
    }

    const foundItems = getClaimsCatalog();
    const item = foundItems.find((entry) => String(entry.id) === String(selectedItemId));

    if (!item) {
      alert('Item not found.');
      return;
    }

    const claims = getClaimsFromLocalStorage();
    claims.push({
      id: Date.now(),
      itemId: item.id,
      itemName: item.title,
      itemDescription: item.description,
      itemLocation: item.location,
      itemContact: item.contact,
      claimerName,
      claimerContact,
      claimedAt: new Date().toISOString(),
    });
    localStorage.setItem('claims', JSON.stringify(claims));

    alert('Claim submitted successfully.');
    claimForm.reset();
  });
}

async function populateFoundItemsSelect() {
  const select = document.getElementById('foundItemSelect');
  if (!select) return;

  try {
    const items = await apiFetch('/items');
    const foundItems = items.filter((item) => item.status === 'found');
    localStorage.setItem('claimableItems', JSON.stringify(foundItems));

    select.innerHTML = '<option value="" selected disabled>Choose a found item...</option>';

    foundItems.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.title} - ${item.description}`;
      select.appendChild(option);
    });
  } catch (error) {
    select.innerHTML = '<option value="" selected disabled>No approved found items available.</option>';
  }
}

function getClaimsCatalog() {
  const raw = localStorage.getItem('claimableItems');
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function bindHelpForm() {
  const contactForm = document.getElementById('contactForm');
  const successAlert = document.getElementById('contactSuccess');
  if (!contactForm || !successAlert) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const contacts = getContactsFromLocalStorage();
    contacts.push({
      id: Date.now(),
      name: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      message: document.getElementById('contactMessage').value.trim(),
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('contacts', JSON.stringify(contacts));

    successAlert.style.display = 'block';
    contactForm.reset();

    setTimeout(() => {
      successAlert.style.display = 'none';
    }, 4000);
  });
}

function getClaimsFromLocalStorage() {
  return getJsonArray('claims');
}

function getContactsFromLocalStorage() {
  return getJsonArray('contacts');
}

function getJsonArray(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}
