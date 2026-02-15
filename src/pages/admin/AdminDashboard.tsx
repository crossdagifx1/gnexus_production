import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
    Users,
    Briefcase,
    DollarSign,
    TrendingUp,
    Activity,
    AlertCircle,
    CheckCircle2,
    Plus,
    FileText,
    Settings,
    ArrowRight,
    Globe,
    Server,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Assuming recharts is installed, if not we'll use a mock visual

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Mock data for initial render - normally fetched from API
    const stats = {
        totalRevenue: 125000,
        activeComp: 12,
        activeProjects: 24,
        pendingInquiries: 5,
        serverStatus: 'Healthy'
    };

    const recentActivity = [
        { id: 1, title: 'New User Registered', description: 'Acme Corp admin account created', timestamp: '10 mins ago', icon: <Users className="w-4 h-4 text-cyan" /> },
        { id: 2, title: 'Project Payment Received', description: '$5,000 payment from Global Tech', timestamp: '1 hour ago', icon: <DollarSign className="w-4 h-4 text-green-500" /> },
        { id: 3, title: 'System Alert', description: 'High CPU usage detected on node-3', timestamp: '2 hours ago', icon: <Activity className="w-4 h-4 text-warning" /> },
        { id: 4, title: 'New Ticket', description: 'Support ticket #1024 opened', timestamp: '4 hours ago', icon: <AlertCircle className="w-4 h-4 text-gold" /> }
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan/30 border-t-cyan rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Initializing Nexus Core...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                    Nexus <GradientText from="cyan" to="purple">Core</GradientText>
                </h1>
                <p className="text-muted-foreground text-lg">
                    System Overview & Command Center
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    variant="gold"
                    animated
                    change={12}
                    trend="up"
                />
                <StatCard
                    label="Active Companies"
                    value={stats.activeComp}
                    icon={<Briefcase className="w-5 h-5" />}
                    variant="cyan"
                    animated
                    change={2}
                    trend="up"
                />
                <StatCard
                    label="Active Projects"
                    value={stats.activeProjects}
                    icon={<Globe className="w-5 h-5" />}
                    variant="default"
                    animated
                />
                <StatCard
                    label="System Status"
                    value={stats.serverStatus}
                    icon={<Server className="w-5 h-5" />}
                    variant="success"
                    animated
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InteractiveCard hover="scale" className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => navigate('/admin/projects/new')}>
                            <div className="p-3 rounded-full bg-cyan/10 text-cyan">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-sm">New Project</span>
                        </InteractiveCard>
                        <InteractiveCard hover="scale" className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => navigate('/admin/clients')}>
                            <div className="p-3 rounded-full bg-gold/10 text-gold">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-sm">Add Client</span>
                        </InteractiveCard>
                        <InteractiveCard hover="scale" className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => navigate('/admin/invoices/new')}>
                            <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-sm">Create Invoice</span>
                        </InteractiveCard>
                        <InteractiveCard hover="scale" className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => navigate('/admin/settings')}>
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Settings className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-sm">System Config</span>
                        </InteractiveCard>
                    </div>

                    {/* Revenue/Growth Section (Placeholder for Chart) */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gold" /> Performance Analytics
                            </h2>
                            <SelectDefault />
                        </div>
                        <div className="h-[300px] w-full bg-black/20 rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden group">
                            {/* Mock Chart Visual */}
                            <div className="absolute inset-x-0 bottom-0 h-[60%] flex items-end justify-between px-8 gap-2 opacity-50">
                                {[35, 55, 40, 70, 60, 85, 95, 80, 65, 90, 100, 120].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-gradient-to-t from-cyan/20 to-cyan/60 rounded-t-sm group-hover:to-cyan transition-all duration-500"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground relative z-10 font-medium">Interactive Chart Integration Pending</p>
                        </div>
                    </GlassCard>

                    {/* Recent Projects Snippet */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Recent Projects</h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/projects')}>View All</Button>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/40 hover:bg-background/60 transition-colors border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Project Alpha {i + 1}</p>
                                            <p className="text-xs text-muted-foreground">Tech Innovations Inc.</p>
                                        </div>
                                    </div>
                                    <Badge variant={i === 0 ? 'cyan' : i === 1 ? 'warning' : 'success'} size="sm" dot>
                                        {i === 0 ? 'In Progress' : i === 1 ? 'Pending' : 'Completed'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Live Activity Feed */}
                    <GlassCard className="p-6 h-full max-h-[600px] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-destructive" /> Live Feed
                        </h2>
                        <Timeline items={recentActivity} />
                    </GlassCard>

                    {/* Pending Tasks */}
                    <GlassCard variant="subtle" className="p-6 bg-gradient-to-br from-cyan/5 to-transparent border-cyan/20">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-cyan" /> Action Required
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-background/50 border border-border/50 flex items-start gap-3">
                                <Badge variant="destructive" className="mt-0.5">High</Badge>
                                <div>
                                    <p className="text-sm font-medium">Review Server Logs</p>
                                    <p className="text-xs text-muted-foreground">Unexpected spike in error rates</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-background/50 border border-border/50 flex items-start gap-3">
                                <Badge variant="warning" className="mt-0.5">Med</Badge>
                                <div>
                                    <p className="text-sm font-medium">Approve Invoice #1025</p>
                                    <p className="text-xs text-muted-foreground">Pending manual verification</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

// Helper for select (placeholder)
function SelectDefault() {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
            <span>Last 30 Days</span>
            <ArrowRight className="w-3 h-3 rotate-90" />
        </div>
    );
}
