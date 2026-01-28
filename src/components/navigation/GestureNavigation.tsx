import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Hand, Keyboard, Mic, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCcw,
    Maximize, Minimize, Plus, Search, Settings, Command, ArrowLeft, ArrowRight, Trash2
} from 'lucide-react';

interface Gesture { id: string; name: string; keys?: string; action: string; enabled: boolean; }
interface VoiceCommand { id: string; phrase: string; action: string; enabled: boolean; }

const GestureNavigation: React.FC = () => {
    const [activeTab, setActiveTab] = useState('shortcuts');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingFor, setRecordingFor] = useState<string | null>(null);

    const [shortcuts, setShortcuts] = useState<Gesture[]>([
        { id: '1', name: 'Search', keys: 'Ctrl + K', action: 'Open search', enabled: true },
        { id: '2', name: 'New Task', keys: 'Ctrl + N', action: 'Create new task', enabled: true },
        { id: '3', name: 'Save', keys: 'Ctrl + S', action: 'Save current work', enabled: true },
        { id: '4', name: 'Toggle Sidebar', keys: 'Ctrl + B', action: 'Show/hide sidebar', enabled: true },
        { id: '5', name: 'Quick Actions', keys: 'Ctrl + Shift + P', action: 'Open command palette', enabled: true },
        { id: '6', name: 'Navigate Back', keys: 'Alt + Left', action: 'Go to previous page', enabled: true },
        { id: '7', name: 'Navigate Forward', keys: 'Alt + Right', action: 'Go to next page', enabled: true },
        { id: '8', name: 'Zoom In', keys: 'Ctrl + +', action: 'Increase zoom', enabled: true },
        { id: '9', name: 'Zoom Out', keys: 'Ctrl + -', action: 'Decrease zoom', enabled: true },
    ]);

    const [touchGestures] = useState<Gesture[]>([
        { id: 't1', name: 'Swipe Left', action: 'Go to next page', enabled: true },
        { id: 't2', name: 'Swipe Right', action: 'Go to previous page', enabled: true },
        { id: 't3', name: 'Swipe Down', action: 'Refresh content', enabled: true },
        { id: 't4', name: 'Pinch', action: 'Zoom in/out', enabled: true },
        { id: 't5', name: 'Two-finger Tap', action: 'Open context menu', enabled: false },
    ]);

    const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([
        { id: 'v1', phrase: 'Open dashboard', action: 'Navigate to dashboard', enabled: true },
        { id: 'v2', phrase: 'Create new project', action: 'Open new project dialog', enabled: true },
        { id: 'v3', phrase: 'Search for...', action: 'Open search with query', enabled: true },
        { id: 'v4', phrase: 'Go back', action: 'Navigate back', enabled: true },
        { id: 'v5', phrase: 'Scroll down', action: 'Scroll page down', enabled: false },
    ]);

    const startRecording = (id: string) => { setRecordingFor(id); setIsRecording(true); setTimeout(() => { setIsRecording(false); setRecordingFor(null); }, 3000); };

    const toggleShortcut = (id: string) => setShortcuts(shortcuts.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const toggleVoice = (id: string) => setVoiceCommands(voiceCommands.map(v => v.id === id ? { ...v, enabled: !v.enabled } : v));

    const getGestureIcon = (name: string) => {
        if (name.includes('Left')) return <ChevronLeft className="w-5 h-5" />;
        if (name.includes('Right')) return <ChevronRight className="w-5 h-5" />;
        if (name.includes('Up')) return <ChevronUp className="w-5 h-5" />;
        if (name.includes('Down')) return <ChevronDown className="w-5 h-5" />;
        if (name.includes('Pinch')) return <Maximize className="w-5 h-5" />;
        return <Hand className="w-5 h-5" />;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Gestures & Navigation</h1><p className="text-muted-foreground">Customize keyboard shortcuts, touch gestures, and voice commands</p></div>
                <Button variant="outline"><RotateCcw className="w-4 h-4 mr-2" />Reset Defaults</Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="shortcuts"><Keyboard className="w-4 h-4 mr-2" />Keyboard</TabsTrigger>
                    <TabsTrigger value="gestures"><Hand className="w-4 h-4 mr-2" />Touch</TabsTrigger>
                    <TabsTrigger value="voice"><Mic className="w-4 h-4 mr-2" />Voice</TabsTrigger>
                </TabsList>

                <TabsContent value="shortcuts" className="space-y-4">
                    <Card><CardHeader><CardTitle>Keyboard Shortcuts</CardTitle><CardDescription>Click on a shortcut to customize it</CardDescription></CardHeader>
                        <CardContent><ScrollArea className="h-[500px]"><div className="space-y-2">
                            {shortcuts.map((shortcut) => (
                                <div key={shortcut.id} className={`flex items-center gap-4 p-3 rounded-lg border ${!shortcut.enabled ? 'opacity-50' : ''}`}>
                                    <Switch checked={shortcut.enabled} onCheckedChange={() => toggleShortcut(shortcut.id)} />
                                    <div className="flex-1"><p className="font-medium text-sm">{shortcut.name}</p><p className="text-xs text-muted-foreground">{shortcut.action}</p></div>
                                    <Button variant={recordingFor === shortcut.id ? 'destructive' : 'outline'} size="sm" onClick={() => startRecording(shortcut.id)} className="min-w-[120px]">
                                        {recordingFor === shortcut.id ? 'Press keys...' : <><Command className="w-3 h-3 mr-1" />{shortcut.keys}</>}
                                    </Button>
                                </div>
                            ))}
                        </div></ScrollArea>
                            <Button className="w-full mt-4" variant="outline"><Plus className="w-4 h-4 mr-2" />Add Custom Shortcut</Button></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gestures" className="space-y-4">
                    <Card><CardHeader><CardTitle>Touch Gestures</CardTitle><CardDescription>Configure touch and trackpad gestures</CardDescription></CardHeader>
                        <CardContent><div className="space-y-3">
                            {touchGestures.map((gesture) => (
                                <div key={gesture.id} className={`flex items-center gap-4 p-4 rounded-lg border ${!gesture.enabled ? 'opacity-50' : ''}`}>
                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">{getGestureIcon(gesture.name)}</div>
                                    <div className="flex-1"><p className="font-medium">{gesture.name}</p><p className="text-sm text-muted-foreground">{gesture.action}</p></div>
                                    <Switch checked={gesture.enabled} />
                                </div>
                            ))}
                        </div></CardContent>
                    </Card>

                    <Card><CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/30">
                                <Hand className="w-12 h-12 text-primary/50" />
                            </div>
                            <div><h3 className="font-semibold">Gesture Tutorial</h3><p className="text-sm text-muted-foreground mb-2">Practice touch gestures in this interactive area</p>
                                <Button size="sm">Start Tutorial</Button></div>
                        </div>
                    </CardContent></Card>
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                    <Card><CardHeader><CardTitle>Voice Commands</CardTitle><CardDescription>Control the app using voice</CardDescription></CardHeader>
                        <CardContent><div className="space-y-3">
                            {voiceCommands.map((cmd) => (
                                <div key={cmd.id} className={`flex items-center gap-4 p-3 rounded-lg border ${!cmd.enabled ? 'opacity-50' : ''}`}>
                                    <Switch checked={cmd.enabled} onCheckedChange={() => toggleVoice(cmd.id)} />
                                    <div className="flex-1"><p className="font-medium text-sm">"{cmd.phrase}"</p><p className="text-xs text-muted-foreground">{cmd.action}</p></div>
                                    <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))}
                        </div>
                            <div className="mt-4 flex gap-2"><Input placeholder="Add custom voice command..." /><Button><Plus className="w-4 h-4" /></Button></div></CardContent>
                    </Card>

                    <Card><CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted'}`}>
                            <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1"><h3 className="font-semibold">Voice Control</h3><p className="text-sm text-muted-foreground">Say "Hey Gnexus" to activate</p></div>
                        <Button variant={isRecording ? 'destructive' : 'default'} onClick={() => setIsRecording(!isRecording)}>
                            {isRecording ? 'Stop Listening' : 'Start Listening'}
                        </Button>
                    </CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default GestureNavigation;
