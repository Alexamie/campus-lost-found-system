CAMPUS LOST AND FOUND WEB SYSTEM
FEATURE IMPLEMENTATION

## Overview
This is a web-based campus lost and found system built with NestJS backend and HTML/CSS/JS frontend. It allows users to report lost/found items, claim items, view lists, and access resources.

## Feature Specifications

### 1. User Authentication (Login/Registration)
**Purpose:** Secure access to the system with user accounts.

**Expected User:** Campus members (students, staff, visitors).

**Main Functionality:**
- Registration form with name, email, password, confirm password.
- Login form with email and password.
- Session management via localStorage.
- Admin fallback account (admin@gmail.com / 1234).

**Acceptance Criteria:**
1. Registration validates required fields and matching passwords.
2. Duplicate emails are rejected.
3. Successful registration redirects to login.
4. Login validates credentials against stored users or admin.
5. Invalid login shows error message.

### 2. Dashboard
**Purpose:** Central hub for navigating app features.

**Expected User:** Logged-in users.

**Main Functionality:**
- Cards for Lost Items, Found Items, Report Item, Submit Claim, Resources, Help.
- Toggle button to show/hide claim requests list.
- Logout button.

**Acceptance Criteria:**
1. Dashboard is protected; redirects to login if not authenticated.
2. Cards link to respective pages.
3. Claim requests toggle shows/hides the list.
4. Logout clears session and redirects to login.

### 3. Report Item
**Purpose:** Allow users to report lost or found items.

**Expected User:** Anyone who has lost or found an item.

**Main Functionality:**
- Form with item name, description, category (lost/found), date, location, contact.
- Submits to localStorage (lostItems and foundItems).

**Acceptance Criteria:**
1. All fields are required and validated.
2. Lost items appear in both lost and found lists (for claiming).
3. Found items appear in found list.
4. Success alert and redirect to appropriate list.

### 4. Lost Items Page
**Purpose:** Display list of reported lost items.

**Expected User:** Users looking for lost items.

**Main Functionality:**
- List of lost items with edit/delete buttons.
- Items stored in localStorage.lostItems.

**Acceptance Criteria:**
1. Items display with name, description, date, location, contact.
2. Edit prompts for updates and refreshes list.
3. Delete confirms and removes item.
4. Empty state shows "No lost items reported yet."

### 5. Found Items Page
**Purpose:** Display list of reported found items.

**Expected User:** Users looking for found items to claim.

**Main Functionality:**
- List of found items with edit/delete buttons.
- Items stored in localStorage.foundItems.

**Acceptance Criteria:**
1. Items display with name, description, date, location, contact.
2. Edit prompts for updates and refreshes list.
3. Delete confirms and removes item.
4. Empty state shows "No found items reported yet."

### 6. Claim Item
**Purpose:** Allow users to claim found items.

**Expected User:** Owners of found items.

**Main Functionality:**
- Dropdown to select found item.
- Form with claimer name and contact.
- Submits claim and removes item from found list.

**Acceptance Criteria:**
1. Dropdown populates with found items.
2. All fields required.
3. Claim stored in localStorage.claims.
4. Item removed from foundItems.
5. Success message and form reset.

### 7. Sidebar Navigation
**Purpose:** Provide easy navigation across pages.

**Expected User:** All users.

**Main Functionality:**
- Toggleable sidebar with profile section and links.
- Links: Dashboard, Found Items, Lost Items, Claim Item, Resources, Help.

**Acceptance Criteria:**
1. Sidebar injects on every page.
2. Toggle collapses/expands sidebar.
3. Profile shows logged-in user name.
4. Links navigate to correct pages.

### 8. Helpful Resources Page
**Purpose:** Provide quick access to campus safety info, lost & found tips, and relevant services.

**Expected User:** Users needing guidance on procedures or contacts.

**Main Functionality:**
- List of 5+ resources (safety, procedures, contacts).
- Styled with Bootstrap list-group.

**Acceptance Criteria:**
1. Page displays categorized resources.
2. At least 5 links with descriptions.
3. Mobile responsive.
4. Accessible via sidebar and dashboard.

#### Mini Specs
- Single page listing at least 5 resource links.
- Each link includes a title, description, and optional contact info.
- Accessible from sidebar and dashboard.

#### What I Implemented
- Created `resources.html` with a Bootstrap list group containing 5 resource entries.
- Added sidebar and dashboard navigation links to the resources page.
- Ensured styling matches the app’s UI and works on mobile.

#### Problems/Challenges Encountered
- Needed to ensure the new page fit the existing sidebar injection logic without breaking layout.
- Kept the resource links generic since there is no backend to retrieve live data.

### 9. Contact / Help Page
**Purpose:** Allow users to send questions or request support.

**Expected User:** Users needing help or reporting issues.

**Main Functionality:**
- Campus support info (phone, email, office).
- Contact form: name, email, message.
- Success message after submission.

**Acceptance Criteria:**
1. Form fields are required and validated.
2. Submission stores in localStorage.contacts.
3. Success alert shown and form reset.
4. Support info displayed prominently.

#### Mini Specs
- Single help page with contact details and a message form.
- Form fields: name, email, message; all required.
- Shows success confirmation after submit.

#### What I Implemented
- Created `help.html` with campus contact details and a contact form.
- Implemented form validation and storing submissions in `localStorage.contacts`.
- Added a success alert that appears after submission and auto-hides.

#### Problems/Challenges Encountered
- Needed to ensure the form worked without a backend (stored in localStorage instead).
- Made sure the success state is clear to the user while keeping the UI clean.

### 10. Claims Management (Dashboard)
**Purpose:** Allow admins/users to view submitted claims.

**Expected User:** Admins or users checking claim status.

**Main Functionality:**
- Toggle button in dashboard to show claims list.
- List displays claim details.

**Acceptance Criteria:**
1. Button toggles list visibility.
2. Claims show item and claimer info.
3. Empty state handled.
4. Data from localStorage.claims.

## Technical Specifications
- **Frontend:** HTML, CSS, JavaScript, Bootstrap 5.
- **Backend:** NestJS (not fully implemented in frontend-only version).
- **Storage:** localStorage for data persistence.
- **Styling:** Custom CSS with responsive design.
- **Icons:** Inline SVG for edit/delete buttons.

## Future Enhancements
- Backend integration with database.
- Email notifications for claims.
- Admin panel for managing items/claims.
- Search/filter functionality on lists.