
/**
 * Tool Storage Adapter
 * Handles persistence for tool execution history and caching
 */

import { getDatabase, type DBOperation } from './indexeddb';
import { apiRequest } from '../api/db';
import { useMySQL } from './config';
import type { ToolInput, ToolOutput } from '../ai-chat-types';

// =============================================================================
// TYPES
// =============================================================================

export interface ToolCacheEntry {
    id: string;
    tool_id: string;
    input_hash: string;
    output: ToolOutput;
    created_at: number;
    expires_at: number;
}

export interface ToolHistoryEntry {
    id: string;
    tool_id: string;
    session_id: string;
    input: ToolInput;
    output: ToolOutput;
    execution_time: number;
    cached: boolean;
    created_at: number;
    metadata?: Record<string, unknown>;
}

// =============================================================================
// CACHE OPERATIONS
// =============================================================================

export async function getCachedResult(toolId: string, inputHash: string): Promise<ToolOutput | null> {
    if (useMySQL) {
        const result = await apiRequest<ToolCacheEntry>(`get_tool_cache&tool_id=${toolId}&input_hash=${inputHash}`);
        if (result.success && result.data) {
            return result.data.output;
        }
        return null;
    }

    try {
        const db = getDatabase();
        const result = await db.getFromIndex<ToolCacheEntry>('tool_cache', 'by_tool_input', `${toolId}-${inputHash}`);

        if (result.success && result.data) {
            // Check if cache is still valid
            if (result.data.expires_at > Date.now()) {
                return result.data.output;
            }
            // Cache expired, delete it
            await db.delete('tool_cache', result.data.id);
        }
    } catch (error) {
        console.warn('Cache lookup failed:', error);
    }
    return null;
}

export async function setCachedResult(entry: ToolCacheEntry): Promise<void> {
    if (useMySQL) {
        await apiRequest('save_tool_cache', 'POST', entry);
        return;
    }

    try {
        const db = getDatabase();
        // IndexedDB requires specific ID structure for the index if we want it unique per tool+input
        // But our index definition handles it on the keyPath usually.
        // The index defined in indexeddb.ts is 'by_tool_input' on 'tool_id-input_hash'??
        // Wait, the index key path was complex in indexeddb.ts? 
        // Checking indexeddb.ts: { name: 'by_tool_input', keyPath: 'tool_id-input_hash', unique: true }
        // This keyPath implies a property named "tool_id-input_hash" exists on the object OR it's a compound key?
        // IDB compound keys are arrays. 'tool_id-input_hash' string with hyphen looks like a property name.
        // Let's ensure we add that property if using local DB to match the index definition.

        const localEntry = {
            ...entry,
            'tool_id-input_hash': `${entry.tool_id}-${entry.input_hash}`
        };

        await db.put('tool_cache', localEntry);
    } catch (error) {
        console.warn('Cache storage failed:', error);
    }
}

export async function clearCache(): Promise<void> {
    if (useMySQL) {
        // Not implemented in API yet, skipping for safety
        return;
    }
    const db = getDatabase();
    await db.clear('tool_cache');
}

// =============================================================================
// HISTORY OPERATIONS
// =============================================================================

export async function recordHistory(entry: ToolHistoryEntry): Promise<void> {
    if (useMySQL) {
        await apiRequest('save_tool_history', 'POST', entry);
        return;
    }

    try {
        const db = getDatabase();
        await db.put('tool_history', entry);

        // Cleanup old local entries (naive implementation)
        // In MySQL we handle cleanup on server side or ignore for now
    } catch (error) {
        console.warn('Failed to record tool history:', error);
    }
}

export async function getHistory(sessionId?: string, limit: number = 50): Promise<ToolHistoryEntry[]> {
    if (useMySQL) {
        let url = `get_tool_history&limit=${limit}`;
        if (sessionId) url += `&session_id=${sessionId}`;

        const result = await apiRequest<ToolHistoryEntry[]>(url);
        return result.success && result.data ? result.data : [];
    }

    try {
        const db = getDatabase();
        const result = sessionId
            ? await db.getAllByIndex<ToolHistoryEntry>('tool_history', 'by_session', sessionId)
            : await db.getAll<ToolHistoryEntry>('tool_history');

        if (result.success && result.data) {
            return result.data
                .sort((a, b) => b.created_at - a.created_at)
                .slice(0, limit);
        }
    } catch (error) {
        console.warn('Failed to get tool history:', error);
    }
    return [];
}

export async function clearHistory(): Promise<void> {
    if (useMySQL) {
        // Not implemented
        return;
    }
    const db = getDatabase();
    await db.clear('tool_history');
}
