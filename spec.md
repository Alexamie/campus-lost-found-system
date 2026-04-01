# Software Testing Specification for Campus Lost and Found System

## Application Overview
The Campus Lost and Found System is a web-based application built with a NestJS backend and an HTML/CSS/JavaScript frontend. It enables campus members (students, staff, visitors) to report lost or found items, view item lists, submit claims, and access helpful resources. The system uses localStorage for data persistence in the frontend-only version, with plans for full backend integration.

## Features List
1. **User Authentication (Login/Registration)**: Secure access with user accounts, including registration, login, and session management.
2. **Dashboard**: Central navigation hub with links to features and claim management toggle.
3. **Report Item**: Form to report lost or found items, storing data in localStorage.
4. **Lost Items Page**: Display and manage list of reported lost items.
5. **Found Items Page**: Display and manage list of reported found items.
6. **Claim Item**: Form to claim found items, linking user and item data.
7. **Sidebar Navigation**: Toggleable navigation across pages.
8. **Helpful Resources Page**: Access to campus safety info, tips, and services.
9. **Contact/Help Page**: Support contact form and campus support details.
10. **Claims Management**: View submitted claims via dashboard toggle.

## Testing Types Explanation

### Unit Testing
Unit tests focus on testing individual components or functions in isolation. For the Campus Lost and Found System, this includes testing services (e.g., ItemsService, ClaimsService) to ensure they handle data correctly without dependencies on external systems like databases or APIs.

### Integration Testing
Integration tests verify the interaction between different parts of the application, such as how controllers communicate with services or how API endpoints handle requests. In this system, integration tests would check API endpoints for reporting items or claiming items to ensure proper data flow.

### End-to-End (E2E) Testing
E2E tests simulate real user scenarios from start to finish, testing the entire application flow. For example, an E2E test might cover user login, reporting an item, and then claiming it, ensuring the frontend and backend work together seamlessly.

## Test Frameworks
- **Jest**: A JavaScript testing framework for unit and integration tests. Used to test backend services and controllers in the NestJS application.
- **Supertest**: A library for testing HTTP endpoints in Node.js. Used for integration tests of API routes, such as sending requests to report or claim items.
- **Playwright** (optional for E2E): A tool for browser automation to test full user workflows on the frontend.

## Test Case Templates

### Unit Test Template
- **Test Name**: [Descriptive name]
- **Component**: [e.g., ItemsService]
- **Input**: [Sample data or parameters]
- **Expected Result**: [What should happen]
- **Steps**: [Code execution steps]

### Integration Test Template
- **Test Name**: [Descriptive name]
- **Endpoint**: [e.g., POST /items/report]
- **Input**: [Request payload]
- **Expected Result**: [Response status, data]
- **Steps**: [API call and assertions]

### E2E Test Template
- **Test Name**: [Descriptive name]
- **Scenario**: [User journey description]
- **Steps**: [Sequence of user actions]
- **Expected Result**: [Final state or output]

## Feature-Specific Test Specifications

### Login
**Expected Behaviors**:
- The system must validate user credentials against stored data or admin fallback.
- Successful login must set session and redirect to dashboard.
- Invalid login must display an error message.

**Test Cases**:
- **Unit**: Test AuthService.validateUser with valid/invalid credentials.
- **Integration**: Test POST /auth/login endpoint with correct/incorrect data.
- **E2E**: Simulate user entering email/password and checking redirect or error.

### Report Item
**Expected Behaviors**:
- The system must save reported item details to storage.
- All required fields must be validated before submission.
- Reported items must appear in appropriate lists immediately.

**Test Cases**:
- **Unit**: Test ItemsService.createItem with sample data.
- **Integration**: Test POST /items/report endpoint with full payload.
- **E2E**: User fills report form and verifies item in list.

### Claim Item
**Expected Behaviors**:
- Users must be logged in to claim items.
- Claims must link user and item data correctly.
- Claimed items must be removed from available lists.

**Test Cases**:
- **Unit**: Test ClaimsService.createClaim with user/item IDs.
- **Integration**: Test POST /claims/submit endpoint with authenticated request.
- **E2E**: Logged-in user selects item and submits claim, checks removal.

### Dashboard
**Expected Behaviors**:
- Dashboard must be protected and redirect unauthenticated users.
- Navigation cards must link to correct pages.
- Claims toggle must show/hide list accurately.

**Test Cases**:
- **Unit**: Test DashboardService for authentication checks.
- **Integration**: Test GET /dashboard with/without auth.
- **E2E**: User logs in, navigates via cards, toggles claims.

## Problems Encountered
- **Frontend-Only Storage**: Using localStorage limits scalability; tests must mock browser storage.
- **Authentication Simulation**: Session management via localStorage complicates E2E tests without real backend.
- **Data Persistence**: Lack of database means tests rely on in-memory or mocked data, potentially missing real-world issues.
- **Cross-Browser Compatibility**: Frontend tests may fail on different browsers if not using tools like Playwright.
- **Async Operations**: Handling promises in tests requires proper setup to avoid flaky results.

## FAQ Section

**Q: Why is testing important for this system?**  
A: Testing ensures the system works reliably, catches bugs early, and maintains user trust in a campus environment where item recovery is critical.

**Q: How do I run the tests?**  
A: Use `npm test` for Jest-based tests in the NestJS backend. For E2E, set up Playwright and run its commands.

**Q: What if a test fails?**  
A: Check the error message, review the code, and ensure test setup matches the application logic. Debug by isolating the failing component.

**Q: Can I test the frontend separately?**  
A: Yes, use Jest for unit tests on JavaScript functions, and Playwright for E2E browser simulations.

**Q: How often should tests be run?**  
A: Run unit/integration tests on every code change. E2E tests should run nightly or before releases.

**Q: What are common pitfalls in testing this app?**  
A: Forgetting to mock localStorage, not handling async code properly, and assuming frontend state without backend verification.

