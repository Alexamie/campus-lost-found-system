// RUN AFTER PAGE LOAD
document.addEventListener("DOMContentLoaded", function () {
  injectSidebar();

  function injectSidebar() {
    if (document.getElementById("appSidebar")) return;

    // Skip sidebar on login and register pages
    if (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html")) return;

    // Get logged-in user info
    const loggedInEmail = localStorage.getItem("loggedInEmail");
    const users = getUsersFromLocalStorage();
    const currentUser = users.find(u => u.email === loggedInEmail);
    const userName = currentUser ? currentUser.name : "Guest";

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
            <a href="dashboard.html">🏠 Dashboard</a>
            <a href="found-items.html">🔍 Found Items</a>
            <a href="lost-items.html">📦 Lost Items</a>
            <a href="claim-item.html">📝 Claim Item</a>
            <a href="resources.html">📚 Resources</a>
            <a href="help.html">📞 Help</a>
          </div>
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML("afterbegin", sidebarHtml);

    // Toggle functionality
    const toggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("appSidebar");
    const body = document.body;

    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      if (sidebar.classList.contains("collapsed")) {
        body.classList.remove("sidebar-open");
        body.classList.add("sidebar-closed");
      } else {
        body.classList.remove("sidebar-closed");
        body.classList.add("sidebar-open");
      }
    });

    // Default state: open
    body.classList.add("sidebar-open");
  }

  const form = document.getElementById("loginForm");

  // LOGIN FUNCTION
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const users = getUsersFromLocalStorage();
      const foundUser = users.find((u) => u.email === email && u.password === password);

      /* Example Admin Account (fallback) */
      const adminEmail = "admin@gmail.com";
      const adminPassword = "1234";

      if (foundUser || (email === adminEmail && password === adminPassword)) {
        alert("Login Successful!");

        // SAVE LOGIN SESSION
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInEmail", email);

        // REDIRECT TO DASHBOARD
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid Email or Password");
      }
    });
  }

  // REGISTER FUNCTION
  if (window.location.pathname.includes("register.html")) {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("fullName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!name || !email || !password) {
        alert("Please fill in all required fields.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      const users = getUsersFromLocalStorage();
      if (users.some((u) => u.email === email)) {
        alert("An account with that email already exists.");
        return;
      }

      saveUserToLocalStorage({ name, email, password });

      alert("Registration successful! Please log in.");
      window.location.href = "login.html";
    });
  }

  // PROTECT DASHBOARD
  if (window.location.pathname.includes("dashboard.html")) {
    if (localStorage.getItem("loggedIn") !== "true") {
      alert("Please login first");
      window.location.href = "login.html";
    }
  }

  // REPORT ITEM HANDLING (LOCAL STORAGE)
  if (window.location.pathname.includes("report-item.html")) {
    const reportForm = document.getElementById("reportForm");

    reportForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const itemName = document.getElementById("itemName").value.trim();
      const itemDescription = document.getElementById("itemDescription").value.trim();
      const itemCategory = document.getElementById("itemCategory").value;
      const itemDate = document.getElementById("itemDate").value;
      const itemLocation = document.getElementById("itemLocation").value.trim();
      const contactInfo = document.getElementById("contactInfo").value.trim();

      const item = {
        id: Date.now(),
        name: itemName,
        description: itemDescription,
        category: itemCategory,
        date: itemDate,
        location: itemLocation,
        contact: contactInfo,
      };

      // Always save lost items so they can be claimed (even if "found" is selected).
      saveItemToLocalStorage("lostItems", item);

      // Also save found items if the user selected "Found".
      if (itemCategory === "found") {
        saveItemToLocalStorage("foundItems", item);
      }

      alert("Report submitted successfully!");
      // Optionally, redirect to the appropriate list
      if (itemCategory === "found") {
        window.location.href = "found-items.html";
      } else {
        window.location.href = "lost-items.html";
      }
    });
  }

  // LOAD ITEMS FOR LIST PAGES
  if (window.location.pathname.includes("lost-items.html")) {
    renderItemList("lostItems", "lostItemsList", "No lost items reported yet.");
  }

  if (window.location.pathname.includes("found-items.html")) {
    renderItemList("foundItems", "foundItemsList", "No found items reported yet.");
  }

  // CLAIM ITEM HANDLING
  if (window.location.pathname.includes("claim-item.html")) {
    populateFoundItemsSelect();

    const claimForm = document.getElementById("claimForm");
    claimForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const selectedItemId = document.getElementById("foundItemSelect").value;
      const claimerName = document.getElementById("claimerName").value.trim();
      const claimerContact = document.getElementById("claimerContact").value.trim();

      if (!selectedItemId || !claimerName || !claimerContact) {
        alert("Please fill in all fields.");
        return;
      }

      // Get the item details
      const foundItems = getItemsFromLocalStorage("foundItems");
      const item = foundItems.find(i => i.id == selectedItemId);

      if (!item) {
        alert("Item not found.");
        return;
      }

      // Store the claim
      const claim = {
        id: Date.now(),
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        itemDate: item.date,
        itemLocation: item.location,
        itemContact: item.contact,
        claimerName,
        claimerContact,
        claimedAt: new Date().toISOString(),
      };
      saveClaimToLocalStorage(claim);

      // Remove the item from foundItems
      removeItemFromLocalStorage("foundItems", parseInt(selectedItemId));

      alert("Claim submitted successfully! The item has been removed from the found items list.");
      // Optionally, redirect or reset form
      claimForm.reset();
      populateFoundItemsSelect(); // Refresh the select
    });
  }

  // CONTACT / HELP PAGE
  if (window.location.pathname.includes("help.html")) {
    const contactForm = document.getElementById("contactForm");
    const successAlert = document.getElementById("contactSuccess");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();

      if (!name || !email || !message) {
        alert("Please fill in all fields.");
        return;
      }

      saveContactToLocalStorage({
        id: Date.now(),
        name,
        email,
        message,
        submittedAt: new Date().toISOString(),
      });

      successAlert.style.display = "block";
      contactForm.reset();

      setTimeout(() => {
        successAlert.style.display = "none";
      }, 4000);
    });
  }

  // DASHBOARD CLAIMS VIEW
  if (window.location.pathname.includes("dashboard.html")) {
    const viewClaimsBtn = document.getElementById("viewClaimsBtn");
    const claimsList = document.getElementById("claimsList");

    viewClaimsBtn.addEventListener("click", function () {
      if (claimsList.style.display === "none") {
        renderClaimsList();
        claimsList.style.display = "block";
        viewClaimsBtn.textContent = "Hide Claims";
      } else {
        claimsList.style.display = "none";
        viewClaimsBtn.textContent = "View Claims";
      }
    });
  }
});

// Helpers
function getItemsFromLocalStorage(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    console.warn(`Unable to parse localStorage key ${key}:`, e);
    return [];
  }
}

function saveItemToLocalStorage(key, item) {
  const items = getItemsFromLocalStorage(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
}

function getUsersFromLocalStorage() {
  const raw = localStorage.getItem("users");
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    console.warn("Unable to parse localStorage key users:", e);
    return [];
  }
}

function saveUserToLocalStorage(user) {
  const users = getUsersFromLocalStorage();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}

function getClaimsFromLocalStorage() {
  const raw = localStorage.getItem("claims");
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    console.warn("Unable to parse localStorage key claims:", e);
    return [];
  }
}

function saveClaimToLocalStorage(claim) {
  const claims = getClaimsFromLocalStorage();
  claims.push(claim);
  localStorage.setItem("claims", JSON.stringify(claims));
}

function getContactsFromLocalStorage() {
  const raw = localStorage.getItem("contacts");
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    console.warn("Unable to parse localStorage key contacts:", e);
    return [];
  }
}

function saveContactToLocalStorage(contact) {
  const contacts = getContactsFromLocalStorage();
  contacts.push(contact);
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function renderClaimsList() {
  const container = document.getElementById("claimsContainer");
  if (!container) return;

  const claims = getClaimsFromLocalStorage();

  if (!claims.length) {
    container.innerHTML = `<p>No claim requests yet.</p>`;
    return;
  }

  container.innerHTML = "";
  claims.forEach((claim) => {
    const claimEl = document.createElement("div");
    claimEl.className = "list-group-item flex-column align-items-start";

    claimEl.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${claim.itemName}</h5>
        <small>Claimed on ${new Date(claim.claimedAt).toLocaleDateString()}</small>
      </div>
      <p class="mb-1">${claim.itemDescription}</p>
      <small><strong>Item Location:</strong> ${claim.itemLocation} • <strong>Item Contact:</strong> ${claim.itemContact}</small><br>
      <small><strong>Claimer:</strong> ${claim.claimerName} • <strong>Contact:</strong> ${claim.claimerContact}</small>
    `;

    container.appendChild(claimEl);
  });
}

function updateItemInLocalStorage(key, itemId, updates) {
  const items = getItemsFromLocalStorage(key);
  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return false;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(key, JSON.stringify(items));
  return true;
}

function removeItemFromLocalStorage(key, itemId) {
  const items = getItemsFromLocalStorage(key);
  const filtered = items.filter((item) => item.id !== itemId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

function renderItemList(storageKey, containerId, emptyMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = getItemsFromLocalStorage(storageKey);

  if (!items.length) {
    container.innerHTML = `<p>${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = "";
  items.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "list-group-item flex-column align-items-start";
    itemEl.dataset.itemId = item.id;

    itemEl.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <div>
          <h5 class="mb-1">${item.name}</h5>
          <small>${item.date}</small>
        </div>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-outline-primary edit-item" title="Edit item" aria-label="Edit item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
              <path fill-rule="evenodd" d="M11.207 2L13 3.793 12.293 4.5 10.5 2.707 11.207 2z"/>
            </svg>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger delete-item" title="Delete item" aria-label="Delete item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7H6v7a.5.5 0 0 1-1 0v-7z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5.5h5H13.5a1 1 0 0 1 1 1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/>
              <path d="M2.5 3a.5.5 0 0 1 .5-.5H5v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2a.5.5 0 0 1 .5.5v1H2.5v-1z"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="mb-1">${item.description}</p>
      <small><strong>Location:</strong> ${item.location} • <strong>Contact:</strong> ${item.contact}</small>
    `;

    // Edit handler
    itemEl.querySelector(".edit-item").addEventListener("click", function () {
      const updatedName = prompt("Item name:", item.name);
      if (updatedName === null) return;
      const updatedDescription = prompt("Description:", item.description);
      if (updatedDescription === null) return;
      const updatedLocation = prompt("Location:", item.location);
      if (updatedLocation === null) return;
      const updatedContact = prompt("Contact info:", item.contact);
      if (updatedContact === null) return;

      const success = updateItemInLocalStorage(storageKey, item.id, {
        name: updatedName.trim() || item.name,
        description: updatedDescription.trim() || item.description,
        location: updatedLocation.trim() || item.location,
        contact: updatedContact.trim() || item.contact,
      });

      if (success) {
        renderItemList(storageKey, containerId, emptyMessage);
      }
    });

    // Delete handler
    itemEl.querySelector(".delete-item").addEventListener("click", function () {
      if (confirm("Delete this item?")) {
        removeItemFromLocalStorage(storageKey, item.id);
        renderItemList(storageKey, containerId, emptyMessage);
      }
    });

    container.appendChild(itemEl);
  });
}

function populateFoundItemsSelect() {
  const select = document.getElementById("foundItemSelect");
  if (!select) return;

  const items = getItemsFromLocalStorage("foundItems");

  // Clear existing options except the first
  select.innerHTML = '<option value="" selected disabled>Choose a found item...</option>';

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} - ${item.description} (Found on ${item.date})`;
    select.appendChild(option);
  });
}

// LOGOUT FUNCTION
function logout() {
  localStorage.removeItem("loggedIn");
  alert("Logged out successfully");
  window.location.href = "login.html";
}
