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

## Testing Assignment

STEP 0 — Identify your app and features
- App name: Campus Lost and Found System
- Features:
  1. Report Lost Item (backend wired)
  2. View Lost Items List (frontend + backend)
  3. Claim Item (backend wired)

PART 1 — Testing 101
1. A software test is a way to check if a part of the Campus Lost and Found System works correctly by running it and seeing if it does what it's supposed to do.
2. Teams write tests to make sure the Campus Lost and Found System doesn't break when they add new stuff, and to find problems early so users don't get frustrated with bugs.
3. Define:
   - Unit Test: This tests a small part of the code in the Campus Lost and Found System, like one function in the items service, all by itself.
   - Integration/API Test: This checks how different parts of the Campus Lost and Found System connect, such as testing the API for reporting items to see if the controller talks to the service right.
   - E2E Test: This tests the whole user experience in the Campus Lost and Found System, like going from logging in to claiming an item, to make sure everything flows smoothly.

PART 2 — Apply testing (Pick ONLY 2 features)
Use:
- Report Lost Item
- Claim Item

For Report Lost Item:

A) Expected Behavior (3 “must be true” statements)
- The system must save the reported item details to the database when a user submits the form.
- The API must check that all required fields are filled before accepting the report.
- The reported item must show up in the lost items list right after it's submitted.

B) 3 Test Cases:
- Test Name: Check Item Data Saving
  Type: Unit
  Steps/Input: Run the items service with sample item info like name and location.
  Expected Result: The service saves the data without errors.
- Test Name: API Report Endpoint Check
  Type: Integration
  Steps/Input: Send a request to the report API with full item details.
  Expected Result: The API saves the item and sends back a success message.
- Test Name: Full User Report Flow
  Type: E2E
  Steps/Input: User fills out the report form on the website and submits it.
  Expected Result: The item appears in the lost items list.

For Claim Item:

A) Expected Behavior (3 “must be true” statements)
- The system must require the user to be logged in before they can claim an item.
- The claim must link the user's info to the specific item in the database.
- Once claimed, the item must not be available for other users to claim again.

B) 3 Test Cases:
- Test Name: Validate Claim Logic
  Type: Unit
  Steps/Input: Test the claims service with a user's ID and an item ID.
  Expected Result: The service confirms the claim is valid.
- Test Name: Claim API Connection
  Type: Integration
  Steps/Input: Make a request to the claim API with user login and item choice.
  Expected Result: The API creates the claim and updates the item status.
- Test Name: Complete Claim Journey
  Type: E2E
  Steps/Input: User logs in, picks an item from the list, and submits a claim.
  Expected Result: The item is marked as claimed in the user's account.

PART 3 — Tools (MAKE IT A TABLE)

| Tool | What it is (1 sentence) | What you would test in my app |
|------|-------------------------|-------------------------------|
| Jest | Jest is a tool for writing and running tests in JavaScript projects like my NestJS backend. | I would use it to test small parts of the Campus Lost and Found System, such as checking if the items service handles item data correctly. |
| Supertest | Supertest is a library that helps test API endpoints in Node.js apps like NestJS. | I would use it to test the APIs in the Campus Lost and Found System, like making sure the report item endpoint works when I send data to it. |
| Playwright | Playwright is a tool for testing websites by automating browser actions. | I would use it to test the full user experience in the Campus Lost and Found System, like filling out forms and checking if pages load right. |

PART 4 — AI + Testing
1. Two ways AI helps: AI can suggest test ideas for the Campus Lost and Found System by looking at the code, which helps me think of cases I might miss. AI can also spot weird situations in the app, like what if someone tries to claim an item twice, to make tests better.
2. Two risks of AI-generated tests: AI might not understand the special rules of the Campus Lost and Found System, like how claims work, so the tests could be wrong. AI tests might look good but not cover real problems users face, like slow loading on the lost items page.
3. Complete: "I will not use AI-generated tests unless I check them myself and make sure they fit the Campus Lost and Found System."

PART 5 — Minimal Test Plan
1. Which ONE feature to test first: Report Lost Item
2. First test to write: A unit test for the items service to see if it saves item info properly.
3. Command to run test (Node/NestJS): npm test

## Future Enhancements
- Backend integration with database.
- Email notifications for claims.
- Admin panel for managing items/claims.
- Search/filter functionality on lists.

## AI Code Quality Audit + Refactoring Plan

### 1) Target Area
- **File name(s)**: `app.controller.ts`
- **Explanation**: This file defines the main application controller in a NestJS framework, handling the root GET endpoint by delegating to the app service to return a simple hello message.

### 2) Short Research Notes
- **What is refactoring?** Refactoring is the process of restructuring existing code without changing its external behavior to improve readability, maintainability, and structure.
- **Difference between refactoring and adding features**: Refactoring focuses on improving code quality and structure without introducing new functionality, whereas adding features involves implementing new capabilities or behaviors.
- **3 common AI code smells**:
  - Overly complex conditional logic that confuses automated analysis.
  - Inconsistent naming conventions that hinder AI pattern recognition.
  - Lack of modularity, making code difficult for AI to decompose and understand.
- **2 safe refactoring techniques**:
  - Extract method: Break down large methods into smaller, focused functions.
  - Rename variables/methods: Update names for clarity without altering logic.

### 3) Code Quality Audit
- **Finding 1**:
  - **What is the issue?** The method name `getHello()` is unclear and does not specify what "hello" refers to or its purpose.
  - **Why is it a long-term problem?** Unclear naming reduces code readability and makes maintenance harder for developers, potentially leading to misunderstandings in larger codebases.
  - **Where is it in the file?** Line 8: `@Get() getHello(): string`
- **Finding 2**:
  - **What is the issue?** There is no error handling in the controller method, which could lead to unhandled exceptions.
  - **Why is it a long-term problem?** Lack of error handling can cause application crashes and poor user experience, making the system less robust over time.
  - **Where is it in the file?** Lines 8-10: The entire `getHello()` method lacks try-catch blocks.
- **Finding 3**:
  - **What is the issue?** The controller has mixed concerns by directly delegating to the service without any validation or preprocessing.
  - **Why is it a long-term problem?** Mixing concerns violates separation of responsibilities, making the code harder to test and extend as the application grows.
  - **Where is it in the file?** Lines 8-10: The method only calls the service without additional logic.
- **Finding 4**:
  - **What is the issue?** Missing explicit type annotations for dependencies, though TypeScript infers them.
  - **Why is it a long-term problem?** Implicit types can lead to type-related bugs and reduce IDE support, complicating refactoring in larger projects.
  - **Where is it in the file?** Line 5: `constructor(private readonly appService: AppService)`
- **Finding 5**:
  - **What is the issue?** The method is very short and simple, potentially indicating underutilization of the controller pattern.
  - **Why is it a long-term problem?** Overly simplistic code may hide the need for proper structure, leading to accumulation of responsibilities elsewhere.
  - **Where is it in the file?** Lines 8-10: The `getHello()` method is only one line.
- **Finding 6** (AI-related):
  - **What is the issue?** The code lacks comments or documentation, making it harder for AI tools to understand intent.
  - **Why is it a long-term problem?** Without documentation, AI-assisted development and maintenance become less effective, increasing the risk of errors during automated refactoring.
  - **Where is it in the file?** Entire file: No comments explaining the controller's purpose.

### 4) Safe Refactoring Plan
- **Step 1**: Rename the method `getHello()` to `getWelcomeMessage()` for clarity. Verification: Run tests to ensure the endpoint still returns the expected response. Commit message: "Rename getHello to getWelcomeMessage for better clarity"
- **Step 2**: Add a try-catch block around the service call to handle potential errors. Verification: Test the endpoint with simulated service failures. Commit message: "Add basic error handling to getWelcomeMessage method"
- **Step 3**: Extract the service call into a private method for better separation. Verification: Ensure the endpoint behavior remains unchanged. Commit message: "Extract service call into private method for modularity"
- **Step 4**: Add explicit type annotations to the constructor parameter. Verification: Compile the code to check for type errors. Commit message: "Add explicit type annotations to constructor for consistency"
- **Step 5**: Add a JSDoc comment to the method explaining its purpose. Verification: Verify the comment appears in IDE tooltips. Commit message: "Add JSDoc comment to getWelcomeMessage for documentation"
- **Step 6**: Add input validation (e.g., check if service is available). Verification: Test with mocked service states. Commit message: "Add basic input validation to improve robustness"

### 5) Reflection
The app.controller.ts file is a basic NestJS controller that serves as an entry point for the application. Analyzing it revealed several opportunities for improvement in naming, error handling, and documentation, despite its simplicity. Refactoring this small file can establish good practices early in the project. The plan focuses on incremental changes to avoid introducing bugs. Overall, this audit highlights how even minimal code can benefit from quality enhancements to support long-term maintainability.

