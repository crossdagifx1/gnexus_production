import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nexus } from '@/lib/api/nexus-core';
import type { ChatPrompt, QuickReply } from '@/lib/api/ai-chat-sdk';
import { toast } from 'sonner';

export default function ChatPromptsManager() {
    const [prompts, setPrompts] = useState<ChatPrompt[]>([]);
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
    const [isQuickReplyDialogOpen, setIsQuickReplyDialogOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Partial<ChatPrompt> | null>(null);
    const [editingQuickReply, setEditingQuickReply] = useState<Partial<QuickReply> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [promptsData, repliesData] = await Promise.all([
                nexus.getPrompts(),
                nexus.getQuickReplies()
            ]);
            setPrompts(promptsData);
            setQuickReplies(repliesData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePrompt = async () => {
        if (!editingPrompt?.name || !editingPrompt?.content) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await nexus.savePrompt(editingPrompt);
            toast.success('Prompt saved successfully!');
            setIsPromptDialogOpen(false);
            setEditingPrompt(null);
            loadData();
        } catch (error: any) {
            toast.error('Failed to save prompt: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuickReply = async () => {
        if (!editingQuickReply?.title || !editingQuickReply?.prompt) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await nexus.saveQuickReply(editingQuickReply);
            toast.success('Quick reply saved successfully!');
            setIsQuickReplyDialogOpen(false);
            setEditingQuickReply(null);
            loadData();
        } catch (error: any) {
            toast.error('Failed to save quick reply: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyPrompt = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Prompts & Quick Replies</h2>
                    <p className="text-muted-foreground">Manage system prompts and quick action templates</p>
                </div>
            </div>

            <Tabs defaultValue="prompts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="prompts">System Prompts ({prompts.length})</TabsTrigger>
                    <TabsTrigger value="quick_replies">Quick Replies ({quickReplies.length})</TabsTrigger>
                </TabsList>

                {/* System Prompts */}
                <TabsContent value="prompts" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search prompts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => {
                            setEditingPrompt({ name: '', content: '', is_public: false });
                            setIsPromptDialogOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Prompt
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AnimatePresence>
                            {prompts
                                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((prompt) => (
                                    <motion.div
                                        key={prompt.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            {prompt.is_public ? (
                                                                <Eye className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <EyeOff className="w-4 h-4 text-gray-400" />
                                                            )}
                                                            {prompt.name}
                                                        </CardTitle>
                                                        {prompt.category && (
                                                            <CardDescription className="text-xs mt-1">
                                                                {prompt.category}
                                                            </CardDescription>
                                                        )}
                                                    </div>
                                                    <Badge variant={prompt.is_public ? 'default' : 'secondary'}>
                                                        {prompt.is_public ? 'Public' : 'Private'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {prompt.content}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyPrompt(prompt.content)}
                                                        className="flex-1"
                                                    >
                                                        <Copy className="w-3 h-3 mr-1" />
                                                        Copy
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingPrompt(prompt);
                                                            setIsPromptDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                {/* Quick Replies */}
                <TabsContent value="quick_replies" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => {
                            setEditingQuickReply({ title: '', prompt: '', display_order: 0, is_enabled: true });
                            setIsQuickReplyDialogOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Quick Reply
                        </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {quickReplies.map((reply) => (
                            <Card key={reply.id} className={!reply.is_enabled ? 'opacity-50' : ''}>
                                <CardContent className="pt-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{reply.title}</h4>
                                            <Badge variant={reply.is_enabled ? 'default' : 'secondary'}>
                                                {reply.is_enabled ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {reply.prompt}
                                        </p>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingQuickReply(reply);
                                                    setIsQuickReplyDialogOpen(true);
                                                }}
                                                className="flex-1"
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Prompt Dialog */}
            <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPrompt?.id ? 'Edit Prompt' : 'Add New Prompt'}
                        </DialogTitle>
                        <DialogDescription>
                            Create reusable system prompts for different use cases
                        </DialogDescription>
                    </DialogHeader>

                    {editingPrompt && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Prompt Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Technical Support"
                                        value={editingPrompt.name || ''}
                                        onChange={(e) => setEditingPrompt({
                                            ...editingPrompt,
                                            name: e.target.value,
                                            slug: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        placeholder="e.g., Support, Sales, Coding"
                                        value={editingPrompt.category || ''}
                                        onChange={(e) => setEditingPrompt({
                                            ...editingPrompt,
                                            category: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Prompt Content *</Label>
                                <Textarea
                                    id="content"
                                    placeholder="You are a helpful assistant that..."
                                    value={editingPrompt.content || ''}
                                    onChange={(e) => setEditingPrompt({
                                        ...editingPrompt,
                                        content: e.target.value
                                    })}
                                    rows={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {editingPrompt.content?.length || 0} characters
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Make Public</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow clients to select this prompt
                                    </p>
                                </div>
                                <Switch
                                    checked={editingPrompt.is_public ?? false}
                                    onCheckedChange={(checked) => setEditingPrompt({
                                        ...editingPrompt,
                                        is_public: checked
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePrompt} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Prompt'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Quick Reply Dialog */}
            <Dialog open={isQuickReplyDialogOpen} onOpenChange={setIsQuickReplyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingQuickReply?.id ? 'Edit Quick Reply' : 'Add Quick Reply'}
                        </DialogTitle>
                        <DialogDescription>
                            Create quick action buttons for common requests
                        </DialogDescription>
                    </DialogHeader>

                    {editingQuickReply && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Button Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Explain Code"
                                    value={editingQuickReply.title || ''}
                                    onChange={(e) => setEditingQuickReply({
                                        ...editingQuickReply,
                                        title: e.target.value
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prompt">Prompt Text *</Label>
                                <Textarea
                                    id="prompt"
                                    placeholder="Explain the code above in simple terms"
                                    value={editingQuickReply.prompt || ''}
                                    onChange={(e) => setEditingQuickReply({
                                        ...editingQuickReply,
                                        prompt: e.target.value
                                    })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon Name</Label>
                                    <Input
                                        id="icon"
                                        placeholder="Code, Sparkles, etc."
                                        value={editingQuickReply.icon || ''}
                                        onChange={(e) => setEditingQuickReply({
                                            ...editingQuickReply,
                                            icon: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Display Order</Label>
                                    <Input
                                        id="display_order"
                                        type="number"
                                        value={editingQuickReply.display_order || 0}
                                        onChange={(e) => setEditingQuickReply({
                                            ...editingQuickReply,
                                            display_order: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <Label>Enable Quick Reply</Label>
                                <Switch
                                    checked={editingQuickReply.is_enabled ?? true}
                                    onCheckedChange={(checked) => setEditingQuickReply({
                                        ...editingQuickReply,
                                        is_enabled: checked
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsQuickReplyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveQuickReply} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Quick Reply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
