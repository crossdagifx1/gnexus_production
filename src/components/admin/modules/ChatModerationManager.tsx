import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Ban, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { nexus } from '@/lib/api/nexus-core';
import type { BannedUser } from '@/lib/api/ai-chat-sdk';
import { toast } from 'sonner';

export default function ChatModerationManager() {
    const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBan, setNewBan] = useState<Partial<BannedUser>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBannedUsers();
    }, []);

    const loadBannedUsers = async () => {
        try {
            setLoading(true);
            const data = await nexus.getBannedUsers();
            setBannedUsers(data);
        } catch (error: any) {
            toast.error('Failed to load banned users: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        if (!newBan.user_id && !newBan.ip_address) {
            toast.error('Please provide either user ID or IP address');
            return;
        }

        try {
            setLoading(true);
            await nexus.banUser(newBan);
            toast.success('User banned successfully');
            setIsDialogOpen(false);
            setNewBan({});
            loadBannedUsers();
        } catch (error: any) {
            toast.error('Failed to ban user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async (id: string) => {
        if (!confirm('Are you sure you want to unban this user?')) return;

        try {
            setLoading(true);
            await nexus.unbanUser(id);
            toast.success('User unbanned successfully');
            loadBannedUsers();
        } catch (error: any) {
            toast.error('Failed to unban user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredBans = bannedUsers.filter(ban =>
        (ban.user_id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ban.ip_address?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ban.reason?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeBans = filteredBans.filter(b => !b.banned_until || new Date(b.banned_until) > new Date());
    const expiredBans = filteredBans.filter(b => b.banned_until && new Date(b.banned_until) <= new Date());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chat Moderation</h2>
                    <p className="text-muted-foreground">Manage banned users and moderation rules</p>
                </div>
                <Button onClick={() => {
                    setNewBan({});
                    setIsDialogOpen(true);
                }} className="gap-2">
                    <Ban className="w-4 h-4" />
                    Ban User
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by user ID, IP, or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Ban className="w-4 h-4 text-red-500" />
                            Active Bans
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeBans.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Expired Bans
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiredBans.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Total Bans
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bannedUsers.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Bans */}
            {activeBans.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Active Bans ({activeBans.length})</h3>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {activeBans.map((ban) => (
                                <motion.div
                                    key={ban.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Card className="border-l-4 border-l-red-500">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {ban.user_id && (
                                                            <Badge>User: {ban.user_id}</Badge>
                                                        )}
                                                        {ban.ip_address && (
                                                            <Badge variant="outline">IP: {ban.ip_address}</Badge>
                                                        )}
                                                        {!ban.banned_until && (
                                                            <Badge variant="destructive">Permanent</Badge>
                                                        )}
                                                        {ban.banned_until && new Date(ban.banned_until) > new Date() && (
                                                            <Badge variant="secondary">
                                                                Until: {new Date(ban.banned_until).toLocaleDateString()}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {ban.reason && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <strong>Reason:</strong> {ban.reason}
                                                        </p>
                                                    )}

                                                    <p className="text-xs text-muted-foreground">
                                                        Banned on: {new Date(ban.created_at!).toLocaleString()}
                                                    </p>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUnban(ban.id)}
                                                    className="ml-4"
                                                >
                                                    Unban
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Expired Bans */}
            {expiredBans.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-muted-foreground">Expired Bans ({expiredBans.length})</h3>
                    <div className="space-y-2 opacity-60">
                        {expiredBans.map((ban) => (
                            <Card key={ban.id} className="border-l-4 border-l-gray-300">
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                {ban.user_id && <span>User: {ban.user_id}</span>}
                                                {ban.ip_address && <span>IP: {ban.ip_address}</span>}
                                            </div>
                                            {ban.reason && (
                                                <p className="text-xs text-muted-foreground">{ban.reason}</p>
                                            )}
                                        </div>
                                        <Badge variant="outline">Expired</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {filteredBans.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Ban className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No banned users</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'No bans match your search' : 'All users are in good standing'}
                    </p>
                </div>
            )}

            {/* Ban Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            Ban a user by their ID or IP address
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">User ID (Optional)</Label>
                            <Input
                                id="user_id"
                                placeholder="User UUID"
                                value={newBan.user_id || ''}
                                onChange={(e) => setNewBan({ ...newBan, user_id: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ip_address">IP Address (Optional)</Label>
                            <Input
                                id="ip_address"
                                placeholder="192.168.1.1"
                                value={newBan.ip_address || ''}
                                onChange={(e) => setNewBan({ ...newBan, ip_address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Spam, abuse, violation of terms..."
                                value={newBan.reason || ''}
                                onChange={(e) => setNewBan({ ...newBan, reason: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="banned_until">Ban Until (Optional - Leave empty for permanent)</Label>
                            <Input
                                id="banned_until"
                                type="datetime-local"
                                value={newBan.banned_until || ''}
                                onChange={(e) => setNewBan({ ...newBan, banned_until: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for permanent ban
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBan} disabled={loading} variant="destructive">
                            {loading ? 'Banning...' : 'Ban User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
