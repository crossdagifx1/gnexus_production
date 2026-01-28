import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users, Video, Monitor, Share2, MessageSquare, Hand, Mic, MicOff, VideoOff,
    ScreenShare, ScreenShareOff, Settings, Copy, Link, Clock, CheckCircle,
    Circle, MousePointer, Edit, Eye, FileText, Folder, Plus, X, Send
} from 'lucide-react';

interface Collaborator { id: string; name: string; avatar?: string; status: 'online' | 'away' | 'busy'; cursor?: { x: number; y: number }; editing?: string; }
interface Workspace { id: string; name: string; type: 'document' | 'whiteboard' | 'code'; collaborators: string[]; lastEdited: Date; }
interface Message { id: string; userId: string; userName: string; content: string; timestamp: Date; }

const CollaborationSuite: React.FC = () => {
    const [activeTab, setActiveTab] = useState('workspace');
    const [isInCall, setIsInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [messageInput, setMessageInput] = useState('');

    const [collaborators] = useState<Collaborator[]>([
        { id: '1', name: 'Alice Chen', status: 'online', cursor: { x: 200, y: 150 }, editing: 'Section 1' },
        { id: '2', name: 'Bob Smith', status: 'online', cursor: { x: 450, y: 300 } },
        { id: '3', name: 'Carol White', status: 'away' },
        { id: '4', name: 'David Lee', status: 'busy', editing: 'Header' },
    ]);

    const [workspaces] = useState<Workspace[]>([
        { id: '1', name: 'Project Roadmap', type: 'document', collaborators: ['1', '2'], lastEdited: new Date() },
        { id: '2', name: 'UI Design Board', type: 'whiteboard', collaborators: ['1', '3', '4'], lastEdited: new Date(Date.now() - 3600000) },
        { id: '3', name: 'Backend API', type: 'code', collaborators: ['2', '4'], lastEdited: new Date(Date.now() - 7200000) },
    ]);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', userId: '1', userName: 'Alice', content: "Let's finalize the design today", timestamp: new Date(Date.now() - 300000) },
        { id: '2', userId: '2', userName: 'Bob', content: 'Sounds good! I updated the API docs', timestamp: new Date(Date.now() - 120000) },
    ]);

    const sendMessage = () => {
        if (!messageInput.trim()) return;
        setMessages([...messages, { id: Date.now().toString(), userId: 'me', userName: 'You', content: messageInput, timestamp: new Date() }]);
        setMessageInput('');
    };

    const getStatusColor = (status: string) => {
        switch (status) { case 'online': return 'bg-green-500'; case 'away': return 'bg-yellow-500'; case 'busy': return 'bg-red-500'; default: return 'bg-gray-500'; }
    };

    const copyInviteLink = () => navigator.clipboard.writeText('https://gnexus.app/collab/invite/abc123');

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Collaboration Suite</h1><p className="text-muted-foreground">Real-time collaboration with your team</p></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={copyInviteLink}><Link className="w-4 h-4 mr-2" />Invite</Button>
                    <Button onClick={() => setIsInCall(!isInCall)}>{isInCall ? <><X className="w-4 h-4 mr-2" />Leave Call</> : <><Video className="w-4 h-4 mr-2" />Start Call</>}</Button>
                </div>
            </div>

            {/* Video Call Bar */}
            {isInCall && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {collaborators.filter(c => c.status === 'online').slice(0, 4).map((c) => (
                                        <Avatar key={c.id} className="border-2 border-background"><AvatarFallback>{c.name.charAt(0)}</AvatarFallback></Avatar>
                                    ))}
                                </div>
                                <div><p className="font-medium">Team Call</p><p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />00:15:32</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" onClick={() => setIsMuted(!isMuted)}>{isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</Button>
                                <Button variant={!isVideoOn ? 'destructive' : 'secondary'} size="icon" onClick={() => setIsVideoOn(!isVideoOn)}>{isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}</Button>
                                <Button variant={isScreenSharing ? 'default' : 'secondary'} size="icon" onClick={() => setIsScreenSharing(!isScreenSharing)}>{isScreenSharing ? <ScreenShareOff className="w-4 h-4" /> : <ScreenShare className="w-4 h-4" />}</Button>
                                <Button variant="destructive" size="sm" onClick={() => setIsInCall(false)}><X className="w-4 h-4 mr-2" />End</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList><TabsTrigger value="workspace">Workspaces</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>

                        <TabsContent value="workspace" className="space-y-4">
                            <div className="flex items-center justify-between"><h3 className="font-semibold">Shared Workspaces</h3><Button size="sm"><Plus className="w-4 h-4 mr-2" />New Workspace</Button></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspaces.map((ws) => (
                                    <Card key={ws.id} className="cursor-pointer hover:border-primary transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                    {ws.type === 'document' ? <FileText className="w-5 h-5" /> : ws.type === 'whiteboard' ? <Edit className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{ws.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{ws.collaborators.length} collaborators</p>
                                                </div>
                                                <div className="flex -space-x-2">
                                                    {ws.collaborators.slice(0, 3).map((cId) => {
                                                        const c = collaborators.find(col => col.id === cId);
                                                        return c ? <Avatar key={cId} className="w-6 h-6 border border-background"><AvatarFallback className="text-xs">{c.name.charAt(0)}</AvatarFallback></Avatar> : null;
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Live Canvas Preview */}
                            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Live Canvas</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="relative h-[300px] bg-muted rounded-lg overflow-hidden">
                                        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-px opacity-20">{Array.from({ length: 48 }).map((_, i) => <div key={i} className="bg-border" />)}</div>
                                        {collaborators.filter(c => c.cursor).map((c) => (
                                            <div key={c.id} className="absolute transition-all duration-100" style={{ left: c.cursor!.x, top: c.cursor!.y }}>
                                                <MousePointer className="w-4 h-4" style={{ color: c.id === '1' ? '#3b82f6' : c.id === '2' ? '#10b981' : '#f59e0b' }} />
                                                <span className="absolute left-4 top-0 text-xs px-1 rounded" style={{ backgroundColor: c.id === '1' ? '#3b82f6' : c.id === '2' ? '#10b981' : '#f59e0b', color: 'white' }}>{c.name.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity"><Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                            <CardContent><ScrollArea className="h-[400px]"><div className="space-y-3">
                                {[{ user: 'Alice', action: 'edited', target: 'Project Roadmap', time: '2 min ago' },
                                { user: 'Bob', action: 'commented on', target: 'API Documentation', time: '15 min ago' },
                                { user: 'Carol', action: 'joined', target: 'UI Design Board', time: '1 hour ago' },
                                { user: 'David', action: 'created', target: 'New Sprint Plan', time: '2 hours ago' }
                                ].map((activity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Avatar className="w-8 h-8"><AvatarFallback>{activity.user.charAt(0)}</AvatarFallback></Avatar>
                                        <p className="text-sm"><span className="font-medium">{activity.user}</span> {activity.action} <span className="text-primary">{activity.target}</span></p>
                                        <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                ))}
                            </div></ScrollArea></CardContent>
                        </Card></TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar: Team & Chat */}
                <div className="space-y-6">
                    <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" />Team ({collaborators.filter(c => c.status === 'online').length} online)</CardTitle></CardHeader>
                        <CardContent><ScrollArea className="h-[180px]"><div className="space-y-2">
                            {collaborators.map((c) => (
                                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                    <div className="relative"><Avatar className="w-8 h-8"><AvatarFallback>{c.name.charAt(0)}</AvatarFallback></Avatar>
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(c.status)}`} /></div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p>
                                        {c.editing && <p className="text-xs text-muted-foreground">Editing: {c.editing}</p>}</div>
                                </div>
                            ))}
                        </div></ScrollArea></CardContent>
                    </Card>

                    <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" />Team Chat</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px] mb-3"><div className="space-y-3">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-2 ${msg.userId === 'me' ? 'justify-end' : ''}`}>
                                        {msg.userId !== 'me' && <Avatar className="w-6 h-6"><AvatarFallback className="text-xs">{msg.userName.charAt(0)}</AvatarFallback></Avatar>}
                                        <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.userId === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            <p className="text-sm">{msg.content}</p><p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div></ScrollArea>
                            <div className="flex gap-2"><Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                                <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CollaborationSuite;
