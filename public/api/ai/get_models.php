<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM ai_models WHERE is_active = 1 ORDER BY category, name");
    $models = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transform to frontend expected format if needed
    // But sending raw DB rows is fine, frontend can map them.
    
    // Group by category for easier consumption? Or just flat list.
    // Flat list is more flexible.

    echo json_encode(['success' => true, 'data' => $models]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
