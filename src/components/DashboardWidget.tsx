import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Clock,
    AlertCircle,
    CheckCircle2,
    FileText,
    FolderKanban,
    MessageSquare,
    TrendingUp,
    Calendar,
    DollarSign,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardWidgetProps {
    variant?: 'activity' | 'deadlines' | 'stats' | 'action-items';
    data?: any;
    className?: string;
}

export function DashboardWidget({ variant = 'stats', data, className = '' }: DashboardWidgetProps) {

    // RECENT ACTIVITY WIDGET
    if (variant === 'activity') {
        const activities = data || [];

        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                    ) : (
                        <div className="space-y-4">
                            {activities.slice(0, 5).map((activity: any, index: number) => (
                                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                    <div className="mt-1">
                                        {activity.type === 'project' && <FolderKanban className="w-4 h-4 text-blue-500" />}
                                        {activity.type === 'invoice' && <FileText className="w-4 h-4 text-green-500" />}
                                        {activity.type === 'ticket' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // UPCOMING DEADLINES WIDGET
    if (variant === 'deadlines') {
        const deadlines = data || [];

        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Upcoming Deadlines
                    </CardTitle>
                    <CardDescription>Important dates to remember</CardDescription>
                </CardHeader>
                <CardContent>
                    {deadlines.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
                    ) : (
                        <div className="space-y-3">
                            {deadlines.map((deadline: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{deadline.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(deadline.due_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <Badge variant={deadline.urgent ? 'destructive' : 'secondary'}>
                                        {deadline.urgent ? 'Urgent' : 'Upcoming'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // ACTION ITEMS WIDGET
    if (variant === 'action-items') {
        const actionItems = data || [];

        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Action Items
                    </CardTitle>
                    <CardDescription>Items requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                    {actionItems.length === 0 ? (
                        <div className="text-center py-6">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">All caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {actionItems.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // STATS WIDGET (default)
    const stats = data || {
        totalProjects: 0,
        activeProjects: 0,
        pendingInvoices: 0,
        openTickets: 0
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProjects}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.activeProjects} active
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Awaiting payment
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.openTickets}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Support requests
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Activity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+12%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        vs last month
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
