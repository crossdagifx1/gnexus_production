import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type ModelKey } from '@/lib/ai';
import { toast } from 'sonner';

// Generate a local user ID for anonymous use
const getLocalUserId = () => {
    let userId = localStorage.getItem('gnexus_local_user_id');
    if (!userId) {
        userId = 'local_' + crypto.randomUUID();
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
    created_at: string;
    model?: string;
}

export function useSupabaseChat() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const initialized = useRef(false);

    // Get or create local user ID
    useEffect(() => {
        const localUserId = getLocalUserId();
        setUserId(localUserId);
        initialized.current = true;
    }, []);

    // Fetch sessions
    const fetchSessions = useCallback(async () => {
        if (!userId || !initialized.current) return;

        try {
            const { data, error } = await supabase
                .from('ai_conversations')
                .select('*')
                .eq('user_id', userId)
                .order('pinned', { ascending: false })
                .order('updated_at', { ascending: false });

            if (error) {
                // Table might not exist yet, silently fail
                console.warn('Could not fetch sessions:', error.message);
                return;
            }

            setSessions(data as unknown as ChatSession[]);
        } catch (err) {
            console.warn('Error fetching sessions:', err);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        if (userId && initialized.current) {
            fetchSessions();
        }
    }, [userId, fetchSessions]);

    // Fetch messages for active session
    const fetchMessages = useCallback(async (sessionId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_messages')
                .select('*')
                .eq('conversation_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) {
                console.warn('Could not fetch messages:', error.message);
                setMessages([]);
            } else {
                setMessages(data as unknown as ChatMessage[]);
            }
        } catch (err) {
            console.warn('Error fetching messages:', err);
            setMessages([]);
        }
        setLoading(false);
    }, []);

    // Effect to fetch messages when active session changes
    useEffect(() => {
        if (activeSessionId) {
            fetchMessages(activeSessionId);
        } else {
            setMessages([]);
        }
    }, [activeSessionId, fetchMessages]);

    // Actions
    const createSession = async (model: ModelKey, title: string = 'New Chat') => {
        const currentUserId = userId || getLocalUserId();

        try {
            const { data, error } = await supabase
                .from('ai_conversations')
                .insert({
                    user_id: currentUserId,
                    title,
                    model,
                    pinned: false
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating session:', error);
                toast.error(`Failed to create chat: ${error.message}`);
                return null;
            }

            const newSession = data as unknown as ChatSession;
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            return newSession;
        } catch (err) {
            console.error('Error creating session:', err);
            toast.error('Failed to create chat');
            return null;
        }
    };

    const deleteSession = async (id: string) => {
        try {
            const { error } = await supabase
                .from('ai_conversations')
                .delete()
                .eq('id', id);

            if (error) {
                toast.error('Failed to delete chat');
                return false;
            }

            setSessions(prev => prev.filter(s => s.id !== id));
            if (activeSessionId === id) {
                setActiveSessionId(null);
            }
            return true;
        } catch (err) {
            console.error('Error deleting session:', err);
            return false;
        }
    };

    const updateSession = async (id: string, updates: Partial<ChatSession>) => {
        try {
            const { error } = await supabase
                .from('ai_conversations')
                .update(updates)
                .eq('id', id);

            if (error) {
                toast.error('Failed to update chat');
                return false;
            }

            setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
            return true;
        } catch (err) {
            console.error('Error updating session:', err);
            return false;
        }
    };

    const addMessage = async (sessionId: string, role: 'user' | 'assistant', content: string, model?: string) => {
        try {
            const { data, error } = await supabase
                .from('ai_messages')
                .insert({
                    conversation_id: sessionId,
                    role,
                    content,
                    model
                })
                .select()
                .single();

            if (error) {
                console.error('Error sending message:', error);
                toast.error('Failed to save message');
                return null;
            }

            const newMessage = data as unknown as ChatMessage;
            setMessages(prev => [...prev, newMessage]);

            // Update conversation's last_message
            await supabase
                .from('ai_conversations')
                .update({
                    last_message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    updated_at: new Date().toISOString()
                })
                .eq('id', sessionId);

            return newMessage;
        } catch (err) {
            console.error('Error adding message:', err);
            return null;
        }
    };

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
        setMessages
    };
}
