import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type ModelKey } from '@/lib/ai';
import { toast } from 'sonner';

// Define types locally since we are using a custom migration
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

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch sessions
    const fetchSessions = useCallback(async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .order('pinned', { ascending: false })
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
            toast.error(`Failed to load chat history: ${error.message}`);
            return;
        }

        // Cast to unknown first to avoid type mismatch if the type isn't perfectly aligned with auto-generated ones yet
        setSessions(data as unknown as ChatSession[]);
    }, [userId]);

    // Initial fetch and realtime subscription for sessions
    useEffect(() => {
        if (!userId) return;

        fetchSessions();

        const channel = supabase
            .channel('ai_conversations_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'ai_conversations',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchSessions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchSessions]);

    // Fetch messages for active session
    const fetchMessages = useCallback(async (sessionId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } else {
            setMessages(data as unknown as ChatMessage[]);
        }
        setLoading(false);
    }, []);

    // Effect to fetch messages when active session changes
    useEffect(() => {
        if (activeSessionId) {
            fetchMessages(activeSessionId);

            // Subscribe to new messages
            const channel = supabase
                .channel(`ai_messages:${activeSessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'ai_messages',
                        filter: `conversation_id=eq.${activeSessionId}`,
                    },
                    (payload) => {
                        const newMsg = payload.new as unknown as ChatMessage;
                        setMessages((prev) => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            setMessages([]);
        }
    }, [activeSessionId, fetchMessages]);

    // Actions
    const createSession = async (model: ModelKey, title: string = 'New Chat') => {
        if (!userId) {
            toast.error('You must be logged in to create a chat');
            return null;
        }

        const { data, error } = await supabase
            .from('ai_conversations')
            .insert({
                user_id: userId,
                title,
                model,
                pinned: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating session:', error);
            toast.error(`Failed to create new chat: ${error.message}`);
            return null;
        }

        const newSession = data as unknown as ChatSession;
        // Optimistic update handled by realtime subscription usually, but we can set it immediately for responsiveness
        setActiveSessionId(newSession.id);
        return newSession;
    };

    const deleteSession = async (id: string) => {
        const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete chat');
            return false;
        }

        if (activeSessionId === id) {
            setActiveSessionId(null);
        }
        return true;
    };

    const updateSession = async (id: string, updates: Partial<ChatSession>) => {
        const { error } = await supabase
            .from('ai_conversations')
            .update(updates)
            .eq('id', id);

        if (error) {
            toast.error('Failed to update chat');
            return false;
        }
        return true;
    };

    const addMessage = async (sessionId: string, role: 'user' | 'assistant', content: string, model?: string) => {
        // Optimistic UI update could be done here, but we rely on realtime for now or local state in UI

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

        // Also update the last_message field of the conversation
        await supabase
            .from('ai_conversations')
            .update({
                last_message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        return data as unknown as ChatMessage;
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
        setMessages // exposed for optimistic updates if needed
    };
}
