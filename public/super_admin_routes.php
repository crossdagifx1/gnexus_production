<?php
/**
 * Super Admin Management Routes
 * 
 * Additional routes for super admin to control everything:
 * - User management (create, edit, delete, change roles)
 * - System settings
 * - Database management
 * - Activity monitoring
 */

// Verify admin access
requireAdmin();

$action = $_GET['action'] ?? '';

switch ($action) {
    // ============================================
    // USER MANAGEMENT
    // ============================================
    
    case 'admin_users':
        // Get all users in the system
        try {
            $stmt = $pdo->prepare("
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.full_name,
                    u.role,
                    u.is_verified,
                    u.created_at,
                    u.last_login,
                    c.id as client_id,
                    c.company_name
                FROM cms_users u
                LEFT JOIN clients c ON c.user_id = u.id
                ORDER BY u.created_at DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll();
            
            sendResponse(['users' => $users]);
        } catch (PDOException $e) {
            sendError('Failed to fetch users: ' . $e->getMessage());
        }
        break;
    
    case 'create_user':
        // Create a new user (admin only)
        try {
            $data = getJsonInput();
            
            // Validate required fields
            if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                sendError('Username, email, and password are required');
            }
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM cms_users WHERE username = ? OR email = ?");
            $stmt->execute([$data['username'], $data['email']]);
            if ($stmt->fetch()) {
                sendError('User with this username or email already exists');
            }
            
            // Hash password
            $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            
            // Insert user
            $stmt = $pdo->prepare("
                INSERT INTO cms_users (
                    username, email, password_hash, full_name, role, is_verified, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $stmt->execute([
                $data['username'],
                $data['email'],
                $passwordHash,
                $data['full_name'] ?? '',
                $data['role'] ?? 'user',
                $data['is_verified'] ?? 0
            ]);
            
            $userId = $pdo->lastInsertId();
            
            // If role is admin or user, create client account
            if (in_array($data['role'] ?? 'user', ['user', 'admin'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO clients (
                        user_id, company_name, contact_person, contact_email, 
                        account_status, onboarding_date, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
                ");
                
                $stmt->execute([
                    $userId,
                    $data['company_name'] ?? 'Personal',
                    $data['full_name'] ?? '',
                    $data['email']
                ]);
            }
            
            sendResponse(['message' => 'User created successfully', 'user_id' => $userId]);
            
        } catch (PDOException $e) {
            sendError('Failed to create user: ' . $e->getMessage());
        }
        break;
    
    case 'update_user':
        // Update user details (admin only)
        try {
            $data = getJsonInput();
            $userId = $data['user_id'] ?? 0;
            
            if (!$userId) {
                sendError('User ID is required');
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['full_name'])) {
                $updates[] = 'full_name = ?';
                $params[] = $data['full_name'];
            }
            if (isset($data['email'])) {
                $updates[] = 'email = ?';
                $params[] = $data['email'];
            }
            if (isset($data['role'])) {
                $updates[] = 'role = ?';
                $params[] = $data['role'];
            }
            if (isset($data['is_verified'])) {
                $updates[] = 'is_verified = ?';
                $params[] = $data['is_verified'];
            }
            
            $updates[] = 'updated_at = NOW()';
            $params[] = $userId;
            
            $sql = "UPDATE cms_users SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            sendResponse(['message' => 'User updated successfully']);
            
        } catch (PDOException $e) {
            sendError('Failed to update user: ' . $e->getMessage());
        }
        break;
    
    case 'delete_user':
        // Delete user (admin only) - soft delete by deactivating
        try {
            $userId = $_GET['user_id'] ?? 0;
            
            if (!$userId) {
                sendError('User ID is required');
            }
            
            // Don't allow deleting yourself
            if ($userId == $userId) {
                sendError('Cannot delete your own account');
            }
            
            // Update related records first
            $pdo->beginTransaction();
            
            // Set client account to suspended
            $stmt = $pdo->prepare("UPDATE clients SET account_status = 'suspended' WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            // Mark user as inactive (soft delete)
            $stmt = $pdo->prepare("
                UPDATE cms_users 
                SET role = 'inactive', updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$userId]);
            
            $pdo->commit();
            
            sendResponse(['message' => 'User deactivated successfully']);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            sendError('Failed to delete user: ' . $e->getMessage());
        }
        break;
    
    case 'change_user_password':
        // Change any user's password (super admin only)
        try {
            $data = getJsonInput();
            $userId = $data['user_id'] ?? 0;
            $newPassword = $data['new_password'] ?? '';
            
            if (!$userId || !$newPassword) {
                sendError('User ID and new password are required');
            }
            
            $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt = $pdo->prepare("
                UPDATE cms_users 
                SET password_hash = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$passwordHash, $userId]);
            
            sendResponse(['message' => 'Password changed successfully']);
            
        } catch (PDOException $e) {
            sendError('Failed to change password: ' . $e->getMessage());
        }
        break;
    
    // ============================================
    // SYSTEM SETTINGS
    // ============================================
    
    case 'system_stats':
        // Get system-wide statistics
        try {
            $stats = [];
            
            // Total users
            $stmt = $pdo->query("SELECT COUNT(*) FROM cms_users WHERE role != 'inactive'");
            $stats['total_users'] = $stmt->fetchColumn();
            
            // Total clients
            $stmt = $pdo->query("SELECT COUNT(*) FROM clients WHERE account_status = 'active'");
            $stats['total_clients'] = $stmt->fetchColumn();
            
            // Total projects
            $stmt = $pdo->query("SELECT COUNT(*) FROM projects");
            $stats['total_projects'] = $stmt->fetchColumn();
            
            // Total invoices
            $stmt = $pdo->query("SELECT COUNT(*) FROM invoices");
            $stats['total_invoices'] = $stmt->fetchColumn();
            
            // Total revenue
            $stmt = $pdo->query("SELECT SUM(amount) FROM invoices WHERE status IN ('paid', 'sent')");
            $stats['total_revenue'] = floatval($stmt->fetchColumn());
            
            // Pending revenue
            $stmt = $pdo->query("SELECT SUM(amount) FROM invoices WHERE status IN ('sent', 'overdue')");
            $stats['pending_revenue'] = floatval($stmt->fetchColumn());
            
            // Open tickets
            $stmt = $pdo->query("SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in-progress')");
            $stats['open_tickets'] = $stmt->fetchColumn();
            
            // Recent activity count
            $stmt = $pdo->query("SELECT COUNT(*) FROM activity_log WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            $stats['recent_activity'] = $stmt->fetchColumn();
            
            sendResponse(['stats' => $stats]);
            
        } catch (PDOException $e) {
            sendError('Failed to fetch system stats: ' . $e->getMessage());
        }
        break;
    
    case 'activity_log':
        // Get all system activity
        try {
            $limit = intval($_GET['limit'] ?? 100);
            $offset = intval($_GET['offset'] ?? 0);
            
            $stmt = $pdo->prepare("
                SELECT 
                    a.*,
                    u.username,
                    u.full_name
                FROM activity_log a
                LEFT JOIN cms_users u ON a.user_id = u.id
                ORDER BY a.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            $logs = $stmt->fetchAll();
            
            sendResponse(['activity_log' => $logs]);
            
        } catch (PDOException $e) {
            sendError('Failed to fetch activity log: ' . $e->getMessage());
        }
        break;
    
    case 'clear_old_logs':
        // Clear activity logs older than X days
        try {
            $days = intval($_GET['days'] ?? 90);
            
            $stmt = $pdo->prepare("DELETE FROM activity_log WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)");
            $stmt->execute([$days]);
            
            $deleted = $stmt->rowCount();
            
            sendResponse(['message' => "Deleted $deleted old log entries"]);
            
        } catch (PDOException $e) {
            sendError('Failed to clear logs: ' . $e->getMessage());
        }
        break;
    
    default:
        sendError('Invalid action for super admin routes');
}
