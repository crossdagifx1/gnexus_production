
/**
 * MySQL Storage Implementation (via PHP API)
 * Replaces IndexedDB storage interactions
 */

import { apiRequest } from '../api/db';
import type { ChatSession, ChatMessage } from './chatStorage';
import type { DBOperation } from './indexeddb';

// =============================================================================
// SESSIONS
// =============================================================================

export async function getAllSessions(): Promise<DBOperation<ChatSession[]>> {
    const result = await apiRequest<ChatSession[]>('get_sessions');
    return {
        success: result.success,
        data: result.data,
        error: result.error
    };
}

export async function saveSession(session: ChatSession): Promise<DBOperation<ChatSession>> {
    const result = await apiRequest<ChatSession>('save_session', 'POST', session);
    return {
        success: result.success,
        data: result.data,
        error: result.error
    };
}

export async function deleteSession(id: string): Promise<DBOperation<void>> {
    const result = await apiRequest<void>('delete_session', 'POST', { id });
    return {
        success: result.success,
        data: undefined,
        error: result.error
    };
}

// =============================================================================
// MESSAGES
// =============================================================================

export async function getSessionMessages(sessionId: string): Promise<DBOperation<ChatMessage[]>> {
    const result = await apiRequest<ChatMessage[]>(`get_messages&session_id=${sessionId}`);
    return {
        success: result.success,
        data: result.data,
        error: result.error
    };
}

export async function saveMessage(message: ChatMessage): Promise<DBOperation<ChatMessage>> {
    const result = await apiRequest<ChatMessage>('save_message', 'POST', message);
    return {
        success: result.success,
        data: result.data,
        error: result.error
    };
}

export async function deleteMessage(id: string): Promise<DBOperation<void>> {
    const result = await apiRequest<void>('delete_message', 'POST', { id });
    return {
        success: result.success,
        data: undefined,
        error: result.error
    };
}
