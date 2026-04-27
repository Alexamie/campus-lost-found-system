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
$status = $input['status'] ?? null;

if (!$id || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'ID and status required']);
    exit();
}

$conn = getDBConnection();
$stmt = $conn->prepare("UPDATE items SET approvalStatus = ? WHERE id = ?");
$stmt->execute([$status, $id]);
$conn = null;

echo json_encode(['success' => true]);
?>