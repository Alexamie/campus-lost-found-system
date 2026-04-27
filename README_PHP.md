# PHP Login System

A simple login system using PHP, MySQL, and JavaScript for role-based authentication.

## Features

- User authentication with email/password
- Role-based access control (user only)
- Session management
- Automatic redirects based on user role
- Secure password hashing

## Setup

1. **Database Setup:**
   ```bash
   mysql -u root -p < database.sql
   ```

2. **Web Server:**
   - Place all files in your web server's document root
   - Ensure PHP and MySQL are installed and running
   - Update database credentials in `config.php` if needed

3. **Default Users:**
   - User: user@example.com / password

## File Structure

- `config.php` - Database configuration and helper functions
- `login.php` - Login processing (handles both form POST and AJAX)
- `logout.php` - Session cleanup and logout
- `database.sql` - Database schema and sample data
- `public/login.html` - Login form
- `public/user-dashboard.html` - User dashboard (protected)

## Security Notes

- Passwords are hashed using `password_hash()` and `password_verify()`
- Prepared statements prevent SQL injection
- Session-based authentication
- Input validation and sanitization

## Usage

1. Navigate to `login.html`
2. Enter credentials
3. System automatically redirects based on role:
   - User → `user-dashboard.html`
4. Click logout to end session

## API (Optional AJAX)

The system supports AJAX login requests to `login.php` with JSON payload:

```javascript
fetch('login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
})
.then(res => res.json())
.then(data => {
  if (data.access_token) {
    // Handle token
  } else {
    // Handle error
  }
});
```