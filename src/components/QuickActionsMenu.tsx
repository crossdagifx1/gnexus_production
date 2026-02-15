import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Plus, MessageSquare, Upload, FileText, Phone, Zap } from 'lucide-react';

export function QuickActionsMenu() {
    const navigate = useNavigate();

    const quickActions = [
        {
            icon: MessageSquare,
            label: 'Create Support Ticket',
            description: 'Get help from our team',
            action: () => navigate('/client/tickets'),
            color: 'text-blue-500'
        },
        {
            icon: FileText,
            label: 'View Latest Invoice',
            description: 'Check your billing',
            action: () => navigate('/client/invoices'),
            color: 'text-green-500'
        },
        {
            icon: Upload,
            label: 'Upload Project File',
            description: 'Share files with your team',
            action: () => navigate('/client/projects'),
            color: 'text-purple-500'
        },
        {
            icon: Phone,
            label: 'Request Callback',
            description: 'Schedule a call',
            action: () => navigate('/contact'),
            color: 'text-orange-500'
        },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-gold to-cyan hover:shadow-xl transition-all duration-300 z-40"
                >
                    <Zap className="w-6 h-6 text-background" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mr-2">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                            className="py-3 cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 mt-0.5 ${action.color}`} />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{action.label}</p>
                                    <p className="text-xs text-muted-foreground">{action.description}</p>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
