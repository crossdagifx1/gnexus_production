import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, LayoutTemplate, Type, Image as ImageIcon, Code, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { nexus, type SiteComponent } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function ComponentManager() {
    const [components, setComponents] = useState<SiteComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadComponents();
    }, []);

    const loadComponents = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getComponents();
            setComponents(data);
        } catch (error) {
            toast.error('Failed to load components');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (key: string, value: any) => {
        setComponents(prev => prev.map(c => c.key === key ? { ...c, value } : c));
        setUnsavedChanges(prev => new Set(prev).add(key));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const promises = Array.from(unsavedChanges).map(async key => {
                const component = components.find(c => c.key === key);
                if (component) {
                    await nexus.saveComponent(component);
                }
            });
            await Promise.all(promises);
            toast.success('Changes saved successfully');
            setUnsavedChanges(new Set());
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Group components by their 'group' property
    const groups = Array.from(new Set(components.map(c => c.group || 'general')));

    // Helper to render input based on type
    const renderInput = (component: SiteComponent) => {
        switch (component.type) {
            case 'text':
                return (
                    <Input
                        value={component.value}
                        onChange={e => handleUpdate(component.key, e.target.value)}
                    />
                );
            case 'feature_flag':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={!!component.value}
                            onCheckedChange={checked => handleUpdate(component.key, checked)}
                        />
                        <span className="text-sm text-muted-foreground">{component.value ? 'Enabled' : 'Disabled'}</span>
                    </div>
                );
            case 'json':
                return (
                    <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[100px]"
                        value={typeof component.value === 'string' ? component.value : JSON.stringify(component.value, null, 2)}
                        onChange={e => {
                            try {
                                // Try to parse to check validity, but store as string while editing
                                // OR just store string and parse on save? 
                                // For simplicity, let's treat as text here and API handles parsing if needed, 
                                // but our SDK expects `any`.
                                // Let's try to keep it as string in UI
                                handleUpdate(component.key, e.target.value);
                            } catch (err) {
                                // ignore
                            }
                        }}
                    />
                );
            case 'image':
                return (
                    <div className="flex gap-4 items-center">
                        {component.value && (
                            <img src={component.value} alt="" className="h-10 w-10 rounded object-cover border border-border" />
                        )}
                        <Input
                            value={component.value}
                            onChange={e => handleUpdate(component.key, e.target.value)}
                            placeholder="Image URL"
                        />
                    </div>
                );
            default:
                return <Input value={String(component.value)} disabled />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-4 h-4" />;
            case 'image': return <ImageIcon className="w-4 h-4" />;
            case 'feature_flag': return <ToggleRight className="w-4 h-4" />;
            case 'json': return <Code className="w-4 h-4" />;
            default: return <LayoutTemplate className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Experience Manager</h1>
                    <p className="text-muted-foreground">Control site content and features without code.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadComponents} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={saveChanges} disabled={unsavedChanges.size === 0 || saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : `Save ${unsavedChanges.size} Changes`}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue={groups[0] || 'general'} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-card border border-border/50">
                    {groups.map(group => (
                        <TabsTrigger key={group} value={group} className="capitalize">
                            {group}
                        </TabsTrigger>
                    ))}
                    {groups.length === 0 && <TabsTrigger value="general">General</TabsTrigger>}
                </TabsList>

                {groups.map(group => (
                    <TabsContent key={group} value={group} className="space-y-4">
                        <div className="grid gap-4">
                            {components.filter(c => c.group === group).map(component => (
                                <motion.div
                                    key={component.key}
                                    layout
                                    className={`bg-card p-6 rounded-xl border transition-all ${unsavedChanges.has(component.key) ? 'border-primary/50 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]' : 'border-border/50'}`}
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="md:w-1/3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center">
                                                    {getTypeIcon(component.type)}
                                                </Badge>
                                                <h3 className="font-semibold">{component.key}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {component.description}
                                            </p>
                                            {component.is_system && (
                                                <Badge variant="secondary" className="text-[10px]">System Locked</Badge>
                                            )}
                                        </div>
                                        <div className="md:w-2/3">
                                            {renderInput(component)}
                                            {unsavedChanges.has(component.key) && (
                                                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    Unsaved changes
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {components.filter(c => c.group === group).length === 0 && (
                                <div className="text-center p-8 text-muted-foreground">
                                    No components in this group.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
