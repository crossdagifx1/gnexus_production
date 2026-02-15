import React, { useEffect, useState } from 'react';
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
import { FileText, Download, Search, DollarSign, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function ClientInvoices() {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await axios.get(
                `${API_URL}?action=client_invoices&${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setInvoices(response.data.data.invoices);
            }
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            // Mock data
            setInvoices([
                { id: 101, invoice_number: 'INV-2025-001', amount: '1250.00', due_date: '2025-02-25', issue_date: '2025-02-10', status: 'sent' },
                { id: 100, invoice_number: 'INV-2025-000', amount: '500.00', due_date: '2025-01-25', issue_date: '2025-01-10', status: 'paid' },
                { id: 99, invoice_number: 'INV-2024-150', amount: '3200.00', due_date: '2025-01-05', issue_date: '2024-12-20', status: 'paid' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTotalPaid = () => {
        return invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    };

    const getTotalUnpaid = () => {
        return invoices
            .filter(inv => ['sent', 'overdue'].includes(inv.status))
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    };

    if (loading) return null; // Or skeleton

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    Billing & <GradientText from="green-400" to="emerald-600">Invoices</GradientText>
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your payments and download invoice history
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    label="Total Invoices"
                    value={invoices.length}
                    icon={<FileText className="w-5 h-5" />}
                    variant="default"
                    animated
                />
                <StatCard
                    label="Paid Total"
                    value={`$${getTotalPaid().toLocaleString()}`}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    variant="success"
                    animated
                />
                <StatCard
                    label="Outstanding"
                    value={`$${getTotalUnpaid().toLocaleString()}`}
                    icon={<AlertCircle className="w-5 h-5" />}
                    variant={getTotalUnpaid() > 0 ? "warning" : "default"}
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
                                placeholder="Search invoice #..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-background/50 border-transparent shadow-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-transparent shadow-none">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* List View */}
                {filteredInvoices.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={<FileText className="w-16 h-16" />}
                            title="No invoices found"
                            description="Invoices will appear here once they are generated for your projects."
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {filteredInvoices.map((invoice) => (
                            <div key={invoice.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-muted/50 border border-border/50 group-hover:border-gold/30 transition-colors">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold">{invoice.invoice_number}</p>
                                            <Badge variant={
                                                invoice.status === 'paid' ? 'success' :
                                                    invoice.status === 'overdue' ? 'destructive' :
                                                        invoice.status === 'sent' ? 'warning' : 'default'
                                            } size="sm" dot>
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Issued: {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/3">
                                    <div className="text-right">
                                        <p className="text-lg font-bold">${parseFloat(invoice.amount).toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">USD</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download className="w-4 h-4 mr-2" /> PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
