import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Play,
    Pause,
    Square,
    Clock,
    CheckCircle,
    AlertCircle,
    Zap,
    Calendar,
    Repeat,
    Settings,
    Plus,
    Trash2,
    Edit,
    Save,
    RefreshCw,
    Activity,
    Target,
    Brain,
    Cpu,
    Database,
    Cloud,
    Smartphone,
    Monitor,
    Code,
    FileText,
    Mail,
    MessageSquare,
    Users,
    TrendingUp,
    BarChart3,
    Timer,
    Bell,
    Webhook,
    GitBranch,
    Shield,
    Lightbulb,
    Sparkles,
    Rocket,
    Workflow,
    Bot,
    Layers,
    Network,
    Server,
    HardDrive,
    Package,
    Archive,
    Upload,
    Download,
    Copy,
    Eye,
    EyeOff,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    PlayCircle,
    PauseCircle,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    RotateCcw,
    Filter,
    Search,
    FilterX,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    MoreHorizontal,
    X
} from 'lucide-react';
import { generateText } from '@/lib/ai';

interface Task {
    id: string;
    name: string;
    description: string;
    type: 'automation' | 'scheduled' | 'triggered' | 'manual';
    status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    trigger?: {
        type: 'schedule' | 'webhook' | 'event' | 'manual';
        config: Record<string, any>;
    };
    actions: TaskAction[];
    conditions?: TaskCondition[];
    schedule?: {
        frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
        time?: string;
        date?: string;
    };
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        lastRun?: Date;
        nextRun?: Date;
        runs: number;
        successRate: number;
        avgDuration: number;
    };
}

interface TaskAction {
    id: string;
    type: 'ai_analysis' | 'email_send' | 'data_processing' | 'api_call' | 'file_operation' | 'notification' | 'webhook_call';
    name: string;
    config: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
    duration?: number;
}

interface TaskCondition {
    id: string;
    type: 'time_based' | 'data_based' | 'event_based';
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
    value: any;
    logic?: 'and' | 'or';
}

const TaskAutomation: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const taskTypes = [
        { value: 'automation', label: 'Automation', icon: Bot, color: 'bg-blue-500' },
        { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-green-500' },
        { value: 'triggered', label: 'Triggered', icon: Zap, color: 'bg-yellow-500' },
        { value: 'manual', label: 'Manual', icon: PlayCircle, color: 'bg-purple-500' },
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-gray-500' },
        { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
        { value: 'high', label: 'High', color: 'bg-orange-500' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    ];

    const categories = [
        'Data Processing',
        'Email Marketing',
        'System Maintenance',
        'Content Generation',
        'API Integration',
        'File Management',
        'Monitoring',
        'Reporting',
        'Security',
        'Backup',
        'Synchronization',
    ];

    const actionTypes = [
        { value: 'ai_analysis', label: 'AI Analysis', icon: Brain, description: 'Run AI-powered analysis on data' },
        { value: 'email_send', label: 'Send Email', icon: Mail, description: 'Send automated emails' },
        { value: 'data_processing', label: 'Data Processing', icon: Cpu, description: 'Process and transform data' },
        { value: 'api_call', label: 'API Call', icon: Network, description: 'Make HTTP API calls' },
        { value: 'file_operation', label: 'File Operation', icon: FileText, description: 'Perform file operations' },
        { value: 'notification', label: 'Send Notification', icon: Bell, description: 'Send notifications' },
        { value: 'webhook_call', label: 'Webhook Call', icon: Webhook, description: 'Trigger webhooks' },
    ];

    const createTask = () => {
        const newTask: Task = {
            id: Date.now().toString(),
            name: 'New Task',
            description: 'Task description',
            type: 'manual',
            status: 'idle',
            priority: 'medium',
            category: 'Data Processing',
            actions: [],
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                runs: 0,
                successRate: 100,
                avgDuration: 0,
            },
        };
        setTasks([newTask, ...tasks]);
        setSelectedTask(newTask);
        setIsCreating(true);
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, ...updates, metadata: { ...task.metadata, updatedAt: new Date() } }
                : task
        ));
        if (selectedTask?.id === taskId) {
            setSelectedTask({ ...selectedTask, ...updates });
        }
    };

    const deleteTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
        if (selectedTask?.id === taskId) {
            setSelectedTask(null);
        }
    };

    const runTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        updateTask(taskId, { status: 'running' });

        try {
            // Simulate task execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            updateTask(taskId, {
                status: 'completed',
                metadata: {
                    ...task.metadata,
                    lastRun: new Date(),
                    runs: task.metadata.runs + 1,
                }
            });
        } catch (error) {
            updateTask(taskId, { status: 'failed' });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        const priorityConfig = priorities.find(p => p.value === priority);
        return priorityConfig?.color || 'bg-gray-500';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Smart Task Automation</h1>
                    <p className="text-muted-foreground">Automate your workflows with AI-powered tasks</p>
                </div>
                <Button onClick={createTask} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Task
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Active Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Total Tasks</p>
                                                        <p className="text-2xl font-bold">{tasks.length}</p>
                                                    </div>
                                                    <Activity className="w-8 h-8 text-blue-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Running</p>
                                                        <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'running').length}</p>
                                                    </div>
                                                    <RefreshCw className="w-8 h-8 text-green-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Success Rate</p>
                                                        <p className="text-2xl font-bold">
                                                            {tasks.length > 0
                                                                ? Math.round(tasks.reduce((acc, t) => acc + t.metadata.successRate, 0) / tasks.length)
                                                                : 0}%
                                                        </p>
                                                    </div>
                                                    <TrendingUp className="w-8 h-8 text-purple-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="active" className="space-y-4">
                                    <ScrollArea className="h-[400px]">
                                        {tasks.filter(task => task.status === 'running' || task.status === 'idle').map(task => (
                                            <Card key={task.id} className="mb-4">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {getStatusIcon(task.status)}
                                                            <div>
                                                                <h3 className="font-semibold">{task.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={getPriorityColor(task.priority)}>
                                                                {task.priority}
                                                            </Badge>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => runTask(task.id)}
                                                                disabled={task.status === 'running'}
                                                            >
                                                                <Play className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="scheduled" className="space-y-4">
                                    <ScrollArea className="h-[400px]">
                                        {tasks.filter(task => task.type === 'scheduled').map(task => (
                                            <Card key={task.id} className="mb-4">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-5 h-5 text-blue-500" />
                                                            <div>
                                                                <h3 className="font-semibold">{task.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {task.schedule?.frequency} at {task.schedule?.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {task.schedule?.frequency}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="completed" className="space-y-4">
                                    <ScrollArea className="h-[400px]">
                                        {tasks.filter(task => task.status === 'completed').map(task => (
                                            <Card key={task.id} className="mb-4">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                            <div>
                                                                <h3 className="font-semibold">{task.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Last run: {task.metadata.lastRun?.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {task.metadata.runs} runs
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Task Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedTask ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Task Name</label>
                                        <Input
                                            value={selectedTask.name}
                                            onChange={(e) => updateTask(selectedTask.id, { name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            value={selectedTask.description}
                                            onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Type</label>
                                            <Select value={selectedTask.type} onValueChange={(value: any) => updateTask(selectedTask.id, { type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {taskTypes.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Priority</label>
                                            <Select value={selectedTask.priority} onValueChange={(value: any) => updateTask(selectedTask.id, { priority: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorities.map(priority => (
                                                        <SelectItem key={priority.value} value={priority.value}>
                                                            {priority.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => runTask(selectedTask.id)} disabled={selectedTask.status === 'running'}>
                                            <Play className="w-4 h-4 mr-2" />
                                            Run Task
                                        </Button>
                                        <Button variant="destructive" onClick={() => deleteTask(selectedTask.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a task to view details</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TaskAutomation;
