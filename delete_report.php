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

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID required']);
    exit();
}

$conn = getDBConnection();
$stmt = $conn->prepare("DELETE FROM items WHERE id = ?");
$stmt->execute([$id]);
$conn = null;

echo json_encode(['success' => true]);
?>