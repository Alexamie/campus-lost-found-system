const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const LOGIN_API_URLS = ['/auth/login'];

document.addEventListener('DOMContentLoaded', async () => {
  bindLoginForm();
  bindRegisterForm();

  const currentUser = await hydrateCurrentUser();
  const allowed = await protectRoute(currentUser);
  if (!allowed) return;

  if (currentPage === 'dashboard.html') {
    const user = getStoredUser();
    if (user) {
      window.location.href = 'user-dashboard.html';
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  if (currentPage === 'user-dashboard.html') {
    await initUserDashboard();
  }

  // Start periodic session validation
  startSessionValidation();
});

function startSessionValidation() {
  // Check session validity every 5 minutes
  setInterval(async () => {
    const session = getSession();
    if (!session) return;

    // If token is close to expiry (within 10 minutes), refresh session
    const payload = decodeJwtPayload(session.token);
    if (payload?.exp) {
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;

      if (expiresAt - now < tenMinutes) {
        console.log('Token expiring soon, refreshing session...');
        await refreshSession();
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

function getToken() {
  const session = getSession();
  if (!session || !session.token) return null;

  if (!isTokenUsable(session.token)) {
    clearSession();
    return null;
  }

  return session.token;
}

function getStoredUser() {
  const session = getSession();
  return session?.user || null;
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

function saveSession(token, user) {
  const normalizedUser = {
    ...user,
    role: String(user?.role || 'user').toLowerCase(),
  };

  const session = {
    token,
    user: normalizedUser,
    timestamp: Date.now()
  };
  localStorage.setItem('session', JSON.stringify(session));
  // Also store role separately for easy access
  localStorage.setItem('role', normalizedUser.role);
}

function clearSession() {
  localStorage.removeItem('session');
  localStorage.removeItem('role');
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

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
    if (response.status === 401) {
      // Token is invalid/expired, clear session
      clearSession();
      // Only redirect to login if not already on auth pages
      if (!['login.html', 'register.html', 'index.html'].includes(currentPage)) {
        window.location.href = 'login.html';
      }
      throw new Error('Authentication required');
    }

    const message =
      (data && typeof data === 'object' && data.message) ||
      response.statusText ||
      'Request failed';
    throw new Error(message);
  }

  return data;
}

async function hydrateCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const token = getToken();
  if (!token) {
    clearSession();
    return null;
  }

  const { user } = session;

  // If we have a valid stored user object, use it
  if (user?.role) {
    return user;
  }

  // Otherwise, fetch fresh user data
  try {
    const freshUser = await apiFetch('/auth/profile');
    saveSession(token, freshUser);
    return freshUser;
  } catch (error) {
    console.warn('Failed to hydrate user:', error.message);
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

function redirectToDashboard(user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const normalizedRole = String(user.role || '').toLowerCase();
  const targetPage = normalizedRole === 'admin' ? 'admin.html' : 'user-dashboard.html';
  if (currentPage !== targetPage) {
    window.location.href = targetPage;
  }
}

async function protectRoute(currentUser) {
  const userPages = ['user-dashboard.html'];

  // If on dashboard redirect page, allow it (will redirect in main logic)
  if (currentPage === 'dashboard.html') {
    return true;
  }

  // For protected pages, ensure user is authenticated
  if (userPages.includes(currentPage)) {
    if (!currentUser) {
      const user = await requireUser();
      if (!user) return false;
      currentUser = user;
    }
  }

  return true;
}

function bindLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const credentials = getLoginCredentials(form);
    const email = credentials.email;
    const password = credentials.password;
    const submitButton = document.getElementById('loginSubmitBtn');
    const msgElement = document.getElementById('msg');

    // Clear previous messages
    if (msgElement) msgElement.textContent = '';

    if (!email) {
      if (msgElement) msgElement.textContent = 'Please enter your email.';
      return;
    }

    if (!isValidEmail(email)) {
      if (msgElement) msgElement.textContent = 'Please enter a valid email address.';
      return;
    }

    if (!password) {
      if (msgElement) msgElement.textContent = 'Please enter your password.';
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
      }

      console.debug('Submitting login form for:', email);

      let data = null;
      let lastError = null;

      for (const url of LOGIN_API_URLS) {
        try {
          data = await apiFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          break;
        } catch (error) {
          lastError = error;
          console.warn(`Login endpoint failed: ${url}`, error);
        }
      }

      if (!data) {
        throw lastError || new Error('Login request failed');
      }

      const token = data.access_token || data.token;
      const resolvedUser = resolveLoginUser(data, token, email);

      if (!token) {
        throw new Error('Login succeeded but no token was returned.');
      }

      if (!resolvedUser?.role) {
        throw new Error('Login succeeded but user role was missing.');
      }

      saveSession(token, resolvedUser);
      console.debug('Login successful. Redirecting to:', resolvedUser.role);
      document.getElementById('msg').textContent = '';
      redirectToDashboard(resolvedUser);
    } catch (error) {
      console.error('Login failed:', error);
      document.getElementById('msg').textContent = error.message || 'Login failed';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

function bindRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const registerMsg = document.getElementById('registerMsg');

    // Clear previous messages
    if (registerMsg) registerMsg.textContent = '';

    if (!name || !email || !password) {
      if (registerMsg) registerMsg.textContent = 'Please complete all required fields.';
      return;
    }

    if (password !== confirmPassword) {
      if (registerMsg) registerMsg.textContent = 'Passwords do not match.';
      return;
    }

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      // Redirect to login page for manual login
      window.location.href = 'login.html';

    } catch (error) {
      if (registerMsg) registerMsg.textContent = error.message || 'Registration failed.';
    }
  });
}

async function initUserDashboard() {
  const dashboard = await apiFetch('/user/dashboard');

  renderUserDashboard(dashboard);
  bindReportForm({
    formId: 'dashboardReportForm',
    fieldIds: {
      title: 'dashboardItemName',
      description: 'dashboardItemDescription',
      status: 'dashboardItemStatus',
      location: 'dashboardItemLocation',
      contact: 'dashboardItemContact',
    },
    onSuccess: async () => {
      alert('Report submitted successfully.');
      await initUserDashboard();
    },
  });

  // Initialize dashboard-specific features
  initDashboardFeatures();
}

function initDashboardFeatures() {
  // Search and filter functionality
  const searchInput = document.getElementById('searchReports');
  const filterSelect = document.getElementById('filterStatus');

  if (searchInput) {
    searchInput.addEventListener('input', filterReports);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', filterReports);
  }

  // Navigation handling
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const target = this.getAttribute('href').substring(1);

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        if (target === 'submit') {
          showSubmitForm();
        } else if (target === 'reports') {
          showReports();
        } else if (target === 'dashboard') {
          showReports(); // Default to reports view
        }
      }
    });
  });
}

function renderUserDashboard(dashboard) {
  const user = dashboard.user;
  const reports = dashboard.reports || [];
  const approvedReports = reports.filter(
    (report) => report.approvalStatus === 'approved',
  );
  const pendingReports = reports.filter(
    (report) => report.approvalStatus === 'pending',
  );
  const resolvedReports = reports.filter(
    (report) => report.status === 'resolved',
  );

  // Update sidebar user info if element exists
  const sidebarUserInfo = document.getElementById('sidebarUserInfo');
  if (sidebarUserInfo) {
    sidebarUserInfo.textContent = `${user.name}`;
  }

  // Update welcome message if elements exist
  const welcomeTitle = document.getElementById('welcomeTitle');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome back, ${user.name}!`;
  }

  const welcomeSubtitle = document.getElementById('welcomeSubtitle');
  if (welcomeSubtitle) {
    welcomeSubtitle.textContent = 'Manage your lost and found reports on campus';
  }

  // Update stats
  setText('statReports', String(reports.length));
  setText('statApprovedReports', String(approvedReports.length));
  setText('statPendingReports', String(pendingReports.length));
  setText('statResolved', String(resolvedReports.length));

  // Render reports table with enhanced features
  renderReportsTable('myReportsTable', reports);

  // Update recent activity
  updateRecentActivity(reports.slice(0, 5));
}

function bindReportForm({ formId, fieldIds, onSuccess }) {
  const form = document.getElementById(formId);
  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      title: document.getElementById(fieldIds.title).value.trim(),
      description: document.getElementById(fieldIds.description).value.trim(),
      status: document.getElementById(fieldIds.status).value,
      location: document.getElementById(fieldIds.location).value.trim(),
      contact: document.getElementById(fieldIds.contact).value.trim(),
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.status ||
      !payload.location ||
      !payload.contact
    ) {
      alert('Please complete all report fields.');
      return;
    }

    try {
      await apiFetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      form.reset();
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      alert(error.message || 'Unable to submit the report.');
    }
  });
}

function renderReportsTable(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <i class="bi bi-file-earmark-x" style="font-size: 3rem; margin-bottom: 16px;"></i>
        <h4>No reports found</h4>
        <p>Submit your first lost or found report to get started!</p>
        <button class="btn btn-primary" onclick="showSubmitForm()" style="background: linear-gradient(135deg, #ff9a7f, #ff6f61); border: none; padding: 12px 24px; border-radius: 8px; color: white; font-weight: 600;">Submit Report</button>
      </div>
    `;
    return;
  }

  const rows = items
    .map((item) => {
      const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
      const approvalClass = item.approvalStatus === 'approved' ? 'status-approved' :
                           item.approvalStatus === 'pending' ? 'status-pending' : 'status-rejected';

      return `
        <tr>
          <td>
            <strong>${escapeHtml(item.title)}</strong>
            <br><small style="color: #666;">${escapeHtml(item.description.substring(0, 50))}...</small>
          </td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(item.status)}</span></td>
          <td>${escapeHtml(item.location)}</td>
          <td><span class="status-badge ${approvalClass}">${escapeHtml(item.approvalStatus)}</span></td>
          <td>${formatDate(item.createdAt)}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function updateRecentActivity(recentReports) {
  const container = document.getElementById('recentActivity');
  if (!container) return;

  if (!recentReports.length) {
    container.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="bi bi-info-circle"></i>
        </div>
        <div class="activity-content">
          <div class="title">Welcome to Campus Lost & Found!</div>
          <div class="meta">Submit reports to help reunite items with their owners</div>
        </div>
      </div>
    `;
    return;
  }

  const activities = recentReports.map(report => `
    <div class="activity-item">
      <div class="activity-icon">
        <i class="bi bi-${report.status === 'lost' ? 'exclamation-triangle' : 'check-circle'}"></i>
      </div>
      <div class="activity-content">
        <div class="title">${escapeHtml(report.title)}</div>
        <div class="meta">${report.status === 'lost' ? 'Lost' : 'Found'} • ${escapeHtml(report.location)} • ${formatDate(report.createdAt)}</div>
      </div>
    </div>
  `).join('');

  container.innerHTML = activities;
}

// Dashboard navigation functions
function showSubmitForm() {
  const reportsSection = document.getElementById('reportsSection');
  const submitSection = document.getElementById('submitSection');

  if (reportsSection) reportsSection.style.display = 'none';
  if (submitSection) submitSection.style.display = 'block';

  // Update active nav
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const submitLink = document.querySelector('a[href="#submit"]');
  if (submitLink) submitLink.classList.add('active');
}

function showReports() {
  const reportsSection = document.getElementById('reportsSection');
  const submitSection = document.getElementById('submitSection');

  if (reportsSection) reportsSection.style.display = 'block';
  if (submitSection) submitSection.style.display = 'none';

  // Update active nav
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const reportsLink = document.querySelector('a[href="#reports"]');
  if (reportsLink) reportsLink.classList.add('active');
}

// Search and filter functionality
function filterReports() {
  const searchInput = document.getElementById('searchReports');
  const filterSelect = document.getElementById('filterStatus');

  if (!searchInput || !filterSelect) return;

  const searchTerm = searchInput.value.toLowerCase();
  const statusFilter = filterSelect.value;
  const rows = document.querySelectorAll('#myReportsTable tbody tr');

  rows.forEach(row => {
    if (!row.cells || row.cells.length < 4) return;

    const title = row.cells[0].textContent.toLowerCase();
    const status = row.cells[3].textContent.toLowerCase();

    const matchesSearch = title.includes(searchTerm);
    const matchesFilter = !statusFilter || status.includes(statusFilter);

    row.style.display = matchesSearch && matchesFilter ? '' : 'none';
  });
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function formatDate(value) {
  if (!value) return 'just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'just now';

  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function isAuthenticated() {
  return !!getToken();
}

function hasRole(requiredRole) {
  // Check localStorage first
  let role = localStorage.getItem('role');
  if (role) return role === requiredRole;
  
  // Fallback to session object
  const user = getStoredUser();
  return user?.role === requiredRole;
}

async function refreshSession() {
  const session = getSession();
  if (!session) return false;

  try {
    const freshUser = await apiFetch('/auth/profile');
    saveSession(session.token, freshUser);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

function isTokenUsable(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  if (!payload.exp) return true;
  return Date.now() < payload.exp * 1000;
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function getLoginCredentials(form) {
  const formData = new FormData(form);

  const emailFromName = String(formData.get('email') || '').trim();
  const passwordFromName = String(formData.get('password') || '');

  const emailFromId =
    document.getElementById('email')?.value?.trim?.() || '';
  const passwordFromId = document.getElementById('password')?.value || '';

  return {
    email: emailFromName || emailFromId,
    password: passwordFromName || passwordFromId,
  };
}

function resolveLoginUser(data, token, fallbackEmail) {
  let user = data?.user;

  // If no user in response, try to extract from token
  if (!user) {
    const payload = token ? decodeJwtPayload(token) : null;
    if (payload) {
      user = {
        id: payload.id ?? payload.sub,
        email: payload.email ?? fallbackEmail,
        role: payload.role ?? 'user', // Default to user if no role
      };
    }
  }

  // Ensure user has required fields
  if (!user) {
    throw new Error('Login response missing user data');
  }

  if (!user.role) {
    const payload = token ? decodeJwtPayload(token) : null;
    if (payload?.role) {
      user.role = payload.role;
    } else {
      console.warn('User role missing from login response, defaulting to user');
      user.role = 'user';
    }
  }

  user.role = String(user.role).toLowerCase();

  if (!user.email && fallbackEmail) {
    user.email = fallbackEmail;
  }

  return user;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
