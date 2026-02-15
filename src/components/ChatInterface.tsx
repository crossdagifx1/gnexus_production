import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Plus, Settings, Download, Trash2, Pin, Archive, Copy,
    Sparkles, Code, Image as ImageIcon, Mic, Paperclip, MoreVertical,
    ChevronDown, MessageSquare, Star, ThumbsUp, ThumbsDown, StopCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nexus } from '@/lib/api/nexus-core';
import type { ChatConversation, ChatMessage, AIModel, QuickReply } from '@/lib/api/ai-chat-sdk';
import { toast } from 'sonner';

export default function ChatInterface() {
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
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2000);
    const [systemPrompt, setSystemPrompt] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
                nexus.getModels(),
                nexus.getConversations(),
                nexus.getQuickReplies()
            ]);

            setModels(modelsData.filter(m => m.is_enabled));
            setConversations(conversationsData);
            setQuickReplies(repliesData.filter(r => r.is_enabled));

            // Select default model
            const defaultModel = modelsData.find(m => m.is_default && m.is_enabled) || modelsData.find(m => m.is_enabled);
            if (defaultModel) {
                setSelectedModel(defaultModel.model_id);
            }

            // Load most recent conversation
            if (conversationsData.length > 0) {
                setActiveConversation(conversationsData[0]);
            }
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const messagesData = await nexus.getMessages(conversationId);
            setMessages(messagesData);
        } catch (error: any) {
            toast.error('Failed to load messages: ' + error.message);
        }
    };

    const createNewConversation = async () => {
        try {
            const result = await nexus.saveConversation({
                title: 'New Chat',
                model: selectedModel,
                temperature,
                max_tokens: maxTokens,
                system_prompt: systemPrompt
            });

            const newConv = await nexus.getConversations();
            setConversations(newConv);
            setActiveConversation(newConv.find(c => c.id === result.id) || null);
            setMessages([]);
            toast.success('New conversation created');
        } catch (error: any) {
            toast.error('Failed to create conversation: ' + error.message);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !activeConversation) return;

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

        try {
            const response = await nexus.sendMessage(activeConversation.id, inputMessage);
            setMessages(prev => [...prev, response as ChatMessage]);

            // Reload conversations to update last_message_at
            const updatedConvs = await nexus.getConversations();
            setConversations(updatedConvs);
        } catch (error: any) {
            toast.error('Failed to send message: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteConversation = async (id: string) => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await nexus.deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeConversation?.id === id) {
                setActiveConversation(conversations[0] || null);
            }
            toast.success('Conversation deleted');
        } catch (error: any) {
            toast.error('Failed to delete conversation: ' + error.message);
        }
    };

    const pinConversation = async (id: string, pinned: boolean) => {
        try {
            await nexus.pinConversation(id, pinned);
            setConversations(prev => prev.map(c =>
                c.id === id ? { ...c, is_pinned: pinned } : c
            ));
            toast.success(pinned ? 'Conversation pinned' : 'Conversation unpinned');
        } catch (error: any) {
            toast.error('Failed to update conversation: ' + error.message);
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
        toast.success('Conversation exported');
    };

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
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
            {/* Sidebar - Conversations */}
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
                                                        <h4 className="font-medium truncate text-sm">
                                                            {conv.title}
                                                        </h4>
                                                        {conv.is_pinned && (
                                                            <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                                                        )}
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
                        {/* Chat Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold">{activeConversation.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {messages.length} messages • {activeConversation.model}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Model Selector */}
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
                                {messages.map((message, idx) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <Card className={`max-w-[80%] ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                            }`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 prose dark:prose-invert">
                                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                                        {message.reasoning && (
                                                            <details className="mt-2">
                                                                <summary className="cursor-pointer text-sm text-muted-foreground">
                                                                    View reasoning
                                                                </summary>
                                                                <p className="text-sm mt-2 text-muted-foreground">
                                                                    {message.reasoning}
                                                                </p>
                                                            </details>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => copyMessage(message.content)}
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
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
                                ))}
                                {isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <Card className="bg-muted">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-pulse">Thinking...</div>
                                                    <Sparkles className="w-4 h-4 animate-spin" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
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

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Type your message..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        className="min-h-[60px] resize-none"
                                        disabled={isGenerating}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!inputMessage.trim() || isGenerating}
                                            size="icon"
                                        >
                                            {isGenerating ? (
                                                <StopCircle className="w-4 h-4" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <Paperclip className="w-4 h-4" />
                                        </Button>
                                    </div>
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
                                Start a new chat or select an existing conversation
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
