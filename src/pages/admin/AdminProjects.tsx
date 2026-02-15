import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
    GlassCard,
    StatCard,
    Badge,
    Button,
    Input,
    EmptyState,
    GradientText
} from '@/components/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Briefcase, Search, Eye, Plus, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function AdminProjects() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchProjects();
    }, [statusFilter]);

    const fetchProjects = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await axios.get(
                `${API_URL}?action=admin_projects&${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setProjects(response.data.data.projects);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            // Mock data
            setProjects([
                { id: 101, project_name: 'E-Commerce Platform', client_name: 'John Doe', company_name: 'Acme Corp', status: 'in-progress', progress_percentage: 65, budget: '5000', deadline: '2025-03-20', service_type: 'web-development' },
                { id: 102, project_name: 'Brand Identity', client_name: 'Jane Smith', company_name: 'Global Tech', status: 'pending', progress_percentage: 0, budget: '2500', deadline: '2025-04-01', service_type: 'design' },
                { id: 103, project_name: 'Mobile App', client_name: 'Robert Davis', company_name: 'Startup Inc', status: 'completed', progress_percentage: 100, budget: '12000', deadline: '2025-01-30', service_type: 'app-development' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (loading) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Project <GradientText from="cyan" to="purple">Management</GradientText>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all client projects and deliverables
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/projects/new')} variant="hero" className="shadow-lg shadow-cyan-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                    label="Total Projects"
                    value={projects.length}
                    icon={<Briefcase className="w-5 h-5" />}
                    variant="default"
                    animated
                />
                <StatCard
                    label="In Progress"
                    value={projects.filter(p => p.status === 'in-progress').length}
                    icon={<Briefcase className="w-5 h-5" />}
                    variant="cyan"
                    animated
                />
                <StatCard
                    label="Completed"
                    value={projects.filter(p => p.status === 'completed').length}
                    icon={<Briefcase className="w-5 h-5" />}
                    variant="success"
                    animated
                />
                <StatCard
                    label="Pending"
                    value={projects.filter(p => p.status === 'pending').length}
                    icon={<Briefcase className="w-5 h-5" />}
                    variant="gold"
                    animated
                />
            </div>

            {/* Content */}
            <GlassCard className="p-0 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-border/40 bg-muted/20">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by project, client, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-background/50 border-transparent shadow-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-background/50 border-transparent shadow-none">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="review">In Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="p-0">
                    {filteredProjects.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={<Briefcase className="w-16 h-16" />}
                                title="No projects found"
                                description="Adjust your filters or create a new project."
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.map((project) => (
                                    <TableRow key={project.id} className="cursor-pointer hover:bg-muted/30 group">
                                        <TableCell className="font-medium">{project.project_name}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{project.client_name}</div>
                                                {project.company_name && (
                                                    <div className="text-xs text-muted-foreground">{project.company_name}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-muted-foreground">
                                            {project.service_type?.replace('-', ' ')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(project.status)} dot pulse={project.status === 'in-progress'}>
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-1.5 bg-muted rounded-full">
                                                    <div
                                                        className={`h-full rounded-full ${project.progress_percentage === 100 ? 'bg-success' : 'bg-cyan-500'}`}
                                                        style={{ width: `${project.progress_percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">{project.progress_percentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            ${parseFloat(project.budget || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/projects/${project.id}`)}>
                                                        <Eye className="w-4 h-4 mr-2" /> View Project
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
