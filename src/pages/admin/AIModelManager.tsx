import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, RefreshCw, Bot, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { refreshAIModels } from '@/lib/ai';

interface AIModel {
    id: string;
    name: string;
    model_id: string;
    provider: string;
    category: string;
    context_window: number;
    is_active: boolean; // boolean in frontend, 1/0 in DB
    is_free: boolean;
    cost_per_1k_input: number;
    cost_per_1k_output: number;
    description: string;
}

const DEFAULT_MODEL: AIModel = {
    id: '',
    name: '',
    model_id: '',
    provider: 'openrouter',
    category: 'general',
    context_window: 4096,
    is_active: true,
    is_free: false,
    cost_per_1k_input: 0,
    cost_per_1k_output: 0,
    description: ''
};

export default function AIModelManager() {
    const [models, setModels] = useState<AIModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingModel, setEditingModel] = useState<AIModel | null>(null);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/get_models.php');
            const data = await res.json();
            if (data.success) {
                // Ensure boolean conversion
                const formatted = data.data.map((m: any) => ({
                    ...m,
                    is_active: !!Number(m.is_active),
                    is_free: !!Number(m.is_free),
                    cost_per_1k_input: Number(m.cost_per_1k_input),
                    cost_per_1k_output: Number(m.cost_per_1k_output),
                    context_window: Number(m.context_window)
                }));
                setModels(formatted);
                // Also update the global AI config
                refreshAIModels();
            } else {
                toast.error('Failed to load models');
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            toast.error('Error fetching models');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingModel) return;

        if (!editingModel.id || !editingModel.name || !editingModel.model_id) {
            toast.error('Please fill in all required fields (ID, Name, Model ID)');
            return;
        }

        try {
            const res = await fetch('/api/admin/save_model.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingModel,
                    is_active: editingModel.is_active ? 1 : 0,
                    is_free: editingModel.is_free ? 1 : 0
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Model saved successfully');
                setEditingModel(null);
                fetchModels();
            } else {
                toast.error(data.error || 'Failed to save model');
            }
        } catch (error) {
            toast.error('Error saving model');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this model?')) return;

        try {
            const res = await fetch('/api/admin/delete_model.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Model deleted');
                fetchModels();
            } else {
                toast.error(data.error || 'Failed to delete model');
            }
        } catch (error) {
            toast.error('Error deleting model');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Models</h2>
                    <p className="text-muted-foreground">
                        Manage available AI models for the platform.
                    </p>
                </div>
                <Button onClick={() => setEditingModel(DEFAULT_MODEL)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Model
                </Button>
            </div>

            {/* Editor Card */}
            {editingModel && (
                <Card className="border-cyan-500/50 bg-cyan-500/5">
                    <CardHeader>
                        <CardTitle>{editingModel.id ? 'Edit Model' : 'New Model'}</CardTitle>
                        <CardDescription>Configure AI model details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ID (Unique)</Label>
                                <Input
                                    value={editingModel.id}
                                    onChange={e => setEditingModel({ ...editingModel, id: e.target.value })}
                                    placeholder="e.g., deepseek_r1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input
                                    value={editingModel.name}
                                    onChange={e => setEditingModel({ ...editingModel, name: e.target.value })}
                                    placeholder="e.g., DeepSeek R1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Model ID (OpenRouter)</Label>
                                <Input
                                    value={editingModel.model_id}
                                    onChange={e => setEditingModel({ ...editingModel, model_id: e.target.value })}
                                    placeholder="e.g., deepseek/deepseek-r1:free"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={editingModel.category}
                                    onValueChange={v => setEditingModel({ ...editingModel, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="code">Coder</SelectItem>
                                        <SelectItem value="planner">Planner</SelectItem>
                                        <SelectItem value="analyst">Analyst</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="vision">Vision</SelectItem>
                                        <SelectItem value="fast">Fast</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <Input
                                    value={editingModel.provider}
                                    onChange={e => setEditingModel({ ...editingModel, provider: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Context Window</Label>
                                <Input
                                    type="number"
                                    value={editingModel.context_window}
                                    onChange={e => setEditingModel({ ...editingModel, context_window: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-8 py-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingModel.is_active}
                                    onCheckedChange={c => setEditingModel({ ...editingModel, is_active: c })}
                                />
                                <Label>Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingModel.is_free}
                                    onCheckedChange={c => setEditingModel({ ...editingModel, is_free: c })}
                                />
                                <Label>Free Model</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingModel(null)}>Cancel</Button>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" /> Save Model
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Configured Models</CardTitle>
                        <Button variant="ghost" size="icon" onClick={fetchModels}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Model ID</TableHead>
                                <TableHead>Free</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {models.map(model => (
                                <TableRow key={model.id}>
                                    <TableCell>
                                        {model.is_active ?
                                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Active</Badge> :
                                            <Badge variant="secondary">Inactive</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Bot className="h-4 w-4 text-cyan-500" />
                                            {model.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{model.category}</TableCell>
                                    <TableCell className="font-mono text-xs">{model.model_id}</TableCell>
                                    <TableCell>
                                        {model.is_free && <Badge variant="outline" className="border-green-500 text-green-500">Free</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setEditingModel(model)}>
                                                Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(model.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {models.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No models configured. Add one above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
