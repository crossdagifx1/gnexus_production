import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { nexus } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function ChatSettingsManager() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await nexus.getChatSettings();
            setSettings(data);
            setHasChanges(false);
        } catch (error: any) {
            toast.error('Failed to load settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: any) => {
        try {
            await nexus.saveChatSetting(key, value);
            setSettings({ ...settings, [key]: value });
            setHasChanges(false);
            toast.success('Setting saved successfully');
        } catch (error: any) {
            toast.error('Failed to save setting: ' + error.message);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings({ ...settings, [key]: value });
        setHasChanges(true);
    };

    const saveAllChanges = async () => {
        try {
            setLoading(true);
            for (const [key, value] of Object.entries(settings)) {
                await nexus.saveChatSetting(key, value);
            }
            toast.success('All settings saved successfully');
            setHasChanges(false);
        } catch (error: any) {
            toast.error('Failed to save settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chat Settings</h2>
                    <p className="text-muted-foreground">Configure global chat system behavior</p>
                </div>
                <div className="flex gap-2">
                    {hasChanges && (
                        <Button variant="outline" onClick={loadSettings}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    )}
                    <Button onClick={saveAllChanges} disabled={!hasChanges || loading}>
                        <Save className="w-4 h-4 mr-2" />
                        Save All
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="limits">Limits & Security</TabsTrigger>
                    <TabsTrigger value="ai">AI Behavior</TabsTrigger>
                    <TabsTrigger value="ui">UI Customization</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Basic chat functionality configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Guest Chat</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow unauthenticated users to use chat
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enable_guest_chat ?? true}
                                    onCheckedChange={(v) => updateSetting('enable_guest_chat', v)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto-Archive Inactive Chats</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically archive chats after inactivity
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.auto_archive ?? false}
                                    onCheckedChange={(v) => updateSetting('auto_archive', v)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Auto-Archive After (days)</Label>
                                <Input
                                    type="number"
                                    value={settings.auto_archive_days ?? 30}
                                    onChange={(e) => updateSetting('auto_archive_days', parseInt(e.target.value))}
                                    disabled={!settings.auto_archive}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Default Welcome Message</Label>
                                <Textarea
                                    placeholder="Welcome! How can I help you today?"
                                    value={settings.welcome_message ?? ''}
                                    onChange={(e) => updateSetting('welcome_message', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Limits & Security */}
                <TabsContent value="limits" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rate Limiting</CardTitle>
                            <CardDescription>Control message frequency and limits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Messages Per Minute (Per User)</Label>
                                    <Input
                                        type="number"
                                        value={settings.rate_limit_per_minute ?? 10}
                                        onChange={(e) => updateSetting('rate_limit_per_minute', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Messages Per Day (Per User)</Label>
                                    <Input
                                        type="number"
                                        value={settings.rate_limit_per_day ?? 100}
                                        onChange={(e) => updateSetting('rate_limit_per_day', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Max Messages Per Conversation</Label>
                                <Input
                                    type="number"
                                    value={settings.max_messages_per_conversation ?? 1000}
                                    onChange={(e) => updateSetting('max_messages_per_conversation', parseInt(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Archive conversation after this many messages
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content Moderation</CardTitle>
                            <CardDescription>Safety and filtering settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Content Filtering</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Filter inappropriate content
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.content_filtering ?? true}
                                    onCheckedChange={(v) => updateSetting('content_filtering', v)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto-Ban on Violations</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically ban users who violate rules
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.auto_ban ?? false}
                                    onCheckedChange={(v) => updateSetting('auto_ban', v)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Violations Before Ban</Label>
                                <Input
                                    type="number"
                                    value={settings.violations_before_ban ?? 3}
                                    onChange={(e) => updateSetting('violations_before_ban', parseInt(e.target.value))}
                                    disabled={!settings.auto_ban}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Behavior */}
                <TabsContent value="ai" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Default AI Parameters</CardTitle>
                            <CardDescription>Default values for new conversations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Default Temperature</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="2"
                                    value={settings.default_temperature ?? 0.7}
                                    onChange={(e) => updateSetting('default_temperature', parseFloat(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    0.0 = Focused, 1.0 = Balanced, 2.0 = Creative
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Default Max Tokens</Label>
                                <Input
                                    type="number"
                                    value={settings.default_max_tokens ?? 2000}
                                    onChange={(e) => updateSetting('default_max_tokens', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Default System Prompt</Label>
                                <Textarea
                                    placeholder="You are a helpful AI assistant..."
                                    value={settings.default_system_prompt ?? ''}
                                    onChange={(e) => updateSetting('default_system_prompt', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Streaming Responses</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Stream AI responses in real-time
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enable_streaming ?? true}
                                    onCheckedChange={(v) => updateSetting('enable_streaming', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* UI Customization */}
                <TabsContent value="ui" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chat Interface</CardTitle>
                            <CardDescription>Customize the chat appearance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Chat Widget Title</Label>
                                <Input
                                    placeholder="G-Nexus AI Assistant"
                                    value={settings.chat_title ?? ''}
                                    onChange={(e) => updateSetting('chat_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Chat Widget Subtitle</Label>
                                <Input
                                    placeholder="Powered by AI"
                                    value={settings.chat_subtitle ?? ''}
                                    onChange={(e) => updateSetting('chat_subtitle', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Model Selector</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow users to choose AI model
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.show_model_selector ?? true}
                                    onCheckedChange={(v) => updateSetting('show_model_selector', v)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Token Counter</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Display token usage to users
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.show_token_counter ?? false}
                                    onCheckedChange={(v) => updateSetting('show_token_counter', v)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Cost Information</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Display cost estimates to users
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.show_cost_info ?? false}
                                    onCheckedChange={(v) => updateSetting('show_cost_info', v)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable File Uploads</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow users to upload files/images
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enable_file_uploads ?? true}
                                    onCheckedChange={(v) => updateSetting('enable_file_uploads', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
