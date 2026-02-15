<?php
/**
 * Advanced AI Chat Features - API Routes
 * Handles: Image uploads, Audio (STT/TTS), Code execution, Sharing, Reactions
 */

// Load security middleware
require_once __DIR__ . '/security_middleware.php';

// Initialize security
XSSProtection::setSecurityHeaders();
if (!isset($_SESSION)) {
    session_start();
}

// Create rate limit table
createRateLimitTable($pdo);

// Rate limiter instance
$rateLimiter = new RateLimiter($pdo);

// Image Upload
case 'upload_chat_attachment':
    requireAuth($pdo);
    // Rate limit: 20 uploads per hour
    $rateLimiter->checkLimit($user['id'], 'upload_image', 20, 3600);
    
    if (!isset($_FILES['file'])) {
    }
    
    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($file['size'] > $maxSize) {
        sendError('File too large');
    }
    
    // Create upload directory
    $uploadDir = __DIR__ . '/../uploads/chat/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $id = generateUUID();
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $id . '.' . $ext;
    $ filePath = $uploadDir . $filename;
    
    // Move file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        sendError('Failed to save file');
    }
    
    // Create thumbnail
    $thumbnailPath = createThumbnail($filePath, 300, 300);
    
    // Get image dimensions
    list($width, $height) = getimagesize($filePath);
    
    // Save to database
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_attachments 
        (id, message_id, type, file_path, thumbnail_path, mime_type, file_size, width, height, created_at) 
        VALUES (?, ?, 'image', ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $id, $messageId, $filename, 
        basename($thumbnailPath), $file['type'], $file['size'],
        $width, $height
    ]);
    
    sendSuccess([
        'id' => $id,
        'url' => '/uploads/chat/' . $filename,
        'thumbnailUrl' => '/uploads/chat/' . basename($thumbnailPath),
        'width' => $width,
        'height' => $height
    ]);
    break;

// Transcribe Audio
case 'transcribe_audio':
    requireAuth($pdo);
    
    if (!isset($_FILES['audio'])) {
        sendError('No audio file uploaded');
    }
    
    $audioFile = $_FILES['audio']['tmp_name'];
    $fileHash = md5_file($audioFile);
    
    // Check cache
    $stmt = $pdo->prepare("SELECT transcription FROM ai_chat_audio_cache WHERE file_hash = ?");
    $stmt->execute([$fileHash]);
    $cached = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($cached) {
        // Update last used
        $pdo->prepare("UPDATE ai_chat_audio_cache SET last_used_at = NOW() WHERE file_hash = ?")
            ->execute([$fileHash]);
        sendSuccess(['text' => $cached['transcription'], 'cached' => true]);
    }
    
    // Call OpenAI Whisper API
    $apiKey = getenv('OPENAI_API_KEY') ?: '';
    if (!$apiKey) {
        sendError('OpenAI API key not configured');
    }
    
    $ch = curl_init('https://api.openai.com/v1/audio/transcriptions');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'file' => new CURLFile($audioFile, 'audio/webm', 'audio.webm'),
        'model' => 'whisper-1'
    ]);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        sendError('Transcription failed: ' . $response);
    }
    
    $data = json_decode($response, true);
    $transcription = $data['text'] ?? '';
    
    // Cache result
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_audio_cache (id, file_hash, transcription, created_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE transcription = ?, last_used_at = NOW()
    ");
    $stmt->execute([generateUUID(), $fileHash, $transcription, $transcription]);
    
    sendSuccess(['text' => $transcription, 'cached' => false]);
    break;

// Text-to-Speech
case 'synthesize_speech':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $text = $data['text'] ?? '';
    $voice = $data['voice'] ?? 'alloy';
    
    if (!$text) {
        sendError('No text provided');
    }
    
    $textHash = md5($text . $voice);
    
    // Check cache
    $stmt = $pdo->prepare("SELECT audio_path FROM ai_chat_tts_cache WHERE text_hash = ?");
    $stmt->execute([$textHash]);
    $cached = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($cached && file_exists(__DIR__ . '/../uploads/audio/' . $cached['audio_path'])) {
        $pdo->prepare("UPDATE ai_chat_tts_cache SET last_used_at = NOW() WHERE text_hash = ?")
            ->execute([$textHash]);
        sendSuccess([
            'audioUrl' => '/uploads/audio/' . $cached['audio_path'],
            'cached' => true
        ]);
    }
    
    // Call OpenAI TTS API
    $apiKey = getenv('OPENAI_API_KEY') ?: '';
    if (!$apiKey) {
        sendError('OpenAI API key not configured');
    }
    
    $ch = curl_init('https://api.openai.com/v1/audio/speech');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'tts-1',
        'input' => $text,
        'voice' => $voice
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $audioData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        sendError('TTS failed');
    }
    
    // Save audio file
    $audioDir = __DIR__ . '/../uploads/audio/';
    if (!file_exists($audioDir)) {
        mkdir($audioDir, 0755, true);
    }
    
    $filename = generateUUID() . '.mp3';
    file_put_contents($audioDir . $filename, $audioData);
    
    // Cache result
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_tts_cache (id, text_hash, voice, audio_path, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([generateUUID(), $textHash, $voice, $filename]);
    
    sendSuccess([
        'audioUrl' => '/uploads/audio/' . $filename,
        'cached' => false
    ]);
    break;

// Execute Code
case 'execute_code':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $code = $data['code'] ?? '';
    $language = $data['language'] ?? 'python';
    $messageId = $data['message_id'] ?? null;
    
    if (!$code) {
        sendError('No code provided');
    }
    
    // Rate limiting (max 10 executions per minute)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count FROM ai_chat_code_executions 
        WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    ");
    $stmt->execute([$userId]);
    $rateCheck = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($rateCheck['count'] >= 10) {
        sendError('Rate limit exceeded. Please wait.');
    }
    
    // Execute code in Docker container
    $containers = [
        'python' => 'python:3.11-alpine',
        'javascript' => 'node:18-alpine',
        'js' => 'node:18-alpine',
        'php' => 'php:8.2-cli-alpine'
    ];
    
    if (!isset($containers[$language])) {
        sendError('Unsupported language');
    }
    
    $startTime = microtime(true);
    
    try {
        // Create temporary code file
        $tempFile = tempnam(sys_get_temp_dir(), 'code_');
        file_put_contents($tempFile, $code);
        
        // Run in Docker with limits
        $containerImage = $containers[$language];
        $timeout = 5;
        
        // Determine execution command
        $execCmd = match($language) {
            'python' => 'python',
            'javascript', 'js' => 'node',
            'php' => 'php',
            default => 'python'
        };
        
        exec(sprintf(
            'docker run --rm --network none --cpus=0.5 --memory=256m -v %s:/code %s timeout %d %s /code 2>&1',
            escapeshellarg($tempFile),
            $containerImage,
            $timeout,
            $execCmd
        ), $output, $exitCode);
        
        $executionTime = (microtime(true) - $startTime) * 1000;
        
        // Clean up
        unlink($tempFile);
        
        $outputStr = implode("\n", $output);
        
        // Log execution
        $stmt = $pdo->prepare("
            INSERT INTO ai_chat_code_executions 
            (id, message_id, user_id, language, code, output, exit_code, execution_time_ms, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            generateUUID(), $messageId, $userId, $language,
            $code, $outputStr, $exitCode, round($executionTime)
        ]);
        
        sendSuccess([
            'output' => $outputStr,
            'exitCode' => $exitCode,
            'executionTime' => round($executionTime)
        ]);
    } catch (Exception $e) {
        sendError('Execution error: ' . $e->getMessage());
    }
    break;

// Share Conversation
case 'share_conversation':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $conversationId = $data['conversation_id'] ?? '';
    $accessLevel = $data['access_level'] ?? 'view';
    $expiresAt = $data['expires_at'] ?? null;
    
    // Verify ownership
    $stmt = $pdo->prepare("SELECT user_id FROM ai_chat_conversations WHERE id = ?");
    $stmt->execute([$conversationId]);
    $conv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$conv || $conv['user_id'] != $userId) {
        sendError('Access denied');
    }
    
    $shareLink = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_shares 
        (id, conversation_id, shared_by_user_id, share_link, access_level, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        generateUUID(), $conversationId, $userId,
        $shareLink, $accessLevel, $expiresAt
    ]);
    
    $baseUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
    sendSuccess([
        'shareUrl' => $baseUrl . '/chat/shared/' . $shareLink,
        'shareLink' => $shareLink
    ]);
    break;

// React to Message
case 'react_to_message':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $messageId = $data['message_id'] ?? '';
    $emoji = $data['emoji'] ?? '';
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_reactions (id, message_id, user_id, emoji, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE created_at = NOW()
    ");
    $stmt->execute([generateUUID(), $messageId, $userId, $emoji]);
    
    sendSuccess(['message' => 'Reaction added']);
    break;

// Remove Reaction
case 'remove_reaction':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $messageId = $data['message_id'] ?? '';
    $emoji = $data['emoji'] ?? '';
    
    $stmt = $pdo->prepare("
        DELETE FROM ai_chat_reactions 
        WHERE message_id = ? AND user_id = ? AND emoji = ?
    ");
    $stmt->execute([$messageId, $userId, $emoji]);
    
    sendSuccess(['message' => 'Reaction removed']);
    break;

// ===== PHASE 8: MESSAGE MANAGEMENT =====

// Edit Message
case 'edit_message':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $messageId = $data['message_id'] ?? '';
    $newContent = $data['new_content'] ?? '';
    
    if (!$newContent) {
        sendError('No content provided');
    }
    
    // Verify ownership
    $stmt = $pdo->prepare("
        SELECT m.content, c.user_id 
        FROM ai_chat_messages m
        JOIN ai_chat_conversations c ON m.conversation_id = c.id
        WHERE m.id = ? AND m.deleted_at IS NULL
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$message || $message['user_id'] != $userId) {
        sendError('Access denied');
    }
    
    // Save current content to history
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_message_history (id, message_id, old_content, edited_by, edited_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        generateUUID(),
        $messageId,
        $message['content'],
        $userId
    ]);
    
    // Update message
    $stmt = $pdo->prepare("
        UPDATE ai_chat_messages 
        SET content = ?, edited_at = NOW(), edit_count = edit_count + 1
        WHERE id = ?
    ");
    $stmt->execute([$newContent, $messageId]);
    
    sendSuccess([
        'message' => 'Message updated',
        'edited_at' => date('Y-m-d H:i:s')
    ]);
    break;

// Delete Message
case 'delete_message':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $messageId = $data['message_id'] ?? '';
    
    // Verify ownership
    $stmt = $pdo->prepare("
        SELECT c.user_id 
        FROM ai_chat_messages m
        JOIN ai_chat_conversations c ON m.conversation_id = c.id
        WHERE m.id = ?
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$message || $message['user_id'] != $userId) {
        sendError('Access denied');
    }
    
    // Soft delete
    $stmt = $pdo->prepare("
        UPDATE ai_chat_messages 
        SET deleted_at = NOW(), deleted_by = ?
        WHERE id = ?
    ");
    $stmt->execute([$userId, $messageId]);
    
    sendSuccess(['message' => 'Message deleted']);
    break;

// Restore Message
case 'restore_message':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $messageId = $data['message_id'] ?? '';
    
    // Verify ownership and recent deletion (within 30 seconds)
    $stmt = $pdo->prepare("
        SELECT c.user_id, m.deleted_at
        FROM ai_chat_messages m
        JOIN ai_chat_conversations c ON m.conversation_id = c.id
        WHERE m.id = ? AND m.deleted_at IS NOT NULL
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$message || $message['user_id'] != $userId) {
        sendError('Access denied');
    }
    
    // Check if within undo window
    $deletedTime = strtotime($message['deleted_at']);
    if (time() - $deletedTime > 30) {
        sendError('Undo window expired');
    }
    
    // Restore
    $stmt = $pdo->prepare("
        UPDATE ai_chat_messages 
        SET deleted_at = NULL, deleted_by = NULL
        WHERE id = ?
    ");
    $stmt->execute([$messageId]);
    
    sendSuccess(['message' => 'Message restored']);
    break;

// Get Message History
case 'get_message_history':
    requireAuth($pdo);
    
    $messageId = $_GET['message_id'] ?? '';
    
    // Verify access
    $stmt = $pdo->prepare("
        SELECT c.user_id 
        FROM ai_chat_messages m
        JOIN ai_chat_conversations c ON m.conversation_id = c.id
        WHERE m.id = ?
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$message || $message['user_id'] != $userId) {
        sendError('Access denied');
    }
    
    // Get history
    $stmt = $pdo->prepare("
        SELECT h.old_content, h.edited_at, u.username as edited_by
        FROM ai_chat_message_history h
        LEFT JOIN cms_users u ON h.edited_by = u.id
        WHERE h.message_id = ?
        ORDER BY h.edited_at DESC
    ");
    $stmt->execute([$messageId]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess($history);
    break;

// Save Draft
case 'save_draft':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $conversationId = $data['conversation_id'] ?? '';
    $content = $data['content'] ?? '';
    
    // Verify ownership
    $stmt = $pdo->prepare("SELECT user_id FROM ai_chat_conversations WHERE id = ?");
    $stmt->execute([$conversationId]);
    $conv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$conv || $conv['user_id'] != $userId) {
        sendError('Access denied');
    }
    
    // Upsert draft
    $stmt = $pdo->prepare("
        INSERT INTO ai_chat_drafts (conversation_id, user_id, content, updated_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE content = ?, updated_at = NOW()
    ");
    $stmt->execute([$conversationId, $userId, $content, $content]);
    
    sendSuccess(['message' => 'Draft saved']);
    break;

// Get Draft
case 'get_draft':
    requireAuth($pdo);
    
    $conversationId = $_GET['conversation_id'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT content, updated_at 
        FROM ai_chat_drafts 
        WHERE conversation_id = ? AND user_id = ?
    ");
    $stmt->execute([$conversationId, $userId]);
    $draft = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($draft) {
        sendSuccess($draft);
    } else {
        sendSuccess(['content' => '', 'updated_at' => null]);
    }
    break;

// Delete Draft
case 'delete_draft':
    requireAuth($pdo);
    
    $data = json_decode(file_get_contents('php://input'), true);
    $conversationId = $data['conversation_id'] ?? '';
    
    $stmt = $pdo->prepare("
        DELETE FROM ai_chat_drafts 
        WHERE conversation_id = ? AND user_id = ?
    ");
    $stmt->execute([$conversationId, $userId]);
    
    sendSuccess(['message' => 'Draft deleted']);
    break;

// Helper Functions
function createThumbnail($source, $maxWidth, $maxHeight) {
    $info = getimagesize($source);
    $mime = $info['mime'];
    
    switch ($mime) {
        case 'image/jpeg': $image = imagecreatefromjpeg($source); break;
        case 'image/png': $image = imagecreatefrompng($source); break;
        case 'image/webp': $image = imagecreatefromwebp($source); break;
        case 'image/gif': $image = imagecreatefromgif($source); break;
        default: return $source;
    }
    
    $width = imagesx($image);
    $height = imagesy($image);
    
    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = $width * $ratio;
    $newHeight = $height * $ratio;
    
    $thumb = imagecreatetruecolor($newWidth, $newHeight);
    imagecopyresampled($thumb, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    $thumbPath = dirname($source) . '/thumb_' . basename($source);
    imagejpeg($thumb, $thumbPath, 85);
    
    imagedestroy($image);
    imagedestroy($thumb);
    
    return $thumbPath;
}
