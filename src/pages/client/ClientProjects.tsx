import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
    InteractiveCard,
    Badge,
    Button,
    Input,
    EmptyState,
    GradientText,
    GlassCard
} from '@/components/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FolderKanban, Search, Filter, Calendar, TrendingUp, Clock, AlertCircle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function ClientProjects() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [serviceFilter, setServiceFilter] = useState<string>('all');

    useEffect(() => {
        fetchProjects();
    }, [statusFilter, serviceFilter]);

    const fetchProjects = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (serviceFilter !== 'all') params.append('service_type', serviceFilter);

            const response = await axios.get(
                `${API_URL}?action=client_projects&${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setProjects(response.data.data.projects);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            // Mock data for dev
            setProjects([
                { id: 1, project_name: 'E-Commerce Platform', status: 'in-progress', progress_percentage: 65, deadline: '2025-03-20', service_type: 'web-development', priority: 'high', description: 'Full stack e-commerce solution with payment gateway integration.' },
                { id: 2, project_name: 'Brand Identity Redesign', status: 'review', progress_percentage: 90, deadline: '2025-02-28', service_type: 'design', priority: 'medium', description: 'Modernizing brand assets and guidelines.' },
                { id: 3, project_name: 'AI Chatbot Integration', status: 'pending', progress_percentage: 10, deadline: '2025-04-15', service_type: 'ai-automation', priority: 'critical', description: 'Customer support automation using LLMs.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        const variants: Record<string, any> = {
            'pending': 'warning',
            'in-progress': 'cyan',
            'review': 'gold',
            'completed': 'success',
            'cancelled': 'destructive',
            'on-hold': 'default',
        };
        return variants[status] || 'default';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-cyan/30 border-t-cyan rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        My <GradientText from="cyan" to="blue">Projects</GradientText>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your ongoing projects
                    </p>
                </div>
                <Button onClick={() => navigate('/client/contact')} variant="gold">
                    Start New Project
                </Button>
            </div>

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Filter by service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Services</SelectItem>
                            <SelectItem value="web-development">Web Development</SelectItem>
                            <SelectItem value="3d-architecture">3D Architecture</SelectItem>
                            <SelectItem value="ai-automation">AI Automation</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </GlassCard>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <EmptyState
                    icon={<FolderKanban className="w-16 h-16" />}
                    title="No projects found"
                    description={searchTerm || statusFilter !== 'all' ? "Try adjusting your filters." : "You haven't started any projects yet."}
                    action={
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setServiceFilter('all'); }}>
                            Clear Filters
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <InteractiveCard
                            key={project.id}
                            hover="lift"
                            className="flex flex-col h-full cursor-pointer group"
                            onClick={() => navigate(`/client/projects/${project.id}`)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <Badge variant={getStatusVariant(project.status)} dot pulse={project.status === 'in-progress'}>
                                    {project.status.replace('-', ' ')}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 mb-6">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-cyan transition-colors">{project.project_name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {project.description || 'No description provided.'}
                                </p>

                                {/* Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Progress</span>
                                        <span className="font-bold">{project.progress_percentage}%</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan to-blue-500 rounded-full"
                                            style={{ width: `${project.progress_percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-background/50 border border-border/50">
                                        <FolderKanban className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="capitalize">{project.service_type?.replace('-', ' ')}</span>
                                </div>
                                {project.deadline && (
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="p-1.5 rounded-md bg-background/50 border border-border/50">
                                            <Calendar className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                                    </div>
                                )}
                            </div>
                        </InteractiveCard>
                    ))}
                </div>
            )}
        </div>
    );
}
