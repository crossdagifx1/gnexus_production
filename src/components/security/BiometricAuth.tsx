import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Fingerprint, Smartphone, Shield, Key, Lock, Unlock, CheckCircle, XCircle,
    AlertTriangle, RefreshCw, Plus, Trash2, Settings, Eye, EyeOff, Monitor,
    Globe, Clock, MapPin, ShieldCheck, ShieldOff, Scan, QrCode, Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AuthDevice { id: string; name: string; type: 'fingerprint' | 'face' | 'security_key' | 'phone'; lastUsed: Date; trusted: boolean; }
interface AuthSession { id: string; device: string; location: string; ip: string; startTime: Date; current: boolean; }

const BiometricAuth: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mfaEnabled, setMfaEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const [devices] = useState<AuthDevice[]>([
        { id: '1', name: 'MacBook Pro Touch ID', type: 'fingerprint', lastUsed: new Date(), trusted: true },
        { id: '2', name: 'iPhone 15 Face ID', type: 'face', lastUsed: new Date(Date.now() - 3600000), trusted: true },
        { id: '3', name: 'YubiKey 5', type: 'security_key', lastUsed: new Date(Date.now() - 86400000), trusted: true },
    ]);

    const [sessions] = useState<AuthSession[]>([
        { id: '1', device: 'Chrome on Windows', location: 'New York, US', ip: '192.168.1.1', startTime: new Date(), current: true },
        { id: '2', device: 'Safari on iPhone', location: 'New York, US', ip: '192.168.1.2', startTime: new Date(Date.now() - 7200000), current: false },
        { id: '3', device: 'Firefox on Mac', location: 'Boston, US', ip: '10.0.0.1', startTime: new Date(Date.now() - 86400000), current: false },
    ]);

    const [securitySettings, setSecuritySettings] = useState({
        requireMfaOnNewDevice: true, sessionTimeout: '24h', rememberDevice: true, loginNotifications: true, suspiciousActivityAlerts: true
    });

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'fingerprint': return <Fingerprint className="w-5 h-5" />;
            case 'face': return <Scan className="w-5 h-5" />;
            case 'security_key': return <Key className="w-5 h-5" />;
            default: return <Smartphone className="w-5 h-5" />;
        }
    };

    const enrollBiometric = async () => {
        setIsEnrolling(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsEnrolling(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Biometric Authentication</h1>
                    <p className="text-muted-foreground">Secure your account with passwordless authentication</p>
                </div>
                <Badge className={mfaEnabled ? 'bg-green-500' : 'bg-red-500'}>
                    {mfaEnabled ? <ShieldCheck className="w-4 h-4 mr-1" /> : <ShieldOff className="w-4 h-4 mr-1" />}
                    MFA {mfaEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
            </div>

            {/* Security Score */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-1">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                <span className="text-2xl font-bold">95</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">Account Security Score</h3>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                {[{ label: 'MFA', enabled: mfaEnabled }, { label: 'Biometric', enabled: biometricEnabled },
                                { label: 'Trusted Devices', enabled: devices.some(d => d.trusted) }, { label: 'Session Security', enabled: true }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        {item.enabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Fingerprint className="w-5 h-5" />Biometric Setup</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Fingerprint className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div><p className="font-medium">Fingerprint Authentication</p><p className="text-sm text-muted-foreground">Use Touch ID or fingerprint sensor</p></div>
                                    </div>
                                    <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                            <Scan className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div><p className="font-medium">Face Recognition</p><p className="text-sm text-muted-foreground">Use Face ID or camera</p></div>
                                    </div>
                                    <Switch checked={true} />
                                </div>
                                <Button className="w-full" onClick={enrollBiometric} disabled={isEnrolling}>
                                    {isEnrolling ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Enrolling...</> : <><Plus className="w-4 h-4 mr-2" />Add New Biometric</>}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Multi-Factor Authentication</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {[{ icon: Smartphone, label: 'Authenticator App', desc: 'Google/Microsoft Authenticator', enabled: true },
                                { icon: Mail, label: 'Email Verification', desc: 'Receive codes via email', enabled: true },
                                { icon: Key, label: 'Security Key', desc: 'FIDO2/WebAuthn hardware key', enabled: devices.some(d => d.type === 'security_key') }
                                ].map((method, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <method.icon className="w-5 h-5 text-muted-foreground" />
                                            <div><p className="font-medium text-sm">{method.label}</p><p className="text-xs text-muted-foreground">{method.desc}</p></div>
                                        </div>
                                        <Badge variant={method.enabled ? 'default' : 'outline'}>{method.enabled ? 'Active' : 'Setup'}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="devices" className="space-y-4">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5" />Trusted Devices</CardTitle>
                        <CardDescription>Manage devices that can authenticate without additional verification</CardDescription></CardHeader>
                        <CardContent><ScrollArea className="h-[400px]"><div className="space-y-3">
                            {devices.map((device) => (
                                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">{getDeviceIcon(device.type)}</div>
                                        <div><h4 className="font-medium">{device.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-3 h-3" />Last used: {device.lastUsed.toLocaleString()}
                                            </div></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {device.trusted && <Badge className="bg-green-500">Trusted</Badge>}
                                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div></ScrollArea></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Active Sessions</CardTitle></CardHeader>
                        <CardContent><ScrollArea className="h-[400px]"><div className="space-y-3">
                            {sessions.map((session) => (
                                <div key={session.id} className={`flex items-center justify-between p-4 border rounded-lg ${session.current ? 'border-green-500 bg-green-500/5' : ''}`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{session.device}</h4>
                                            {session.current && <Badge className="bg-green-500">Current</Badge>}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>
                                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{session.ip}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.startTime.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {!session.current && <Button variant="destructive" size="sm">Revoke</Button>}
                                </div>
                            ))}
                        </div></ScrollArea>
                            <Button variant="outline" className="w-full mt-4"><Lock className="w-4 h-4 mr-2" />Sign Out All Other Sessions</Button></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Security Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[{ key: 'requireMfaOnNewDevice', label: 'Require MFA on new devices', desc: 'Additional verification for unrecognized devices' },
                            { key: 'rememberDevice', label: 'Remember trusted devices', desc: 'Skip MFA on devices you trust' },
                            { key: 'loginNotifications', label: 'Login notifications', desc: 'Get notified of new sign-ins' },
                            { key: 'suspiciousActivityAlerts', label: 'Suspicious activity alerts', desc: 'Alert on unusual account activity' }
                            ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div><p className="font-medium">{setting.label}</p><p className="text-sm text-muted-foreground">{setting.desc}</p></div>
                                    <Switch checked={securitySettings[setting.key as keyof typeof securitySettings] as boolean}
                                        onCheckedChange={(c) => setSecuritySettings({ ...securitySettings, [setting.key]: c })} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BiometricAuth;
