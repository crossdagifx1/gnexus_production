import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertCircle, Brain, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nexus } from '@/lib/api/nexus-core';
import type { AIModel, AIProvider } from '@/lib/api/ai-chat-sdk';
import { toast } from 'sonner';

export default function AIModelsManager() {
    const [models, setModels] = useState<AIModel[]>([]);
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [filteredModels, setFilteredModels] = useState<AIModel[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [providerFilter, setProviderFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<Partial<AIModel> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let filtered = models;

        if (searchQuery) {
            filtered = filtered.filter(m =>
                m.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.model_id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter && categoryFilter !== 'all') {
            filtered = filtered.filter(m => m.category === categoryFilter);
        }

        if (providerFilter && providerFilter !== 'all') {
            filtered = filtered.filter(m => m.provider_id === providerFilter);
        }

        setFilteredModels(filtered);
    }, [searchQuery, categoryFilter, providerFilter, models]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [modelsData, providersData] = await Promise.all([
                nexus.getModels(),
                nexus.getProviders()
            ]);
            setModels(modelsData);
            setProviders(providersData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingModel?.provider_id || !editingModel?.model_id || !editingModel?.display_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await nexus.saveModel(editingModel);
            toast.success('Model saved successfully!');
            setIsDialogOpen(false);
            setEditingModel(null);
            loadData();
        } catch (error: any) {
            toast.error('Failed to save model: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this model?')) return;

        try {
            setLoading(true);
            await nexus.deleteModel(id);
            toast.success('Model deleted successfully');
            loadData();
        } catch (error: any) {
            toast.error('Failed to delete model: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (model: AIModel) => {
        setEditingModel({ ...model });
        setIsDialogOpen(true);
    };

    const startNew = () => {
        setEditingModel({
            provider_id: providers[0]?.id || '',
            name: '',
            model_id: '',
            display_name: '',
            category: 'general',
            context_window: 4096,
            max_tokens: 2000,
            cost_per_1k_input: 0,
            cost_per_1k_output: 0,
            is_enabled: true,
            is_default: false,
            supports_vision: false,
            supports_function_calling: false,
            supports_streaming: true,
        });
        setIsDialogOpen(true);
    };

    const categoryColors: Record<string, string> = {
        general: 'bg-blue-500',
        coding: 'bg-purple-500',
        analysis: 'bg-green-500',
        creative: 'bg-pink-500',
        reasoning: 'bg-orange-500',
    };

    const modelsByCategory = filteredModels.reduce((acc, model) => {
        if (!acc[model.category]) acc[model.category] = [];
        acc[model.category].push(model);
        return acc;
    }, {} as Record<string, AIModel[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Models</h2>
                    <p className="text-muted-foreground">
                        Configure available AI models and their parameters
                    </p>
                </div>
                <Button onClick={startNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Model
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="reasoning">Reasoning</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {providers.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Models by Category */}
            <Tabs defaultValue={Object.keys(modelsByCategory)[0] || 'general'} className="space-y-4">
                <TabsList>
                    {Object.keys(modelsByCategory).map(category => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                            {category} ({modelsByCategory[category].length})
                        </TabsTrigger>
                    ))}
                </TabsList>

                {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {categoryModels.map((model) => (
                                    <motion.div
                                        key={model.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${categoryColors[model.category]}`} />
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1 flex-1">
                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                            {model.is_enabled ? (
                                                                <Eye className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <EyeOff className="w-4 h-4 text-gray-400" />
                                                            )}
                                                            {model.display_name}
                                                            {model.is_default && (
                                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            {model.provider_name} • {model.model_id}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge variant={model.is_enabled ? 'default' : 'secondary'} className="text-xs">
                                                        {model.is_enabled ? 'Active' : 'Disabled'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {model.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {model.description}
                                                    </p>
                                                )}

                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Context:</span>
                                                        <span className="font-medium">{model.context_window.toLocaleString()} tokens</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Max Output:</span>
                                                        <span className="font-medium">{model.max_tokens.toLocaleString()} tokens</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Cost (1K):</span>
                                                        <span className="font-medium">
                                                            ${model.cost_per_1k_input.toFixed(4)} / ${model.cost_per_1k_output.toFixed(4)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {model.supports_vision && (
                                                        <Badge variant="outline" className="text-xs">Vision</Badge>
                                                    )}
                                                    {model.supports_function_calling && (
                                                        <Badge variant="outline" className="text-xs">Functions</Badge>
                                                    )}
                                                    {model.supports_streaming && (
                                                        <Badge variant="outline" className="text-xs">Streaming</Badge>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => startEdit(model)}
                                                        className="flex-1"
                                                    >
                                                        <Edit className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(model.id)}
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
                    </TabsContent>
                ))}
            </Tabs>

            {filteredModels.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No models found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try a different search term' : 'Get started by adding your first AI model'}
                    </p>
                    {!searchQuery && (
                        <Button onClick={startNew}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Model
                        </Button>
                    )}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingModel?.id ? 'Edit Model' : 'Add New Model'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure AI model parameters and capabilities
                        </DialogDescription>
                    </DialogHeader>

                    {editingModel && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="provider">Provider *</Label>
                                    <Select
                                        value={editingModel.provider_id}
                                        onValueChange={(value) => setEditingModel({
                                            ...editingModel,
                                            provider_id: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.filter(p => p.is_enabled).map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={editingModel.category}
                                        onValueChange={(value: any) => setEditingModel({
                                            ...editingModel,
                                            category: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="coding">Coding</SelectItem>
                                            <SelectItem value="analysis">Analysis</SelectItem>
                                            <SelectItem value="creative">Creative</SelectItem>
                                            <SelectItem value="reasoning">Reasoning</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="model_id">Model ID *</Label>
                                    <Input
                                        id="model_id"
                                        placeholder="e.g., gpt-4-turbo"
                                        value={editingModel.model_id || ''}
                                        onChange={(e) => setEditingModel({
                                            ...editingModel,
                                            model_id: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_name">Display Name *</Label>
                                    <Input
                                        id="display_name"
                                        placeholder="e.g., GPT-4 Turbo"
                                        value={editingModel.display_name || ''}
                                        onChange={(e) => setEditingModel({
                                            ...editingModel,
                                            display_name: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief description of model capabilities..."
                                    value={editingModel.description || ''}
                                    onChange={(e) => setEditingModel({
                                        ...editingModel,
                                        description: e.target.value
                                    })}
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="context_window">Context Window</Label>
                                    <Input
                                        id="context_window"
                                        type="number"
                                        value={editingModel.context_window || 4096}
                                        onChange={(e) => setEditingModel({
                                            ...editingModel,
                                            context_window: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_tokens">Max Tokens</Label>
                                    <Input
                                        id="max_tokens"
                                        type="number"
                                        value={editingModel.max_tokens || 2000}
                                        onChange={(e) => setEditingModel({
                                            ...editingModel,
                                            max_tokens: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost_input">Cost per 1K Input ($)</Label>
                                    <Input
                                        id="cost_input"
                                        type="number"
                                        step="0.000001"
                                        value={editingModel.cost_per_1k_input || 0}
                                        onChange={(e) => setEditingModel({
                                            ...editingModel,
                                            cost_per_1k_input: parseFloat(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost_output">Cost per 1K Output ($)</Label>
                                    <Input
                                        id="cost_output"
                                        type="number"
                                        step="0.000001"
                                        value={editingModel.cost_per_1k_output || 0}
                                        onChange={(e) => setEditingModel({
                                            ...editingModel,
                                            cost_per_1k_output: parseFloat(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-muted rounded-lg">
                                <Label className="text-base">Capabilities</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="vision" className="font-normal">Supports Vision</Label>
                                        <Switch
                                            id="vision"
                                            checked={editingModel.supports_vision ?? false}
                                            onCheckedChange={(checked) => setEditingModel({
                                                ...editingModel,
                                                supports_vision: checked
                                            })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="functions" className="font-normal">Supports Function Calling</Label>
                                        <Switch
                                            id="functions"
                                            checked={editingModel.supports_function_calling ?? false}
                                            onCheckedChange={(checked) => setEditingModel({
                                                ...editingModel,
                                                supports_function_calling: checked
                                            })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="streaming" className="font-normal">Supports Streaming</Label>
                                        <Switch
                                            id="streaming"
                                            checked={editingModel.supports_streaming ?? true}
                                            onCheckedChange={(checked) => setEditingModel({
                                                ...editingModel,
                                                supports_streaming: checked
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label>Enable Model</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Available for use
                                        </p>
                                    </div>
                                    <Switch
                                        checked={editingModel.is_enabled ?? true}
                                        onCheckedChange={(checked) => setEditingModel({
                                            ...editingModel,
                                            is_enabled: checked
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label>Default Model</Label>
                                        <p className="text-xs text-muted-foreground">
                                            For this category
                                        </p>
                                    </div>
                                    <Switch
                                        checked={editingModel.is_default ?? false}
                                        onCheckedChange={(checked) => setEditingModel({
                                            ...editingModel,
                                            is_default: checked
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Model'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
