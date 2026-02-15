import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    FileText,
    MessageSquare,
    Activity,
    DollarSign,
    CheckCircle,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function AdminClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchClientDetail();
        }
    }, [id]);

    const fetchClientDetail = async () => {
        try {
            const response = await axios.get(
                `${API_URL}?action=admin_client_detail&id=${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch client details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'active': 'bg-green-500',
            'inactive': 'bg-gray-500',
            'suspended': 'bg-red-500',
            'pending': 'bg-yellow-500',
            'in-progress': 'bg-blue-500',
            'completed': 'bg-green-500',
            'paid': 'bg-green-500',
            'overdue': 'bg-red-500',
            'open': 'bg-blue-500',
            'resolved': 'bg-green-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading client...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.client) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Client not found</p>
                <Button onClick={() => navigate('/admin/clients')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Clients
                </Button>
            </div>
        );
    }

    const client = data.client;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold">{client.full_name || client.username}</h1>
                            <Badge className={getStatusColor(client.account_status)}>
                                {client.account_status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Client ID: {client.id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = `mailto:${client.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                    </Button>
                    <Button onClick={() => navigate(`/admin/clients/${client.id}/edit`)}>
                        Edit Client
                    </Button>
                </div>
            </div>

            {/* Client Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.projects.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.invoices.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${data.invoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || 0), 0).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.tickets.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Client Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="font-medium">{client.email}</span>
                        </div>
                        {client.company_name && (
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Company:</span>
                                <span className="font-medium">{client.company_name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Joined:</span>
                            <span className="font-medium">
                                {format(new Date(client.onboarding_date || client.created_at), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        {client.city && (
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Location:</span>
                                <span className="font-medium">{client.city}, {client.country}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="projects" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="projects">Projects ({data.projects.length})</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices ({data.invoices.length})</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets ({data.tickets.length})</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Projects Tab */}
                <TabsContent value="projects">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Projects</CardTitle>
                            <Button onClick={() => navigate(`/admin/projects/new?client_id=${client.id}`)}>
                                Create Project
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.projects.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No projects yet</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead>Budget</TableHead>
                                            <TableHead>Deadline</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.projects.map((project: any) => (
                                            <TableRow
                                                key={project.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/admin/projects/${project.id}`)}
                                            >
                                                <TableCell className="font-medium">{project.project_name}</TableCell>
                                                <TableCell className="capitalize">{project.service_type.replace('-', ' ')}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{project.progress_percentage}%</TableCell>
                                                <TableCell>${parseFloat(project.budget || 0).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Invoices</CardTitle>
                            <Button onClick={() => navigate(`/admin/invoices/new?client_id=${client.id}`)}>
                                Create Invoice
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.invoices.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No invoices yet</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Issue Date</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.invoices.map((invoice: any) => (
                                            <TableRow
                                                key={invoice.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                            >
                                                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                                <TableCell>${parseFloat(invoice.amount).toFixed(2)}</TableCell>
                                                <TableCell>{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(invoice.status)}>
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tickets Tab */}
                <TabsContent value="tickets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Support Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.tickets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No support tickets</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ticket #</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.tickets.map((ticket: any) => (
                                            <TableRow
                                                key={ticket.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                                            >
                                                <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                                                <TableCell>{ticket.subject}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{ticket.priority}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(ticket.status)}>
                                                        {ticket.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.activity.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No activity yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.activity.map((activity: any) => (
                                        <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                                            <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{activity.action}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {activity.entity_type && `${activity.entity_type} #${activity.entity_id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
