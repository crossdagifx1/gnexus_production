<?php
/**
 * G-Nexus Client Portal Routes
 * Handles client project management, invoices, support tickets
 */

require_once __DIR__ . '/api.php';
require_once __DIR__ . '/security_middleware.php';

header('Content-Type: application/json');

// Helper: Get current authenticated client
function getCurrentClient($pdo) {
    // Get user from auth
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    // Verify JWT (reuse function from auth_routes.php)
    require_once __DIR__ . '/auth_routes.php';
    $payload = verifyJWT($token);
    
    if (!$payload) {
        return null;
    }
    
    // Get client record
    $stmt = $pdo->prepare("
        SELECT c.*, u.username, u.email, u.full_name, u.avatar_url
        FROM clients c
        JOIN cms_users u ON c.user_id = u.id
        WHERE c.user_id = ? AND u.is_active = TRUE
    ");
    $stmt->execute([$payload['user_id']]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

$action = $_GET['action'] ?? '';

switch ($action) {

// =====================================================
// CLIENT DASHBOARD
// =====================================================
case 'client_dashboard':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    // Get active projects
    $stmt = $pdo->prepare("
        SELECT id, project_name, status, progress_percentage, deadline
        FROM projects
        WHERE client_id = ? AND status IN ('pending', 'in-progress', 'review')
        ORDER BY deadline ASC
        LIMIT 5
    ");
    $stmt->execute([$client['id']]);
    $activeProjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get unpaid invoices
    $stmt = $pdo->prepare("
        SELECT id, invoice_number, amount, due_date, status
        FROM invoices
        WHERE client_id = ? AND status IN ('sent', 'overdue')
        ORDER BY due_date ASC
        LIMIT 5
    ");
    $stmt->execute([$client['id']]);
    $unpaidInvoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get open tickets
    $stmt = $pdo->prepare("
        SELECT id, ticket_number, subject, status, priority, created_at
        FROM support_tickets
        WHERE client_id = ? AND status NOT IN ('closed', 'resolved')
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$client['id']]);
    $openTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent activity
    $stmt = $pdo->prepare("
        SELECT action, entity_type, entity_id, created_at
        FROM activity_log
        WHERE client_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$client['id']]);
    $recentActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess([
        'client' => $client,
        'active_projects' => $activeProjects,
        'unpaid_invoices' => $unpaidInvoices,
        'open_tickets' => $openTickets,
        'recent_activity' => $recentActivity
    ]);
    break;

// =====================================================
// CLIENT PROJECTS
// =====================================================
case 'client_projects':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $status = $_GET['status'] ?? '';
    $serviceType = $_GET['service_type'] ?? '';
    
    $query = "SELECT * FROM projects WHERE client_id = ?";
    $params = [$client['id']];
    
    if ($status) {
        $query .= " AND status = ?";
        $params[] = $status;
    }
    
    if ($serviceType) {
        $query .= " AND service_type = ?";
        $params[] = $serviceType;
    }
    
    $query .= " ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['projects' => $projects]);
    break;

// =====================================================
// PROJECT DETAILS
// =====================================================
case 'project_details':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $projectId = $_GET['id'] ?? 0;
    
    // Get project
    $stmt = $pdo->prepare("
        SELECT * FROM projects
        WHERE id = ? AND client_id = ?
    ");
    $stmt->execute([$projectId, $client['id']]);
    $project = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$project) {
        sendError('Project not found', 404);
    }
    
    // Get milestones
    $stmt = $pdo->prepare("
        SELECT * FROM project_milestones
        WHERE project_id = ?
        ORDER BY sort_order ASC, due_date ASC
    ");
    $stmt->execute([$projectId]);
    $milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get files
    $stmt = $pdo->prepare("
        SELECT * FROM project_files
        WHERE project_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$projectId]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess([
        'project' => $project,
        'milestones' => $milestones,
        'files' => $files
    ]);
    break;

// =====================================================
// CLIENT INVOICES
// =====================================================
case 'client_invoices':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $status = $_GET['status'] ?? '';
    
    $query = "SELECT * FROM invoices WHERE client_id = ?";
    $params = [$client['id']];
    
    if ($status) {
        $query .= " AND status = ?";
        $params[] = $status;
    }
    
    $query .= " ORDER BY issue_date DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['invoices' => $invoices]);
    break;

// =====================================================
// SUBMIT SUPPORT TICKET
// =====================================================
case 'submit_ticket':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $subject = trim($data['subject'] ?? '');
    $description = trim($data['description'] ?? '');
    $priority = $data['priority'] ?? 'medium';
    $projectId = $data['project_id'] ?? null;
    
    if (empty($subject) || empty($description)) {
        sendError('Subject and description are required');
    }
    
    // Generate ticket number
    $ticketNumber = 'TKT-' . strtoupper(substr(uniqid(), -8));
    
    $stmt = $pdo->prepare("
        INSERT INTO support_tickets (ticket_number, client_id, project_id, subject, description, priority)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    try {
        $stmt->execute([$ticketNumber, $client['id'], $projectId, $subject, $description, $priority]);
        $ticketId = $pdo->lastInsertId();
        
        // Log activity
        $stmt = $pdo->prepare("
            INSERT INTO activity_log (client_id, user_id, action, entity_type, entity_id)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$client['id'], $client['user_id'], 'Submitted support ticket', 'ticket', $ticketId]);
        
        sendSuccess([
            'ticket_id' => $ticketId,
            'ticket_number' => $ticketNumber,
            'message' => 'Support ticket submitted successfully'
        ]);
    } catch (PDOException $e) {
        sendError('Failed to submit ticket: ' . $e->getMessage());
    }
    break;

// =====================================================
// CLIENT TICKETS
// =====================================================
case 'client_tickets':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $status = $_GET['status'] ?? '';
    
    $query = "SELECT * FROM support_tickets WHERE client_id = ?";
    $params = [$client['id']];
    
    if ($status) {
        $query .= " AND status = ?";
        $params[] = $status;
    }
    
    $query .= " ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['tickets' => $tickets]);
    break;

// =====================================================
// TICKET MESSAGES
// =====================================================
case 'ticket_messages':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $ticketId = $_GET['id'] ?? 0;
    
    // Verify ticket belongs to client
    $stmt = $pdo->prepare("SELECT id FROM support_tickets WHERE id = ? AND client_id = ?");
    $stmt->execute([$ticketId, $client['id']]);
    if (!$stmt->fetch()) {
        sendError('Ticket not found', 404);
    }
    
    // Get messages
    $stmt = $pdo->prepare("
        SELECT m.*, u.full_name as sender_name
        FROM ticket_messages m
        LEFT JOIN cms_users u ON m.sender_id = u.id
        WHERE m.ticket_id = ? AND m.is_internal = FALSE
        ORDER BY m.created_at ASC
    ");
    $stmt->execute([$ticketId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['messages' => $messages]);
    break;

// =====================================================
// REPLY TO TICKET
// =====================================================
case 'reply_ticket':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $ticketId = $data['ticket_id'] ?? 0;
    $message = trim($data['message'] ?? '');
    
    if (empty($message)) {
        sendError('Message is required');
    }
    
    // Verify ticket belongs to client
    $stmt = $pdo->prepare("SELECT id FROM support_tickets WHERE id = ? AND client_id = ?");
    $stmt->execute([$ticketId, $client['id']]);
    if (!$stmt->fetch()) {
        sendError('Ticket not found', 404);
    }
    
    // Add message
    $stmt = $pdo->prepare("
        INSERT INTO ticket_messages (ticket_id, message, sender_id, sender_role)
        VALUES (?, ?, ?, 'client')
    ");
    $stmt->execute([$ticketId, $message, $client['user_id']]);
    
    // Update ticket status
    $stmt = $pdo->prepare("
        UPDATE support_tickets
        SET status = 'in-progress', updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$ticketId]);
    
    sendSuccess(['message' => 'Reply sent successfully']);
    break;

// =====================================================
// GET COMPANY INFO
// =====================================================
case 'get_company_info':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    sendSuccess([
        'company_name' => $client['company_name'] ?? '',
        'industry' => $client['industry'] ?? '',
        'address' => $client['address'] ?? '',
        'city' => $client['city'] ?? '',
        'country' => $client['country'] ?? '',
        'website' => $client['website'] ?? '',
        'tax_id' => $client['tax_id'] ?? ''
    ]);
    break;

// =====================================================
// UPDATE COMPANY INFO
// =====================================================
case 'update_company_info':
    $client = getCurrentClient($pdo);
    if (!$client) {
        sendError('Not authenticated', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $companyName = trim($data['company_name'] ?? '');
    $industry = trim($data['industry'] ?? '');
    $address = trim($data['address'] ?? '');
    $city = trim($data['city'] ?? '');
    $country = trim($data['country'] ?? '');
    $website = trim($data['website'] ?? '');
    $taxId = trim($data['tax_id'] ?? '');
    
    $stmt = $pdo->prepare("
        UPDATE clients
        SET company_name = ?, industry = ?, address = ?, city = ?, 
            country = ?, website = ?, tax_id = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    try {
        $stmt->execute([
            $companyName, $industry, $address, $city,
            $country, $website, $taxId, $client['id']
        ]);
        
        sendSuccess(['message' => 'Company information updated successfully']);
    } catch (PDOException $e) {
        sendError('Failed to update company information: ' . $e->getMessage());
    }
    break;

default:
    sendError('Invalid action');
}
