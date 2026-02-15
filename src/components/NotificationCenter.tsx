import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, FileText, FolderKanban, MessageSquare, Info } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

interface Notification {
    id: number;
    type: 'project' | 'invoice' | 'ticket' | 'system';
    title: string;
    message: string;
    link?: string;
    read_at: string | null;
    created_at: string;
}

export function NotificationCenter() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open && token) {
            fetchNotifications();
        }
    }, [open, token]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}?action=get_notifications`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setNotifications(response.data.data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axios.put(
                `${API_URL}?action=mark_notification_read`,
                { notification_id: id },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(
                `${API_URL}?action=mark_all_notifications_read`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setNotifications(notifications.map(n => ({
                ...n,
                read_at: new Date().toISOString()
            })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'project':
                return <FolderKanban className="w-4 h-4 text-blue-500" />;
            case 'invoice':
                return <FileText className="w-4 h-4 text-green-500" />;
            case 'ticket':
                return <MessageSquare className="w-4 h-4 text-purple-500" />;
            default:
                return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-7"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                            <p className="text-sm">Loading...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read_at ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                    }`}
                                onClick={() => {
                                    if (!notification.read_at) {
                                        markAsRead(notification.id);
                                    }
                                    if (notification.link) {
                                        window.location.href = notification.link;
                                    }
                                }}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm">{notification.title}</p>
                                            {!notification.read_at && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                            setOpen(false);
                            window.location.href = '/client/notifications';
                        }}
                    >
                        View all notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
