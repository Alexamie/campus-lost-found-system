# Campus Lost and Found System

## Description
The Campus Lost and Found System is a web-based project designed to help students, staff, and campus visitors report, search, and claim lost or found items more easily. It provides a simple digital process for submitting item details, viewing lost and found lists, managing claims, and contacting support when help is needed. The system includes user authentication, dashboard navigation, profile management, claim tracking, and an admin dashboard for reviewing reports and coordinating item returns. It currently uses a frontend-focused setup with localStorage for data persistence, while the project structure also supports future NestJS backend integration. Overall, the project aims to make campus item recovery faster, more organized, and more reliable for both users and administrators.

# Software Testing Specification for Campus Lost and Found System

## Application Overview
The Campus Lost and Found System is a web-based application built with a NestJS backend and an HTML/CSS/JavaScript frontend. It enables campus members (students, staff, visitors) to report lost or found items, view item lists, submit claims, and access helpful resources. The system uses localStorage for data persistence in the frontend-only version, with plans for full backend integration.

## Features List
1. **User Authentication (Login/Registration)**: Secure access with user accounts, including registration, login, and session management.
2. **Dashboard**: Central navigation hub with links to features and claim management toggle.
3. **User Profile**: Simple profile management with basic personal information (name, email, phone, student ID) and account statistics.
4. **Report Item**: Form to report lost or found items, storing data in localStorage.
5. **Lost Items Page**: Display and manage list of reported lost items.
6. **Found Items Page**: Display and manage list of reported found items.
7. **Claim Item**: Form to claim found items, linking user and item data.
8. **Sidebar Navigation**: Toggleable navigation across pages.
9. **Helpful Resources Page**: Access to campus safety info, tips, and services.
10. **Contact/Help Page**: Support contact form and campus support details.
11. **Claims Management**: View submitted claims via dashboard toggle.
12. **Admin Dashboard**: Admin-only control center with report counts, priority review queue, location hotspots, return/handover queue, campus user review, and report approval/rejection actions.
13. **Role-Based Routing**: Login redirects admins to the admin dashboard and normal users to the user dashboard based on the authenticated user role.

## Recent Updates
- Fixed the account creation flow so `register.html` opens correctly and does not redirect immediately to the dashboard.
- Updated login redirection so admin users are routed to `admin-dashboard.html` and normal users are routed to `user-dashboard.html`.
- Removed the "Recent Activity" and "Campus Tips" sections from the user dashboard layout.
- Added a campus-focused admin dashboard with priority report review, location hotspots, return/handover queue, daily admin checklist, richer all-reports table, and campus user management tools.
- Added demo admin handling for `admin@gmail.com` so it is treated as an admin account, while `user@gmail.com` remains a normal user account.

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
- The system must validate user credentials against stored data.
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

### Admin Dashboard
**Expected Behaviors**:
- Admin dashboard must be protected and only accessible to users with the `admin` role.
- Normal users attempting to open the admin dashboard must be redirected to the user dashboard or login page.
- Summary cards must display total reports, pending review reports, approved posts, and campus user count.
- Priority Review Queue must list pending reports first, with high-priority items highlighted.
- Location Hotspots must summarize where lost/found reports are most common on campus.
- Return / Handover Queue must show approved found items that are ready for claim verification or Security Office coordination.
- All Reports table must show item title, type, user, status, location/submission time, and approve/reject actions.
- Campus Users section must allow admins to search users, filter verification status, and view user activity/report counts.
- Admin checklist must support daily operational tasks such as reviewing photos, matching reports, and confirming items with Security Office.

**Test Cases**:
- **Unit**: Test admin dashboard rendering helpers using sample lost/found report data.
- **Integration**: Test admin-only dashboard route guard with admin and non-admin sessions.
- **E2E**: Log in as `admin@gmail.com`, verify redirect to `admin-dashboard.html`, review queue contents, filter campus users, and approve/reject a report.
- **E2E**: Log in as `user@gmail.com`, verify redirect to `user-dashboard.html`, and confirm admin dashboard access is blocked.

### User Profile
**Expected Behaviors**:
- Profile page must be protected and require authentication.
- User can update personal information (name, email, phone, student ID).
- Campus preferences can be saved and retrieved.
- Account statistics must display correctly (total reports, approved reports, resolved items, account age).
- Data export functionality must generate downloadable JSON file.
- Account deletion must require confirmation and clear all user data.

**Test Cases**:
- **Unit**: Test profile data validation and localStorage operations.
- **Integration**: Test profile update endpoints with authentication.
- **E2E**: User navigates to profile, updates information, saves preferences, exports data, and verifies changes persist.

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

## Implemented Project Features
This project implements a complete Campus Lost and Found workflow for students, staff, visitors, and administrators. Users can create an account, log in, maintain a session, and be redirected to the correct dashboard based on their role. Normal users can report lost or found items, view their submitted reports, search and filter report records, view lost and found item pages, submit claims for found items, manage profile information, and access help or resource pages. Admin users have a dedicated admin dashboard where they can review campus reports, view report totals, check pending and approved reports, monitor location hotspots, manage handover queues, review campus users, and approve or reject report-related actions. The system also includes backend support through NestJS modules, TypeORM entities, JWT authentication, protected API routes, test files, and database/PHP support files for authentication and report management.

### Frontend Pages Implemented
- Landing page through `public/index.html`.
- Login and registration pages through `public/login.html` and `public/register.html`.
- User dashboard through `public/user-dashboard.html`.
- Admin dashboard through `public/admin-dashboard.html`.
- Dashboard redirect page through `public/dashboard.html`.
- Report item form through `public/report-item.html`.
- Lost items and found items pages through `public/lost-items.html` and `public/found-items.html`.
- Claim item page through `public/claim-item.html`.
- User profile page through `public/profile.html`.
- Helpful resources page through `public/resources.html`.
- Contact and help page through `public/help.html`.
- Shared styling and browser logic through `public/styles.css` and `public/script.js`.

### Backend Features Implemented
- User registration and login using the NestJS authentication module.
- JWT-based authentication with protected routes.
- Role-based routing for admin and normal user accounts.
- Demo admin handling for `admin@gmail.com`.
- Password hashing with bcrypt.
- Authenticated profile retrieval.
- User dashboard API support.
- Item reporting through `/items` and `/items/report`.
- User-specific report retrieval through `/items/mine/reports`.
- Item detail retrieval with access checks.
- Claim creation for approved found items.
- User claim history through `/claims/mine`.
- Claim status handling in the claims service.
- TypeORM entity models for users, items, and claims.

### Admin and Data Management Implemented
- Admin-only dashboard interface.
- Summary cards for total reports, pending reports, approved reports, and users.
- Priority review queue for campus reports.
- Location hotspot display.
- Return and handover queue.
- Daily admin checklist.
- All-reports table for report review.
- Campus user search, filtering, and statistics.
- PHP support files for login, logout, report retrieval, report deletion, and status updates.
- SQLite database file and SQL schema support.

### Testing and Documentation Implemented
- Unit test files for app, auth, users, items, and claims modules.
- Integration test setup and item integration test files.
- E2E test setup through Jest configuration.
- Additional testing documentation through `TEST_CASES.md` and `TESTING_SETUP_GUIDE.md`.
- Software testing specification copied into this README from `spec.md`.

## Tech Stack
- NestJS
- HTML/CSS/JavaScript
- Jest
- Supertest
- Playwright

## How to Run
```bash
npm install
npm run start
```

## Testing
```bash
npm test
```

## Project Setup
```bash
npm install
```

## Compile and Run the Project

### Development
```bash
npm run start
```

### Watch Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run start:prod
```

## Run Tests

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Deployment
When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the deployment documentation for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out Mau, the official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
npm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources
Check out a few resources that may come in handy when working with NestJS:

- Visit the NestJS Documentation to learn more about the framework.
- For questions and support, please visit the NestJS Discord channel.
- To dive deeper and get more hands-on experience, check out the official video courses.
- Deploy your application to AWS with the help of NestJS Mau in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real time using NestJS Devtools.
- Need help with your project from part-time to full-time support? Check out the official enterprise support.
- To stay in the loop and get updates, follow NestJS on X and LinkedIn.
- Looking for a job, or have a job to offer? Check out the official Jobs board.

## Support
Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support from its backers. If you'd like to join them, please read more on the NestJS support page.

## Stay in Touch
- **Author**: Kamil Myślic
- **Website**: https://nestjs.com
- **Twitter**: @nestframework

## License
Nest is MIT licensed.
