import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, FileText, Component, Monitor,
    Users, Settings, LogOut, Menu, X, Bell, Search,
    ChevronDown, ShieldCheck, ExternalLink, Briefcase, UserCircle, Inbox, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { nexus, type User } from '@/lib/api/nexus-core';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AdminShellProps {
    children: React.ReactNode;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'ai-models', label: 'AI Models', icon: Bot, path: '/admin/ai-models' },
    { id: 'projects', label: 'Portfolio', icon: FileText, path: '/admin/projects' },
    { id: 'services', label: 'Services', icon: Briefcase, path: '/admin/services' },
    { id: 'posts', label: 'Blog Posts', icon: FileText, path: '/admin/posts' },
    { id: 'team', label: 'Team Profiles', icon: UserCircle, path: '/admin/team' },
    { id: 'components', label: 'Experience', icon: Component, path: '/admin/components' },
    { id: 'platforms', label: 'Platform Hub', icon: Monitor, path: '/admin/platforms' },
    { id: 'inquiries', label: 'Inbox', icon: Inbox, path: '/admin/inquiries' },
    { id: 'users', label: 'Admin Access', icon: Users, path: '/admin/users' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export const AdminShell = ({ children }: AdminShellProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const location = useLocation();

    useEffect(() => {
        // Load user from local storage via SDK
        const u = nexus.getUser();
        if (u) {
            setUser(u);
        } else {
            // Redirect if not logged in (handled by protected route usually, but safety check)
            window.location.href = '/auth';
        }
    }, []);

    const handleLogout = () => {
        nexus.logout();
    };

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className={cn(
                    "fixed left-0 top-0 h-screen border-r border-white/10 z-40 hidden md:flex flex-col shadow-2xl backdrop-blur-xl",
                    "bg-black/40 supports-[backdrop-filter]:bg-black/20"
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                            <span className="font-bold text-white">N</span>
                        </div>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-lg whitespace-nowrap text-white tracking-wide"
                            >
                                Nexus <span className="text-cyan-400">Core</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link key={item.id} to={item.path}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start mb-1 relative overflow-hidden transition-all duration-300",
                                        !sidebarOpen && "justify-center px-0",
                                        isActive
                                            ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/15"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", sidebarOpen && "mr-3", isActive && "text-cyan-400")} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                    {isActive && sidebarOpen && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute md:left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                        />
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                {/* User */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={cn("w-full hover:bg-white/5", sidebarOpen ? "justify-start px-2" : "justify-center px-0")}>
                                <Avatar className="w-8 h-8 mr-2 ring-2 ring-white/10">
                                    <AvatarImage src={user?.avatar_url} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">{user?.full_name?.charAt(0) || 'A'}</AvatarFallback>
                                </Avatar>
                                {sidebarOpen && (
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-white">{user?.full_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                                    </div>
                                )}
                                {sidebarOpen && <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10 backdrop-blur-xl">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="focus:bg-white/10">Profile</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/10">Settings</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300 flex flex-col",
                sidebarOpen ? "md:ml-[280px]" : "md:ml-[80px]"
            )}>
                {/* Header */}
                <header className="h-16 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border/50 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex">
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="md:hidden">
                            {/* Mobile menu trigger would go here */}
                            <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
                        </div>

                        {/* Breadcrumbs or Page Title could go here */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-normal bg-background">
                                {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                className="h-9 w-64 rounded-full bg-muted/50 border-none pl-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                                placeholder="Search everything..."
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                        </Button>
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link to="/" target="_blank">
                                View Site <ExternalLink className="w-3 h-3 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};
