<?php
/**
 * G-Nexus Authentication Routes - Part 2
 * Password reset, logout, profile management
 */

// This continues from auth_routes.php
// Add these cases to the switch statement

// =====================================================
// FORGOT PASSWORD
// =====================================================
case 'forgot-password':
    $data = json_decode(file_get_contents('php://input'), true);
    $email = trim($data['email'] ?? '');
    
    if (empty($email)) {
        sendError('Email is required');
    }
    
    $stmt = $pdo->prepare("SELECT * FROM cms_users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Don't reveal if email exists
        sendSuccess(['message' => 'If your email is in our system, you will receive password reset instructions.']);
        break;
    }
    
    // Generate reset token (expires in 1 hour)
    $resetToken = generateToken();
    $expiresAt = date('Y-m-d H:i:s', time() + 3600);
    
    $stmt = $pdo->prepare("
        UPDATE cms_users 
        SET password_reset_token = ?, password_reset_expires = ?
        WHERE id = ?
    ");
    $stmt->execute([$resetToken, $expiresAt, $user['id']]);
    
    // Queue email
    $resetUrl = ($_ENV['APP_URL'] ?? 'https://gnexuset.com') . '/auth/reset-password?token=' . $resetToken;
    $emailHtml = "
        <h1>Reset Your Password</h1>
        <p>Hi {$user['full_name']},</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <p><a href='$resetUrl' style='display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;'>Reset Password</a></p>
        <p style='color: #666;'>This link expires in 1 hour.</p>
        <p style='color: #666; font-size: 12px;'>If you didn't request this, please ignore this email.</p>
    ";
    
    queueEmail($pdo, $email, $user['full_name'], 'Reset your G-Nexus password', $emailHtml);
    
    sendSuccess(['message' => 'Password reset instructions sent to your email']);
    break;

// =====================================================
// RESET PASSWORD
// =====================================================
case 'reset-password':
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    
    if (empty($token) || empty($newPassword)) {
        sendError('Token and new password are required');
    }
    
    $passwordError = validatePassword($newPassword);
    if ($passwordError) {
        sendError($passwordError);
    }
    
    $stmt = $pdo->prepare("
        SELECT id FROM cms_users 
        WHERE password_reset_token = ? 
        AND password_reset_expires > NOW()
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendError('Invalid or expired reset token');
    }
    
    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("
        UPDATE cms_users 
        SET password = ?, 
            password_reset_token = NULL, 
            password_reset_expires = NULL,
            failed_login_attempts = 0,
            locked_until = NULL
        WHERE id = ?
    ");
    $stmt->execute([$hashedPassword, $user['id']]);
    
    // Invalidate all sessions for security
    $stmt = $pdo->prepare("DELETE FROM cms_sessions WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    
    sendSuccess(['message' => 'Password reset successfully. Please log in with your new password.']);
    break;

// =====================================================
// GET CURRENT USER
// =====================================================
case 'me':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    // Remove sensitive fields
    unset($user['password'], $user['email_verification_token'], $user['password_reset_token']);
    
    sendSuccess(['user' => $user]);
    break;

// =====================================================
// LOGOUT
// =====================================================
case 'logout':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches);
    $token = $matches[1] ?? '';
    
    // Delete this session
    $stmt = $pdo->prepare("DELETE FROM cms_sessions WHERE user_id = ? AND token = ?");
    $stmt->execute([$user['id'], $token]);
    
    sendSuccess(['message' => 'Logged out successfully']);
    break;

// =====================================================
// LOGOUT ALL (Invalidate all sessions)
// =====================================================
case 'logout-all':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    // Delete all sessions for this user
    $stmt = $pdo->prepare("DELETE FROM cms_sessions WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    
    sendSuccess(['message' => 'All sessions logged out']);
    break;

// =====================================================
// UPDATE PROFILE
// =====================================================
case 'update-profile':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fullName = trim($data['full_name'] ?? $user['full_name']);
    $bio = trim($data['bio'] ?? $user['bio'] ?? '');
    $avatarUrl = trim($data['avatar_url'] ?? $user['avatar_url'] ?? '');
    
    $stmt = $pdo->prepare("
        UPDATE cms_users 
        SET full_name = ?, bio = ?, avatar_url = ?
        WHERE id = ?
    ");
    $stmt->execute([$fullName, $bio, $avatarUrl, $user['id']]);
    
    // Get updated user
    $stmt = $pdo->prepare("SELECT * FROM cms_users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    unset($updatedUser['password'], $updatedUser['email_verification_token'], $updatedUser['password_reset_token']);
    
    sendSuccess(['user' => $updatedUser]);
    break;

// =====================================================
// CHANGE PASSWORD
// =====================================================
case 'change-password':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    
    if (empty($currentPassword) || empty($newPassword)) {
        sendError('Current and new password are required');
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        sendError('Current password is incorrect');
    }
    
    $passwordError = validatePassword($newPassword);
    if ($passwordError) {
        sendError($passwordError);
    }
    
    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("UPDATE cms_users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $user['id']]);
    
    // Invalidate all other sessions (keep current)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches);
    $currentToken = $matches[1] ?? '';
    
    $stmt = $pdo->prepare("DELETE FROM cms_sessions WHERE user_id = ? AND token != ?");
    $stmt->execute([$user['id'], $currentToken]);
    
    sendSuccess(['message' => 'Password changed successfully']);
    break;

// =====================================================
// GET USER SESSIONS
// =====================================================
case 'sessions':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    $stmt = $pdo->prepare("
        SELECT id, ip_address, user_agent, created_at, last_activity, expires_at, remember_me
        FROM cms_sessions 
        WHERE user_id = ? AND expires_at > NOW()
        ORDER BY last_activity DESC
    ");
    $stmt->execute([$user['id']]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['sessions' => $sessions]);
    break;

// =====================================================
// DELETE SESSION
// =====================================================
case 'delete-session':
    $user = getCurrentUser($pdo);
    
    if (!$user) {
        sendError('Not authenticated', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $sessionId = $data['session_id'] ?? '';
    
    $stmt = $pdo->prepare("DELETE FROM cms_sessions WHERE id = ? AND user_id = ?");
    $stmt->execute([$sessionId, $user['id']]);
    
    sendSuccess(['message' => 'Session deleted']);
    break;
