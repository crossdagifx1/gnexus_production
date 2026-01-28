import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
    Kanban, Calendar, BarChart3, Plus, Filter, Search, MoreVertical, Clock, CheckCircle,
    Circle, AlertCircle, User, Users, Tag, Flag, ArrowRight, GripVertical, Folder
} from 'lucide-react';

interface Task {
    id: string; title: string; description: string; status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent'; assignee?: string; dueDate?: Date; tags: string[]; progress: number;
}
interface Project { id: string; name: string; description: string; progress: number; tasks: number; completed: number; members: string[]; color: string; }

const ProjectHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState('kanban');
    const [selectedProject, setSelectedProject] = useState('1');
    const [searchQuery, setSearchQuery] = useState('');

    const [projects] = useState<Project[]>([
        { id: '1', name: 'Website Redesign', description: 'Complete overhaul of company website', progress: 65, tasks: 24, completed: 16, members: ['Alice', 'Bob'], color: 'bg-blue-500' },
        { id: '2', name: 'Mobile App v2', description: 'New features and performance improvements', progress: 40, tasks: 32, completed: 13, members: ['Carol', 'David'], color: 'bg-purple-500' },
        { id: '3', name: 'API Integration', description: 'Third-party service integrations', progress: 85, tasks: 12, completed: 10, members: ['Eve'], color: 'bg-green-500' },
    ]);

    const [tasks] = useState<Task[]>([
        { id: '1', title: 'Design homepage mockup', description: 'Create high-fidelity mockups', status: 'done', priority: 'high', assignee: 'Alice', tags: ['design'], progress: 100 },
        { id: '2', title: 'Implement auth system', description: 'Add OAuth and JWT', status: 'in_progress', priority: 'urgent', assignee: 'Bob', dueDate: new Date(Date.now() + 86400000), tags: ['backend'], progress: 60 },
        { id: '3', title: 'Write API documentation', description: 'OpenAPI specs', status: 'review', priority: 'medium', assignee: 'Carol', tags: ['docs'], progress: 90 },
        { id: '4', title: 'Setup CI/CD pipeline', description: 'GitHub Actions workflow', status: 'todo', priority: 'high', tags: ['devops'], progress: 0 },
        { id: '5', title: 'User testing', description: 'Conduct usability tests', status: 'backlog', priority: 'medium', tags: ['qa'], progress: 0 },
        { id: '6', title: 'Performance optimization', description: 'Improve load times', status: 'todo', priority: 'low', tags: ['frontend'], progress: 0 },
    ]);

    const columns = [
        { id: 'backlog', title: 'Backlog', icon: Circle, color: 'text-gray-500' },
        { id: 'todo', title: 'To Do', icon: AlertCircle, color: 'text-blue-500' },
        { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-yellow-500' },
        { id: 'review', title: 'Review', icon: User, color: 'text-purple-500' },
        { id: 'done', title: 'Done', icon: CheckCircle, color: 'text-green-500' },
    ];

    const getPriorityColor = (p: string) => {
        switch (p) { case 'urgent': return 'bg-red-500'; case 'high': return 'bg-orange-500'; case 'medium': return 'bg-blue-500'; default: return 'bg-gray-500'; }
    };

    const currentProject = projects.find(p => p.id === selectedProject);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Project Management Hub</h1><p className="text-muted-foreground">Plan, track, and deliver projects</p></div>
                <div className="flex items-center gap-2">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button><Plus className="w-4 h-4 mr-2" />New Task</Button>
                </div>
            </div>

            {/* Project Overview */}
            {currentProject && (
                <Card><CardContent className="p-4">
                    <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-lg ${currentProject.color} flex items-center justify-center text-white`}><Folder className="w-6 h-6" /></div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{currentProject.name}</h3>
                            <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center"><p className="text-2xl font-bold">{currentProject.completed}/{currentProject.tasks}</p><p className="text-xs text-muted-foreground">Tasks</p></div>
                            <div className="w-32"><p className="text-sm mb-1">{currentProject.progress}% Complete</p><Progress value={currentProject.progress} /></div>
                            <div className="flex -space-x-2">{currentProject.members.map((m, i) => <Avatar key={i} className="w-8 h-8 border-2 border-background"><AvatarFallback>{m.charAt(0)}</AvatarFallback></Avatar>)}</div>
                        </div>
                    </div>
                </CardContent></Card>
            )}

            <div className="flex items-center gap-4">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="pl-10" /></div>
                <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList><TabsTrigger value="kanban"><Kanban className="w-4 h-4 mr-2" />Kanban</TabsTrigger>
                    <TabsTrigger value="timeline"><Calendar className="w-4 h-4 mr-2" />Timeline</TabsTrigger>
                    <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger></TabsList>

                <TabsContent value="kanban">
                    <div className="grid grid-cols-5 gap-4 mt-4">
                        {columns.map((col) => (
                            <div key={col.id} className="bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <col.icon className={`w-4 h-4 ${col.color}`} />
                                    <h3 className="font-medium text-sm">{col.title}</h3>
                                    <Badge variant="secondary" className="ml-auto text-xs">{tasks.filter(t => t.status === col.id).length}</Badge>
                                </div>
                                <ScrollArea className="h-[500px]"><div className="space-y-2">
                                    {tasks.filter(t => t.status === col.id).map((task) => (
                                        <Card key={task.id} className="cursor-move hover:shadow-md transition-shadow">
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 cursor-grab" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>{task.priority}</Badge>
                                                        </div>
                                                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex gap-1">{task.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>)}</div>
                                                            {task.assignee && <Avatar className="w-5 h-5"><AvatarFallback className="text-xs">{task.assignee.charAt(0)}</AvatarFallback></Avatar>}
                                                        </div>
                                                        {task.progress > 0 && task.progress < 100 && <Progress value={task.progress} className="mt-2 h-1" />}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Button variant="ghost" size="sm" className="w-full border-dashed border"><Plus className="w-4 h-4 mr-1" />Add Task</Button>
                                </div></ScrollArea>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card className="mt-4"><CardHeader><CardTitle>Project Timeline</CardTitle></CardHeader>
                        <CardContent><div className="space-y-4">
                            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => (
                                <div key={week} className="flex items-center gap-4">
                                    <div className="w-20 text-sm font-medium">{week}</div>
                                    <div className="flex-1 h-8 bg-muted rounded-lg relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" style={{ width: `${Math.max(30, 100 - idx * 20)}%` }} />
                                    </div>
                                    <div className="w-16 text-sm text-right">{4 - idx} tasks</div>
                                </div>
                            ))}
                        </div></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {[{ label: 'Tasks Completed', value: '16', change: '+3 this week', color: 'text-green-500' },
                        { label: 'In Progress', value: '5', change: '2 overdue', color: 'text-yellow-500' },
                        { label: 'Team Velocity', value: '12', change: 'tasks/week', color: 'text-blue-500' }
                        ].map((stat, idx) => (
                            <Card key={idx}><CardContent className="p-6 text-center">
                                <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-sm font-medium">{stat.label}</p>
                                <p className="text-xs text-muted-foreground">{stat.change}</p>
                            </CardContent></Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProjectHub;
