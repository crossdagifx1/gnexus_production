import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
    StatCard,
    GlassCard,
    Timeline,
    GradientText,
    InteractiveCard,
    Badge,
    Button,
    EmptyState,
    ProgressIndicator
} from '@/components/ui';
import {
    FolderKanban,
    FileText,
    AlertCircle,
    TrendingUp,
    Calendar,
    ArrowRight,
    Search,
    Clock,
    CheckCircle2,
    Activity,
    Plus
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

interface DashboardData {
    client: any;
    active_projects: any[];
    unpaid_invoices: any[];
    open_tickets: any[];
    recent_activity: any[];
}

export default function ClientDashboard() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${API_URL}?action=client_dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
            // Fallback mock data for development if API fails
            setData({
                client: { ...user, account_status: 'active', onboarding_date: '2025-01-15' },
                active_projects: [
                    { id: 1, project_name: 'E-Commerce Platform', status: 'in-progress', progress_percentage: 65, deadline: '2025-03-20', service_type: 'web-development' },
                    { id: 2, project_name: 'Brand Identity', status: 'review', progress_percentage: 90, deadline: '2025-02-28', service_type: 'design' }
                ],
                unpaid_invoices: [
                    { id: 101, invoice_number: 'INV-2025-001', amount: '1250.00', due_date: '2025-02-25', status: 'sent' }
                ],
                open_tickets: [
                    { id: 5, subject: 'API Integration Issue', status: 'open', priority: 'high', created_at: '2025-02-14 10:30:00' }
                ],
                recent_activity: [
                    { id: 1, title: 'Project Milestone Reached', description: 'Design phase completed for Brand Identity', timestamp: '2 hours ago', icon: <CheckCircle2 className="w-4 h-4 text-success" /> },
                    { id: 2, title: 'New Invoice Generated', description: 'Invoice #INV-2025-001 is now available', timestamp: 'Yesterday', icon: <FileText className="w-4 h-4 text-gold" /> },
                    { id: 3, title: 'Ticket Updated', description: 'Support replied to ticket #5', timestamp: '2 days ago', icon: <AlertCircle className="w-4 h-4 text-cyan" /> }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = {
        totalProjects: data?.active_projects.length || 0,
        pendingInvoices: data?.unpaid_invoices.length || 0,
        openTickets: data?.open_tickets.length || 0,
        totalOutstanding: data?.unpaid_invoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0) || 0,
        yearsActive: data?.client?.onboarding_date ?
            Math.floor((new Date().getTime() - new Date(data.client.onboarding_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) + 1 : 1
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, <GradientText from="gold" to="cyan">{user?.full_name || user?.username}</GradientText> 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Here's what's happening with your projects today.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Active Projects"
                    value={stats.totalProjects}
                    icon={<FolderKanban className="w-5 h-5" />}
                    variant="gold"
                    animated
                />
                <StatCard
                    label="Outstanding Balance"
                    value={`$${stats.totalOutstanding.toLocaleString()}`}
                    icon={<FileText className="w-5 h-5" />}
                    variant={stats.totalOutstanding > 0 ? 'warning' : 'success'}
                    animated
                />
                <StatCard
                    label="Support Tickets"
                    value={stats.openTickets}
                    icon={<AlertCircle className="w-5 h-5" />}
                    variant={stats.openTickets > 0 ? 'cyan' : 'default'}
                    animated
                />
                <StatCard
                    label="Year with Us"
                    value={`Year ${stats.yearsActive}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    variant="default"
                    animated
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Projects */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FolderKanban className="w-5 h-5 text-gold" /> Active Projects
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/client/projects')}>
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {stats.totalProjects === 0 ? (
                            <EmptyState
                                icon={<FolderKanban className="w-12 h-12" />}
                                title="No active projects"
                                description="Ready to start something new? Request a new project today."
                                action={<Button variant="gold">Request Project</Button>}
                            />
                        ) : (
                            <div className="space-y-4">
                                {data?.active_projects.map((project) => (
                                    <InteractiveCard
                                        key={project.id}
                                        hover="lift"
                                        className="p-4 cursor-pointer"
                                        onClick={() => navigate(`/client/projects/${project.id}`)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-lg">{project.project_name}</h3>
                                                    <Badge variant={project.status === 'in-progress' ? 'cyan' : 'warning'} dot>
                                                        {project.status.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Activity className="w-3 h-3" /> {project.service_type || 'Custom Service'}
                                                    </span>
                                                    {project.deadline && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> Due {format(new Date(project.deadline), 'MMM d')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-gold to-cyan transition-all duration-1000"
                                                            style={{ width: `${project.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold w-8 text-right">{project.progress_percentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </InteractiveCard>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {/* Unpaid Invoices */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-warning" /> Outstanding Invoices
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/client/invoices')}>
                                Full History <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {data?.unpaid_invoices.length === 0 ? (
                            <div className="text-center py-8 bg-success/5 rounded-xl border border-success/10">
                                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                                <p className="font-medium text-success">All caught up!</p>
                                <p className="text-sm text-muted-foreground">No outstanding invoices</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {data?.unpaid_invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/50">
                                        <div>
                                            <p className="font-bold">{invoice.invoice_number}</p>
                                            <p className="text-xs text-muted-foreground">Due {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">${parseFloat(invoice.amount).toLocaleString()}</p>
                                            <Badge variant="destructive" size="sm">{invoice.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Recent Activity */}
                    <GlassCard className="p-6 h-fit sticky top-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan" /> Recent Activity
                        </h2>
                        {data?.recent_activity && data.recent_activity.length > 0 ? (
                            <Timeline items={data.recent_activity} />
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No recent activity</p>
                        )}
                    </GlassCard>

                    {/* Quick Access Support */}
                    <GlassCard variant="subtle" className="p-6 bg-gradient-to-br from-gold/5 to-transparent border-gold/20">
                        <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                        <p className="text-sm text-text-secondary mb-4">
                            Having trouble with a project or have a question? Our support team is ready to assist.
                        </p>
                        <Button className="w-full" variant="outline" onClick={() => navigate('/client/tickets')}>
                            <Plus className="w-4 h-4 mr-2" /> Open Ticket
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
