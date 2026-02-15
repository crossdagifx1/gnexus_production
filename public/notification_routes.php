<?php
/**
 * Notification Routes
 * Endpoints for managing user notifications
 */

require_once __DIR__ . '/api.php';

header('Content-Type: application/json');

// Helper: Get authenticated user
function getAuthenticatedUser($pdo) {
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
    
    return $payload;
}

$action = $_GET['action'] ?? '';

switch ($action) {

// =====================================================
// GET NOTIFICATIONS
// =====================================================
case 'get_notifications':
    $payload = getAuthenticatedUser($pdo);
    $userId = $payload['user_id'];
    
    $limit = $_GET['limit'] ?? 20;
    
    $stmt = $pdo->prepare("
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$userId, (int)$limit]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['notifications' => $notifications]);
    break;

// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================
case 'mark_notification_read':
    $payload = getAuthenticatedUser($pdo);
    $userId = $payload['user_id'];
    
    $data = json_decode(file_get_contents('php://input'), true);
    $notificationId = $data['notification_id'] ?? 0;
    
    $stmt = $pdo->prepare("
        UPDATE notifications
        SET read_at = NOW()
        WHERE id = ? AND user_id = ? AND read_at IS NULL
    ");
    
    try {
        $stmt->execute([$notificationId, $userId]);
        sendSuccess(['message' => 'Notification marked as read']);
    } catch (PDOException $e) {
        sendError('Failed to update notification: ' . $e->getMessage());
    }
    break;

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================
case 'mark_all_notifications_read':
    $payload = getAuthenticatedUser($pdo);
    $userId = $payload['user_id'];
    
    $stmt = $pdo->prepare("
        UPDATE notifications
        SET read_at = NOW()
        WHERE user_id = ? AND read_at IS NULL
    ");
    
    try {
        $stmt->execute([$userId]);
        sendSuccess(['message' => 'All notifications marked as read']);
    } catch (PDOException $e) {
        sendError('Failed to update notifications: ' . $e->getMessage());
    }
    break;

// =====================================================
// CREATE NOTIFICATION (Internal use / Admin)
// =====================================================
case 'create_notification':
    $payload = getAuthenticatedUser($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $userId = $data['user_id'] ?? 0;
    $type = $data['type'] ?? 'system';
    $title = trim($data['title'] ?? '');
    $message = trim($data['message'] ?? '');
    $link = trim($data['link'] ?? '');
    
    if (!in_array($type, ['project', 'invoice', 'ticket', 'system'])) {
        sendError('Invalid notification type');
    }
    
    if (empty($title) || empty($message)) {
        sendError('Title and message are required');
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    try {
        $stmt->execute([$userId, $type, $title, $message, $link ?: null]);
        sendSuccess([
            'notification_id' => $pdo->lastInsertId(),
            'message' => 'Notification created successfully'
        ]);
    } catch (PDOException $e) {
        sendError('Failed to create notification: ' . $e->getMessage());
    }
    break;

default:
    sendError('Invalid action');
}
