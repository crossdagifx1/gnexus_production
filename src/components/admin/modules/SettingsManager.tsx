import { useState, useEffect } from 'react';
import { Save, Globe, Shield, Database, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nexus, type SiteComponent } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function SettingsManager() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            // We reuse the components API to store settings
            const components = await nexus.getComponents('settings');
            const settingsMap: Record<string, any> = {};
            components.forEach(c => settingsMap[c.key] = c.value);
            setSettings(settingsMap);
        } catch (error) {
            // silent fail or init defaults
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each setting as a component
            const promises = Object.entries(settings).map(async ([key, value]) => {
                await nexus.saveComponent({
                    key,
                    value,
                    type: typeof value === 'boolean' ? 'feature_flag' : 'text',
                    group: 'settings',
                    description: 'System Setting',
                    is_system: true
                });
            });
            await Promise.all(promises);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Configure global site parameters.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4 bg-card p-6 rounded-xl border border-border/50">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Site Name</label>
                            <div className="flex gap-2">
                                <div className="p-2 bg-muted rounded border border-border">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <Input
                                    value={settings['site_name'] || ''}
                                    onChange={e => updateSetting('site_name', e.target.value)}
                                    placeholder="G-Nexus"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Maintenance Mode</label>
                                <p className="text-sm text-muted-foreground">
                                    Disable public access to the site.
                                </p>
                            </div>
                            <Switch
                                checked={settings['maintenance_mode'] || false}
                                onCheckedChange={checked => updateSetting('maintenance_mode', checked)}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                    <div className="grid gap-4 bg-card p-6 rounded-xl border border-border/50">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Default Meta Title</label>
                            <Input
                                value={settings['meta_title_default'] || ''}
                                onChange={e => updateSetting('meta_title_default', e.target.value)}
                                placeholder="G-Nexus | AI Solutions"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Default Meta Description</label>
                            <textarea
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                value={settings['meta_description_default'] || ''}
                                onChange={e => updateSetting('meta_description_default', e.target.value)}
                                placeholder="Leading AI technology provider..."
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <div className="grid gap-4 bg-card p-6 rounded-xl border border-border/50">
                        <div className="flex items-center gap-4 text-yellow-500 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                            <Shield className="w-5 h-5" />
                            <div className="text-sm">
                                <span className="font-semibold">Start-Up Security Active.</span> Basic auth enabled.
                            </div>
                        </div>

                        <div className="space-y-2 opacity-50 pointer-events-none">
                            <label className="text-sm font-medium">Admin IP Whitelist</label>
                            <Input placeholder="Enter IP addresses separated by commas..." />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
