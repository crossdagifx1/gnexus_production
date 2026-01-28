import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    LayoutDashboard, Plus, GripVertical, X, Settings, Maximize2, Minimize2, RefreshCw,
    Activity, Users, Zap, Clock, TrendingUp, MessageSquare, Calendar, Bell, Target, FileText
} from 'lucide-react';

interface Widget { id: string; type: string; title: string; size: 'small' | 'medium' | 'large'; position: { x: number; y: number }; }

const widgetTypes = [
    { type: 'activity', title: 'Recent Activity', icon: Activity, color: 'bg-blue-500' },
    { type: 'stats', title: 'Quick Stats', icon: TrendingUp, color: 'bg-green-500' },
    { type: 'tasks', title: 'My Tasks', icon: Target, color: 'bg-purple-500' },
    { type: 'messages', title: 'Messages', icon: MessageSquare, color: 'bg-yellow-500' },
    { type: 'calendar', title: 'Calendar', icon: Calendar, color: 'bg-red-500' },
    { type: 'notifications', title: 'Notifications', icon: Bell, color: 'bg-indigo-500' },
];

const PersonalizedDashboard: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [widgets, setWidgets] = useState<Widget[]>([
        { id: '1', type: 'stats', title: 'Quick Stats', size: 'large', position: { x: 0, y: 0 } },
        { id: '2', type: 'activity', title: 'Recent Activity', size: 'medium', position: { x: 2, y: 0 } },
        { id: '3', type: 'tasks', title: 'My Tasks', size: 'medium', position: { x: 0, y: 1 } },
        { id: '4', type: 'messages', title: 'Messages', size: 'small', position: { x: 2, y: 1 } },
    ]);

    const removeWidget = (id: string) => setWidgets(widgets.filter(w => w.id !== id));
    const addWidget = (type: string) => {
        const wt = widgetTypes.find(w => w.type === type);
        if (wt) setWidgets([...widgets, { id: Date.now().toString(), type, title: wt.title, size: 'medium', position: { x: 0, y: widgets.length } }]);
    };

    const renderWidgetContent = (widget: Widget) => {
        switch (widget.type) {
            case 'stats':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {[{ label: 'Active Projects', value: '12', change: '+2', icon: Target },
                        { label: 'Tasks Complete', value: '48', change: '+8', icon: Zap },
                        { label: 'Team Members', value: '16', change: '', icon: Users },
                        { label: 'Hours Saved', value: '124', change: '+12', icon: Clock }
                        ].map((stat, i) => (
                            <div key={i} className="p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1"><stat.icon className="w-4 h-4" /><span className="text-xs">{stat.label}</span></div>
                                <div className="flex items-baseline gap-2"><span className="text-2xl font-bold">{stat.value}</span>{stat.change && <span className="text-xs text-green-500">{stat.change}</span>}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'activity':
                return (
                    <ScrollArea className="h-[200px]"><div className="space-y-3">
                        {[{ action: 'Completed task', target: 'API Integration', time: '2m ago' },
                        { action: 'Commented on', target: 'Design Review', time: '15m ago' },
                        { action: 'Created project', target: 'Mobile App v2', time: '1h ago' },
                        { action: 'Joined team', target: 'Marketing', time: '2h ago' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <p className="text-sm flex-1"><span className="text-muted-foreground">{item.action}</span> <span className="font-medium">{item.target}</span></p>
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                            </div>
                        ))}
                    </div></ScrollArea>
                );
            case 'tasks':
                return (
                    <div className="space-y-2">
                        {[{ task: 'Review pull request #142', priority: 'high', due: 'Today' },
                        { task: 'Update documentation', priority: 'medium', due: 'Tomorrow' },
                        { task: 'Team standup meeting', priority: 'low', due: 'In 2 hours' }
                        ].map((t, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded border">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm flex-1">{t.task}</span>
                                <Badge variant={t.priority === 'high' ? 'destructive' : t.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">{t.priority}</Badge>
                                <span className="text-xs text-muted-foreground">{t.due}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'messages':
                return (
                    <div className="space-y-2">
                        {[{ from: 'Alice', msg: 'Can you review the PR?', time: '5m' },
                        { from: 'Bob', msg: 'Meeting moved to 3pm', time: '1h' }
                        ].map((m, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">{m.from.charAt(0)}</div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-medium">{m.from}</p><p className="text-xs text-muted-foreground truncate">{m.msg}</p></div>
                                <span className="text-xs text-muted-foreground">{m.time}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'calendar':
                return (
                    <div className="space-y-2">
                        {[{ event: 'Team Standup', time: '10:00 AM', duration: '30m' },
                        { event: 'Design Review', time: '2:00 PM', duration: '1h' },
                        { event: 'Sprint Planning', time: '4:00 PM', duration: '1h' }
                        ].map((e, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded border-l-4 border-primary bg-muted/30">
                                <div><p className="text-sm font-medium">{e.event}</p><p className="text-xs text-muted-foreground">{e.time} · {e.duration}</p></div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return <div className="flex items-center justify-center h-32 text-muted-foreground">Widget content</div>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">My Dashboard</h1><p className="text-muted-foreground">Your personalized workspace</p></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>{isEditing ? <><X className="w-4 h-4 mr-2" />Done</> : <><Settings className="w-4 h-4 mr-2" />Customize</>}</Button>
                    <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4" /></Button>
                </div>
            </div>

            {isEditing && (
                <Card><CardContent className="p-4">
                    <p className="text-sm font-medium mb-3">Add Widgets</p>
                    <div className="flex flex-wrap gap-2">
                        {widgetTypes.map((wt) => (
                            <Button key={wt.type} variant="outline" size="sm" onClick={() => addWidget(wt.type)} className="gap-2">
                                <wt.icon className="w-4 h-4" />{wt.title}
                            </Button>
                        ))}
                    </div>
                </CardContent></Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget) => (
                    <Card key={widget.id} className={`${widget.size === 'large' ? 'md:col-span-2' : ''} ${isEditing ? 'ring-2 ring-dashed ring-primary/30' : ''}`}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    {isEditing && <GripVertical className="w-4 h-4 cursor-grab text-muted-foreground" />}
                                    {widget.title}
                                </CardTitle>
                                {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeWidget(widget.id)}><X className="w-4 h-4" /></Button>}
                            </div>
                        </CardHeader>
                        <CardContent>{renderWidgetContent(widget)}</CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PersonalizedDashboard;
