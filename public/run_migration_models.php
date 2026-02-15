<?php
require_once 'db_connect.php';

$sql = file_get_contents('database/migrations/create_ai_models_table.sql');

try {
    $pdo->exec($sql);
    echo "Migration successful: ai_models table created/updated.";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
?>
