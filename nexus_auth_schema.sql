-- G-Nexus Custom Authentication Schema
-- Run this after nexus_core_schema.sql

-- =====================================================
-- Update cms_users Table for Authentication
-- =====================================================

ALTER TABLE cms_users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) NULL,
ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS bio TEXT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verified ON cms_users(email_verified);
CREATE INDEX IF NOT EXISTS idx_is_active ON cms_users(is_active);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON cms_users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON cms_users(password_reset_token);

-- =====================================================
-- Email Queue Table (for async email sending)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255) NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    html_body TEXT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sent (sent),
    INDEX idx_created (created_at)
);

-- =====================================================
-- Update cms_sessions Table
-- =====================================================

-- Ensure sessions table has proper structure
CREATE TABLE IF NOT EXISTS cms_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    remember_me BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cms_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_token (token(255))
);

-- =====================================================
-- Login History Table (for security audit)
-- =====================================================

CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cms_users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_created (created_at),
    INDEX idx_success (success)
);

-- =====================================================
-- Cleanup old sessions (optional, run periodically)
-- =====================================================

-- Delete expired sessions
-- DELETE FROM cms_sessions WHERE expires_at < NOW();

-- Delete old login history (keep 90 days)
-- DELETE FROM login_history WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
