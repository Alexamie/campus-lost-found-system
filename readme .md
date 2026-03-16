<h1 align="center">Feature 1: Helpful Resources Page</h1>

<h3 align="left">Mini Specs: Single page listing at least 5 resource links. Each link includes a title, description, and optional contact info. Accessible from sidebar and dashboard.</h3>

<h3 align="left">What I Implemented: Created `resources.html` with a Bootstrap list group containing 5 resource entries. Added sidebar and dashboard navigation links to the resources page. Ensured styling matches the app’s UI and works on mobile.</h3>

<h3 align="left">Problems/Challenges Encountered: Needed to ensure the new page fit the existing sidebar injection logic without breaking layout. Kept the resource links generic since there is no backend to retrieve live data.</h3>


<h1 align="center">Feature 2: Contact / Help Page</h1>

<h3 align="left">Mini Specs: Single help page with contact details and a message form. Form fields: name, email, message; all required. Shows success confirmation after submit.</h3>

<h3 align="left">What I Implemented: Created `help.html` with campus contact details and a contact form. Implemented form validation and storing submissions in `localStorage.contacts`. Added a success alert that appears after submission and auto-hides.</h3>

<h3 align="left">Problems/Challenges Encountered: Needed to ensure the form worked without a backend (stored in localStorage instead). Made sure the success state is clear to the user while keeping the UI clean.</h3>


<h1 align="left">Figure 1</h1>

![image alt]()
