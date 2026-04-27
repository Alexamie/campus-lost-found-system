<?php
// Database configuration
define('DB_FILE', __DIR__ . '/database.sqlite');

// Create connection
function getDBConnection() {
    try {
        $conn = new PDO('sqlite:' . DB_FILE);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

// Start session
session_start();

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper function to get current user
function getCurrentUser() {
    if (!isLoggedIn()) return null;

    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id, username, email, role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $conn = null;

    return $user;
}

// Helper function to require login
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.html');
        exit();
    }
}

?>