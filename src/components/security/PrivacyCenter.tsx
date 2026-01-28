import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Shield, Eye, Cookie, Database, Download, Trash2, Settings, Share2, Users,
    Bell, Mail, Smartphone, FileText, Info, History, UserX, ShieldCheck
} from 'lucide-react';

interface PrivacyPreference {
    id: string; category: string; name: string; description: string; enabled: boolean; required?: boolean;
}

const PrivacyCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [preferences, setPreferences] = useState<PrivacyPreference[]>([
        { id: '1', category: 'essential', name: 'Essential Cookies', description: 'Required for the website to function', enabled: true, required: true },
        { id: '2', category: 'analytics', name: 'Analytics', description: 'Help us understand visitor interactions', enabled: true },
        { id: '3', category: 'marketing', name: 'Marketing', description: 'Used for personalized advertisements', enabled: false },
        { id: '4', category: 'functional', name: 'Functional', description: 'Enhanced functionality and personalization', enabled: true },
    ]);
    const [dataSharing, setDataSharing] = useState({
        shareWithPartners: false, personalizedAds: false, usageAnalytics: true, crashReports: true, locationData: false
    });
    const [notifications, setNotifications] = useState({
        email: { marketing: false, security: true, updates: true },
        push: { security: true, updates: false }
    });
    const connectedApps = [
        { id: '1', name: 'Google Analytics', icon: '📊', permissions: ['Read usage data'], connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { id: '2', name: 'Slack', icon: '💬', permissions: ['Send messages'], connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        { id: '3', name: 'GitHub', icon: '🐙', permissions: ['Read repositories'], connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    ];
    const dataCategories = [
        { name: 'Profile Information', items: ['Name', 'Email', 'Phone'], size: '2.3 KB' },
        { name: 'Activity Data', items: ['Login history', 'Page views'], size: '156 KB' },
        { name: 'AI Interactions', items: ['Chat history', 'Generated content'], size: '12.4 MB' }
    ];

    const togglePreference = (id: string) => setPreferences(preferences.map(p => p.id === id && !p.required ? { ...p, enabled: !p.enabled } : p));

    const handleExportData = () => {
        const blob = new Blob([JSON.stringify({ preferences, dataSharing, notifications }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `privacy-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Privacy Control Center</h1>
                    <p className="text-muted-foreground">Manage your data privacy preferences</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" />Privacy Protected
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[{ icon: Download, title: 'Export Data', desc: 'Download your data', color: 'blue' },
                { icon: Cookie, title: 'Cookie Settings', desc: 'Manage cookies', color: 'yellow' },
                { icon: Users, title: 'Third-Party Apps', desc: `${connectedApps.length} connected`, color: 'purple' },
                { icon: Trash2, title: 'Delete Account', desc: 'Remove all data', color: 'red' }
                ].map((item, idx) => (
                    <Card key={idx} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${item.color}-500/10 flex items-center justify-center`}>
                                <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                            </div>
                            <div><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="cookies">Cookies</TabsTrigger>
                    <TabsTrigger value="apps">Connected Apps</TabsTrigger>
                    <TabsTrigger value="data">Your Data</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Alert><ShieldCheck className="h-4 w-4" /><AlertTitle>Your Privacy Matters</AlertTitle>
                        <AlertDescription>Review and customize your privacy settings below.</AlertDescription></Alert>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Privacy Summary</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {[{ icon: Cookie, label: 'Cookies Enabled', value: `${preferences.filter(p => p.enabled).length}/${preferences.length}` },
                                { icon: Share2, label: 'Data Sharing', value: dataSharing.shareWithPartners ? 'Enabled' : 'Limited' },
                                { icon: Users, label: 'Connected Apps', value: connectedApps.length.toString() },
                                { icon: Database, label: 'Data Stored', value: '17.4 MB' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2"><item.icon className="w-4 h-4" /><span>{item.label}</span></div>
                                        <Badge variant="outline">{item.value}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {[{ icon: Mail, label: 'Email Notifications', key: 'email' as const },
                                { icon: Smartphone, label: 'Push Notifications', key: 'push' as const }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><item.icon className="w-4 h-4" /><span>{item.label}</span></div>
                                        <Switch checked={notifications[item.key].security} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: { ...notifications[item.key], security: c } })} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="cookies" className="space-y-4">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Cookie className="w-5 h-5" />Cookie Preferences</CardTitle>
                        <CardDescription>Control which cookies are used</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {preferences.map((pref) => (
                                    <div key={pref.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div><div className="flex items-center gap-2"><h4 className="font-medium">{pref.name}</h4>
                                            {pref.required && <Badge variant="outline" className="text-xs">Required</Badge>}</div>
                                            <p className="text-sm text-muted-foreground mt-1">{pref.description}</p></div>
                                        <Switch checked={pref.enabled} onCheckedChange={() => togglePreference(pref.id)} disabled={pref.required} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="apps" className="space-y-4">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Connected Applications</CardTitle></CardHeader>
                        <CardContent><div className="space-y-4">
                            {connectedApps.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">{app.icon}</div>
                                        <div><h4 className="font-medium">{app.name}</h4>
                                            <p className="text-sm text-muted-foreground">Connected {app.connectedAt.toLocaleDateString()}</p>
                                            <div className="flex gap-1 mt-1">{app.permissions.map((p, i) => <Badge key={i} variant="outline" className="text-xs">{p}</Badge>)}</div></div>
                                    </div>
                                    <Button variant="destructive" size="sm"><UserX className="w-4 h-4 mr-2" />Revoke</Button>
                                </div>
                            ))}
                        </div></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Your Data</CardTitle></CardHeader>
                            <CardContent><ScrollArea className="h-[300px]"><div className="space-y-3">
                                {dataCategories.map((cat, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2"><h4 className="font-medium">{cat.name}</h4><Badge variant="outline">{cat.size}</Badge></div>
                                        <div className="flex flex-wrap gap-1">{cat.items.map((item, i) => <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>)}</div>
                                    </div>
                                ))}
                            </div></ScrollArea></CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Data Actions</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Alert><Info className="h-4 w-4" /><AlertTitle>Data Portability</AlertTitle>
                                    <AlertDescription>Download all your data in portable format.</AlertDescription></Alert>
                                <div className="space-y-3">
                                    <Button className="w-full justify-start" onClick={handleExportData}><Download className="w-4 h-4 mr-2" />Export All Data</Button>
                                    <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" />View Privacy Policy</Button>
                                    <Button variant="outline" className="w-full justify-start"><History className="w-4 h-4 mr-2" />Access Request History</Button>
                                    <Separator />
                                    <Button variant="destructive" className="w-full justify-start"><Trash2 className="w-4 h-4 mr-2" />Request Data Deletion</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PrivacyCenter;
