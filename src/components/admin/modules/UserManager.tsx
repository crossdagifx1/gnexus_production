import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreHorizontal, User, Shield, Key, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { nexus, type User as NexusUser } from '@/lib/api/nexus-core';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function UserManager() {
    const [users, setUsers] = useState<NexusUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'Super Admin': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            case 'Editor': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'Author': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            default: return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Access</h1>
                    <p className="text-muted-foreground">Manage user roles and permissions.</p>
                </div>
                <Button disabled variant="outline">
                    <User className="w-4 h-4 mr-2" /> Invite User (Coming Soon)
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="divide-y divide-border/50">
                    <AnimatePresence>
                        {filteredUsers.map((user, i) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <Avatar className="h-10 w-10 border border-border/50">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium truncate">{user.full_name}</h3>
                                            <Badge variant="secondary" className={`${getRoleBadge(user.role)} text-[10px] px-2 py-0 h-5`}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem disabled>
                                            <Key className="w-4 h-4 mr-2" /> Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled>
                                            <Shield className="w-4 h-4 mr-2" /> Change Role
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
