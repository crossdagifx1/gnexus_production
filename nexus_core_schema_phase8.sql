-- Phase 8: Message Management Schema
-- Add columns for edit/delete tracking

-- Add edit tracking columns to messages table
ALTER TABLE ai_chat_messages
ADD COLUMN edited_at TIMESTAMP NULL AFTER created_at,
ADD COLUMN edit_count INT DEFAULT 0 AFTER edited_at,
ADD COLUMN deleted_at TIMESTAMP NULL AFTER edit_count,
ADD COLUMN deleted_by INT NULL AFTER deleted_at;

-- Create message history table for tracking edits
CREATE TABLE IF NOT EXISTS ai_chat_message_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    old_content TEXT NOT NULL,
    edited_by INT NOT NULL,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edit_reason VARCHAR(255),
    INDEX idx_message (message_id),
    INDEX idx_edited_by (edited_by),
    FOREIGN KEY (message_id) REFERENCES ai_chat_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create drafts table for auto-save
CREATE TABLE IF NOT EXISTS ai_chat_drafts (
    conversation_id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES cms_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for deleted messages
CREATE INDEX idx_deleted ON ai_chat_messages(deleted_at);
