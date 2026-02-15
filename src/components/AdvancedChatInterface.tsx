import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Plus, Settings, Download, Trash2, Pin, Image as ImageIcon,
    Mic, Paperclip, MoreVertical, MessageSquare, Sparkles, Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { StreamingMessage } from './chat/StreamingMessage';
import { ImageUpload } from './chat/ImageUpload';
import { VoiceInput } from './chat/VoiceInput';
import { ExecutableCodeBlock } from './chat/ExecutableCodeBlock';
import { ShareDialog } from './chat/ShareDialog';
import { MessageReactions } from './chat/MessageReactions';
import { MessageActions } from './chat/MessageActions';
import { DraftIndicator } from './chat/DraftIndicator';
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave';

// Temp types until SDK is updated
interface ChatConversation {
    id: string;
    title: string;
    model: string;
    temperature: number;
    max_tokens: number;
    system_prompt?: string;
    is_pinned?: boolean;
    created_at: string;
    updated_at: string;
}

interface ChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    tokens_input?: number;
    tokens_output?: number;
    cost?: number;
    created_at: string;
    edited_at?: string;
    edit_count?: number;
    deleted_at?: string;
    deleted_by?: number;
}

interface AIModel {
    id: string;
    model_id: string;
    display_name: string;
    category: string;
    is_enabled: boolean;
    is_default?: boolean;
}

interface QuickReply {
    id: string;
    title: string;
    prompt: string;
    is_enabled: boolean;
}

// Use direct API calls
const api = {
    async getConversations() {
        const res = await fetch('/ai_chat_routes.php?action=get_conversations', { credentials: 'include' });
        return (await res.json()).data || [];
    },
    async getMessages(convId: string) {
        const res = await fetch(`/ai_chat_routes.php?action=get_messages&conversation_id=${convId}`, { credentials: 'include' });
        return (await res.json()).data || [];
    },
    async getModels() {
        const res = await fetch('/ai_chat_routes.php?action=get_models', { credentials: 'include' });
        return (await res.json()).data || [];
    },
    async getQuickReplies() {
        const res = await fetch('/ai_chat_routes.php?action=get_quick_replies', { credentials: 'include' });
        return (await res.json()).data || [];
    },
    async saveConversation(data: any) {
        const res = await fetch('/ai_chat_routes.php?action=save_conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return (await res.json()).data;
    },
    async deleteConversation(id: string) {
        await fetch('/ai_chat_routes.php?action=delete_conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id })
        });
    },
    async pinConversation(id: string, pinned: boolean) {
        await fetch('/ai_chat_routes.php?action=pin_conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id, is_pinned: pinned })
        });
    }
};
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AdvancedChatInterface() {
    // State management
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [models, setModels] = useState<AIModel[]>([]);
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [inputMessage, setInputMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2000);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Draft auto-save
    const { isSaving: draftSaving, lastSaved: draftLastSaved } = useDraftAutoSave({
        conversationId: activeConversation?.id || '',
        value: inputMessage,
        onSave: (content) => setInputMessage(content)
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadInitialData = async () => {
        try {
            const [modelsData, conversationsData, repliesData] = await Promise.all([
                api.getModels(),
                api.getConversations(),
                api.getQuickReplies()
            ]);

            setModels(modelsData.filter(m => m.is_enabled));
            setConversations(conversationsData);
            setQuickReplies(repliesData.filter(r => r.is_enabled));

            const defaultModel = modelsData.find(m => m.is_default && m.is_enabled) || modelsData.find(m => m.is_enabled);
            if (defaultModel) {
                setSelectedModel(defaultModel.model_id);
            }

            if (conversationsData.length > 0) {
                setActiveConversation(conversationsData[0]);
            }
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const messagesData = await api.getMessages(conversationId);
            setMessages(messagesData);
        } catch (error: any) {
            toast.error('Failed to load messages: ' + error.message);
        }
    };

    const createNewConversation = async () => {
        try {
            const result = await api.saveConversation({
                title: 'New Chat',
                model: selectedModel,
                temperature,
                max_tokens: maxTokens,
                system_prompt: systemPrompt
            });

            const newConv = await api.getConversations();
            setConversations(newConv);
            setActiveConversation(newConv.find(c => c.id === result.id) || null);
            setMessages([]);
            toast.success('New conversation created');
        } catch (error: any) {
            toast.error('Failed to create conversation: ' + error.message);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !activeConversation || isGenerating) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            conversation_id: activeConversation.id,
            role: 'user',
            content: inputMessage,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsGenerating(true);

        // Generate streaming message ID
        const newMessageId = (Date.now() + 1).toString();
        setStreamingMessageId(newMessageId);
    };

    const handleStreamComplete = async (content: string, tokens: number) => {
        setIsGenerating(false);
        setStreamingMessageId(null);

        // Reload conversations to update timestamp
        const updatedConvs = await api.getConversations();
        setConversations(updatedConvs);
    };

    const handleStreamError = (error: string) => {
        toast.error('Streaming error: ' + error);
        setIsGenerating(false);
        setStreamingMessageId(null);
    };

    const handleImageUpload = async (files: File[]) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        if (activeConversation) {
            formData.append('message_id', 'temp');
        }

        try {
            const response = await fetch('/api.php?action=upload_chat_attachment', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setUploadedImages(prev => [...prev, data.data.url]);
                toast.success('Image uploaded');
                setShowImageUpload(false);
            }
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message);
        }
    };

    const handleVoiceTranscript = (text: string) => {
        setInputMessage(prev => prev + (prev ? ' ' : '') + text);
        textareaRef.current?.focus();
    };

    const deleteConversation = async (id: string) => {
        if (!confirm('Delete this conversation?')) return;

        try {
            await api.deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeConversation?.id === id) {
                setActiveConversation(conversations[0] || null);
            }
            toast.success('Conversation deleted');
        } catch (error: any) {
            toast.error('Failed to delete: ' + error.message);
        }
    };

    const pinConversation = async (id: string, pinned: boolean) => {
        try {
            await api.pinConversation(id, pinned);
            setConversations(prev => prev.map(c =>
                c.id === id ? { ...c, is_pinned: pinned } : c
            ));
        } catch (error: any) {
            toast.error('Failed to pin: ' + error.message);
        }
    };

    // Message Management Handlers
    const handleEditMessage = async (messageId: string, newContent: string) => {
        const response = await fetch('/api.php?action=edit_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message_id: messageId, new_content: newContent })
        });
        const data = await response.json();
        if (data.success) {
            // Update local state
            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, content: newContent, edited_at: data.data.edited_at, edit_count: (m.edit_count || 0) + 1 }
                    : m
            ));
        } else {
            throw new Error(data.error || 'Edit failed');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        const response = await fetch('/api.php?action=delete_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message_id: messageId })
        });
        const data = await response.json();
        if (data.success) {
            // Update local state
            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, deleted_at: new Date().toISOString() }
                    : m
            ));
        } else {
            throw new Error(data.error || 'Delete failed');
        }
    };

    const handleRestoreMessage = async (messageId: string) => {
        const response = await fetch('/api.php?action=restore_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message_id: messageId })
        });
        const data = await response.json();
        if (data.success) {
            // Update local state
            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, deleted_at: undefined, deleted_by: undefined }
                    : m
            ));
        } else {
            throw new Error(data.error || 'Restore failed');
        }
    };

    const exportConversation = () => {
        if (!activeConversation) return;
        const markdown = messages.map(m => `## ${m.role}\n${m.content}\n`).join('\n');
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeConversation.title}.md`;
        a.click();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const modelsByCategory = models.reduce((acc, model) => {
        if (!acc[model.category]) acc[model.category] = [];
        acc[model.category].push(model);
        return acc;
    }, {} as Record<string, AIModel[]>);

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                    <Button onClick={createNewConversation} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        New Chat
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                        {conversations
                            .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                            .map((conv) => (
                                <motion.div
                                    key={conv.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        className={`cursor-pointer transition-colors ${activeConversation?.id === conv.id ? 'bg-accent' : 'hover:bg-accent/50'
                                            }`}
                                        onClick={() => setActiveConversation(conv)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                                        <h4 className="font-medium truncate text-sm">{conv.title}</h4>
                                                        {conv.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {conv.model} • {new Date(conv.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreVertical className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => pinConversation(conv.id, !conv.is_pinned)}>
                                                            <Pin className="w-4 h-4 mr-2" />
                                                            {conv.is_pinned ? 'Unpin' : 'Pin'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => deleteConversation(conv.id)} className="text-red-500">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold">{activeConversation.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {messages.length} messages • {activeConversation.model}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
                                            <div key={category}>
                                                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
                                                    {category}
                                                </div>
                                                {categoryModels.map(model => (
                                                    <SelectItem key={model.id} value={model.model_id}>
                                                        {model.display_name}
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <ShareDialog conversationId={activeConversation.id} conversationTitle={activeConversation.title} />

                                <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
                                    <Settings className="w-4 h-4" />
                                </Button>

                                <Button variant="outline" size="icon" onClick={exportConversation}>
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-b overflow-hidden"
                                >
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Temperature: {temperature}</Label>
                                                <Slider
                                                    value={[temperature]}
                                                    onValueChange={([v]) => setTemperature(v)}
                                                    min={0}
                                                    max={2}
                                                    step={0.1}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Max Tokens: {maxTokens}</Label>
                                                <Slider
                                                    value={[maxTokens]}
                                                    onValueChange={([v]) => setMaxTokens(v)}
                                                    min={100}
                                                    max={4000}
                                                    step={100}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>System Prompt</Label>
                                            <Textarea
                                                placeholder="You are a helpful assistant..."
                                                value={systemPrompt}
                                                onChange={(e) => setSystemPrompt(e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {messages.map((message) => (
                                    <div key={message.id} className="group">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <Card className={`max-w-[80%] ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}>
                                                <CardContent className="p-4">
                                                    <div className="prose dark:prose-invert max-w-none">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({ className, children, ...props }) {
                                                                    const match = /language-(\w+)/.exec(className || '');
                                                                    const language = match ? match[1] : '';
                                                                    const isInline = !language;

                                                                    if (!isInline && language) {
                                                                        return (
                                                                            <ExecutableCodeBlock
                                                                                code={String(children).replace(/\n$/, '')}
                                                                                language={language}
                                                                                messageId={message.id}
                                                                            />
                                                                        );
                                                                    }

                                                                    return <code className={className} {...props}>{children}</code>;
                                                                }
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                                        <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                                                        {message.tokens_input && (
                                                            <span>• {message.tokens_input + (message.tokens_output || 0)} tokens</span>
                                                        )}
                                                        {message.cost && (
                                                            <span>• ${message.cost.toFixed(4)}</span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        {/* Message Actions (Edit/Delete) */}
                                        <MessageActions
                                            messageId={message.id}
                                            content={message.content}
                                            role={message.role}
                                            editCount={message.edit_count || 0}
                                            editedAt={message.edited_at}
                                            deletedAt={message.deleted_at}
                                            onEdit={(newContent) => handleEditMessage(message.id, newContent)}
                                            onDelete={() => handleDeleteMessage(message.id)}
                                            onRestore={() => handleRestoreMessage(message.id)}
                                        />

                                        {message.role === 'assistant' && (
                                            <MessageReactions messageId={message.id} />
                                        )}
                                    </div>
                                ))}

                                {/* Streaming Message */}
                                {streamingMessageId && activeConversation && (
                                    <StreamingMessage
                                        conversationId={activeConversation.id}
                                        userMessage={messages[messages.length - 1]?.content || ''}
                                        messageId={streamingMessageId}
                                        onComplete={handleStreamComplete}
                                        onError={handleStreamError}
                                    />
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Quick Replies */}
                        {quickReplies.length > 0 && (
                            <div className="px-4 pb-2">
                                <div className="flex gap-2 overflow-x-auto max-w-4xl mx-auto">
                                    {quickReplies.slice(0, 5).map((reply) => (
                                        <Button
                                            key={reply.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setInputMessage(reply.prompt)}
                                            className="whitespace-nowrap"
                                        >
                                            {reply.title}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image Upload Panel */}
                        <AnimatePresence>
                            {showImageUpload && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 pb-2"
                                >
                                    <div className="max-w-4xl mx-auto">
                                        <ImageUpload onUpload={handleImageUpload} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            ref={textareaRef}
                                            placeholder="Type your message..."
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            className="min-h-[60px] resize-none pr-20"
                                            disabled={isGenerating}
                                        />
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setShowImageUpload(!showImageUpload)}
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </Button>
                                            <VoiceInput onTranscript={handleVoiceTranscript} />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim() || isGenerating}
                                        size="icon"
                                        className="h-[60px] w-[60px]"
                                    >
                                        {isGenerating ? (
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
                            <p className="text-muted-foreground mb-4">
                                Start a new chat to begin
                            </p>
                            <Button onClick={createNewConversation}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Chat
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
