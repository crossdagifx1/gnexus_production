<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db_connect.php';

// Retrieve and decode JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

// Basic validation
if (empty($input['id']) || empty($input['name']) || empty($input['model_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields (id, name, model_id)']);
    exit;
}

try {
    $sql = "INSERT INTO ai_models (
                id, name, model_id, provider, category, context_window, 
                is_active, is_free, cost_per_1k_input, cost_per_1k_output, description
            ) VALUES (
                :id, :name, :model_id, :provider, :category, :context_window, 
                :is_active, :is_free, :cost_per_1k_input, :cost_per_1k_output, :description
            ) ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                model_id = VALUES(model_id),
                provider = VALUES(provider),
                category = VALUES(category),
                context_window = VALUES(context_window),
                is_active = VALUES(is_active),
                is_free = VALUES(is_free),
                cost_per_1k_input = VALUES(cost_per_1k_input),
                cost_per_1k_output = VALUES(cost_per_1k_output),
                description = VALUES(description)";

    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':id' => $input['id'],
        ':name' => $input['name'],
        ':model_id' => $input['model_id'],
        ':provider' => $input['provider'] ?? 'openrouter',
        ':category' => $input['category'] ?? 'general',
        ':context_window' => $input['context_window'] ?? 4096,
        ':is_active' => isset($input['is_active']) ? $input['is_active'] : 1,
        ':is_free' => isset($input['is_free']) ? $input['is_free'] : 0,
        ':cost_per_1k_input' => $input['cost_per_1k_input'] ?? 0,
        ':cost_per_1k_output' => $input['cost_per_1k_output'] ?? 0,
        ':description' => $input['description'] ?? ''
    ]);

    echo json_encode(['success' => true, 'message' => 'Model saved successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
