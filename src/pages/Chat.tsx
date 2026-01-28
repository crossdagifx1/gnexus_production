/**
 * G-CORE CHAT PAGE
 * 
 * The main conversational interface for the G-Core AI Advisor.
 * Features a cyberpunk/sigma aesthetic with glassmorphism effects,
 * animated gradients, and real-time AI chat capabilities.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Menu,
    X,
    MessageSquare,
    Plus,
    Trash2,
    Copy,
    Check,
    Terminal,
    Sparkles,
    ChevronLeft,
    Volume2,
    Settings,
    MoreVertical,
    Search,
    Clock,
    Zap,
    Download,
    HelpCircle,
    Pin,
    PenLine,
    BarChart3,
    Calendar,
    Share2,
    MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useNexusChat } from '@/hooks/useNexus';
import { AI_MODELS, type ModelKey } from '@/lib/ai';
import { SettingsModal } from '@/components/SettingsModal';
import { SEO } from '@/components/SEO';
import { useSupabaseChat, type ChatSession } from '@/hooks/useSupabaseChat';

// =============================================================================
// TYPES
// =============================================================================

// INTERFACES REMOVED (Using one from hook)

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_SESSIONS: ChatSession[] = [
    {
        id: '1',
        title: 'Project Nexus Architecture',
        lastMessage: 'Let\'s review the system design...',
        timestamp: new Date(),
        model: 'coder',
        pinned: true,
    },
    {
        id: '2',
        title: 'Marketing Strategy Q1',
        lastMessage: 'Target audience analysis completed.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        model: 'marketing',
    },
    {
        id: '3',
        title: 'Code Review: Auth Flow',
        lastMessage: 'Check the JWT validation logic.',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        model: 'coder',
    },
    {
        id: '4',
        title: 'System Optimization',
        lastMessage: 'Memory usage reduced by 20%.',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        model: 'analyst',
    }
];

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Code Block with Copy functionality
 */
const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-3 rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-white/10">
                <span className="text-xs font-mono text-cyan-400/70">{language || 'code'}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2 text-xs hover:bg-white/10"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                    )}
                </Button>
            </div>
            <pre className="p-4 bg-[#050505] overflow-x-auto">
                <code className="text-sm font-mono text-gray-300">{code}</code>
            </pre>
        </div>
    );
};

/**
 * Message Bubble Component
 */
const MessageBubble = ({
    message,
    isUser,
}: {
    message: { content: string; timestamp?: Date };
    isUser: boolean;
}) => {
    const parseContent = (content: string) => {
        const parts = content.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (part.startsWith('```')) {
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (match) {
                    return <CodeBlock key={i} code={match[2].trim()} language={match[1]} />;
                }
            }
            const inlineCode = part.split(/(`[^`]+`)/g);
            return (
                <span key={i}>
                    {inlineCode.map((segment, j) => {
                        if (segment.startsWith('`') && segment.endsWith('`')) {
                            return (
                                <code
                                    key={j}
                                    className="px-1.5 py-0.5 bg-white/10 rounded text-cyan-300 font-mono text-sm"
                                >
                                    {segment.slice(1, -1)}
                                </code>
                            );
                        }
                        return segment;
                    })}
                </span>
            );
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div
                className={`max-w-[80%] md:max-w-[70%] ${isUser
                    ? 'bg-gray-800/80 rounded-2xl rounded-br-md'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md'
                    } px-4 py-3`}
            >
                {!isUser && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-mono text-cyan-400">G-CORE</span>
                    </div>
                )}
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {parseContent(message.content)}
                </div>
                <div className={`text-xs mt-2 ${isUser ? 'text-gray-500' : 'text-gray-600'}`}>
                    {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Sidebar Session Item
 */
const SessionItem = ({
    session,
    isActive,
    onClick,
    onPin,
    onDelete
}: {
    session: ChatSession;
    isActive: boolean;
    onClick: () => void;
    onPin: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}) => {
    const modelInfo = AI_MODELS[session.model];

    return (
        <motion.div
            layout
            whileHover={{ x: 4 }}
            className={`w-full text-left p-3 rounded-lg transition-all relative group cursor-pointer ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
            onClick={onClick}
        >
            {isActive && (
                <motion.div
                    layoutId="activeSession"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400 rounded-full"
                    style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)' }}
                />
            )}
            <div className="flex items-start gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative"
                    style={{ backgroundColor: `${modelInfo?.color}20` }}
                >
                    <MessageSquare
                        className="w-4 h-4"
                        style={{ color: modelInfo?.color }}
                    />
                    {session.pinned && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
                            <Pin className="w-1.5 h-1.5 text-white fill-current" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-gray-200 truncate pr-2">
                            {session.title}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-gray-200">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(e); }} className="hover:bg-white/5 cursor-pointer">
                                    <Pin className="w-3.5 h-3.5 mr-2" />
                                    {session.pinned ? 'Unpin' : 'Pin'} Chat
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="hover:bg-white/5 cursor-pointer">
                                    <PenLine className="w-3.5 h-3.5 mr-2" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(e); }} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                        {session.last_message || 'New conversation'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        {session.pinned && <span className="text-cyan-500/80 font-mono text-[10px] mr-1">PINNED</span>}
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(session.created_at)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// =============================================================================
// UTILS
// =============================================================================

// Updated helper to handle string dates from Supabase
function formatTimeAgo(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function groupSessionsByDate(sessions: ChatSession[]) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string; sessions: ChatSession[] }[] = [
        { label: 'Pinned', sessions: sessions.filter(s => s.pinned) },
        {
            label: 'Today',
            sessions: sessions.filter(s => !s.pinned && new Date(s.created_at).toDateString() === today.toDateString())
        },
        {
            label: 'Yesterday',
            sessions: sessions.filter(s => !s.pinned && new Date(s.created_at).toDateString() === yesterday.toDateString())
        },
        {
            label: 'Previous 7 Days',
            sessions: sessions.filter(s => {
                if (s.pinned) return false;
                const d = new Date(s.created_at);
                return d < yesterday && d >= new Date(Date.now() - 7 * 86400000);
            })
        },
        {
            label: 'Older',
            sessions: sessions.filter(s => !s.pinned && new Date(s.created_at) < new Date(Date.now() - 7 * 86400000))
        },
    ];

    return groups.filter(g => g.sessions.length > 0);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatPage() {
    // State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);

    // Supabase Hook
    const {
        sessions,
        messages: supabaseMessages,
        activeSessionId,
        setActiveSessionId,
        createSession,
        deleteSession,
        updateSession,
        addMessage
    } = useSupabaseChat();

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const {
        messages,
        setMessages,
        sendMessage,
        clearMessages,
        loading,
        error,
        activeModel
    } = useNexusChat('planner');

    // Sync Supabase messages to Nexus Chat state when active session changes or new messages arrive
    useEffect(() => {
        if (supabaseMessages) {
            const formattedMessages = supabaseMessages.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                timestamp: new Date(m.created_at),
                model: m.model as ModelKey | undefined,
                status: 'sent' as const
            }));
            setMessages(formattedMessages);
        }
    }, [supabaseMessages, setMessages]);

    // Handle AI errors
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Handle mouse move for gradient effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle send message
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        let currentSessionId = activeSessionId;

        // If no active session, create one
        if (!currentSessionId) {
            const newSession = await createSession(activeModel, input.trim().substring(0, 30) + '...');
            if (newSession) {
                currentSessionId = newSession.id;
            } else {
                return; // Failed to create session
            }
        }

        const messageContent = input.trim();
        setInput('');

        // Save user message to Supabase
        if (currentSessionId) {
            await addMessage(currentSessionId, 'user', messageContent);

            // Send to AI (state update handled by setMessages from useSupabaseChat effect, 
            // but useNexusChat also optimistically updates. We need to prevent double entry if possible,
            // or let them sync. Our setMessages in useSupabaseChat handles deduplication by ID, 
            // but sending to AI generates a new response.)

            // Actually, useNexusChat's sendMessage returns the response string.
            const response = await sendMessage(messageContent); // This triggers AI generation

            if (response) {
                // Save AI response to Supabase
                await addMessage(currentSessionId, 'assistant', response, activeModel);
            }
        }
    };

    // ... (toggleRecording remains same) ...
    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setIsRecording(true);
                toast.info('Recording started... Click again to stop.');

                // Simulate recording for 3 seconds
                setTimeout(() => {
                    stream.getTracks().forEach(track => track.stop());
                    setIsRecording(false);
                    setInput('Voice message: "Help me with my project"');
                    toast.success('Voice recording completed');
                }, 3000);
            } catch (error) {
                toast.error('Microphone access denied');
                console.error('Microphone access error:', error);
            }
        } else {
            setIsRecording(false);
            toast.info('Recording stopped');
        }
    };

    // Create new chat session
    const createNewSession = () => {
        setActiveSessionId(null);
        clearMessages();
        inputRef.current?.focus();
        if (window.innerWidth < 1024) setMobileMenuOpen(false);
    };

    // Toggle sound effects
    const toggleSound = () => {
        toast.info('Sound effects toggled');
    };

    const exportChatHistory = () => {
        const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        const blob = new Blob([history], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Chat history exported');
    };

    const clearCurrentConversation = () => {
        if (confirm('Are you sure you want to clear the current conversation?')) {
            clearMessages();
            // Also simpler interpretation: just start a new chat? 
            // Or delete messages? usually clearing just resets UI for "New Chat" type behavior if not deleting.
            // But if it's persistent, clearing implies deleting messages. 
            // For now let's just create new session behavior.
            setActiveSessionId(null);
            toast.success('Started new conversation');
        }
    };

    const togglePinSession = (id: string, currentPinned: boolean) => {
        updateSession(id, { pinned: !currentPinned });
        toast.success(currentPinned ? 'Chat unpinned' : 'Chat pinned');
    };

    // ... deleteSession ...
    const handleDeleteSession = (id: string) => {
        if (confirm('Delete this chat permanently?')) {
            deleteSession(id);
            toast.success('Chat deleted');
        }
    };

    return (
        <>
            <SEO
                title="G-CORE Chat | G-NEXUS AI Platform"
                description="Interact with G-CORE, the advanced AI advisor powered by cutting-edge language models."
            />

            <div className="h-screen overflow-hidden bg-[#050505] flex flex-col">


                {/* Animated Background Gradient */}
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        background: `
              radial-gradient(
                600px circle at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(6, 182, 212, 0.15),
                transparent 40%
              ),
              radial-gradient(
                800px circle at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(59, 130, 246, 0.1),
                transparent 50%
              )
            `,
                    }}
                />

                {/* Main Content */}
                <main className="flex-1 flex relative z-10">
                    {/* Sidebar - Redesigned */}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.aside
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 320, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="hidden lg:flex flex-col bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/5 z-30"
                            >
                                {/* Sidebar Header */}
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-mono text-sm font-semibold text-gray-400 tracking-wider flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            HISTORY
                                        </h2>
                                        <button
                                            onClick={() => setSidebarOpen(false)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>

                                    <Button
                                        onClick={createNewSession}
                                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-900/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Chat
                                    </Button>
                                </div>

                                {/* Search */}
                                <div className="p-4">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search conversations..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Sessions List */}
                                <ScrollArea className="flex-1 px-4">
                                    <div className="space-y-6 pb-4">
                                        {sessions.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                                                <p className="text-sm text-gray-500">No conversations yet</p>
                                                <p className="text-xs text-gray-600 mt-1">Start a new chat to begin</p>
                                            </div>
                                        ) : (
                                            groupSessionsByDate(sessions).map((group, i) => (
                                                <div key={i} className="space-y-2">
                                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 font-mono">
                                                        {group.label}
                                                    </h3>
                                                    {group.sessions.map((session) => (
                                                        <SessionItem
                                                            key={session.id}
                                                            session={session}
                                                            isActive={session.id === activeSessionId}
                                                            onClick={() => setActiveSessionId(session.id)}
                                                            onPin={(e) => togglePinSession(session.id, !!session.pinned)}
                                                            onDelete={(e) => handleDeleteSession(session.id)}
                                                        />
                                                    ))}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Sidebar Footer */}
                                <div className="p-4 border-t border-white/5 space-y-2">
                                    <Button
                                        onClick={() => setSettingsOpen(true)}
                                        variant="ghost"
                                        className="w-full justify-start gap-2 text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Button>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Mobile Sidebar */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                                />
                                <motion.aside
                                    initial={{ x: -320, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -320, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed inset-y-0 left-0 z-50 w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl lg:hidden"
                                >
                                    {/* Copy of sidebar content for mobile */}
                                    <div className="flex flex-col h-full">
                                        {/* Mobile Sidebar Header */}
                                        <div className="p-6 border-b border-white/5">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="font-mono text-sm font-semibold text-gray-400 tracking-wider">
                                                    CHAT HISTORY
                                                </h2>
                                                <button
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            <Button
                                                onClick={createNewSession}
                                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                New Chat
                                            </Button>
                                        </div>
                                        {/* Mobile Sessions List */}
                                        <ScrollArea className="flex-1 px-4">
                                            <div className="space-y-6 pb-4 pt-4">
                                                {sessions.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                        <p className="text-sm text-gray-500">No conversations yet</p>
                                                    </div>
                                                ) : (
                                                    groupSessionsByDate(sessions).map((group, i) => (
                                                        <div key={i} className="space-y-2">
                                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 font-mono">
                                                                {group.label}
                                                            </h3>
                                                            {group.sessions.map((session) => (
                                                                <SessionItem
                                                                    key={session.id}
                                                                    session={session}
                                                                    isActive={session.id === activeSessionId}
                                                                    onClick={() => {
                                                                        setActiveSessionId(session.id);
                                                                        setMobileMenuOpen(false);
                                                                    }}
                                                                    onPin={(e) => togglePinSession(session.id, !!session.pinned)}
                                                                    onDelete={(e) => handleDeleteSession(session.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                        {/* Mobile Footer */}
                                        <div className="p-4 border-t border-white/5 space-y-2">
                                            <Button onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false); }} variant="ghost" className="w-full justify-start gap-2 text-gray-400">
                                                <Settings className="w-4 h-4" /> Settings
                                            </Button>
                                        </div>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* Chat Header */}
                        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl flex items-center px-4 gap-4 shrink-0">
                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Desktop Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:flex p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ChevronLeft
                                    className={`w-5 h-5 text-gray-400 transition-transform ${sidebarOpen ? '' : 'rotate-180'
                                        }`}
                                />
                            </button>

                            {/* Title */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-cyan-400" />
                                    <h1 className="font-mono font-bold text-gray-200">G-CORE v2.0</h1>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="w-2 h-2 rounded-full bg-green-500"
                                        style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }}
                                    />
                                    <span className="text-xs font-mono text-green-400">ONLINE</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSound}
                                    className="text-gray-400 hover:text-gray-200"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-gray-200"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-white/10 text-gray-200 p-2">
                                        <DropdownMenuLabel className="text-[10px] font-mono text-cyan-400 tracking-wider">SESSION CONTROLS</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/10" />

                                        <DropdownMenuItem onClick={() => setStatsOpen(true)} className="hover:bg-white/5 cursor-pointer">
                                            <BarChart3 className="mr-2 h-4 w-4 text-purple-400" />
                                            <span>Chat Statistics</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                                            <Share2 className="mr-2 h-4 w-4 text-blue-400" />
                                            <span>Share Conversation</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-white/10" />

                                        <DropdownMenuItem onClick={exportChatHistory} className="hover:bg-white/5 cursor-pointer">
                                            <Download className="mr-2 h-4 w-4" />
                                            <span>Export Chat</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={clearCurrentConversation} className="hover:bg-red-500/10 text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Clear Chat</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-white/10" />

                                        <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="hover:bg-white/5 cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                                            <HelpCircle className="mr-2 h-4 w-4" />
                                            <span>Help & Support</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </header>

                        {/* Settings Modal */}
                        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

                        {/* Stats Modal */}
                        <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
                            <DialogContent className="bg-[#1a1a1a] border-white/10 text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-cyan-400 chat-stats-icon" />
                                        Session Statistics
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Messages</div>
                                        <div className="text-2xl font-mono text-cyan-400">{messages.length}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Word Count</div>
                                        <div className="text-2xl font-mono text-purple-400">
                                            {messages.reduce((acc, m) => acc + m.content.split(' ').length, 0)}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">User Messages</div>
                                        <div className="text-2xl font-mono text-green-400">
                                            {messages.filter(m => m.role === 'user').length}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">AI Responses</div>
                                        <div className="text-2xl font-mono text-blue-400">
                                            {messages.filter(m => m.role === 'assistant').length}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4 md:p-6">
                            <div className="max-w-4xl mx-auto">
                                {/* Welcome Message */}
                                {messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                            <Zap className="w-10 h-10 text-cyan-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-200 mb-2">
                                            Welcome to G-CORE v2.0
                                        </h2>
                                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                                            Your advanced AI advisor. Ask me anything about coding, marketing, strategy, or analysis.
                                        </p>
                                    </motion.div>
                                )}

                                {/* Messages List */}
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isUser={msg.role === 'user'}
                                        />
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start mb-4">
                                            <div className="max-w-[70%] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-mono text-cyan-400">G-CORE</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/5">
                            <div className="max-w-4xl mx-auto flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                                >
                                    <input type="file" id="file-upload" className="hidden" />
                                    <Plus className="w-5 h-5" />
                                </Button>
                                <div className="flex-1 relative group">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your message..."
                                        className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleRecording}
                                    className={`
                                        transition-all duration-300
                                        ${isRecording
                                            ? 'text-red-400 bg-red-500/10 animate-pulse'
                                            : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                                        }
                                    `}
                                >
                                    <Mic className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="max-w-4xl mx-auto mt-2 text-center">
                                <span className="text-[10px] text-gray-600">
                                    G-CORE can make mistakes. Consider checking important information.
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
