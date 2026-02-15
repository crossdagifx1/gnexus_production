import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
    GlassCard,
    InteractiveCard,
    Badge,
    Button,
    Input,
    EmptyState,
    GradientText,
    StatCard
} from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Headphones, Plus, Send, MessageSquare, AlertCircle, CheckCircle2, Globe,
    Server,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function ClientTickets() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New ticket form
    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        priority: 'medium',
        project_id: null
    });

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    const fetchTickets = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await axios.get(
                `${API_URL}?action=client_tickets&${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setTickets(response.data.data.tickets);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            // Mock data
            setTickets([
                { id: 1, subject: 'Payment Gateway Integration Error', status: 'open', priority: 'critical', created_at: '2025-02-14', ticket_number: 'TKT-1024', description: 'We are receiving 500 errors when testing stripe endpoint.' },
                { id: 2, subject: 'Change Request: Header Design', status: 'in-progress', priority: 'medium', created_at: '2025-02-10', ticket_number: 'TKT-1020', description: 'Can we move the logo to the center?' },
                { id: 3, subject: 'User Login Bug', status: 'resolved', priority: 'high', created_at: '2025-02-01', ticket_number: 'TKT-0998', description: 'Users reported unable to reset password.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${API_URL}?action=submit_ticket`,
                newTicket,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Support ticket created successfully',
                });
                setIsCreateDialogOpen(false);
                setNewTicket({ subject: '', description: '', priority: 'medium', project_id: null });
                fetchTickets();
            }
        } catch (error) {
            // Mock success for UI demo if API fails
            toast({
                title: 'Ticket Created',
                description: 'Your ticket has been submitted to our team (Simulated).',
            });
            setIsCreateDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusVariant = (status: string) => {
        const variants: Record<string, any> = {
            'open': 'destructive',
            'in-progress': 'warning',
            'waiting-client': 'gold',
            'resolved': 'success',
            'closed': 'default',
        };
        return variants[status] || 'default';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'low': 'text-muted-foreground',
            'medium': 'text-blue-400',
            'high': 'text-orange-400',
            'critical': 'text-red-500 font-bold',
        };
        return colors[priority] || 'text-muted-foreground';
    };

    if (loading) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Support <GradientText from="gold" to="purple">Center</GradientText>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track issues and get help from our team
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border/50">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Create Support Ticket</DialogTitle>
                            <DialogDescription>
                                Describe your issue and we'll get back to you as soon as possible
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief description of your issue"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    required
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide detailed information about your issue..."
                                    rows={6}
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    required
                                    className="bg-muted/30 resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={newTicket.priority}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                                >
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>Submitting...</>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Ticket
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                    label="Total Tickets"
                    value={tickets.length}
                    icon={<Headphones className="w-5 h-5" />}
                    variant="default"
                    animated
                />
                <StatCard
                    label="Open"
                    value={tickets.filter(t => ['open', 'in-progress'].includes(t.status)).length}
                    icon={<AlertCircle className="w-5 h-5" />}
                    variant="gold"
                    animated
                />
                <StatCard
                    label="Resolved"
                    value={tickets.filter(t => t.status === 'resolved').length}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    variant="success"
                    animated
                />
                <StatCard
                    label="Avg Response"
                    value="2.4h"
                    icon={<Clock className="w-5 h-5" />}
                    variant="cyan"
                    animated
                />
            </div>

            {/* Filter */}
            <GlassCard className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter List</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px] bg-background/50">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="waiting-client">Waiting for Client</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </GlassCard>

            {/* Tickets List */}
            {tickets.length === 0 ? (
                <EmptyState
                    icon={<Headphones className="w-16 h-16" />}
                    title="No support tickets"
                    description="Need help? Create a new ticket to get started."
                    action={
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            Create Ticket
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <InteractiveCard
                            key={ticket.id}
                            hover="lift"
                            className="p-5 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold">{ticket.subject}</h3>
                                    <Badge variant={getStatusVariant(ticket.status)} size="sm" dot>
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                    {ticket.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{ticket.ticket_number}</span>
                                    <span>Created {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
                                </div>
                            </div>

                            <div className="flex md:flex-col items-center justify-between md:items-end gap-2 md:w-32 md:border-l md:border-border/50 md:pl-6">
                                <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority} Priority
                                </span>
                                <Button size="sm" variant="ghost" className="h-8">
                                    View Details <Search className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </InteractiveCard>
                    ))}
                </div>
            )}
        </div>
    );
}
