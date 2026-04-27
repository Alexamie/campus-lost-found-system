<?php
error_reporting(0);
ini_set('display_errors', 0);
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$conn = getDBConnection();
$stmt = $conn->prepare("SELECT id, title, status, location, contact, description, approvalStatus, createdAt FROM items ORDER BY createdAt DESC");
$stmt->execute();
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
$conn = null;

echo json_encode($items);
?>