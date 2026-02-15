<?php
/**
 * Server-Sent Events (SSE) Streaming Endpoint
 * Streams AI responses in real-time token-by-token
 */

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Disable nginx buffering

// Allow CORS
$allowed_origins = ['http://localhost:5173', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

// Prevent timeout
set_time_limit(300);
ini_set('max_execution_time', 300);

// Include database and auth
require_once __DIR__ . '/api.php';

// Get parameters
$conversationId = $_GET['conversation_id'] ?? '';
$message = $_GET['message'] ?? '';
$messageId = $_GET['message_id'] ?? '';

if (!$conversationId || !$message) {
    sendSSE('error', ['message' => 'Missing required parameters']);
    exit;
}

// Authenticate user (same as api.php)
$userId = null;
$sessionId = null;

// Try to get user from session/auth
session_start();
if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
} else {
    // Use session ID for guests
    $sessionId = session_id();
}

try {
    // Get conversation and verify access
    $stmt = $pdo->prepare("SELECT * FROM ai_chat_conversations WHERE id = ?");
    $stmt->execute([$conversationId]);
    $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$conversation) {
        sendSSE('error', ['message' => 'Conversation not found']);
        exit;
    }
    
    // Verify user has access
    if ($userId && $conversation['user_id'] != $userId) {
        sendSSE('error', ['message' => 'Access denied']);
        exit;
    }
    
    if (!$userId && $conversation['session_id'] != $sessionId) {
        sendSSE('error', ['message' => 'Access denied']);
        exit;
    }
    
    // Get AI provider and model settings
    $model = $conversation['model'];
    $temperature = $conversation['temperature'] ?? 0.7;
    $maxTokens = $conversation['max_tokens'] ?? 2000;
    $systemPrompt = $conversation['system_prompt'] ?? '';
    
    // Get conversation history
    $stmt = $pdo->prepare("
        SELECT role, content 
        FROM ai_chat_messages 
        WHERE conversation_id = ? 
        ORDER BY created_at ASC
        LIMIT 50
    ");
    $stmt->execute([$conversationId]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Build messages array
    $messages = [];
    if ($systemPrompt) {
        $messages[] = ['role' => 'system', 'content' => $systemPrompt];
    }
    foreach ($history as $msg) {
        $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
    }
    $messages[] = ['role' => 'user', 'content' => $message];
    
    // Call OpenRouter with streaming
    $apiKey = getenv('OPENROUTER_API_KEY') ?: '';
    if (!$apiKey) {
        sendSSE('error', ['message' => 'API key not configured']);
        exit;
    }
    
    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
    
    $requestData = [
        'model' => $model,
        'messages' => $messages,
        'temperature' => (float)$temperature,
        'max_tokens' => (int)$maxTokens,
        'stream' => true
    ];
    
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
        'HTTP-Referer: https://gnexus.com',
        'X-Title: G-Nexus AI Chat'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) use ($messageId) {
        static $fullResponse = '';
        static $totalTokens = 0;
        
        // Parse SSE data from OpenRouter
        $lines = explode("\n", $data);
        foreach ($lines as $line) {
            if (strpos($line, 'data: ') === 0) {
                $json = substr($line, 6);
                if ($json === '[DONE]') {
                    sendSSE('done', [
                        'messageId' => $messageId,
                        'content' => $fullResponse,
                        'tokens' => $totalTokens
                    ]);
                    continue;
                }
                
                $chunk = json_decode($json, true);
                if (isset($chunk['choices'][0]['delta']['content'])) {
                    $content = $chunk['choices'][0]['delta']['content'];
                    $fullResponse .= $content;
                    $totalTokens++;
                    
                    // Send delta to client
                    sendSSE('delta', [
                        'content' => $content,
                        'messageId' => $messageId
                    ]);
                }
                
                // Check for finish
                if (isset($chunk['choices'][0]['finish_reason'])) {
                    sendSSE('complete', [
                        'messageId' => $messageId,
                        'content' => $fullResponse,
                        'finishReason' => $chunk['choices'][0]['finish_reason']
                    ]);
                }
            }
        }
        
        @ob_flush();
        flush();
        
        return strlen($data);
    });
    
    curl_exec($ch);
    
    if (curl_errno($ch)) {
        sendSSE('error', ['message' => curl_error($ch)]);
    }
    
    curl_close($ch);
    
} catch (Exception $e) {
    sendSSE('error', ['message' => $e->getMessage()]);
}

/**
 * Send SSE event to client
 */
function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data) . "\n\n";
    @ob_flush();
    flush();
}
