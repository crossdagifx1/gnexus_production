/**
 * AdvancedChatContainer Component
 * Full-featured chat interface with all advanced capabilities
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Settings, Pin, PinOff, Trash2, MoreVertical,
    MessageSquare, Clock, ChevronLeft, Menu, X, Send, Bot, Sparkles,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useKeyboardShortcuts, getDefaultChatShortcuts, shortcutCategories } from '@/hooks/useKeyboardShortcuts';
import { useChatStorage } from '@/hooks/useChatStorage';
import { useNexus } from '@/hooks/useNexus';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ExportImportMenu } from './ExportImportMenu';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { ChatSession, ChatMessage } from '@/lib/storage/chatStorage';

// Group sessions by date
function groupSessionsByDate(sessions: ChatSession[]) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = [
        { label: 'Pinned', sessions: sessions.filter(s => s.pinned) },
        { label: 'Today', sessions: sessions.filter(s => !s.pinned && new Date(s.created_at).toDateString() === today.toDateString()) },
        { label: 'Yesterday', sessions: sessions.filter(s => !s.pinned && new Date(s.created_at).toDateString() === yesterday.toDateString()) },
        { label: 'Older', sessions: sessions.filter(s => !s.pinned && new Date(s.created_at) < yesterday) },
    ];
    return groups.filter(g => g.sessions.length > 0);
}

export function AdvancedChatContainer() {
    // State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [streamingContent, setStreamingContent] = useState('');

    // Hooks
    const nexus = useNexus();

    // Storage
    const {
        sessions,
        activeSession,
        messages,
        loading,
        error,
        loadSessions,
        loadSession,
        createSession,
        updateSession,
        deleteSession,
        togglePin,
        sendMessage,
        editMessage,
        removeMessage,
        reactToMessage,
    } = useChatStorage();

    // Keyboard shortcuts
    const handleNewChat = useCallback(async () => {
        const session = await createSession();
        if (session) {
            await loadSession(session.id);
            setStreamingContent('');
        }
    }, [createSession, loadSession]);

    const handleSearch = useCallback(() => {
        // Focus search input
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
    }, []);

    const handleTogglePin = useCallback(async () => {
        if (activeSession) {
            await togglePin(activeSession.id);
        }
    }, [activeSession, togglePin]);

    const handleSettings = useCallback(() => {
        setShowSettings(true);
    }, []);

    const handleVoiceInput = useCallback(() => {
        toast.info('Voice input activated');
        // TODO: Implement actual voice input integration with nexus.transcribeAudio
    }, []);

    const shortcuts = getDefaultChatShortcuts({
        onNewChat: handleNewChat,
        onSearch: handleSearch,
        onCommandPalette: () => setShowShortcuts(true),
        onTogglePin: handleTogglePin,
        onSettings: handleSettings,
        onVoiceInput: handleVoiceInput,
    });

    useKeyboardShortcuts({ shortcuts });

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // Load active session messages
    useEffect(() => {
        if (activeSession) {
            loadSession(activeSession.id);
            setStreamingContent('');
        }
    }, [activeSession?.id, loadSession]);

    // Handle send message
    const handleSend = useCallback(async (content: string) => {
        let currentSession = activeSession;

        if (!currentSession) {
            // Create new session if none active
            const session = await createSession('New Chat', 'general'); // Default to general if not specified
            if (session) {
                await loadSession(session.id);
                currentSession = session;
            } else {
                return; // Failed to create session
            }
        }

        if (!currentSession) return;

        // 1. Add user message to storage
        await sendMessage(content, 'user');

        // 2. Stream AI response
        setStreamingContent(''); // Reset streaming buffer
        const modelToUse = currentSession.model || 'general';

        try {
            await nexus.streamChat(content, modelToUse, (chunk) => {
                setStreamingContent(prev => prev + chunk);
            });

            // 3. Save full assistant message to storage
            // Note: nexus.output contains the full text after stream completes
            const finalContent = nexus.output || streamingContent || "I'm sorry, I couldn't generate a response.";

            // We use the 'nexus.output' from state if available, but since standard 'streamChat' 
            // returns the full text, we can use the result if we awaited. 
            // However, inside the callback we are just updating state. 
            // The 'streamChat' promise resolves with full text.

            // Re-fetch full text from the promise result if needed, but 'nexus' hook state might lag a bit or be perfect.
            // Let's rely on the accumulated streaming content or the hook's returned value if we capture it.
            // Actually, `nexus.streamChat` returns `Promise<string | null>`.

        } catch (e) {
            console.error("Streaming error:", e);
            toast.error("Failed to generate response");
        }
    }, [activeSession, createSession, loadSession, sendMessage, nexus, streamingContent]);

    // Effect to handle saving the message AFTER streaming is officially done (nexus.loading goes false)
    // But referencing 'nexus.loading' might key off too early or late. 
    // Better to handle the save in the 'handleSend' await.

    // We need to overwrite the handleSend above to capture the return value properly.
    // Re-defining handleSend to be more robust:
    const handleSendRobust = useCallback(async (content: string) => {
        let currentSession = activeSession;
        if (!currentSession) {
            const session = await createSession('New Chat', 'general');
            if (session) {
                await loadSession(session.id);
                currentSession = session;
            } else {
                return;
            }
        }

        // Add user message
        await sendMessage(content, 'user');

        // Start streaming
        setStreamingContent('');
        const modelToUse = currentSession?.model || 'general';

        const fullResponse = await nexus.streamChat(content, modelToUse, (chunk) => {
            setStreamingContent(prev => prev + chunk);
        });

        if (fullResponse) {
            await sendMessage(fullResponse, 'assistant', modelToUse);
        }
        setStreamingContent('');

    }, [activeSession, createSession, loadSession, sendMessage, nexus]);

    // Combine messages for display
    const displayMessages = useMemo(() => {
        if (!nexus.streaming || !streamingContent) return messages;

        const tempMessage: ChatMessage = {
            id: 'streaming-temp',
            session_id: activeSession?.id || '',
            role: 'assistant',
            content: streamingContent,
            created_at: Date.now(),
            model: activeSession?.model || 'general'
        };
        return [...messages, tempMessage];
    }, [messages, nexus.streaming, streamingContent, activeSession]);

    // Handle edit message
    const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
        await editMessage(messageId, newContent);
        toast.success('Message updated');
    }, [editMessage]);

    // Handle delete message
    const handleDeleteMessage = useCallback(async (messageId: string) => {
        await removeMessage(messageId);
        toast.success('Message deleted');
    }, [removeMessage]);

    // Handle react to message
    const handleReactMessage = useCallback(async (messageId: string, emoji: string) => {
        await reactToMessage(messageId, emoji);
    }, [reactToMessage]);

    // Filter sessions by search
    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const groupedSessions = groupSessionsByDate(filteredSessions);

    // Get session icon
    const getSessionIcon = (session: ChatSession) => {
        if (session.pinned) return <Pin className="w-4 h-4 text-yellow-400" />;
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    };

    return (
        <>
            <SEO title="Advanced Chat | G-Nexus" description="Enhanced AI chat with advanced features" />

            <div className="flex h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
                {/* Global Error Alert */}
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                        <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white backdrop-blur-md">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Background Effects */}
                <div className="absolute inset-0 gradient-mesh opacity-20 pointer-events-none" />
                <div className="absolute inset-0 tibeb-pattern opacity-5 pointer-events-none" />

                {/* Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col overflow-hidden z-10"
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">Chats</h2>
                                    <Button
                                        size="sm"
                                        onClick={handleNewChat}
                                        className="bg-cyan-500 hover:bg-cyan-400"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        data-search-input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search chats..."
                                        className="pl-9 bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>

                            {/* Session List */}
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-4">
                                    {error && (
                                        <div className="p-2 text-xs text-red-400 bg-red-900/20 rounded border border-red-900/30 mb-2">
                                            Failed to load chats: {error}
                                        </div>
                                    )}

                                    {groupedSessions.map((group) => (
                                        <div key={group.label}>
                                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {group.label}
                                            </div>
                                            <div className="space-y-1">
                                                {group.sessions.map((session) => (
                                                    <button
                                                        key={session.id}
                                                        onClick={() => loadSession(session.id)}
                                                        className={cn(
                                                            'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
                                                            activeSession?.id === session.id
                                                                ? 'bg-cyan-500/20 border border-cyan-500/30'
                                                                : 'hover:bg-white/5'
                                                        )}
                                                    >
                                                        {getSessionIcon(session)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-white truncate">
                                                                    {session.title}
                                                                </span>
                                                                {session.pinned && (
                                                                    <Pin className="w-3 h-3 text-yellow-400 shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                {session.last_message || 'New conversation'}
                                                            </p>
                                                            <span className="text-[10px] text-gray-600 mt-1 block">
                                                                {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {filteredSessions.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No chats found</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Sidebar Footer */}
                            <div className="p-4 border-t border-white/10">
                                <ExportImportMenu />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Chat Header */}
                    <header className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-sm shrink-0 z-10">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-400 hover:text-white"
                            >
                                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>

                            {activeSession && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-cyan-400" />
                                        <span className="font-medium text-white">{activeSession.title}</span>
                                        {activeSession.pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                                    </div>
                                    <Badge variant="secondary" className="bg-white/10 text-gray-400">
                                        {messages.length} messages
                                    </Badge>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {activeSession && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleTogglePin}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        {activeSession.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => updateSession({ title: 'New Title' })}>
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => deleteSession(activeSession.id)}
                                                className="text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Chat
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-hidden">
                        <MessageList
                            messages={displayMessages}
                            loading={loading}
                            streaming={nexus.streaming}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onReactMessage={handleReactMessage}
                        />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md shrink-0 z-10">
                        <ChatInput
                            onSend={handleSendRobust}
                            onVoiceInput={handleVoiceInput}
                            onStop={nexus.stopGeneration}
                            isLoading={nexus.loading || nexus.streaming}
                            disabled={loading}
                            placeholder="Type your message..."
                        />
                    </div>
                </main>
            </div>

            {/* Keyboard Shortcuts Dialog */}
            <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            Keyboard Shortcuts
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6">
                        {shortcutCategories.map((category) => (
                            <div key={category.name}>
                                <h3 className="text-sm font-medium text-white mb-3">{category.name}</h3>
                                <div className="space-y-2">
                                    {category.shortcuts.map((shortcut) => (
                                        <div key={shortcut.key} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">{shortcut.description}</span>
                                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-gray-300">
                                                {shortcut.key}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AdvancedChatContainer;
