import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcut } from '@/hooks/useKeyboardNavigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Home, FileText, Users, Briefcase, Mail, Search,
    Settings, Sun, Moon, Languages, HelpCircle, Code
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    keywords: string[];
    category: 'navigation' | 'actions' | 'settings';
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Toggle with Cmd+K or Ctrl+K
    useKeyboardShortcut('meta+k', () => setIsOpen((prev) => !prev));
    useKeyboardShortcut('ctrl+k', () => setIsOpen((prev) => !prev));

    const commands: CommandItem[] = useMemo(() => [
        // Navigation
        {
            id: 'nav-home',
            label: 'Go to Home',
            icon: <Home className="w-4 h-4" />,
            action: () => { navigate('/'); setIsOpen(false); },
            keywords: ['home', 'index', 'main'],
            category: 'navigation',
        },
        {
            id: 'nav-about',
            label: 'Go to About',
            icon: <FileText className="w-4 h-4" />,
            action: () => { navigate('/about'); setIsOpen(false); },
            keywords: ['about', 'company', 'info'],
            category: 'navigation',
        },
        {
            id: 'nav-team',
            label: 'Go to Team',
            icon: <Users className="w-4 h-4" />,
            action: () => { navigate('/team'); setIsOpen(false); },
            keywords: ['team', 'members', 'staff'],
            category: 'navigation',
        },
        {
            id: 'nav-gnexus',
            label: 'Go to G-Nexus Platform',
            icon: <Briefcase className="w-4 h-4" />,
            action: () => { navigate('/gnexus'); setIsOpen(false); },
            keywords: ['gnexus', 'platform', 'business'],
            category: 'navigation',
        },
        {
            id: 'nav-contact',
            label: 'Go to Contact',
            icon: <Mail className="w-4 h-4" />,
            action: () => { navigate('/contact'); setIsOpen(false); },
            keywords: ['contact', 'email', 'reach', 'message'],
            category: 'navigation',
        },
        {
            id: 'nav-portfolio',
            label: 'Go to Portfolio',
            icon: <Code className="w-4 h-4" />,
            action: () => { navigate('/portfolio'); setIsOpen(false); },
            keywords: ['portfolio', 'projects', 'work'],
            category: 'navigation',
        },
        {
            id: 'nav-careers',
            label: 'Go to Careers',
            icon: <Briefcase className="w-4 h-4" />,
            action: () => { navigate('/careers'); setIsOpen(false); },
            keywords: ['careers', 'jobs', 'hiring'],
            category: 'navigation',
        },
        {
            id: 'nav-faq',
            label: 'Go to FAQ',
            icon: <HelpCircle className="w-4 h-4" />,
            action: () => { navigate('/faq'); setIsOpen(false); },
            keywords: ['faq', 'help', 'questions'],
            category: 'navigation',
        },
        // Actions
        {
            id: 'action-search',
            label: 'Search Website',
            icon: <Search className="w-4 h-4" />,
            action: () => { console.log('Search triggered'); },
            keywords: ['search', 'find', 'look'],
            category: 'actions',
        },
        // Settings
        {
            id: 'settings-theme-light',
            label: 'Switch to Light Theme',
            icon: <Sun className="w-4 h-4" />,
            action: () => {
                document.documentElement.classList.remove('dark');
                setIsOpen(false);
            },
            keywords: ['theme', 'light', 'bright'],
            category: 'settings',
        },
        {
            id: 'settings-theme-dark',
            label: 'Switch to Dark Theme',
            icon: <Moon className="w-4 h-4" />,
            action: () => {
                document.documentElement.classList.add('dark');
                setIsOpen(false);
            },
            keywords: ['theme', 'dark', 'night'],
            category: 'settings',
        },
        {
            id: 'settings-language',
            label: 'Change Language',
            icon: <Languages className="w-4 h-4" />,
            action: () => { console.log('Language switcher'); },
            keywords: ['language', 'translate', 'amharic', 'english'],
            category: 'settings',
        },
    ], [navigate]);

    const filteredCommands = useMemo(() => {
        if (!search.trim()) return commands;

        const searchLower = search.toLowerCase();
        return commands.filter((cmd) =>
            cmd.label.toLowerCase().includes(searchLower) ||
            cmd.keywords.some((keyword) => keyword.includes(searchLower))
        );
    }, [commands, search]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredCommands.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredCommands.length - 1
                );
            } else if (e.key === 'Enter') {
                e.preventDefault();
                filteredCommands[selectedIndex]?.action();
            } else if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex]);

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        filteredCommands.forEach((cmd) => {
            if (!groups[cmd.category]) groups[cmd.category] = [];
            groups[cmd.category].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl p-0 glass-v2 border-gold/20">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Type a command or search..."
                                className="pl-10 bg-background/50 border-white/10 focus-ring-gold text-fluid-base"
                                autoFocus
                            />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto p-2">
                        {Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category} className="mb-4">
                                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {category}
                                </div>
                                <div className="space-y-1">
                                    {items.map((cmd, index) => {
                                        const globalIndex = filteredCommands.indexOf(cmd);
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={cmd.action}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                                                    globalIndex === selectedIndex
                                                        ? 'bg-gold/20 text-gold-glow shadow-depth-sm'
                                                        : 'hover:bg-white/5 text-foreground'
                                                )}
                                            >
                                                {cmd.icon}
                                                <span className="flex-1 text-sm">{cmd.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredCommands.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No commands found for "{search}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
