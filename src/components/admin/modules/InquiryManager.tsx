import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Clock, MessageSquare, CheckCircle, Archive, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { nexus, type Inquiry } from '@/lib/api/nexus-core';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InquiryManager() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadInquiries();
    }, []);

    const loadInquiries = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getInquiries();
            setInquiries(data);
        } catch (error) {
            toast.error('Failed to load inquiries');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await nexus.updateInquiryStatus(id, status);
            toast.success(`Marked as ${status}`);
            loadInquiries();
            if (selectedInquiry && selectedInquiry.id === id) {
                setSelectedInquiry(prev => prev ? { ...prev, status: status as any } : null);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredInquiries = inquiries.filter(inq => {
        const matchesSearch =
            inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inq.subject?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && inq.status === activeTab;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'read': return 'bg-secondary/50 text-secondary-foreground';
            case 'replied': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'archived': return 'bg-muted text-muted-foreground';
            default: return 'bg-muted';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Operations Hub</h1>
                    <p className="text-muted-foreground">Track leads and manage incoming inquiries.</p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search inquiries..."
                        className="pl-9 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 max-w-2xl bg-muted/50">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="new">New</TabsTrigger>
                    <TabsTrigger value="read">Read</TabsTrigger>
                    <TabsTrigger value="replied">Replied</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                        <div className="divide-y divide-border/50">
                            {filteredInquiries.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No inquiries found.
                                </div>
                            ) : (
                                filteredInquiries.map((inquiry) => (
                                    <div
                                        key={inquiry.id}
                                        className={cn(
                                            "p-4 hover:bg-muted/30 transition-colors cursor-pointer flex gap-4 items-start group",
                                            inquiry.status === 'new' && "bg-primary/5"
                                        )}
                                        onClick={() => {
                                            setSelectedInquiry(inquiry);
                                            // Mark as read if opened and currently new
                                            if (inquiry.status === 'new') {
                                                updateStatus(inquiry.id, 'read');
                                            }
                                        }}
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full mt-2 shrink-0",
                                            inquiry.status === 'new' ? "bg-primary" : "bg-transparent"
                                        )} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={cn("font-semibold truncate pr-4", inquiry.status === 'new' ? "text-foreground" : "text-muted-foreground")}>
                                                    {inquiry.subject || 'No Subject'}
                                                </h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(inquiry.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground/80">{inquiry.name}</span>
                                                    <span>&bull;</span>
                                                    <span>{inquiry.email}</span>
                                                </div>
                                                <Badge variant="outline" className={cn("text-[10px] h-5 capitalize", getStatusColor(inquiry.status))}>
                                                    {inquiry.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground/70 line-clamp-1 mt-1">
                                                {inquiry.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedInquiry && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-4 mr-8">
                                    <DialogTitle className="text-xl line-clamp-1">{selectedInquiry.subject}</DialogTitle>
                                    <Badge className={cn("capitalize", getStatusColor(selectedInquiry.status))}>
                                        {selectedInquiry.status}
                                    </Badge>
                                </div>
                                <DialogDescription className="flex items-center gap-2 mt-2">
                                    <Mail className="w-4 h-4" />
                                    {selectedInquiry.name} ({selectedInquiry.email})
                                    <span className="text-xs ml-auto text-muted-foreground">
                                        {new Date(selectedInquiry.created_at).toLocaleString()}
                                    </span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-4 bg-muted/30 rounded-lg min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed border border-border/50">
                                {selectedInquiry.message}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <div className="flex items-center gap-2 mr-auto">
                                    {selectedInquiry.status !== 'replied' && (
                                        <Button size="sm" onClick={() => {
                                            window.location.href = `mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`;
                                            updateStatus(selectedInquiry.id, 'replied');
                                        }}>
                                            <Reply className="w-4 h-4 mr-2" /> Reply via Email
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedInquiry.status !== 'archived' && (
                                        <Button variant="outline" size="sm" onClick={() => updateStatus(selectedInquiry.id, 'archived')}>
                                            <Archive className="w-4 h-4 mr-2" /> Archive
                                        </Button>
                                    )}
                                    {selectedInquiry.status === 'archived' && (
                                        <Button variant="outline" size="sm" onClick={() => updateStatus(selectedInquiry.id, 'read')}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Move to Inbox
                                        </Button>
                                    )}
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
