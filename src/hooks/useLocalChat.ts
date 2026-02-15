import { useState, useCallback, useEffect } from 'react';
import { type ModelKey } from '@/lib/ai';
import { toast } from 'sonner';

// Local storage keys
const STORAGE_KEYS = {
    SESSIONS: 'gnexus_chat_sessions',
    MESSAGES: 'gnexus_chat_messages_',
};

// Generate unique ID
const generateId = () => crypto.randomUUID();

// Get local user ID
const getLocalUserId = () => {
    let userId = localStorage.getItem('gnexus_local_user_id');
    if (!userId) {
        userId = 'local_' + generateId();
        localStorage.setItem('gnexus_local_user_id', userId);
    }
    return userId;
};

export interface ChatSession {
    id: string;
    title: string;
    model: ModelKey;
    created_at: string;
    updated_at: string;
    pinned: boolean;
    last_message: string | null;
    user_id: string;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
    reasoning_details?: any;
    created_at: string;
    model?: string;
    latency?: number;
    tokens?: number;
}

// Local storage helpers
const getSessions = (): ChatSession[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveSessions = (sessions: ChatSession[]) => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

const getMessages = (sessionId: string): ChatMessage[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MESSAGES + sessionId);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveMessages = (sessionId: string, messages: ChatMessage[]) => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES + sessionId, JSON.stringify(messages));
};

export function useLocalChat() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId] = useState<string>(() => getLocalUserId());

    // Load sessions on mount
    useEffect(() => {
        const loadedSessions = getSessions();
        setSessions(loadedSessions);
    }, []);

    // Fetch messages when active session changes
    useEffect(() => {
        if (activeSessionId) {
            const loadedMessages = getMessages(activeSessionId);
            setMessages(loadedMessages);
        } else {
            setMessages([]);
        }
    }, [activeSessionId]);

    // Fetch sessions
    const fetchSessions = useCallback(() => {
        const loadedSessions = getSessions();
        setSessions(loadedSessions);
    }, []);

    // Create new chat session
    const createSession = useCallback(async (model: ModelKey, title: string = 'New Chat') => {
        const newSession: ChatSession = {
            id: generateId(),
            user_id: userId,
            title,
            model,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            pinned: false,
            last_message: null,
        };

        const allSessions = getSessions();
        allSessions.unshift(newSession);
        saveSessions(allSessions);
        setSessions(allSessions);
        setActiveSessionId(newSession.id);

        return newSession;
    }, [userId]);

    // Delete session
    const deleteSession = useCallback(async (id: string) => {
        // Remove session
        const allSessions = getSessions().filter(s => s.id !== id);
        saveSessions(allSessions);
        setSessions(allSessions);

        // Remove messages
        localStorage.removeItem(STORAGE_KEYS.MESSAGES + id);

        if (activeSessionId === id) {
            setActiveSessionId(null);
            setMessages([]);
        }

        return true;
    }, [activeSessionId]);

    // Update session
    const updateSession = useCallback(async (id: string, updates: Partial<ChatSession>) => {
        const allSessions = getSessions();
        const index = allSessions.findIndex(s => s.id === id);

        if (index === -1) return false;

        allSessions[index] = { ...allSessions[index], ...updates, updated_at: new Date().toISOString() };
        saveSessions(allSessions);
        setSessions(allSessions);

        return true;
    }, []);

    // Add message
    const addMessage = useCallback(async (
        sessionId: string,
        role: 'user' | 'assistant',
        content: string,
        reasoning?: string,
        model?: string,
        latency?: number,
        tokens?: number,
        reasoning_details?: any
    ) => {
        const newMessage: ChatMessage = {
            id: generateId(),
            conversation_id: sessionId,
            role,
            content,
            reasoning,
            reasoning_details,
            created_at: new Date().toISOString(),
            model,
            latency,
            tokens,
        };

        const allMessages = getMessages(sessionId);
        allMessages.push(newMessage);
        saveMessages(sessionId, allMessages);
        setMessages(allMessages);

        // Update session's last_message
        const allSessions = getSessions();
        const sessionIndex = allSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            allSessions[sessionIndex] = {
                ...allSessions[sessionIndex],
                last_message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                updated_at: new Date().toISOString(),
            };
            saveSessions(allSessions);
            setSessions(allSessions);
        }

        return newMessage;
    }, []);

    return {
        sessions,
        messages,
        activeSessionId,
        setActiveSessionId,
        loading,
        userId,
        createSession,
        deleteSession,
        updateSession,
        addMessage,
        setMessages,
        fetchSessions,
    };
}
