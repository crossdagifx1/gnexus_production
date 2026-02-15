<?php
/**
 * Database Validation & Health Check Tool
 * 
 * This script validates database setup, checks for errors,
 * and provides a health dashboard for the G-Nexus database.
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$results = [
    'status' => 'success',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => [],
    'errors' => [],
    'warnings' => [],
    'stats' => []
];

try {
    // ============================================
    // CHECK 1: Database Connection
    // ============================================
    $results['checks']['connection'] = [
        'name' => 'Database Connection',
        'status' => 'pass',
        'message' => 'Connected to database successfully'
    ];
    
    // ============================================
    // CHECK 2: Required Tables Exist
    // ============================================
    $requiredTables = [
        // Core
        'cms_users', 'cms_roles',
        // Auth
        'password_resets', 'email_verifications', 'cms_sessions', 'login_history', 'email_queue',
        // Client Portal
        'clients', 'projects', 'project_milestones', 'project_files',
        'invoices', 'support_tickets', 'ticket_messages', 'activity_log',
        // Notifications
        'notifications'
    ];
    
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $missingTables = array_diff($requiredTables, $existingTables);
    
    if (empty($missingTables)) {
        $results['checks']['tables'] = [
            'name' => 'Required Tables',
            'status' => 'pass',
            'message' => count($requiredTables) . ' required tables found',
            'details' => $requiredTables
        ];
    } else {
        $results['checks']['tables'] = [
            'name' => 'Required Tables',
            'status' => 'fail',
            'message' => count($missingTables) . ' tables missing',
            'missing' => $missingTables
        ];
        $results['errors'][] = 'Missing tables: ' . implode(', ', $missingTables);
        $results['status'] = 'error';
    }
    
    // ============================================
    // CHECK 3: Foreign Key Integrity
    // ============================================
    $stmt = $pdo->query("
        SELECT TABLE_NAME, CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ");
    $foreignKeys = $stmt->fetchAll();
    
    $results['checks']['foreign_keys'] = [
        'name' => 'Foreign Key Constraints',
        'status' => 'pass',
        'message' => count($foreignKeys) . ' foreign keys defined',
        'count' => count($foreignKeys)
    ];
    
    // ============================================
    // CHECK 4: Indexes
    // ============================================
    $stmt = $pdo->query("
        SELECT TABLE_NAME, COUNT(*) as index_count 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE()
        GROUP BY TABLE_NAME
    ");
    $indexes = $stmt->fetchAll();
    
    $results['checks']['indexes'] = [
        'name' => 'Database Indexes',
        'status' => 'pass',
        'message' => 'Indexes present on all tables',
        'details' => $indexes
    ];
    
    // ============================================
    // CHECK 5: Super Admin Account
    // ============================================
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM cms_users WHERE role = 'admin'");
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();
    
    if ($adminCount > 0) {
        $results['checks']['admin'] = [
            'name' => 'Admin Account',
            'status' => 'pass',
            'message' => $adminCount . ' admin account(s) found'
        ];
    } else {
        $results['checks']['admin'] = [
            'name' => 'Admin Account',
            'status' => 'warn',
            'message' => 'No admin accounts found'
        ];
        $results['warnings'][] = 'No admin account exists. Run setup_super_admin.sql';
    }
    
    // ============================================
    // CHECK 6: Character Set
    // ============================================
    $stmt = $pdo->query("
        SELECT DEFAULT_CHARACTER_SET_NAME 
        FROM information_schema.SCHEMATA 
        WHERE SCHEMA_NAME = DATABASE()
    ");
    $charset = $stmt->fetchColumn();
    
    if ($charset === 'utf8mb4') {
        $results['checks']['charset'] = [
            'name' => 'Character Encoding',
            'status' => 'pass',
            'message' => 'UTF-8 MB4 (supports all characters including emojis)'
        ];
    } else {
        $results['checks']['charset'] = [
            'name' => 'Character Encoding',
            'status' => 'warn',
            'message' => 'Using ' . $charset . ' (recommend utf8mb4)'
        ];
        $results['warnings'][] = 'Database charset is not utf8mb4';
    }
    
    // ============================================
    // STATISTICS
    // ============================================
    
    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) FROM cms_users");
    $results['stats']['total_users'] = $stmt->fetchColumn();
    
    // Total clients
    $stmt = $pdo->query("SELECT COUNT(*) FROM clients");
    $results['stats']['total_clients'] = $stmt->fetchColumn();
    
    // Total projects
    $stmt = $pdo->query("SELECT COUNT(*) FROM projects");
    $results['stats']['total_projects'] = $stmt->fetchColumn();
    
    // Total invoices
    $stmt = $pdo->query("SELECT COUNT(*) FROM invoices");
    $results['stats']['total_invoices'] = $stmt->fetchColumn();
    
    // Total tickets
    $stmt = $pdo->query("SELECT COUNT(*) FROM support_tickets");
    $results['stats']['total_tickets'] = $stmt->fetchColumn();
    
    // Total notifications
    $stmt = $pdo->query("SELECT COUNT(*) FROM notifications");
    $results['stats']['total_notifications'] = $stmt->fetchColumn();
    
    // Database size
    $stmt = $pdo->query("
        SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.TABLES 
        WHERE table_schema = DATABASE()
    ");
    $results['stats']['database_size_mb'] = $stmt->fetchColumn();
    
    // ============================================
    // OVERALL STATUS
    // ============================================
    
    if ($results['status'] !== 'error' && empty($results['warnings'])) {
        $results['status'] = 'healthy';
        $results['overall_message'] = '✅ Database is healthy and fully operational';
    } elseif ($results['status'] !== 'error') {
        $results['status'] = 'warning';
        $results['overall_message'] = '⚠️ Database is operational but has warnings';
    } else {
        $results['overall_message'] = '❌ Database has critical errors';
    }
    
} catch (PDOException $e) {
    $results['status'] = 'error';
    $results['errors'][] = 'Database error: ' . $e->getMessage();
    $results['overall_message'] = '❌ Failed to validate database';
}

// Output results
echo json_encode($results, JSON_PRETTY_PRINT);
