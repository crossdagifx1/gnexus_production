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
import { Users, Search, Eye, Edit, Mail, UserCheck, UserX, MoreHorizontal, Plus } from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function AdminClients() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchClients();
    }, [statusFilter]);

    const fetchClients = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await axios.get(
                `${API_URL}?action=admin_clients&${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setClients(response.data.data.clients);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            // Mock data
            setClients([
                { id: 1, full_name: 'John Doe', company_name: 'Acme Corp', email: 'john@acme.com', account_status: 'active', onboarding_date: '2024-12-01' },
                { id: 2, full_name: 'Jane Smith', company_name: 'Global Tech', email: 'jane@global.com', account_status: 'inactive', onboarding_date: '2025-01-15' },
                { id: 3, full_name: 'Robert Davis', company_name: 'Startup Inc', email: 'rob@startup.io', account_status: 'suspended', onboarding_date: '2025-02-10' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        const variants: Record<string, any> = {
            'active': 'success',
            'inactive': 'default',
            'suspended': 'destructive',
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
                        Client <GradientText from="gold" to="cyan">Management</GradientText>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all client accounts and relationships
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/clients/new')} variant="hero" className="shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                    label="Total Clients"
                    value={clients.length}
                    icon={<Users className="w-5 h-5" />}
                    variant="gold"
                    animated
                />
                <StatCard
                    label="Active"
                    value={clients.filter(c => c.account_status === 'active').length}
                    icon={<UserCheck className="w-5 h-5" />}
                    variant="success"
                    animated
                />
                <StatCard
                    label="Inactive"
                    value={clients.filter(c => c.account_status === 'inactive').length}
                    icon={<UserX className="w-5 h-5" />}
                    variant="default"
                    animated
                />
                <StatCard
                    label="New (Month)"
                    value={clients.filter(c => {
                        const created = new Date(c.onboarding_date);
                        const now = new Date();
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length}
                    icon={<Users className="w-5 h-5" />}
                    variant="cyan"
                    animated
                />
            </div>

            {/* Main Content */}
            <GlassCard className="p-0 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-border/40 bg-muted/20">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-background/50 border-transparent shadow-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px] bg-background/50 border-transparent shadow-none">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="p-0">
                    {filteredClients.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={<Users className="w-16 h-16" />}
                                title="No clients found"
                                description="Try adjusting your filters or add a new client."
                            />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow key={client.id} className="hover:bg-muted/30 cursor-pointer group">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/10 to-orange-500/10 flex items-center justify-center text-gold font-bold text-xs ring-1 ring-gold/20">
                                                    {client.full_name?.charAt(0) || client.username?.charAt(0)}
                                                </div>
                                                {client.full_name || client.username}
                                            </div>
                                        </TableCell>
                                        <TableCell>{client.company_name || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{client.email}</TableCell>
                                        <TableCell>
                                            {client.onboarding_date
                                                ? format(new Date(client.onboarding_date), 'MMM dd, yyyy')
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(client.account_status)} dot>
                                                {client.account_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.id}`)}>
                                                        <Eye className="w-4 h-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.id}/edit`)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Edit Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.location.href = `mailto:${client.email}`}>
                                                        <Mail className="w-4 h-4 mr-2" /> Email Client
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
