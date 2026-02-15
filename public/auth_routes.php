<?php
/**
 * G-Nexus Authentication Routes
 * Handles user registration, login, password reset, email verification
 */

// Include main API for database connection
require_once __DIR__ . '/api.php';
require_once __DIR__ . '/security_middleware.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$rateLimiter = new RateLimiter($pdo);

// Helper function to generate secure random token
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Helper function to generate JWT
function generateJWT($userId, $email, $expiresIn = 86400) {
    $secretKey = $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-this';
    $issuedAt = time();
    $expire = $issuedAt + $expiresIn;
    
    $payload = [
        'user_id' => $userId,
        'email' => $email,
        'iat' => $issuedAt,
        'exp' => $expire
    ];
    
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$payload", $secretKey, true);
    $signature = base64_encode($signature);
    
    return "$header.$payload.$signature";
}

// Helper function to verify JWT
function verifyJWT($token) {
    $secretKey = $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-this';
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $secretKey, true));
    
    if ($signature !== $validSignature) {
        return false;
    }
    
    $payloadData = json_decode(base64_decode($payload), true);
    
    if ($payloadData['exp'] < time()) {
        return false; // Token expired
    }
    
    return $payloadData;
}

// Helper function to get current user from JWT
function getCurrentUser($pdo) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    $payload = verifyJWT($token);
    
    if (!$payload) {
        return null;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM cms_users WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$payload['user_id']]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Helper function to queue email
function queueEmail($pdo, $toEmail, $toName, $subject, $htmlBody) {
    $stmt = $pdo->prepare("
        INSERT INTO email_queue (to_email, to_name, subject, html_body) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$toEmail, $toName, $subject, $htmlBody]);
}

// Helper function to validate password strength
function validatePassword($password) {
    if (strlen($password) < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!preg_match('/[A-Z]/', $password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!preg_match('/[a-z]/', $password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!preg_match('/[0-9]/', $password)) {
        return "Password must contain at least one number";
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        return "Password must contain at least one special character";
    }
    return null; // Valid
}

switch ($action) {
    
// =====================================================
// REGISTER
// =====================================================
case 'register':
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $fullName = trim($data['full_name'] ?? '');
    
    // Validate input
    if (empty($username) || empty($email) || empty($password)) {
        sendError('All fields are required');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email address');
    }
    
    $passwordError = validatePassword($password);
    if ($passwordError) {
        sendError($passwordError);
    }
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM cms_users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        sendError('Email or username already exists');
    }
    
    // Create user
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $verificationToken = generateToken();
    
    $stmt = $pdo->prepare("
        INSERT INTO cms_users (username, email, password, full_name, email_verification_token, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    try {
        $stmt->execute([$username, $email, $hashedPassword, $fullName, $verificationToken]);
        $userId = $pdo->lastInsertId();
        
        // Queue verification email
        $verifyUrl = ($_ENV['APP_URL'] ?? 'https://gnexuset.com') . '/auth/verify-email?token=' . $verificationToken;
        $emailHtml = "
            <h1>Welcome to G-Nexus AI Suite!</h1>
            <p>Hi $fullName,</p>
            <p>Thank you for creating an account. Please verify your email address to get started.</p>
            <p><a href='$verifyUrl' style='display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;'>Verify Email Address</a></p>
            <p style='color: #666;'>This link expires in 24 hours.</p>
            <p style='color: #666; font-size: 12px;'>If you didn't create this account, please ignore this email.</p>
        ";
        
        queueEmail($pdo, $email, $fullName, 'Verify your G-Nexus account', $emailHtml);
        
        sendSuccess([
            'message' => 'Account created successfully! Please check your email to verify your account.',
            'user_id' => $userId
        ]);
        
    } catch (PDOException $e) {
        sendError('Registration failed: ' . $e->getMessage());
    }
    break;

// =====================================================
// LOGIN
// =====================================================
case 'login':
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $rememberMe = $data['remember_me'] ?? false;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    if (empty($email) || empty($password)) {
        sendError('Email and password are required');
    }
    
    // Rate limiting
    if (!$rateLimiter->checkLimit(0, 'login_' . $email, 5, 900)) {
        sendError('Too many login attempts. Please try again in 15 minutes.');
    }
    
    // Get user
    $stmt = $pdo->prepare("SELECT * FROM cms_users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log login attempt
    $loginSuccess = false;
    $failureReason = null;
    
    if (!$user) {
        $failureReason = 'User not found';
    } elseif (!$user['is_active']) {
        $failureReason = 'Account is disabled';
    } elseif ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
        $failureReason = 'Account is temporarily locked';
    } elseif (!password_verify($password, $user['password'])) {
        $failureReason = 'Invalid password';
        
        // Increment failed attempts
        $attempts = ($user['failed_login_attempts'] ?? 0) + 1;
        $lockedUntil = null;
        
        if ($attempts >= 5) {
            $lockedUntil = date('Y-m-d H:i:s', time() + 900); // Lock for 15 minutes
        }
        
        $stmt = $pdo->prepare("
            UPDATE cms_users 
            SET failed_login_attempts = ?, locked_until = ?
            WHERE id = ?
        ");
        $stmt->execute([$attempts, $lockedUntil, $user['id']]);
    } else {
        $loginSuccess = true;
    }
    
    // Log to login_history
    $stmt = $pdo->prepare("
        INSERT INTO login_history (user_id, email, ip_address, user_agent, success, failure_reason)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user['id'] ?? null,
        $email,
        $ipAddress,
        $userAgent,
        $loginSuccess,
        $failureReason
    ]);
    
    if (!$loginSuccess) {
        sendError($failureReason ?? 'Login failed');
    }
    
    // Check email verification
    if (!$user['email_verified']) {
        sendError('Please verify your email before logging in');
    }
    
    // Reset failed attempts
    $stmt = $pdo->prepare("
        UPDATE cms_users 
        SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), last_login_ip = ?
        WHERE id = ?
    ");
    $stmt->execute([$ipAddress, $user['id']]);
    
    // Generate JWT
    $expiresIn = $rememberMe ? 604800 : 86400; // 7 days or 1 day
    $token = generateJWT($user['id'], $user['email'], $expiresIn);
    
    // Create session
    $sessionId = generateToken(16);
    $stmt = $pdo->prepare("
        INSERT INTO cms_sessions (id, user_id, token, ip_address, user_agent, expires_at, remember_me)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $sessionId,
        $user['id'],
        $token,
        $ipAddress,
        $userAgent,
        date('Y-m-d H:i:s', time() + $expiresIn),
        $rememberMe
    ]);
    
    // Return user data (exclude password)
    unset($user['password'], $user['email_verification_token'], $user['password_reset_token']);
    
    sendSuccess([
        'token' => $token,
        'user' => $user,
        'expires_in' => $expiresIn
    ]);
    break;

// =====================================================
// VERIFY EMAIL
// =====================================================
case 'verify-email':
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? '';
    
    if (empty($token)) {
        sendError('Verification token is required');
    }
    
    $stmt = $pdo->prepare("
        SELECT id, email, full_name 
        FROM cms_users 
        WHERE email_verification_token = ? AND email_verified = FALSE
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendError('Invalid or expired verification token');
    }
    
    // Mark as verified
    $stmt = $pdo->prepare("
        UPDATE cms_users 
        SET email_verified = TRUE, email_verified_at = NOW(), email_verification_token = NULL
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);
    
    sendSuccess(['message' => 'Email verified successfully! You can now log in.']);
    break;

// =====================================================
// RESEND VERIFICATION
// =====================================================
case 'resend-verification':
    $data = json_decode(file_get_contents('php://input'), true);
    $email = trim($data['email'] ?? '');
    
    if (empty($email)) {
        sendError('Email is required');
    }
    
    $stmt = $pdo->prepare("SELECT * FROM cms_users WHERE email = ? AND email_verified = FALSE");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Don't reveal if email exists
        sendSuccess(['message' => 'If your email is in our system, you will receive a verification email.']);
        break;
    }
    
    // Generate new token
    $newToken = generateToken();
    $stmt = $pdo->prepare("UPDATE cms_users SET email_verification_token = ? WHERE id = ?");
    $stmt->execute([$newToken, $user['id']]);
    
    // Queue email
    $verifyUrl = ($_ENV['APP_URL'] ?? 'https://gnexuset.com') . '/auth/verify-email?token=' . $newToken;
    $emailHtml = "
        <h1>Verify Your Email</h1>
        <p>Hi {$user['full_name']},</p>
        <p>Click below to verify your email address:</p>
        <p><a href='$verifyUrl' style='display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;'>Verify Email</a></p>
    ";
    
    queueEmail($pdo, $email, $user['full_name'], 'Verify your G-Nexus account', $emailHtml);
    
    sendSuccess(['message' => 'Verification email sent']);
    break;

// More endpoints in next file due to length...

default:
    sendError('Invalid action');
}
