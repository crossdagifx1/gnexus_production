import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare, Hash, Plus, Search, Send, Smile, Paperclip, Phone, Video,
    Settings, Bell, BellOff, Pin, Star, MoreVertical, Users, AtSign, ChevronDown, Circle
} from 'lucide-react';

interface Channel { id: string; name: string; type: 'public' | 'private' | 'direct'; unread: number; pinned: boolean; }
interface Message { id: string; userId: string; userName: string; content: string; timestamp: Date; reactions?: { emoji: string; count: number }[]; }
interface User { id: string; name: string; status: 'online' | 'away' | 'dnd' | 'offline'; role: string; }

const TeamCommunication: React.FC = () => {
    const [selectedChannel, setSelectedChannel] = useState('1');
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [channels] = useState<Channel[]>([
        { id: '1', name: 'general', type: 'public', unread: 0, pinned: true },
        { id: '2', name: 'announcements', type: 'public', unread: 2, pinned: true },
        { id: '3', name: 'dev-team', type: 'private', unread: 5, pinned: false },
        { id: '4', name: 'design', type: 'private', unread: 0, pinned: false },
        { id: '5', name: 'random', type: 'public', unread: 0, pinned: false },
    ]);

    const [directMessages] = useState<{ id: string; name: string; status: string; unread: number }[]>([
        { id: 'd1', name: 'Alice Chen', status: 'online', unread: 1 },
        { id: 'd2', name: 'Bob Smith', status: 'away', unread: 0 },
        { id: 'd3', name: 'Carol White', status: 'offline', unread: 0 },
    ]);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', userId: '1', userName: 'Alice', content: 'Good morning team! 👋', timestamp: new Date(Date.now() - 3600000) },
        { id: '2', userId: '2', userName: 'Bob', content: 'Morning! Ready for the standup?', timestamp: new Date(Date.now() - 3500000) },
        { id: '3', userId: '1', userName: 'Alice', content: 'Yes! I pushed the new feature branch last night. Check it out when you have time.', timestamp: new Date(Date.now() - 3400000), reactions: [{ emoji: '👍', count: 3 }, { emoji: '🎉', count: 1 }] },
        { id: '4', userId: '3', userName: 'Carol', content: 'Great work! I\'ll review it this afternoon.', timestamp: new Date(Date.now() - 1800000) },
        { id: '5', userId: '2', userName: 'Bob', content: 'The API integration is looking solid. Nice job everyone!', timestamp: new Date(Date.now() - 900000) },
    ]);

    const [teamMembers] = useState<User[]>([
        { id: '1', name: 'Alice Chen', status: 'online', role: 'Lead Developer' },
        { id: '2', name: 'Bob Smith', status: 'online', role: 'Backend Engineer' },
        { id: '3', name: 'Carol White', status: 'away', role: 'Designer' },
        { id: '4', name: 'David Lee', status: 'dnd', role: 'DevOps' },
        { id: '5', name: 'Eve Wilson', status: 'offline', role: 'QA Engineer' },
    ]);

    const sendMessage = () => {
        if (!messageInput.trim()) return;
        setMessages([...messages, { id: Date.now().toString(), userId: 'me', userName: 'You', content: messageInput, timestamp: new Date() }]);
        setMessageInput('');
    };

    const getStatusColor = (s: string) => { switch (s) { case 'online': return 'bg-green-500'; case 'away': return 'bg-yellow-500'; case 'dnd': return 'bg-red-500'; default: return 'bg-gray-500'; } };

    const currentChannel = channels.find(c => c.id === selectedChannel) || directMessages.find(d => d.id === selectedChannel);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    return (
        <div className="h-[calc(100vh-120px)] flex">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/30 flex flex-col">
                <div className="p-4 border-b"><h2 className="font-bold text-lg">Gnexus Team</h2><p className="text-xs text-muted-foreground">{teamMembers.filter(m => m.status === 'online').length} members online</p></div>

                <ScrollArea className="flex-1 p-2">
                    {/* Channels */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between px-2 mb-2"><span className="text-xs font-semibold text-muted-foreground uppercase">Channels</span><Button variant="ghost" size="icon" className="h-5 w-5"><Plus className="w-3 h-3" /></Button></div>
                        {channels.map((ch) => (
                            <div key={ch.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${selectedChannel === ch.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                onClick={() => setSelectedChannel(ch.id)}>
                                <Hash className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-sm truncate">{ch.name}</span>
                                {ch.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                                {ch.unread > 0 && <Badge className="h-5 min-w-5 text-xs">{ch.unread}</Badge>}
                            </div>
                        ))}
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2"><span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span><Button variant="ghost" size="icon" className="h-5 w-5"><Plus className="w-3 h-3" /></Button></div>
                        {directMessages.map((dm) => (
                            <div key={dm.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${selectedChannel === dm.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                onClick={() => setSelectedChannel(dm.id)}>
                                <div className="relative"><Avatar className="w-6 h-6"><AvatarFallback className="text-xs">{dm.name.charAt(0)}</AvatarFallback></Avatar>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(dm.status)}`} /></div>
                                <span className="flex-1 text-sm truncate">{dm.name}</span>
                                {dm.unread > 0 && <Badge className="h-5 min-w-5 text-xs">{dm.unread}</Badge>}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-14 border-b px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Hash className="w-5 h-5" /><span className="font-semibold">{currentChannel && 'name' in currentChannel ? currentChannel.name : 'general'}</span></div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex gap-3 group">
                                <Avatar className="w-9 h-9"><AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm">{msg.userName}</span>
                                        <span className="text-xs text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm mt-0.5">{msg.content}</p>
                                    {msg.reactions && <div className="flex gap-1 mt-1">{msg.reactions.map((r, i) => <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">{r.emoji} {r.count}</Badge>)}</div>}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><Smile className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
                        <Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder={`Message #${currentChannel && 'name' in currentChannel ? currentChannel.name : 'general'}`}
                            className="border-0 bg-transparent focus-visible:ring-0" onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><AtSign className="w-4 h-4" /></Button>
                        <Button size="icon" className="h-8 w-8" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>

            {/* Members Sidebar */}
            <div className="w-60 border-l bg-muted/30 p-4 hidden lg:block">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" />Team Members</h3>
                <div className="space-y-2">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                            <div className="relative"><Avatar className="w-8 h-8"><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} /></div>
                            <div><p className="text-sm font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.role}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamCommunication;
