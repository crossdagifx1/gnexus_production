-- G-Nexus "Nexus Core" Enterprise Schema
-- Version: 1.1.0
-- Description: Million-dollar database architecture for Headless CMS, RBAC, Audit Logging, and Advanced Admin Modules.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- =============================================================================
-- 1. ACCESS CONTROL (RBAC)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `cms_roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `permissions` json DEFAULT NULL COMMENT 'JSON array of permission strings',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Roles
INSERT INTO `cms_roles` (`id`, `name`, `permissions`, `description`) VALUES
('role_super_admin', 'Super Admin', '["*"]', 'Full system access'),
('role_editor', 'Editor', '["view_all", "create_content", "edit_content", "publish_content"]', 'Can manage content but not system settings'),
('role_author', 'Author', '["view_own", "create_content", "edit_own"]', 'Can create and edit their own drafts'),
('role_viewer', 'Viewer', '["view_all"]', 'Read-only access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

CREATE TABLE IF NOT EXISTS `cms_users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role_id` varchar(36) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `cms_roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. CONTENT MODULES
-- =============================================================================

-- Portfolio Engine
CREATE TABLE IF NOT EXISTS `cms_projects` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `content` longtext COMMENT 'Rich text or JSON block content',
  `client` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `technologies` json DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `gallery_urls` json DEFAULT NULL,
  `project_url` varchar(500) DEFAULT NULL,
  `featured` boolean DEFAULT FALSE,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `display_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `status` (`status`),
  KEY `category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Content Studio (Blog)
CREATE TABLE IF NOT EXISTS `cms_posts` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `excerpt` text,
  `content` longtext COMMENT 'Rich text or JSON block content',
  `author_id` varchar(36) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `read_time_min` int DEFAULT 5,
  `featured` boolean DEFAULT FALSE,
  `trending` boolean DEFAULT FALSE,
  `status` enum('draft','review','published','archived') DEFAULT 'draft',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `views` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Experience Manager (Site Components)
CREATE TABLE IF NOT EXISTS `cms_components` (
  `id` varchar(36) NOT NULL,
  `key` varchar(100) NOT NULL COMMENT 'Unique identifier e.g., home_hero_text',
  `type` enum('text','image','json','feature_flag') NOT NULL,
  `value` longtext,
  `description` varchar(255) DEFAULT NULL,
  `group` varchar(50) DEFAULT 'general',
  `is_system` boolean DEFAULT FALSE COMMENT 'If true, cannot be deleted',
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Platform Hub
CREATE TABLE IF NOT EXISTS `cms_platforms` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `icon` varchar(50) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `status` enum('active','maintenance','development','deprecated') DEFAULT 'development',
  `version` varchar(20) DEFAULT NULL,
  `display_order` int DEFAULT 0,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Manager
CREATE TABLE IF NOT EXISTS `cms_services` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `icon` varchar(50) DEFAULT NULL,
  `features` json DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general',
  `display_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Manager (Public Profiles)
CREATE TABLE IF NOT EXISTS `cms_team_members` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  `bio` text,
  `image_url` varchar(500) DEFAULT NULL,
  `skills` json DEFAULT NULL COMMENT 'Array of {name, level}',
  `social_links` json DEFAULT NULL COMMENT 'Array of {platform, url}',
  `display_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Operations Hub (Inquiries/Leads)
CREATE TABLE IF NOT EXISTS `cms_inquiries` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text,
  `status` enum('new','read','replied','archived') DEFAULT 'new',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. SYSTEM & SECURITY
-- =============================================================================

-- Media Library
CREATE TABLE IF NOT EXISTS `cms_media` (
  `id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size_bytes` bigint NOT NULL,
  `url` varchar(500) NOT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS `cms_audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `action` varchar(50) NOT NULL COMMENT 'create, update, delete, login, etc.',
  `resource_type` varchar(50) NOT NULL COMMENT 'project, post, user, etc.',
  `resource_id` varchar(36) DEFAULT NULL,
  `changes` json DEFAULT NULL COMMENT 'Before/After values',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add basic text search indexes
ALTER TABLE `cms_projects` ADD FULLTEXT KEY `ft_project` (`title`, `description`);
ALTER TABLE `cms_posts` ADD FULLTEXT KEY `ft_post` (`title`, `excerpt`, `content`);
-- =============================================================================
-- AI CHAT SYSTEM TABLES
-- =============================================================================
-- Complete AI chat infrastructure with provider management, cost tracking,
-- analytics, and comprehensive admin controls
-- =============================================================================

-- AI Providers Configuration (Admin Managed)
CREATE TABLE IF NOT EXISTS `ai_providers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Display name (e.g., OpenRouter, OpenAI)',
  `slug` varchar(50) NOT NULL COMMENT 'Unique identifier',
  `api_key` text NOT NULL COMMENT 'Encrypted API key',
  `api_endpoint` varchar(255) DEFAULT NULL COMMENT 'Custom API endpoint if needed',
  `is_enabled` boolean DEFAULT TRUE COMMENT 'Admin can enable/disable',
  `priority` int DEFAULT 100 COMMENT 'Lower number = higher priority',
  `config` json DEFAULT NULL COMMENT 'Provider-specific config',
  `rate_limit_per_minute` int DEFAULT 60,
  `rate_limit_per_day` int DEFAULT 10000,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  INDEX `idx_enabled` (`is_enabled`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Models Configuration (Admin Managed)
CREATE TABLE IF NOT EXISTS `ai_models` (
  `id` varchar(36) NOT NULL,
  `provider_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Internal name',
  `model_id` varchar(200) NOT NULL COMMENT 'Provider model ID (e.g., gpt-4-turbo)',
  `display_name` varchar(100) NOT NULL COMMENT 'User-friendly name',
  `description` text DEFAULT NULL,
  `category` enum('general','coding','analysis','creative','reasoning') DEFAULT 'general',
  `context_window` int DEFAULT 4096 COMMENT 'Max context tokens',
  `max_tokens` int DEFAULT 2000 COMMENT 'Max output tokens',
  `cost_per_1k_input` decimal(10,6) DEFAULT 0 COMMENT 'USD per 1k input tokens',
  `cost_per_1k_output` decimal(10,6) DEFAULT 0 COMMENT 'USD per 1k output tokens',
  `is_enabled` boolean DEFAULT TRUE,
  `is_default` boolean DEFAULT FALSE COMMENT 'Default for category',
  `supports_vision` boolean DEFAULT FALSE,
  `supports_function_calling` boolean DEFAULT FALSE,
  `supports_streaming` boolean DEFAULT TRUE,
  `config` json DEFAULT NULL COMMENT 'Model-specific parameters',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`provider_id`) REFERENCES `ai_providers`(`id`) ON DELETE CASCADE,
  INDEX `idx_enabled` (`is_enabled`),
  INDEX `idx_category` (`category`),
  INDEX `idx_default` (`is_default`),
  UNIQUE KEY `unique_provider_model` (`provider_id`, `model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Conversations
CREATE TABLE IF NOT EXISTS `ai_chat_conversations` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL COMMENT 'NULL for guest users',
  `session_id` varchar(100) DEFAULT NULL COMMENT 'For guest tracking',
  `title` varchar(255) NOT NULL DEFAULT 'New Chat',
  `model` varchar(100) NOT NULL COMMENT 'Current model being used',
  `provider` varchar(50) NOT NULL COMMENT 'Current provider',
  `system_prompt` text DEFAULT NULL COMMENT 'Custom system instructions',
  `temperature` decimal(3,2) DEFAULT 0.70 COMMENT 'Response randomness (0-1)',
  `max_tokens` int DEFAULT 2000,
  `status` enum('active','archived','deleted') DEFAULT 'active',
  `is_pinned` boolean DEFAULT FALSE,
  `tags` json DEFAULT NULL COMMENT 'Array of tag strings',
  `metadata` json DEFAULT NULL COMMENT 'tokens_used, total_cost, rating, etc.',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'For rate limiting/abuse',
  `user_agent` text DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `cms_users`(`id`) ON DELETE SET NULL,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_session` (`session_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_pinned` (`is_pinned`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_last_message` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Messages
CREATE TABLE IF NOT EXISTS `ai_chat_messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) NOT NULL,
  `role` enum('user','assistant','system') NOT NULL,
  `content` longtext NOT NULL,
  `model` varchar(100) DEFAULT NULL COMMENT 'Model used for this response',
  `tokens_input` int DEFAULT NULL,
  `tokens_output` int DEFAULT NULL,
  `cost` decimal(10,6) DEFAULT NULL COMMENT 'USD cost for this message',
  `reasoning` text DEFAULT NULL COMMENT 'Thinking process for reasoning models',
  `attachments` json DEFAULT NULL COMMENT 'Files, images uploaded',
  `metadata` json DEFAULT NULL COMMENT 'response_time_ms, finish_reason, etc.',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `ai_chat_conversations`(`id`) ON DELETE CASCADE,
  INDEX `idx_conversation` (`conversation_id`),
  INDEX `idx_role` (`role`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Ratings & Feedback
CREATE TABLE IF NOT EXISTS `ai_chat_ratings` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL COMMENT 'Specific message rated, NULL = entire conversation',
  `rating` int NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `feedback` text DEFAULT NULL COMMENT 'Optional user feedback',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `ai_chat_conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`message_id`) REFERENCES `ai_chat_messages`(`id`) ON DELETE CASCADE,
  INDEX `idx_conversation` (`conversation_id`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics (Daily Aggregates)
CREATE TABLE IF NOT EXISTS `ai_chat_analytics` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `provider` varchar(50) NOT NULL,
  `model` varchar(100) NOT NULL,
  `total_conversations` int DEFAULT 0,
  `total_messages` int DEFAULT 0,
  `total_tokens_input` bigint DEFAULT 0,
  `total_tokens_output` bigint DEFAULT 0,
  `total_cost` decimal(10,2) DEFAULT 0,
  `avg_response_time_ms` int DEFAULT 0,
  `error_count` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_date_provider_model` (`date`, `provider`, `model`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Global Chat Settings (Admin Controlled)
CREATE TABLE IF NOT EXISTS `ai_chat_settings` (
  `key` varchar(100) NOT NULL,
  `value` json NOT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Settings
INSERT INTO `ai_chat_settings` (`key`, `value`, `description`) VALUES
('general', '{"enable_guest_chat": true, "max_messages_per_conversation": 100, "auto_archive_days": 30, "require_email_for_guests": false}', 'General chat behavior'),
('rate_limiting', '{"guest_messages_per_minute": 10, "guest_messages_per_day": 100, "user_messages_per_minute": 30, "user_messages_per_day": 1000}', 'Rate limiting configuration'),
('ui_customization', '{"theme": "dark", "welcome_message": "Hi! I am your AI assistant. How can I help you today?", "quick_replies": ["Tell me about your services", "I need help", "Talk to sales"]}', 'UI appearance and behavior'),
('ai_behavior', '{"default_temperature": 0.7, "default_max_tokens": 2000, "safety_filter": true, "content_moderation": true}', 'Default AI parameters'),
('notifications', '{"admin_email_on_new_chat": false, "admin_email_on_error": true, "cost_threshold_alert": 100}', 'Alert and notification settings')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- System Prompts Library
CREATE TABLE IF NOT EXISTS `ai_chat_prompts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(50) DEFAULT NULL COMMENT 'coding, support, sales, etc.',
  `is_public` boolean DEFAULT FALSE COMMENT 'Available to clients',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  FOREIGN KEY (`created_by`) REFERENCES `cms_users`(`id`) ON DELETE SET NULL,
  INDEX `idx_category` (`category`),
  INDEX `idx_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quick Reply Templates
CREATE TABLE IF NOT EXISTS `ai_chat_quick_replies` (
  `id` varchar(36) NOT NULL,
  `title` varchar(100) NOT NULL,
  `prompt` text NOT NULL,
  `icon` varchar(50) DEFAULT NULL COMMENT 'Icon name or emoji',
  `category` varchar(50) DEFAULT NULL,
  `display_order` int DEFAULT 0,
  `is_enabled` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_enabled` (`is_enabled`),
  INDEX `idx_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Quick Replies
INSERT INTO `ai_chat_quick_replies` (`id`, `title`, `prompt`, `icon`, `category`, `display_order`) VALUES
(UUID(), 'Explain Code', 'Explain this code in simple terms: ', '💡', 'coding', 1),
(UUID(), 'Summarize', 'Summarize the following: ', '📝', 'productivity', 2),
(UUID(), 'Translate', 'Translate to Amharic: ', '🌍', 'language', 3),
(UUID(), 'Fix Bug', 'Help me debug this code: ', '🐛', 'coding', 4),
(UUID(), 'Get Started', 'What can you help me with?', '🚀', 'general', 5);

-- Banned Users / IP Addresses
CREATE TABLE IF NOT EXISTS `ai_chat_banned_users` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `banned_until` timestamp NULL DEFAULT NULL COMMENT 'NULL = permanent ban',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `cms_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `cms_users`(`id`) ON DELETE SET NULL,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_ip` (`ip_address`),
  INDEX `idx_banned_until` (`banned_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- AI CHAT SYSTEM - END
-- =============================================================================
