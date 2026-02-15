<?php
/**
 * G-Nexus AI Chat System - API Routes
 * Handles all AI chat-related endpoints
 * Include this file in api.php
 */

// =============================================================================
// AI PROVIDERS MANAGEMENT (Admin Only)
// =============================================================================

function handleGetProviders($pdo) {
    $stmt = $pdo->query("SELECT * FROM ai_providers ORDER BY priority ASC, name ASC");
    $providers = $stmt->fetchAll();
    
    // Don't expose full API keys
    foreach ($providers as &$provider) {
        if (isset($provider['api_key'])) {
            $provider['api_key_preview'] = substr($provider['api_key'], 0, 8) . '...';
            unset($provider['api_key']);
        }
        $provider['config'] = json_decode($provider['config'] ?? '{}');
    }
    
    jsonResponse($providers);
}

function handleSaveProvider($pdo, $input) {
    requireAuth(); // Admin only
    
    $id = $input['id'] ?? generateUUID();
    $name = $input['name'] ?? '';
    $slug = $input['slug'] ?? strtolower(str_replace(' ', '_', $name));
    $api_key = $input['api_key'] ?? '';
    $api_endpoint = $input['api_endpoint'] ?? null;
    $is_enabled = $input['is_enabled'] ?? true;
    $priority = $input['priority'] ?? 100;
    $config = json_encode($input['config'] ?? []);
    $rate_limit_per_minute = $input['rate_limit_per_minute'] ?? 60;
    $rate_limit_per_day = $input['rate_limit_per_day'] ?? 10000;
    
    if (empty($name) || empty($api_key)) {
        throw new Exception('Name and API key are required');
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_providers 
        (id, name, slug, api_key, api_endpoint, is_enabled, priority, config, rate_limit_per_minute, rate_limit_per_day)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name=VALUES(name), api_key=VALUES(api_key), api_endpoint=VALUES(api_endpoint),
        is_enabled=VALUES(is_enabled), priority=VALUES(priority), config=VALUES(config),
        rate_limit_per_minute=VALUES(rate_limit_per_minute), rate_limit_per_day=VALUES(rate_limit_per_day)
    ");
    
    $stmt->execute([$id, $name, $slug, $api_key, $api_endpoint, $is_enabled, $priority, $config, $rate_limit_per_minute, $rate_limit_per_day]);
    
    jsonResponse(['id' => $id, 'message' => 'Provider saved successfully']);
}

function handleDeleteProvider($pdo, $id) {
    requireAuth(); // Admin only
    $pdo->prepare("DELETE FROM ai_providers WHERE id = ?")->execute([$id]);
    jsonResponse(['message' => 'Provider deleted successfully']);
}

// =============================================================================
// AI MODELS MANAGEMENT
// =============================================================================

function handleGetModels($pdo, $category = null, $enabled_only = false) {
    $sql = "SELECT m.*, p.name as provider_name, p.slug as provider_slug 
            FROM ai_models m 
            JOIN ai_providers p ON m.provider_id = p.id 
            WHERE 1=1";
    $params = [];
    
    if ($category) {
        $sql .= " AND m.category = ?";
        $params[] = $category;
    }
    
    if ($enabled_only) {
        $sql .= " AND m.is_enabled = 1 AND p.is_enabled = 1";
    }
    
    $sql .= " ORDER BY p.priority ASC, m.display_name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $models = $stmt->fetchAll();
    
    foreach ($models as &$model) {
        $model['config'] = json_decode($model['config'] ?? '{}');
    }
    
    jsonResponse($models);
}

function handleSaveModel($pdo, $input) {
    requireAuth(); // Admin only
    
    $id = $input['id'] ?? generateUUID();
    $provider_id = $input['provider_id'] ?? '';
    $name = $input['name'] ?? '';
    $model_id = $input['model_id'] ?? '';
    $display_name = $input['display_name'] ?? $name;
    $description = $input['description'] ?? null;
    $category = $input['category'] ?? 'general';
    $context_window = $input['context_window'] ?? 4096;
    $max_tokens = $input['max_tokens'] ?? 2000;
    $cost_per_1k_input = $input['cost_per_1k_input'] ?? 0;
    $cost_per_1k_output = $input['cost_per_1k_output'] ?? 0;
    $is_enabled = $input['is_enabled'] ?? true;
    $is_default = $input['is_default'] ?? false;
    $supports_vision = $input['supports_vision'] ?? false;
    $supports_function_calling = $input['supports_function_calling'] ?? false;
    $supports_streaming = $input['supports_streaming'] ?? true;
    $config = json_encode($input['config'] ?? []);
    
    if (empty($provider_id) || empty($model_id)) {
        throw new Exception('Provider ID and Model ID are required');
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_models 
        (id, provider_id, name, model_id, display_name, description, category, context_window, max_tokens,
         cost_per_1k_input, cost_per_1k_output, is_enabled, is_default, supports_vision, 
         supports_function_calling, supports_streaming, config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name=VALUES(name), display_name=VALUES(display_name), description=VALUES(description),
        category=VALUES(category), context_window=VALUES(context_window), max_tokens=VALUES(max_tokens),
        cost_per_1k_input=VALUES(cost_per_1k_input), cost_per_1k_output=VALUES(cost_per_1k_output),
        is_enabled=VALUES(is_enabled), is_default=VALUES(is_default), supports_vision=VALUES(supports_vision),
        supports_function_calling=VALUES(supports_function_calling), supports_streaming=VALUES(supports_streaming),
        config=VALUES(config)
    ");
    
    $stmt->execute([
        $id, $provider_id, $name, $model_id, $display_name, $description, $category, $context_window, $max_tokens,
        $cost_per_1k_input, $cost_per_1k_output, $is_enabled, $is_default, $supports_vision,
        $supports_function_calling, $supports_streaming, $config
    ]);
    
    jsonResponse(['id' => $id, 'message' => 'Model saved successfully']);
}

function handleDeleteModel($pdo, $id) {
    requireAuth(); // Admin only
    $pdo->prepare("DELETE FROM ai_models WHERE id = ?")->execute([$id]);
    jsonResponse(['message' => 'Model deleted successfully']);
}

// =============================================================================
// CHAT CONVERSATIONS
// =============================================================================

function handleGetConversations($pdo, $filters = []) {
    $user = getCurrentUser(); // Can be null for guests
    
    $sql = "SELECT * FROM ai_chat_conversations WHERE 1=1";
    $params = [];
    
    // If not admin, only show own conversations
    if (!isAdmin()) {
        if ($user) {
            $sql .= " AND user_id = ?";
            $params[] = $user['id'];
        } else {
            // Guest - use session_id from filter
            $session_id = $filters['session_id'] ?? null;
            if ($session_id) {
                $sql .= " AND session_id = ?";
                $params[] = $session_id;
            } else {
                jsonResponse([]); // No session, return empty
                return;
            }
        }
    }
    
    // Status filter
    if (!empty($filters['status'])) {
        $sql .= " AND status = ?";
        $params[] = $filters['status'];
    } else {
        $sql .= " AND status != 'deleted'";
    }
    
    // Search
    if (!empty($filters['search'])) {
        $sql .= " AND title LIKE ?";
        $params[] = '%' . $filters['search'] . '%';
    }
    
    $sql .= " ORDER BY is_pinned DESC, last_message_at DESC LIMIT 100";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $conversations = $stmt->fetchAll();
    
    foreach ($conversations as &$conv) {
        $conv['tags'] = json_decode($conv['tags'] ?? '[]');
        $conv['metadata'] = json_decode($conv['metadata'] ?? '{}');
    }
    
    jsonResponse($conversations);
}

function handleSaveConversation($pdo, $input) {
    $user = getCurrentUser();
    
    $id = $input['id'] ?? generateUUID();
    $user_id = $user['id'] ?? null;
    $session_id = $input['session_id'] ?? null;
    $title = $input['title'] ?? 'New Chat';
    $model = $input['model'] ?? 'gpt-4';
    $provider = $input['provider'] ?? 'openrouter';
    $system_prompt = $input['system_prompt'] ?? null;
    $temperature = $input['temperature'] ?? 0.7;
    $max_tokens = $input['max_tokens'] ?? 2000;
    $status = $input['status'] ?? 'active';
    $is_pinned = $input['is_pinned'] ?? false;
    $tags = json_encode($input['tags'] ?? []);
    $metadata = json_encode($input['metadata'] ?? []);
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_conversations 
        (id, user_id, session_id, title, model, provider, system_prompt, temperature, max_tokens,
         status, is_pinned, tags, metadata, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        title=VALUES(title), model=VALUES(model), provider=VALUES(provider),
        system_prompt=VALUES(system_prompt), temperature=VALUES(temperature), max_tokens=VALUES(max_tokens),
        status=VALUES(status), is_pinned=VALUES(is_pinned), tags=VALUES(tags), metadata=VALUES(metadata)
    ");
    
    $stmt->execute([
        $id, $user_id, $session_id, $title, $model, $provider, $system_prompt, $temperature, $max_tokens,
        $status, $is_pinned, $tags, $metadata, $ip_address, $user_agent
    ]);
    
    jsonResponse(['id' => $id, 'message' => 'Conversation saved successfully']);
}

function handleDeleteConversation($pdo, $id) {
    $user = getCurrentUser();
    
    if (!isAdmin()) {
        // Verify ownership
        $stmt = $pdo->prepare("SELECT user_id FROM ai_chat_conversations WHERE id = ?");
        $stmt->execute([$id]);
        $conv = $stmt->fetch();
        
        if (!$conv || ($conv['user_id'] && $conv['user_id'] !== ($user['id'] ?? null))) {
            throw new Exception('Unauthorized');
        }
    }
    
    $pdo->prepare("DELETE FROM ai_chat_conversations WHERE id = ?")->execute([$id]);
    jsonResponse(['message' => 'Conversation deleted successfully']);
}

function handlePinConversation($pdo, $id, $pinned) {
    $user = getCurrentUser();
    
    if (!isAdmin()) {
        $stmt = $pdo->prepare("SELECT user_id FROM ai_chat_conversations WHERE id = ?");
        $stmt->execute([$id]);
        $conv = $stmt->fetch();
        
        if (!$conv || ($conv['user_id'] && $conv['user_id'] !== ($user['id'] ?? null))) {
            throw new Exception('Unauthorized');
        }
    }
    
    $pdo->prepare("UPDATE ai_chat_conversations SET is_pinned = ? WHERE id = ?")->execute([$pinned, $id]);
    jsonResponse(['message' => 'Conversation updated successfully']);
}

// =============================================================================
// CHAT MESSAGES
// =============================================================================

function handleGetMessages($pdo, $conversation_id) {
    $user = getCurrentUser();
    
    // Verify access
    if (!isAdmin()) {
        $stmt = $pdo->prepare("SELECT user_id, session_id FROM ai_chat_conversations WHERE id = ?");
        $stmt->execute([$conversation_id]);
        $conv = $stmt->fetch();
        
        if (!$conv) {
            throw new Exception('Conversation not found');
        }
        
        if ($conv['user_id'] && $conv['user_id'] !== ($user['id'] ?? null)) {
            throw new Exception('Unauthorized');
        }
    }
    
    $stmt = $pdo->prepare("SELECT * FROM ai_chat_messages WHERE conversation_id = ? ORDER BY created_at ASC");
    $stmt->execute([$conversation_id]);
    $messages = $stmt->fetchAll();
    
    foreach ($messages as &$msg) {
        $msg['attachments'] = json_decode($msg['attachments'] ?? '[]');
        $msg['metadata'] = json_decode($msg['metadata'] ?? '{}');
    }
    
    jsonResponse($messages);
}

function handleSendMessage($pdo, $input) {
    $conversation_id = $input['conversation_id'] ?? '';
    $content = $input['content'] ?? '';
    $stream = $input['stream'] ?? false;
    
    if (empty($conversation_id) || empty($content)) {
        throw new Exception('Conversation ID and content are required');
    }
    
    // Check rate limiting
    checkRateLimit($pdo);
    
    // Get conversation settings
    $stmt = $pdo->prepare("SELECT * FROM ai_chat_conversations WHERE id = ?");
    $stmt->execute([$conversation_id]);
    $conv = $stmt->fetch();
    
    if (!$conv) {
        throw new Exception('Conversation not found');
    }
    
    // Save user message
    $user_msg_id = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_messages (id, conversation_id, role, content)
        VALUES (?, ?, 'user', ?)
    ");
    $stmt->execute([$user_msg_id, $conversation_id, $content]);
    
    // Get AI response
    $ai_response = callAIProvider($pdo, $conv, $content);
    
    // Save AI message
    $ai_msg_id = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_messages 
        (id, conversation_id, role, content, model, tokens_input, tokens_output, cost, reasoning, metadata)
        VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $ai_msg_id,
        $conversation_id,
        $ai_response['content'],
        $ai_response['model'],
        $ai_response['tokens_input'],
        $ai_response['tokens_output'],
        $ai_response['cost'],
        $ai_response['reasoning'] ?? null,
        json_encode($ai_response['metadata'] ?? [])
    ]);
    
    // Update conversation last_message_at
    $pdo->prepare("UPDATE ai_chat_conversations SET last_message_at = NOW() WHERE id = ?")->execute([$conversation_id]);
    
    // Track analytics
    trackAnalytics($pdo, $conv, $ai_response);
    
    jsonResponse([
        'user_message' => ['id' => $user_msg_id, 'content' => $content, 'role' => 'user'],
        'ai_message' => array_merge(['id' => $ai_msg_id, 'role' => 'assistant'], $ai_response)
    ]);
}

function handleDeleteMessage($pdo, $id) {
    $user = getCurrentUser();
    
    if (!isAdmin()) {
        // Verify ownership via conversation
        $stmt = $pdo->prepare("
            SELECT c.user_id FROM ai_chat_messages m
            JOIN ai_chat_conversations c ON m.conversation_id = c.id
            WHERE m.id = ?
        ");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        
        if (!$result || ($result['user_id'] && $result['user_id'] !== ($user['id'] ?? null))) {
            throw new Exception('Unauthorized');
        }
    }
    
    $pdo->prepare("DELETE FROM ai_chat_messages WHERE id = ?")->execute([$id]);
    jsonResponse(['message' => 'Message deleted successfully']);
}

// =============================================================================
// ANALYTICS (Admin Only)
// =============================================================================

function handleGetChatAnalytics($pdo, $date_range = '30') {
    requireAuth();
    
    $days = intval($date_range);
    $start_date = date('Y-m-d', strtotime("-$days days"));
    
    $stmt = $pdo->prepare("
        SELECT * FROM ai_chat_analytics 
        WHERE date >= ? 
        ORDER BY date DESC, provider, model
    ");
    $stmt->execute([$start_date]);
    $analytics = $stmt->fetchAll();
    
    // Also get real-time stats
    $stats = [
        'total_conversations' => $pdo->query("SELECT COUNT(*) FROM ai_chat_conversations WHERE status != 'deleted'")->fetchColumn(),
        'total_messages' => $pdo->query("SELECT COUNT(*) FROM ai_chat_messages")->fetchColumn(),
        'active_today' => $pdo->query("SELECT COUNT(*) FROM ai_chat_conversations WHERE DATE(last_message_at) = CURDATE()")->fetchColumn(),
    ];
    
    jsonResponse([
        'analytics' => $analytics,
        'stats' => $stats
    ]);
}

// =============================================================================
// SETTINGS
// =============================================================================

function handleGetChatSettings($pdo) {
    $stmt = $pdo->query("SELECT * FROM ai_chat_settings");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['key']] = json_decode($row['value'], true);
    }
    jsonResponse($settings);
}

function handleSaveChatSetting($pdo, $key, $value) {
    requireAuth();
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_settings (`key`, `value`) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)
    ");
    $stmt->execute([$key, json_encode($value)]);
    
    jsonResponse(['message' => 'Setting saved successfully']);
}

// =============================================================================
// PROMPTS & QUICK REPLIES
// =============================================================================

function handleGetPrompts($pdo, $public_only = false) {
    $sql = "SELECT * FROM ai_chat_prompts WHERE 1=1";
    if ($public_only) {
        $sql .= " AND is_public = 1";
    }
    $sql .= " ORDER BY category, name";
    
    $prompts = $pdo->query($sql)->fetchAll();
    jsonResponse($prompts);
}

function handleSavePrompt($pdo, $input) {
    requireAuth();
    
    $id = $input['id'] ?? generateUUID();
    $name = $input['name'] ?? '';
    $slug = $input['slug'] ?? strtolower(str_replace(' ', '_', $name));
    $content = $input['content'] ?? '';
    $category = $input['category'] ?? null;
    $is_public = $input['is_public'] ?? false;
    $created_by = getCurrentUser()['id'] ?? null;
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_prompts (id, name, slug, content, category, is_public, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name=VALUES(name), content=VALUES(content), category=VALUES(category), is_public=VALUES(is_public)
    ");
    $stmt->execute([$id, $name, $slug, $content, $category, $is_public, $created_by]);
    
    jsonResponse(['id' => $id, 'message' => 'Prompt saved successfully']);
}

function handleGetQuickReplies($pdo) {
    $replies = $pdo->query("SELECT * FROM ai_chat_quick_replies WHERE is_enabled = 1 ORDER BY display_order ASC")->fetchAll();
    jsonResponse($replies);
}

function handleSaveQuickReply($pdo, $input) {
    requireAuth();
    
    $id = $input['id'] ?? generateUUID();
    $title = $input['title'] ?? '';
    $prompt = $input['prompt'] ?? '';
    $icon = $input['icon'] ?? null;
    $category = $input['category'] ?? null;
    $display_order = $input['display_order'] ?? 0;
    $is_enabled = $input['is_enabled'] ?? true;
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_quick_replies (id, title, prompt, icon, category, display_order, is_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        title=VALUES(title), prompt=VALUES(prompt), icon=VALUES(icon), 
        category=VALUES(category), display_order=VALUES(display_order), is_enabled=VALUES(is_enabled)
    ");
    $stmt->execute([$id, $title, $prompt, $icon, $category, $display_order, $is_enabled]);
    
    jsonResponse(['id' => $id, 'message' => 'Quick reply saved successfully']);
}

// =============================================================================
// RATINGS & FEEDBACK
// =============================================================================

function handleRateConversation($pdo, $input) {
    $conversation_id = $input['conversation_id'] ?? '';
    $message_id = $input['message_id'] ?? null;
    $rating = $input['rating'] ?? 0;
    $feedback = $input['feedback'] ?? null;
    
    if (empty($conversation_id) || $rating < 1 || $rating > 5) {
        throw new Exception('Valid conversation ID and rating (1-5) required');
    }
    
    $id = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_ratings (id, conversation_id, message_id, rating, feedback)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $conversation_id, $message_id, $rating, $feedback]);
    
    jsonResponse(['message' => 'Thank you for your feedback!']);
}

// =============================================================================
// MODERATION (Admin Only)
// =============================================================================

function handleBanUser($pdo, $input) {
    requireAuth();
    
    $id = generateUUID();
    $user_id = $input['user_id'] ?? null;
    $ip_address = $input['ip_address'] ?? null;
    $reason = $input['reason'] ?? null;
    $banned_until = $input['banned_until'] ?? null;
    $created_by = getCurrentUser()['id'];
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_banned_users (id, user_id, ip_address, reason, banned_until, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $user_id, $ip_address, $reason, $banned_until, $created_by]);
    
    jsonResponse(['message' => 'User banned successfully']);
}

function handleGetBannedUsers($pdo) {
    requireAuth();
    $banned = $pdo->query("SELECT * FROM ai_chat_banned_users ORDER BY created_at DESC")->fetchAll();
    jsonResponse($banned);
}

function handleUnbanUser($pdo, $id) {
    requireAuth();
    $pdo->prepare("DELETE FROM ai_chat_banned_users WHERE id = ?")->execute([$id]);
    jsonResponse(['message' => 'User unbanned successfully']);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function callAIProvider($pdo, $conv, $user_message) {
    // Get provider details
    $stmt = $pdo->prepare("SELECT * FROM ai_providers WHERE slug = ? AND is_enabled = 1");
    $stmt->execute([$conv['provider']]);
    $provider = $stmt->fetch();
    
    if (!$provider) {
        throw new Exception('Provider not configured or disabled');
    }
    
    // Get model details
    $stmt = $pdo->prepare("SELECT * FROM ai_models WHERE provider_id = ? AND model_id = ?");
    $stmt->execute([$provider['id'], $conv['model']]);
    $model = $stmt->fetch();
    
    if (!$model) {
        throw new Exception('Model not found');
    }
    
    // Call OpenRouter API (can be extended for other providers)
    $api_url = $provider['api_endpoint'] ?? 'https://openrouter.ai/api/v1/chat/completions';
    
    $messages = [];
    if ($conv['system_prompt']) {
        $messages[] = ['role' => 'system', 'content' => $conv['system_prompt']];
    }
    
    // Get conversation history
    $stmt = $pdo->prepare("SELECT role, content FROM ai_chat_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20");
    $stmt->execute([$conv['id']]);
    foreach ($stmt->fetchAll() as $msg) {
        $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
    }
    
    $messages[] = ['role' => 'user', 'content' => $user_message];
    
    $payload = [
        'model' => $conv['model'],
        'messages' => $messages,
        'temperature' => floatval($conv['temperature']),
        'max_tokens' => intval($conv['max_tokens'])
    ];
    
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $provider['api_key']
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code !== 200) {
        throw new Exception('AI provider error: ' . $response);
    }
    
    $data = json_decode($response, true);
    $choice = $data['choices'][0] ?? null;
    
    if (!$choice) {
        throw new Exception('Invalid AI response');
    }
    
    $usage = $data['usage'] ?? [];
    $cost = calculateCost($usage['prompt_tokens'] ?? 0, $usage['completion_tokens'] ?? 0, $model);
    
    return [
        'content' => $choice['message']['content'] ?? '',
        'model' => $conv['model'],
        'tokens_input' => $usage['prompt_tokens'] ?? 0,
        'tokens_output' => $usage['completion_tokens'] ?? 0,
        'cost' => $cost,
        'reasoning' => $choice['message']['reasoning'] ?? null,
        'metadata' => [
            'finish_reason' => $choice['finish_reason'] ?? null,
            'provider' => $conv['provider']
        ]
    ];
}

function calculateCost($input_tokens, $output_tokens, $model) {
    $input_cost = ($input_tokens / 1000) * floatval($model['cost_per_1k_input']);
    $output_cost = ($output_tokens / 1000) * floatval($model['cost_per_1k_output']);
    return $input_cost + $output_cost;
}

function trackAnalytics($pdo, $conv, $response) {
    $date = date('Y-m-d');
    $provider = $conv['provider'];
    $model = $conv['model'];
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_analytics 
        (id, date, provider, model, total_conversations, total_messages, total_tokens_input, total_tokens_output, total_cost)
        VALUES (UUID(), ?, ?, ?, 1, 1, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_messages = total_messages + 1,
        total_tokens_input = total_tokens_input + ?,
        total_tokens_output = total_tokens_output + ?,
        total_cost = total_cost + ?
    ");
    
    $stmt->execute([
        $date, $provider, $model,
        $response['tokens_input'], $response['tokens_output'], $response['cost'],
        $response['tokens_input'], $response['tokens_output'], $response['cost']
    ]);
}

function checkRateLimit($pdo) {
    $user = getCurrentUser();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    
    // Check if banned
    if ($user) {
        $stmt = $pdo->prepare("SELECT * FROM ai_chat_banned_users WHERE user_id = ? AND (banned_until IS NULL OR banned_until > NOW())");
        $stmt->execute([$user['id']]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM ai_chat_banned_users WHERE ip_address = ? AND (banned_until IS NULL OR banned_until > NOW())");
        $stmt->execute([$ip]);
    }
    
    if ($stmt->fetch()) {
        throw new Exception('You have been banned from using the chat');
    }
    
    // Check rate limits (simplified - should use Redis in production)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM ai_chat_messages m
        JOIN ai_chat_conversations c ON m.conversation_id = c.id
        WHERE c.ip_address = ? AND m.created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    ");
    $stmt->execute([$ip]);
    $count = $stmt->fetchColumn();
    
    if ($count > 10) { // 10 messages per minute
        throw new Exception('Rate limit exceeded. Please slow down.');
    }
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function getCurrentUser() {
    // Get from auth token - simplified
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($auth_header)) {
        return null;
    }
    
    $token = str_replace('Bearer ', '', $auth_header);
    $decoded = json_decode(base64_decode($token), true);
    
    if ($decoded && $decoded['exp'] > time()) {
        return $decoded;
    }
    
    return null;
}

function isAdmin() {
    $user = getCurrentUser();
    return $user && in_array($user['role'], ['Super Admin', 'Admin']);
}

function requireAuth() {
    if (!isAdmin()) {
        http_response_code(403);
        throw new Exception('Admin access required');
    }
}

function jsonResponse($data) {
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

?>
