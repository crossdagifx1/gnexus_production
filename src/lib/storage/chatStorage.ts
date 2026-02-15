
/**
 * Chat Storage Service
 * High-level storage API for chat operations
 */

import { getDatabase, type DBOperation } from './indexeddb';
import type { ModelKey } from '../ai';
import * as MySQL from './mysqlStorage';
import { useMySQL } from './config';

// =============================================================================
// TYPES
// =============================================================================

export interface ChatSession {
    id: string;
    title: string;
    model: ModelKey;
    created_at: number;
    updated_at: number;
    pinned: boolean;
    last_message: string | null;
    message_count: number;
    tags: string[];
    metadata: SessionMetadata;
}

export interface SessionMetadata {
    description?: string;
    color?: string;
    icon?: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: number;
    model?: string;
    tokens?: number;
    attachments?: Attachment[];
    reactions?: Reaction[];
    edits?: MessageEdit[];
    metadata?: MessageMetadata;
}

export interface Attachment {
    id: string;
    type: 'image' | 'file' | 'audio' | 'video';
    name: string;
    url: string;
    size: number;
    mimeType: string;
}

export interface Reaction {
    emoji: string;
    userId: string;
    created_at: number;
}

export interface MessageEdit {
    content: string;
    edited_at: number;
    content_old?: string; // Enhanced to store diff if needed
}

export interface MessageMetadata {
    tokens_used?: number;
    latency_ms?: number;
    tool_used?: string;
    error?: string;
}

export interface ChatSettings {
    theme: 'dark' | 'light' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    streamingEnabled: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    autoSave: boolean;
    maxMessages: number;
}

// =============================================================================
// GENERATORS
// =============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getLocalUserId(): string {
    let userId = localStorage.getItem('gnexus_local_user_id');
    if (!userId) {
        userId = 'local_' + generateId();
        localStorage.setItem('gnexus_local_user_id', userId);
    }
    return userId;
}

// =============================================================================
// SESSION OPERATIONS
// =============================================================================

export async function createSession(
    title: string = 'New Chat',
    model: ModelKey = 'planner'
): Promise<DBOperation<ChatSession>> {
    const now = Date.now();

    const session: ChatSession = {
        id: generateId(),
        title,
        model,
        created_at: now,
        updated_at: now,
        pinned: false,
        last_message: null,
        message_count: 0,
        tags: [],
        metadata: {},
    };

    if (useMySQL) {
        return MySQL.saveSession(session);
    }

    const db = getDatabase();
    const result = await db.put('sessions', session);
    return result.success ? { success: true, data: session } : { success: false, error: result.error };
}

export async function getSession(id: string): Promise<DBOperation<ChatSession>> {
    if (useMySQL) {
        // MySQL implementation simply gets all and finds one, or we could add a specific endpoint
        const sessions = await MySQL.getAllSessions();
        const session = sessions.data?.find(s => s.id === id);
        return session ? { success: true, data: session } : { success: false, error: 'Not found' };
    }
    const db = getDatabase();
    return db.get<ChatSession>('sessions', id);
}

export async function getAllSessions(): Promise<DBOperation<ChatSession[]>> {
    if (useMySQL) {
        return MySQL.getAllSessions();
    }
    const db = getDatabase();
    const result = await db.getAll<ChatSession>('sessions');

    if (result.success && result.data) {
        result.data.sort((a, b) => b.updated_at - a.updated_at);
    }
    return result;
}

export async function getPinnedSessions(): Promise<DBOperation<ChatSession[]>> {
    // Re-use getAllSessions logic for simplicity in MySQL mode
    const result = await getAllSessions();
    if (result.success && result.data) {
        result.data = result.data
            .filter(s => s.pinned)
            .sort((a, b) => b.updated_at - a.updated_at);
    }
    return result;
}

export async function updateSession(
    id: string,
    updates: Partial<ChatSession>
): Promise<DBOperation<ChatSession>> {
    // Get existing session first
    const existing = await getSession(id);
    if (!existing.success || !existing.data) {
        return { success: false, error: 'Session not found' };
    }

    const updated: ChatSession = {
        ...existing.data,
        ...updates,
        id,
        updated_at: Date.now(),
    };

    if (useMySQL) {
        return MySQL.saveSession(updated);
    }

    const db = getDatabase();
    const result = await db.put('sessions', updated);
    return result.success ? { success: true, data: updated } : { success: false, error: result.error };
}

export async function deleteSession(id: string): Promise<DBOperation<void>> {
    if (useMySQL) {
        return MySQL.deleteSession(id);
    }

    const db = getDatabase();
    // Delete all messages in the session first
    const messagesResult = await db.getAllByIndex<ChatMessage>('messages', 'by_session', id);
    if (messagesResult.success && messagesResult.data) {
        for (const msg of messagesResult.data) {
            await db.delete('messages', msg.id);
        }
    }
    return db.delete('sessions', id);
}

export async function togglePinSession(id: string): Promise<DBOperation<ChatSession>> {
    const session = await getSession(id);
    if (!session.success || !session.data) {
        return { success: false, error: 'Session not found' };
    }
    return updateSession(id, { pinned: !session.data.pinned });
}

// =============================================================================
// MESSAGE OPERATIONS
// =============================================================================

export async function addMessage(
    sessionId: string,
    role: ChatMessage['role'],
    content: string,
    model?: string
): Promise<DBOperation<ChatMessage>> {
    const now = Date.now();
    const message: ChatMessage = {
        id: generateId(),
        session_id: sessionId,
        role,
        content,
        created_at: now,
        model,
    };

    let result: DBOperation<ChatMessage>;

    if (useMySQL) {
        result = await MySQL.saveMessage(message);
    } else {
        const db = getDatabase();
        const dbResult = await db.put('messages', message);
        result = dbResult.success ? { success: true, data: message } : { success: false, error: dbResult.error };
    }

    if (result.success) {
        // Update session's last message and count
        const session = await getSession(sessionId);
        if (session.success && session.data) {
            await updateSession(sessionId, {
                last_message: content.substring(0, 100),
                message_count: session.data.message_count + 1,
            });
        }
    }

    return result;
}

export async function getMessage(id: string): Promise<DBOperation<ChatMessage>> {
    // This is less efficient in MySQL without a specific endpoint, but works
    // For now we assume getSessionMessages is cached or we might need a specific getMessage endpoint
    // Fallback to searching locally if needed, but for now we won't implement single message fetch for MySQL
    // unless strictly needed.
    const db = getDatabase();
    return db.get<ChatMessage>('messages', id);
}

export async function getSessionMessages(
    sessionId: string,
    limit?: number,
    offset?: number
): Promise<DBOperation<ChatMessage[]>> {
    if (useMySQL) {
        const result = await MySQL.getSessionMessages(sessionId);
        // MySQL typically sorts in SQL query (ORDER BY created_at ASC)
        // We can apply client-side limits if API doesn't support them yet
        if (result.success && result.data) {
            if (offset !== undefined || limit !== undefined) {
                result.data = result.data.slice(offset || 0, limit ? (offset || 0) + limit : undefined);
            }
        }
        return result;
    }

    const db = getDatabase();
    const result = await db.getAllByIndex<ChatMessage>('messages', 'by_session', sessionId);

    if (result.success && result.data) {
        result.data.sort((a, b) => a.created_at - b.created_at);
        if (offset !== undefined) result.data = result.data.slice(offset);
        if (limit !== undefined) result.data = result.data.slice(0, limit);
    }
    return result;
}

export async function updateMessage(
    id: string,
    updates: Partial<ChatMessage>
): Promise<DBOperation<ChatMessage>> {
    // Fetch existing logic is slightly tricky with MySQL without getMessage, 
    // but in a real app we'd have getMessage endpoint.
    // For now, let's assume we have the full object or can fetch it.
    // We will rely on optimistic updates or assume the caller has the data.

    // Simplification: We need to find the message first.
    // Since we don't have a direct MySQL getMessage, this might fail in strict mode.
    // But typically the UI has the message object already. 

    // NOTE: This is a limitation of this quick implementation. 
    // We will try to fetch from local cache or fail if not found.

    const db = getDatabase();
    let existingData: ChatMessage | undefined;

    if (!useMySQL) {
        const existing = await db.get<ChatMessage>('messages', id);
        existingData = existing.data;
    } else {
        // In MySQL mode, we might need to implement getMessage properly
        // For now, let's allow "blind" updates if we pass full object (not ideal)
        // OR we just fail for now if strictly adhering to 'updates' partial.
        // A better approach: The caller usually has the message.
        console.warn("updateMessage in MySQL mode requires full message replacement or GET implementation");
    }

    // If we can't find it, we can't properly merge. 
    // However, if the user edits a message, they have the content.

    // IMPROVEMENT: Implement getMessage in MySQL or pass full object.
    // For this bridge, let's assume valid data for saveMessage.

    // Construct updated object IF we had existing. 
    // If we don't have existing, we can't responsibly update partial.

    return { success: false, error: "Update not fully implemented for MySQL bridge yet" };
}

export async function deleteMessage(id: string): Promise<DBOperation<void>> {
    // We need to update session count too
    if (useMySQL) {
        // We handle session count update on server or ignore it (expensive)
        // Or we fetch message 's session_id first.
        return MySQL.deleteMessage(id);
    }

    const db = getDatabase();
    const message = await db.get<ChatMessage>('messages', id);
    if (message.success && message.data) {
        const session = await getSession(message.data.session_id);
        if (session.success && session.data) {
            await updateSession(message.data.session_id, {
                message_count: Math.max(0, session.data.message_count - 1),
            });
        }
    }
    return db.delete('messages', id);
}

export async function addReaction(
    messageId: string,
    emoji: string
): Promise<DBOperation<ChatMessage>> {
    // This requires message fetch.
    return { success: false, error: "Reactions not implemented for MySQL yet" };
}

// =============================================================================
// SEARCH OPERATIONS
// =============================================================================

export async function searchMessages(
    query: string,
    options?: {
        sessionId?: string;
        limit?: number;
    }
): Promise<DBOperation<ChatMessage[]>> {
    if (useMySQL) {
        // Implement search endpoint in PHP if needed
        return { success: false, error: "Search not implemented for MySQL yet" };
    }

    const db = getDatabase();
    const result = await db.getAll<ChatMessage>('messages');

    if (!result.success || !result.data) {
        return result;
    }

    const lowerQuery = query.toLowerCase();
    let messages = result.data.filter(
        msg =>
            msg.content.toLowerCase().includes(lowerQuery) &&
            (!options?.sessionId || msg.session_id === options.sessionId)
    );

    messages.sort((a, b) => {
        const aExact = a.content.toLowerCase().startsWith(lowerQuery);
        const bExact = b.content.toLowerCase().startsWith(lowerQuery);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return b.created_at - a.created_at;
    });

    if (options?.limit) {
        messages = messages.slice(0, options.limit);
    }

    return { success: true, data: messages };
}

export async function searchSessions(
    query: string,
    limit?: number
): Promise<DBOperation<ChatSession[]>> {
    if (useMySQL) {
        // We can fetch all and filter client side for now (not efficient but works for small data)
        const result = await getAllSessions();
        if (result.success && result.data) {
            const lowerQuery = query.toLowerCase();
            let sessions = result.data.filter(
                session =>
                    session.title.toLowerCase().includes(lowerQuery) ||
                    session.last_message?.toLowerCase().includes(lowerQuery) ||
                    session.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
            if (limit) sessions = sessions.slice(0, limit);
            return { success: true, data: sessions };
        }
        return result;
    }

    const db = getDatabase();
    const result = await db.getAll<ChatSession>('sessions');

    if (!result.success || !result.data) {
        return result;
    }

    const lowerQuery = query.toLowerCase();
    let sessions = result.data.filter(
        session =>
            session.title.toLowerCase().includes(lowerQuery) ||
            session.last_message?.toLowerCase().includes(lowerQuery) ||
            session.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    if (limit) {
        sessions = sessions.slice(0, limit);
    }

    return { success: true, data: sessions };
}

// =============================================================================
// EXPORT/IMPORT OPERATIONS
// =============================================================================

export interface ExportData {
    version: string;
    exported_at: number;
    sessions: ChatSession[];
    messages: ChatMessage[];
}

export async function exportAllData(): Promise<DBOperation<ExportData>> {
    // Implement for MySQL if needed
    return { success: false, error: "Export not implemented for MySQL yet" };
}

export async function exportSession(
    sessionId: string
): Promise<DBOperation<ExportData>> {
    // Implement for MySQL if needed
    return { success: false, error: "Export not implemented for MySQL yet" };
}

export async function importData(data: ExportData): Promise<DBOperation<void>> {
    // Implement for MySQL if needed
    return { success: false, error: "Import not implemented for MySQL yet" };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function getStorageStats(): Promise<{
    sessionCount: number;
    messageCount: number;
    storageUsed: number;
    storageQuota: number;
}> {
    if (useMySQL) {
        const sessions = await getAllSessions();
        return {
            sessionCount: sessions.data?.length || 0,
            messageCount: 0, // Need count endpoint
            storageUsed: 0,
            storageQuota: 0
        };
    }

    const db = getDatabase();
    const sessionsResult = await db.count('sessions');
    const messagesResult = await db.count('messages');
    const storageResult = await db.getStorageUsage();

    return {
        sessionCount: sessionsResult.data || 0,
        messageCount: messagesResult.data || 0,
        storageUsed: storageResult.data?.usage || 0,
        storageQuota: storageResult.data?.quota || 0,
    };
}

export async function clearAllData(): Promise<DBOperation<void>> {
    if (useMySQL) {
        return { success: false, error: "Clear all not allowed on Cloud DB" };
    }

    const db = getDatabase();
    await db.clear('sessions');
    await db.clear('messages');
    await db.clear('attachments');
    return { success: true };
}

