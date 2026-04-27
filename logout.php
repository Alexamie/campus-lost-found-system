<?php
require_once 'config.php';

// Clear session
session_destroy();

// Redirect to login
header('Location: login.html');
exit();
?>