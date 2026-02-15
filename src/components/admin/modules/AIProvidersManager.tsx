import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Wifi, WifiOff, Edit, Trash2, CheckCircle2, AlertCircle, Key, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { nexus } from '@/lib/api/nexus-core';
import type { AIProvider } from '@/lib/api/ai-chat-sdk';
import { toast } from 'sonner';

export default function AIProvidersManager() {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<AIProvider[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Partial<AIProvider> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProviders();
    }, []);

    useEffect(() => {
        const filtered = providers.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProviders(filtered);
    }, [searchQuery, providers]);

    const loadProviders = async () => {
        try {
            setLoading(true);
            const data = await nexus.getProviders();
            setProviders(data);
        } catch (error: any) {
            toast.error('Failed to load providers: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingProvider?.name || !editingProvider?.api_key) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await nexus.saveProvider(editingProvider);
            toast.success('Provider saved successfully!');
            setIsDialogOpen(false);
            setEditingProvider(null);
            loadProviders();
        } catch (error: any) {
            toast.error('Failed to save provider: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this provider? All associated models will also be deleted.')) return;

        try {
            setLoading(true);
            await nexus.deleteProvider(id);
            toast.success('Provider deleted successfully');
            loadProviders();
        } catch (error: any) {
            toast.error('Failed to delete provider: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (provider: AIProvider) => {
        setEditingProvider({ ...provider });
        setIsDialogOpen(true);
    };

    const startNew = () => {
        setEditingProvider({
            name: '',
            slug: '',
            api_key: '',
            is_enabled: true,
            priority: 100,
            rate_limit_per_minute: 60,
            rate_limit_per_day: 10000,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Providers</h2>
                    <p className="text-muted-foreground">
                        Manage AI service providers and their configurations
                    </p>
                </div>
                <Button onClick={startNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Provider
                </Button>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search providers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Provider Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredProviders.map((provider) => (
                        <motion.div
                            key={provider.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {provider.is_enabled ? (
                                                    <Wifi className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <WifiOff className="w-4 h-4 text-gray-400" />
                                                )}
                                                {provider.name}
                                            </CardTitle>
                                            <CardDescription className="font-mono text-xs">
                                                {provider.slug}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={provider.is_enabled ? 'default' : 'secondary'}>
                                            {provider.is_enabled ? 'Active' : 'Disabled'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Priority:</span>
                                            <span className="font-medium">{provider.priority}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">API Key:</span>
                                            <span className="font-mono text-xs">{provider.api_key_preview}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Rate Limit:</span>
                                            <span className="text-xs">
                                                {provider.rate_limit_per_minute}/min
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => startEdit(provider)}
                                            className="flex-1"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(provider.id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProviders.length === 0 && !loading && (
                <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No providers found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try a different search term' : 'Get started by adding your first AI provider'}
                    </p>
                    {!searchQuery && (
                        <Button onClick={startNew}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Provider
                        </Button>
                    )}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProvider?.id ? 'Edit Provider' : 'Add New Provider'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure AI provider settings and API credentials
                        </DialogDescription>
                    </DialogHeader>

                    {editingProvider && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Provider Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., OpenRouter"
                                        value={editingProvider.name || ''}
                                        onChange={(e) => setEditingProvider({
                                            ...editingProvider,
                                            name: e.target.value,
                                            slug: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        placeholder="e.g., openrouter"
                                        value={editingProvider.slug || ''}
                                        onChange={(e) => setEditingProvider({
                                            ...editingProvider,
                                            slug: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key">API Key *</Label>
                                <Input
                                    id="api_key"
                                    type="password"
                                    placeholder="sk-..."
                                    value={editingProvider.api_key || ''}
                                    onChange={(e) => setEditingProvider({
                                        ...editingProvider,
                                        api_key: e.target.value
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_endpoint">API Endpoint (Optional)</Label>
                                <Input
                                    id="api_endpoint"
                                    placeholder="https://api.example.com/v1"
                                    value={editingProvider.api_endpoint || ''}
                                    onChange={(e) => setEditingProvider({
                                        ...editingProvider,
                                        api_endpoint: e.target.value
                                    })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        placeholder="100"
                                        value={editingProvider.priority || 100}
                                        onChange={(e) => setEditingProvider({
                                            ...editingProvider,
                                            priority: parseInt(e.target.value)
                                        })}
                                    />
                                    <p className="text-xs text-muted-foreground">Lower = higher priority</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate_minute">Rate/Min</Label>
                                    <Input
                                        id="rate_minute"
                                        type="number"
                                        value={editingProvider.rate_limit_per_minute || 60}
                                        onChange={(e) => setEditingProvider({
                                            ...editingProvider,
                                            rate_limit_per_minute: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate_day">Rate/Day</Label>
                                    <Input
                                        id="rate_day"
                                        type="number"
                                        value={editingProvider.rate_limit_per_day || 10000}
                                        onChange={(e) => setEditingProvider({
                                            ...editingProvider,
                                            rate_limit_per_day: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Enable Provider</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow this provider to be used for AI requests
                                    </p>
                                </div>
                                <Switch
                                    checked={editingProvider.is_enabled ?? true}
                                    onCheckedChange={(checked) => setEditingProvider({
                                        ...editingProvider,
                                        is_enabled: checked
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Provider'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
