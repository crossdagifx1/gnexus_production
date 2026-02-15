<?php
/**
 * G-Nexus Admin Routes
 * Admin-only endpoints for client, project, and invoice management
 */

require_once __DIR__ . '/api.php';
require_once __DIR__ . '/security_middleware.php';

header('Content-Type: application/json');

// Helper: Verify admin access
function requireAdmin($pdo) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('Not authenticated', 401);
    }
    
    $token = $matches[1];
    require_once __DIR__ . '/auth_routes.php';
    $payload = verifyJWT($token);
    
    if (!$payload) {
        sendError('Invalid token', 401);
    }
    
    // Check if user is admin
    $stmt = $pdo->prepare("SELECT is_admin FROM cms_users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !$user['is_admin']) {
        sendError('Access denied. Admin privileges required.', 403);
    }
    
    return $payload;
}

$action = $_GET['action'] ?? '';

switch ($action) {

// =====================================================
// ADMIN: GET ALL CLIENTS
// =====================================================
case 'admin_clients':
    requireAdmin($pdo);
    
    $status = $_GET['status'] ?? '';
    
    $query = "
        SELECT c.*, u.username, u.email, u.full_name, u.is_active,
               COUNT(DISTINCT p.id) as project_count,
               COUNT(DISTINCT i.id) as invoice_count,
               COUNT(DISTINCT t.id) as ticket_count
        FROM clients c
        JOIN cms_users u ON c.user_id = u.id
        LEFT JOIN projects p ON c.id = p.client_id
        LEFT JOIN invoices i ON c.id = i.client_id
        LEFT JOIN support_tickets t ON c.id = t.client_id
    ";
    
    $params = [];
    
    if ($status && $status !== 'all') {
        $query .= " WHERE c.account_status = ?";
        $params[] = $status;
    }
    
    $query .= " GROUP BY c.id ORDER BY c.onboarding_date DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['clients' => $clients]);
    break;

// =====================================================
// ADMIN: GET CLIENT DETAIL
// =====================================================
case 'admin_client_detail':
    requireAdmin($pdo);
    
    $clientId = $_GET['id'] ?? 0;
    
    // Get client info
    $stmt = $pdo->prepare("
        SELECT c.*, u.username, u.email, u.full_name, u.avatar_url, u.is_active, u.created_at
        FROM clients c
        JOIN cms_users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        sendError('Client not found', 404);
    }
    
    // Get projects
    $stmt = $pdo->prepare("
        SELECT * FROM projects
        WHERE client_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$clientId]);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get invoices
    $stmt = $pdo->prepare("
        SELECT * FROM invoices
        WHERE client_id = ?
        ORDER BY issue_date DESC
    ");
    $stmt->execute([$clientId]);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get tickets
    $stmt = $pdo->prepare("
        SELECT * FROM support_tickets
        WHERE client_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$clientId]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get activity
    $stmt = $pdo->prepare("
        SELECT * FROM activity_log
        WHERE client_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$clientId]);
    $activity = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess([
        'client' => $client,
        'projects' => $projects,
        'invoices' => $invoices,
        'tickets' => $tickets,
        'activity' => $activity
    ]);
    break;

// =====================================================
// ADMIN: UPDATE CLIENT STATUS
// =====================================================
case 'update_client_status':
    requireAdmin($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $clientId = $data['client_id'] ?? 0;
    $status = $data['status'] ?? '';
    
    if (!in_array($status, ['active', 'inactive', 'suspended'])) {
        sendError('Invalid status');
    }
    
    $stmt = $pdo->prepare("
        UPDATE clients
        SET account_status = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    try {
        $stmt->execute([$status, $clientId]);
        sendSuccess(['message' => 'Client status updated successfully']);
    } catch (PDOException $e) {
        sendError('Failed to update status: ' . $e->getMessage());
    }
    break;

// =====================================================
// ADMIN: GET ALL PROJECTS
// =====================================================
case 'admin_projects':
    requireAdmin($pdo);
    
    $clientId = $_GET['client_id'] ?? '';
    $status = $_GET['status'] ?? '';
    
    $query = "
        SELECT p.*, c.company_name, u.full_name as client_name
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        JOIN cms_users u ON c.user_id = u.id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($clientId) {
        $query .= " AND p.client_id = ?";
        $params[] = $clientId;
    }
    
    if ($status && $status !== 'all') {
        $query .= " AND p.status = ?";
        $params[] = $status;
    }
    
    $query .= " ORDER BY p.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['projects' => $projects]);
    break;

// =====================================================
// ADMIN: CREATE PROJECT
// =====================================================
case 'create_project':
    requireAdmin($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $clientId = $data['client_id'] ?? 0;
    $projectName = trim($data['project_name'] ?? '');
    $serviceType = $data['service_type'] ?? '';
    $description = trim($data['description'] ?? '');
    $budget = $data['budget'] ?? null;
    $startDate = $data['start_date'] ?? null;
    $deadline = $data['deadline'] ?? null;
    
    if (empty($projectName) || empty($serviceType)) {
        sendError('Project name and service type are required');
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO projects (
            client_id, project_name, service_type, description,
            budget, start_date, deadline, status, progress_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)
    ");
    
    try {
        $stmt->execute([
            $clientId, $projectName, $serviceType, $description,
            $budget, $startDate, $deadline
        ]);
        
        $projectId = $pdo->lastInsertId();
        
        // Log activity
        $stmt = $pdo->prepare("
            INSERT INTO activity_log (client_id, action, entity_type, entity_id)
            VALUES (?, 'Project created', 'project', ?)
        ");
        $stmt->execute([$clientId, $projectId]);
        
        sendSuccess([
            'project_id' => $projectId,
            'message' => 'Project created successfully'
        ]);
    } catch (PDOException $e) {
        sendError('Failed to create project: ' . $e->getMessage());
    }
    break;

// =====================================================
// ADMIN: UPDATE PROJECT
// =====================================================
case 'update_project':
    requireAdmin($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $projectId = $data['project_id'] ?? 0;
    $updates = [];
    $params = [];
    
    $allowedFields = ['project_name', 'description', 'status', 'progress_percentage', 
                      'budget', 'start_date', 'deadline', 'service_type'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $projectId;
    
    $stmt = $pdo->prepare("
        UPDATE projects
        SET " . implode(', ', $updates) . ", updated_at = NOW()
        WHERE id = ?
    ");
    
    try {
        $stmt->execute($params);
        sendSuccess(['message' => 'Project updated successfully']);
    } catch (PDOException $e) {
        sendError('Failed to update project: ' . $e->getMessage());
    }
    break;

// =====================================================
// ADMIN: GET ALL INVOICES
// =====================================================
case 'admin_invoices':
    requireAdmin($pdo);
    
    $clientId = $_GET['client_id'] ?? '';
    $status = $_GET['status'] ?? '';
    
    $query = "
        SELECT i.*, c.company_name, u.full_name as client_name, p.project_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        JOIN cms_users u ON c.user_id = u.id
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($clientId) {
        $query .= " AND i.client_id = ?";
        $params[] = $clientId;
    }
    
    if ($status && $status !== 'all') {
        $query .= " AND i.status = ?";
        $params[] = $status;
    }
    
    $query .= " ORDER BY i.issue_date DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['invoices' => $invoices]);
    break;

// =====================================================
// ADMIN: CREATE INVOICE
// =====================================================
case 'create_invoice':
    requireAdmin($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $clientId = $data['client_id'] ?? 0;
    $projectId = $data['project_id'] ?? null;
    $amount = $data['amount'] ?? 0;
    $dueDate = $data['due_date'] ?? null;
    $description = trim($data['description'] ?? '');
    
    if (!$clientId || !$amount) {
        sendError('Client ID and amount are required');
    }
    
    // Generate invoice number
    $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    $stmt = $pdo->prepare("
        INSERT INTO invoices (
            invoice_number, client_id, project_id, amount,
            issue_date, due_date, description, status
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, 'draft')
    ");
    
    try {
        $stmt->execute([
            $invoiceNumber, $clientId, $projectId, $amount,
            $dueDate, $description
        ]);
        
        $invoiceId = $pdo->lastInsertId();
        
        sendSuccess([
            'invoice_id' => $invoiceId,
            'invoice_number' => $invoiceNumber,
            'message' => 'Invoice created successfully'
        ]);
    } catch (PDOException $e) {
        sendError('Failed to create invoice: ' . $e->getMessage());
    }
    break;

// =====================================================
// ADMIN: UPDATE INVOICE STATUS
// =====================================================
case 'update_invoice_status':
    requireAdmin($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $invoiceId = $data['invoice_id'] ?? 0;
    $status = $data['status'] ?? '';
    
    if (!in_array($status, ['draft', 'sent', 'paid', 'overdue', 'cancelled'])) {
        sendError('Invalid status');
    }
    
    $stmt = $pdo->prepare("
        UPDATE invoices
        SET status = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    try {
        $stmt->execute([$status, $invoiceId]);
        
        // If marked as paid, set paid_at
        if ($status === 'paid') {
            $stmt = $pdo->prepare("UPDATE invoices SET paid_at = NOW() WHERE id = ?");
            $stmt->execute([$invoiceId]);
        }
        
        sendSuccess(['message' => 'Invoice status updated successfully']);
    } catch (PDOException $e) {
        sendError('Failed to update invoice: ' . $e->getMessage());
    }
    break;

// =====================================================
// ADMIN: GET ALL TICKETS
// =====================================================
case 'admin_tickets':
    requireAdmin($pdo);
    
    $status = $_GET['status'] ?? '';
    $priority = $_GET['priority'] ?? '';
    
    $query = "
        SELECT t.*, c.company_name, u.full_name as client_name, p.project_name
        FROM support_tickets t
        JOIN clients c ON t.client_id = c.id
        JOIN cms_users u ON c.user_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($status && $status !== 'all') {
        $query .= " AND t.status = ?";
        $params[] = $status;
    }
    
    if ($priority && $priority !== 'all') {
        $query .= " AND t.priority = ?";
        $params[] = $priority;
    }
    
    $query .= " ORDER BY t.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['tickets' => $tickets]);
    break;

// =====================================================
// ADMIN: UPDATE TICKET STATUS
// =====================================================
case 'update_ticket_status':
    requireAdmin($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $ticketId = $data['ticket_id'] ?? 0;
    $status = $data['status'] ?? '';
    
    if (!in_array($status, ['open', 'in-progress', 'resolved', 'closed'])) {
        sendError('Invalid status');
    }
    
    $stmt = $pdo->prepare("
        UPDATE support_tickets
        SET status = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    try {
        $stmt->execute([$status, $ticketId]);
        sendSuccess(['message' => 'Ticket status updated successfully']);
    } catch (PDOException $e) {
        sendError('Failed to update ticket: ' . $e->getMessage());
    }
    break;

default:
    sendError('Invalid action');
}
