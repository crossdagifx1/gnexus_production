<?php
/**
 * Security Middleware for Advanced AI Chat Features
 * Handles: CSRF protection, Rate limiting, XSS prevention, File validation
 */

// CSRF Token Management
class CSRFProtection {
    private static function getToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function validateToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public static function requireToken() {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!self::validateToken($token)) {
            http_response_code(403);
            die(json_encode(['success' => false, 'error' => 'Invalid CSRF token']));
        }
    }
}

// Rate Limiting
class RateLimiter {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function checkLimit($userId, $action, $maxAttempts, $windowSeconds) {
        // Clean old attempts
        $stmt = $this->pdo->prepare("
            DELETE FROM rate_limits 
            WHERE user_id = ? AND action = ? AND created_at < DATE_SUB(NOW(), INTERVAL ? SECOND)
        ");
        $stmt->execute([$userId, $action, $windowSeconds]);
        
        // Count recent attempts
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as count FROM rate_limits 
            WHERE user_id = ? AND action = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
        ");
        $stmt->execute([$userId, $action, $windowSeconds]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] >= $maxAttempts) {
            http_response_code(429);
            die(json_encode([
                'success' => false,
                'error' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $windowSeconds
            ]));
        }
        
        // Log this attempt
        $stmt = $this->pdo->prepare("
            INSERT INTO rate_limits (user_id, action, ip_address, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $action, $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    }
}

// File Upload Validation
class FileValidator {
    private static $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ];
    
    private static $maxFileSize = 10 * 1024 * 1024; // 10MB
    
    public static function validateUpload($file) {
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('Invalid file upload');
        }
        
        // Check file size
        if ($file['size'] > self::$maxFileSize) {
            throw new Exception('File size exceeds 10MB limit');
        }
        
        // Check MIME type (both declared and actual)
        $declaredMime = $file['type'];
        $actualMime = mime_content_type($file['tmp_name']);
        
        if (!in_array($declaredMime, self::$allowedMimeTypes) || 
            !in_array($actualMime, self::$allowedMimeTypes)) {
            throw new Exception('Invalid file type. Only images allowed.');
        }
        
        // Verify it's actually an image
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            throw new Exception('File is not a valid image');
        }
        
        // Check for PHP code in image (basic check)
        $contents = file_get_contents($file['tmp_name']);
        if (preg_match('/<\?php|<\?=|<script/i', $contents)) {
            throw new Exception('File contains suspicious content');
        }
        
        return true;
    }
    
    public static function sanitizeFilename($filename) {
        // Remove path components
        $filename = basename($filename);
        
        // Remove non-alphanumeric characters (except dots and dashes)
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        
        // Generate unique name to prevent overwriting
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        return uniqid('upload_', true) . '.' . $ext;
    }
}

// XSS Prevention
class XSSProtection {
    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        
        // Remove null bytes
        $input = str_replace(chr(0), '', $input);
        
        // HTML entity encoding for display
        return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    public static function sanitizeOutput($output) {
        // For JSON output, ensure proper encoding
        return json_encode($output, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    }
    
    public static function setSecurityHeaders() {
        // Content Security Policy
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://openrouter.ai");
        
        // XSS Protection
        header("X-XSS-Protection: 1; mode=block");
        
        // Prevent MIME sniffing
        header("X-Content-Type-Options: nosniff");
        
        // Frame options
        header("X-Frame-Options: SAMEORIGIN");
        
        // Referrer policy
        header("Referrer-Policy: strict-origin-when-cross-origin");
        
        // HSTS (if using HTTPS)
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
        }
    }
}

// SQL Injection Prevention Helper
class SQLSafeQuery {
    public static function prepare($pdo, $query, $params = []) {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }
    
    public static function escapeIdentifier($identifier) {
        // Only allow alphanumeric and underscores
        return preg_replace('/[^a-zA-Z0-9_]/', '', $identifier);
    }
}

// Initialize security headers on every request
XSSProtection::setSecurityHeaders();

// Create rate_limits table if not exists
function createRateLimitTable($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action VARCHAR(100),
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_action (user_id, action, created_at),
            INDEX idx_cleanup (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}
