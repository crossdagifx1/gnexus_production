import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, CheckCircle2, GripVertical, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { nexus, type Service } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function ServiceManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getServices();
            setServices(data);
        } catch (error) {
            toast.error('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!currentService.title) {
                toast.error('Title is required');
                return;
            }

            await nexus.saveService({
                ...currentService,
                category: currentService.category || 'general'
            });

            toast.success('Service saved successfully');
            setIsDialogOpen(false);
            loadServices();
            setCurrentService({});
            setFeatureInput('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save service');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await nexus.deleteService(id);
            toast.success('Service deleted');
            loadServices();
        } catch (error) {
            toast.error('Failed to delete service');
        }
    }

    const startEdit = (service: Service) => {
        setCurrentService({ ...service });
        setFeatureInput('');
        setIsDialogOpen(true);
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        const features = currentService.features || [];
        setCurrentService({ ...currentService, features: [...features, featureInput] });
        setFeatureInput('');
    };

    const removeFeature = (index: number) => {
        const features = currentService.features || [];
        const newFeatures = [...features];
        newFeatures.splice(index, 1);
        setCurrentService({ ...currentService, features: newFeatures });
    };

    const categories = ['web', '3d', 'ai', 'general'];

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Manager</h1>
                    <p className="text-muted-foreground">Manage service offerings and features.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setCurrentService({});
                        setFeatureInput('');
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> New Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentService.id ? 'Edit Service' : 'Create New Service'}</DialogTitle>
                            <DialogDescription>
                                Define your service offering details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Service Title</label>
                                    <Input
                                        value={currentService.title || ''}
                                        onChange={e => setCurrentService(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. Web Development"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={currentService.category || 'general'}
                                        onChange={e => setCurrentService(p => ({ ...p, category: e.target.value as any }))}
                                    >
                                        {categories.map(c => (
                                            <option key={c} value={c}>{c.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                    value={currentService.description || ''}
                                    onChange={e => setCurrentService(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Service description..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Icon Code/Emoji</label>
                                    <Input
                                        value={currentService.icon || ''}
                                        onChange={e => setCurrentService(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="e.g. 🚀 or Globe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Display Order</label>
                                    <Input
                                        type="number"
                                        value={currentService.display_order || 0}
                                        onChange={e => setCurrentService(p => ({ ...p, display_order: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Features</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        placeholder="Add a key feature..."
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    />
                                    <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {currentService.features?.map((feature, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                                <span>{feature}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeFeature(i)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!currentService.features || currentService.features.length === 0) && (
                                        <p className="text-xs text-muted-foreground italic">No features added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Service'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        className="pl-9 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                    {filteredServices.map((service, i) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="group bg-card hover:bg-card/80 border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                                        {service.icon || '🛠️'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{service.title}</h3>
                                        <Badge variant="secondary" className="mt-1">{service.category.toUpperCase()}</Badge>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => startEdit(service)}>
                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(service.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {service.description}
                            </p>

                            <div className="space-y-1">
                                {service.features?.slice(0, 3).map((f, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-3 h-3 text-primary/70" />
                                        <span className="truncate">{f}</span>
                                    </div>
                                ))}
                                {(service.features?.length || 0) > 3 && (
                                    <p className="text-xs text-muted-foreground pl-5">+ {(service.features?.length || 0) - 3} more features</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
