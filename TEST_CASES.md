# Test Cases - Campus Lost and Found System

## Overview
Comprehensive test cases for the Campus Lost and Found Web System. Each test case includes step-by-step instructions and expected results.

---

## Test Case Table

| Test Case ID | Feature | Steps | Expected Result |
|--------------|---------|-------|-----------------|
| TC001 | User Registration | 1. Navigate to registration page<br>2. Enter name: "John Doe"<br>3. Enter email: "john@example.com"<br>4. Enter password: "Pass123!"<br>5. Confirm password: "Pass123!"<br>6. Click Register button | User account is created successfully. System redirects to login page. Success message displayed: "Registration successful." |
| TC002 | User Registration - Duplicate Email | 1. Register user with email "alice@example.com"<br>2. Try to register another user with same email<br>3. Click Register button | Error message displayed: "Email already registered." Registration is rejected. Duplicate user is not created. |
| TC003 | User Registration - Password Mismatch | 1. Navigate to registration page<br>2. Enter password: "Pass123!"<br>3. Confirm password: "Pass456!"<br>4. Click Register button | Error message displayed: "Passwords do not match." Registration form remains on same page. No user is created. |
| TC004 | User Login - Valid Credentials | 1. Navigate to login page<br>2. Enter email: "john@example.com"<br>3. Enter password: "Pass123!"<br>4. Click Login button | User is authenticated successfully. System redirects to dashboard. Session is created. User remains logged in. |
| TC005 | User Login - Invalid Password | 1. Navigate to login page<br>2. Enter email: "john@example.com"<br>3. Enter password: "WrongPassword"<br>4. Click Login button | Error message displayed: "Invalid credentials." User is not logged in. Login form remains visible. |
| TC006 | Report Lost Item | 1. Log in as user<br>2. Click "Report Item" button on dashboard<br>3. Select category: "Lost"<br>4. Enter name: "Black Wallet"<br>5. Enter description: "Contains ID cards and cash"<br>6. Enter date lost: "2024-03-28"<br>7. Enter location: "Library Building"<br>8. Enter contact: "john@example.com"<br>9. Click Submit | Item is saved to system. Success message displayed. User redirected to Lost Items list. New item appears in list with all details. |
| TC007 | Report Found Item | 1. Log in as user<br>2. Click "Report Item" button on dashboard<br>3. Select category: "Found"<br>4. Enter name: "Blue Keys"<br>5. Enter description: "Keychain with blue tag on Office Building"<br>6. Enter date found: "2024-03-29"<br>7. Enter location: "Cafeteria"<br>8. Enter contact: "staff@example.com"<br>9. Click Submit | Item is saved to system. Success message displayed. User redirected to Found Items list. New item appears in list. |
| TC008 | View Lost Items List | 1. Log in as user<br>2. Click "Lost Items" card on dashboard<br>3. Wait for page to load | Lost Items page loads successfully. All previously reported lost items are displayed in a list format. Each item shows: name, description, date, location, contact info. Empty state message shown if no items exist. |
| TC009 | View Found Items List | 1. Log in as user<br>2. Click "Found Items" card on dashboard<br>3. Wait for page to load | Found Items page loads successfully. All previously reported found items are displayed in a list format. Each item shows: name, description, date, location, contact info. Users can browse available items to claim. |
| TC010 | Claim Found Item | 1. Log in as user<br>2. Click "Claim Item" card on dashboard<br>3. Select an item from dropdown: "Blue Keys"<br>4. Enter claimer name: "Jane Smith"<br>5. Enter contact: "jane@example.com"<br>6. Click Submit Claim | Claim is created and stored. Success message displayed: "Claim submitted successfully."<br>Item is removed from Found Items list. Claim status set to "pending." Item no longer available for other users. |
| TC011 | Edit Lost Item | 1. Log in as item reporter<br>2. Navigate to Lost Items page<br>3. Find reported item: "Black Wallet"<br>4. Click Edit button<br>5. Change location from "Library Building" to "Student Center"<br>6. Click Update | Item is updated successfully. List refreshes immediately. Updated item shows new location. Other details remain unchanged. |
| TC012 | Delete Lost Item | 1. Log in as item reporter<br>2. Navigate to Lost Items page<br>3. Find reported item: "Black Wallet"<br>4. Click Delete button<br>5. Confirm deletion in popup | Item is removed from the system. Item no longer appears in Lost Items list. Confirmation message displayed. |
| TC013 | Approve Claim (Admin) | 1. Log in as admin<br>2. Navigate to Dashboard<br>3. Click "Show Claims" toggle button<br>4. Find claim: User "Jane Smith" claiming "Blue Keys"<br>5. Click Approve button | Claim status changes from "pending" to "approved." Claim appears with "Approved" badge in claims list. User can see approval status. |
| TC014 | Reject Claim (Admin) | 1. Log in as admin<br>2. Navigate to Dashboard<br>3. Click "Show Claims" toggle button<br>4. Find claim to reject<br>5. Click Reject button | Claim status changes from "pending" to "rejected." Claimed item becomes available for other users to claim. Rejection notification visible. |
| TC015 | View Help/Contact Page | 1. Log in to system<br>2. Click "Help" card on dashboard<br>3. Wait for page to load | Help page loads successfully. Campus support contact information is displayed (phone, email, office location). Contact form is visible with fields: name, email, message. |
| TC016 | Submit Help Request | 1. Navigate to Help page<br>2. Enter name: "Bob Johnson"<br>3. Enter email: "bob@example.com"<br>4. Enter message: "Lost my ID card, how to proceed?"<br>5. Click Submit | Message is saved to system (localStorage.contacts). Success alert appears: "Message sent successfully." Form is cleared and reset. Alert auto-hides after 3 seconds. |
| TC017 | View Resources Page | 1. Log in to system<br>2. Click "Resources" card on dashboard<br>3. Wait for page to load | Resources page loads successfully. At least 5 resource entries displayed with: title, description, and contact information. Page is mobile responsive. |
| TC018 | Sidebar Navigation | 1. Navigate to any page in system<br>2. Click sidebar toggle button<br>3. Sidebar expands showing: profile section, navigation links<br>4. Click "Lost Items" link | Sidebar is fully functional. Displays logged-in user's name. All navigation links work (Lost Items, Found Items, Claim Item, Resources, Help, Dashboard). Page correctly navigates to selected section. |
| TC019 | User Logout | 1. Log in as user<br>2. Click "Logout" button in dashboard or sidebar<br>3. Confirm logout | Session is cleared. User is logged out. localStorage session data is removed. System redirects to login page. |
| TC020 | Admin Fallback Login | 1. Navigate to login page<br>2. Enter email: "admin@gmail.com"<br>3. Enter password: "1234"<br>4. Click Login | Admin user is authenticated. System redirects to dashboard. Admin can access all features including claim management. |

---

## Test Coverage Summary

| Feature | Test Cases | Status |
|---------|-----------|--------|
| User Registration | TC001, TC002, TC003 | ✅ Basic + Error Cases |
| User Login | TC004, TC005, TC020 | ✅ Valid + Invalid + Admin |
| Report Item | TC006, TC007 | ✅ Lost & Found Items |
| View Items | TC008, TC009 | ✅ List Display |
| Claim Item | TC010 | ✅ Claim Submission |
| Manage Items | TC011, TC012 | ✅ Edit & Delete |
| Claim Management | TC013, TC014 | ✅ Approve & Reject |
| Help & Support | TC015, TC016 | ✅ Help Page & Contact Form |
| Resources | TC017 | ✅ Resources Page |
| Navigation | TC018, TC019 | ✅ Sidebar & Logout |

---

## Test Execution Priority

### High Priority (Critical Path)
- TC001 (Registration)
- TC004 (Login)
- TC006 (Report Lost Item)
- TC008 (View Lost Items)
- TC010 (Claim Item)

### Medium Priority (Core Features)
- TC007 (Report Found Item)
- TC009 (View Found Items)
- TC013 (Approve Claim)
- TC014 (Reject Claim)

### Low Priority (Secondary Features)
- TC002, TC003 (Registration Edge Cases)
- TC005 (Login Error)
- TC011, TC012 (Edit/Delete)
- TC015, TC016 (Help)
- TC017 (Resources)
- TC018, TC019 (Navigation)

---

## Notes for Testers

1. **Test Environment**: All tests should be run in a clean browser session (clear localStorage before starting).
2. **Test Data**: Use consistent test data across multiple test runs for reproducibility.
3. **Browser Compatibility**: Test on Chrome, Firefox, Safari, and Edge browsers.
4. **Mobile Testing**: Verify responsive design on mobile devices (iOS and Android).
5. **Defect Reporting**: Document any differences from expected results with screenshots.
6. **Regression Testing**: Re-run all test cases after any code changes or bug fixes.
