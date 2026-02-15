/**
 * useChatStorage Hook
 * React hook for IndexedDB-based chat storage
 */

import { useState, useEffect, useCallback } from 'react';
import {
    type ChatSession,
    type ChatMessage,
    createSession,
    getAllSessions,
    getSession,
    updateSession,
    deleteSession,
    togglePinSession,
    addMessage,
    getSessionMessages,
    updateMessage,
    deleteMessage,
    addReaction,
    searchMessages,
    searchSessions,
    exportAllData,
    exportSession,
    importData,
    getStorageStats,
    clearAllData,
    type ExportData,
} from '@/lib/storage/chatStorage';
import type { ModelKey } from '@/lib/ai';

interface UseChatStorageState<T> {
    data: T;
    loading: boolean;
    error: string | null;
}

export function useChatStorage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize - load sessions
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAllSessions();
            if (result.success && result.data) {
                setSessions(result.data);
            } else {
                setError(result.error || 'Failed to load sessions');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSession = useCallback(async (sessionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const [sessionResult, messagesResult] = await Promise.all([
                getSession(sessionId),
                getSessionMessages(sessionId),
            ]);

            if (sessionResult.success && sessionResult.data) {
                setActiveSession(sessionResult.data);
            } else {
                setError(sessionResult.error || 'Session not found');
                return;
            }

            if (messagesResult.success && messagesResult.data) {
                setMessages(messagesResult.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const createNewSession = useCallback(async (
        title?: string,
        model?: ModelKey
    ): Promise<ChatSession | null> => {
        setError(null);
        try {
            const result = await createSession(title, model);
            if (result.success && result.data) {
                setSessions(prev => [result.data!, ...prev]);
                return result.data;
            } else {
                setError(result.error || 'Failed to create session');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        }
    }, []);

    const updateCurrentSession = useCallback(async (
        updates: Partial<ChatSession>
    ): Promise<boolean> => {
        if (!activeSession) return false;

        setError(null);
        try {
            const result = await updateSession(activeSession.id, updates);
            if (result.success && result.data) {
                setActiveSession(result.data);
                setSessions(prev => prev.map(s =>
                    s.id === activeSession.id ? result.data! : s
                ));
                return true;
            } else {
                setError(result.error || 'Failed to update session');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [activeSession]);

    const removeSession = useCallback(async (sessionId: string): Promise<boolean> => {
        setError(null);
        try {
            const result = await deleteSession(sessionId);
            if (result.success) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                if (activeSession?.id === sessionId) {
                    setActiveSession(null);
                    setMessages([]);
                }
                return true;
            } else {
                setError(result.error || 'Failed to delete session');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [activeSession]);

    const togglePin = useCallback(async (sessionId: string): Promise<boolean> => {
        setError(null);
        try {
            const result = await togglePinSession(sessionId);
            if (result.success && result.data) {
                setSessions(prev => prev.map(s =>
                    s.id === sessionId ? result.data! : s
                ));
                if (activeSession?.id === sessionId) {
                    setActiveSession(result.data);
                }
                return true;
            } else {
                setError(result.error || 'Failed to toggle pin');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [activeSession]);

    const sendMessage = useCallback(async (
        content: string,
        role: ChatMessage['role'] = 'user',
        model?: string
    ): Promise<ChatMessage | null> => {
        if (!activeSession) return null;

        setError(null);
        try {
            const result = await addMessage(activeSession.id, role, content, model);
            if (result.success && result.data) {
                setMessages(prev => [...prev, result.data!]);
                // Update session in list
                setSessions(prev => prev.map(s =>
                    s.id === activeSession.id
                        ? { ...s, last_message: content.substring(0, 100), message_count: s.message_count + 1 }
                        : s
                ));
                return result.data;
            } else {
                setError(result.error || 'Failed to send message');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        }
    }, [activeSession]);

    const editMessage = useCallback(async (
        messageId: string,
        content: string
    ): Promise<boolean> => {
        setError(null);
        try {
            const result = await updateMessage(messageId, { content });
            if (result.success && result.data) {
                setMessages(prev => prev.map(m =>
                    m.id === messageId ? result.data! : m
                ));
                return true;
            } else {
                setError(result.error || 'Failed to edit message');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, []);

    const removeMessage = useCallback(async (messageId: string): Promise<boolean> => {
        setError(null);
        try {
            const result = await deleteMessage(messageId);
            if (result.success) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
                return true;
            } else {
                setError(result.error || 'Failed to delete message');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, []);

    const reactToMessage = useCallback(async (
        messageId: string,
        emoji: string
    ): Promise<boolean> => {
        setError(null);
        try {
            const result = await addReaction(messageId, emoji);
            if (result.success && result.data) {
                setMessages(prev => prev.map(m =>
                    m.id === messageId ? result.data! : m
                ));
                return true;
            } else {
                setError(result.error || 'Failed to add reaction');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        sessions,
        activeSession,
        messages,
        loading,
        error,

        // Session actions
        loadSessions,
        loadSession,
        createSession: createNewSession,
        updateSession: updateCurrentSession,
        deleteSession: removeSession,
        togglePin,
        clearError,
    };
}

export function useMessageSearch(sessionId?: string) {
    const [results, setResults] = useState<ChatMessage[]>([]);
    const [sessionResults, setSessionResults] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setSessionResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [messagesResult, sessionsResult] = await Promise.all([
                searchMessages(query, { sessionId, limit: 50 }),
                searchSessions(query, 10),
            ]);

            if (messagesResult.success && messagesResult.data) {
                setResults(messagesResult.data);
            }

            if (sessionsResult.success && sessionsResult.data) {
                setSessionResults(sessionsResult.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    const clear = useCallback(() => {
        setResults([]);
        setSessionResults([]);
        setError(null);
    }, []);

    return {
        results,
        sessionResults,
        loading,
        error,
        search,
        clear,
    };
}

export function useStorageStats() {
    const [stats, setStats] = useState({
        sessionCount: 0,
        messageCount: 0,
        storageUsed: 0,
        storageQuota: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getStorageStats();
            setStats(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        stats,
        loading,
        error,
        refresh,
    };
}

export function useExportImport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exportAll = useCallback(async (): Promise<ExportData | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await exportAllData();
            if (result.success && result.data) {
                return result.data;
            } else {
                setError(result.error || 'Export failed');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const exportOne = useCallback(async (sessionId: string): Promise<ExportData | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await exportSession(sessionId);
            if (result.success && result.data) {
                return result.data;
            } else {
                setError(result.error || 'Export failed');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const importAll = useCallback(async (data: ExportData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await importData(data);
            if (result.success) {
                return true;
            } else {
                setError(result.error || 'Import failed');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAll = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await clearAllData();
            if (result.success) {
                return true;
            } else {
                setError(result.error || 'Clear failed');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Clear failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        exportAll,
        exportOne,
        importAll,
        clearAll,
    };
}
