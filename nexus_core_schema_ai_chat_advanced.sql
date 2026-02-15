-- Advanced AI Chat Features - Additional Tables

-- Attachments for images and files
CREATE TABLE IF NOT EXISTS ai_chat_attachments (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    type ENUM('image', 'file', 'code', 'audio') NOT NULL DEFAULT 'file',
    file_path VARCHAR(500),
    file_url VARCHAR(1000),
    thumbnail_path VARCHAR(500),
    mime_type VARCHAR(100),
    file_size INT UNSIGNED,
    width INT,
    height INT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    INDEX idx_message_id (message_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation sharing
CREATE TABLE IF NOT EXISTS ai_chat_shares (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    shared_by_user_id INT,
    shared_with_user_id INT,
    share_link VARCHAR(100) UNIQUE NOT NULL,
    access_level ENUM('view', 'comment', 'edit') DEFAULT 'view',
    view_count INT UNSIGNED DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP NULL,
    FOREIGN KEY (conversation_id) REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
    INDEX idx_share_link (share_link),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message reactions
CREATE TABLE IF NOT EXISTS ai_chat_reactions (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    user_id INT,
   session_id VARCHAR(255),
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_reaction (message_id, user_id, emoji),
    INDEX idx_message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message threads
CREATE TABLE IF NOT EXISTS ai_chat_threads (
    id VARCHAR(36) PRIMARY KEY,
    parent_message_id VARCHAR(36) NOT NULL,
    reply_message_id VARCHAR(36) NOT NULL,
    depth INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_message_id) REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_message_id) REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    INDEX idx_parent (parent_message_id),
    INDEX idx_reply (reply_message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Code execution logs
CREATE TABLE IF NOT EXISTS ai_chat_code_executions (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36),
    user_id INT,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    output TEXT,
    exit_code INT,
    execution_time_ms INT,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audio transcription cache
CREATE TABLE IF NOT EXISTS ai_chat_audio_cache (
    id VARCHAR(36) PRIMARY KEY,
    file_hash VARCHAR(64) UNIQUE NOT NULL,
    transcription TEXT NOT NULL,
    language VARCHAR(10),
    duration_seconds DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_file_hash (file_hash),
    INDEX idx_last_used (last_used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TTS audio cache
CREATE TABLE IF NOT EXISTS ai_chat_tts_cache (
    id VARCHAR(36) PRIMARY KEY,
    text_hash VARCHAR(64) UNIQUE NOT NULL,
    voice VARCHAR(50) NOT NULL,
    audio_path VARCHAR(500) NOT NULL,
    audio_url VARCHAR(1000),
    duration_seconds DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_text_hash (text_hash),
    INDEX idx_last_used (last_used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
