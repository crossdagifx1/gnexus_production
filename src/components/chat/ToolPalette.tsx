/**
 * ToolPalette Component
 * Visual tool selector with categories, search, and suggestions
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Code, BarChart3, Lightbulb, MessageSquare, Calendar,
    Zap, ChevronRight, Star, Clock, Sparkles, X, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getAllTools, getToolsByCategory, type AITool, type ToolCategory } from '@/lib/tools/registry';
import { getToolSuggestionEngine, type ToolSuggestion } from '@/lib/tools/suggestionEngine';

// Category icons and colors
const CATEGORY_CONFIG: Record<ToolCategory, { icon: React.ReactNode; color: string; label: string }> = {
    analysis: { icon: <BarChart3 className="w-4 h-4" />, color: '#10b981', label: 'Analysis' },
    creation: { icon: <Lightbulb className="w-4 h-4" />, color: '#f59e0b', label: 'Creation' },
    development: { icon: <Code className="w-4 h-4" />, color: '#3b82f6', label: 'Development' },
    search: { icon: <Search className="w-4 h-4" />, color: '#06b6d4', label: 'Search' },
    communication: { icon: <MessageSquare className="w-4 h-4" />, color: '#8b5cf6', label: 'Communication' },
    productivity: { icon: <Calendar className="w-4 h-4" />, color: '#ec4899', label: 'Productivity' },
    utility: { icon: <Zap className="w-4 h-4" />, color: '#6366f1', label: 'Utility' },
};

interface ToolPaletteProps {
    selectedTool?: string | null;
    onSelectTool: (toolId: string) => void;
    onExecuteTool?: (toolId: string, input: string) => void;
    contextInput?: string;
    className?: string;
    compact?: boolean;
}

export function ToolPalette({
    selectedTool,
    onSelectTool,
    onExecuteTool,
    contextInput = '',
    className,
    compact = false,
}: ToolPaletteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all' | 'suggested'>('all');
    const [showInfo, setShowInfo] = useState<string | null>(null);

    // Get all tools
    const allTools = useMemo(() => getAllTools(), []);

    // Get suggestions based on context
    const suggestions = useMemo(() => {
        if (!contextInput) return [];
        const engine = getToolSuggestionEngine();
        return engine.suggestTools({ input: contextInput });
    }, [contextInput]);

    // Filter tools
    const filteredTools = useMemo(() => {
        let tools = allTools;

        // Filter by category
        if (activeCategory === 'suggested') {
            tools = suggestions.map(s => s.tool);
        } else if (activeCategory !== 'all') {
            tools = tools.filter(t => t.category === activeCategory);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            tools = tools.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.keywords.some(k => k.toLowerCase().includes(query))
            );
        }

        return tools;
    }, [allTools, activeCategory, searchQuery, suggestions]);

    // Group tools by category
    const groupedTools = useMemo(() => {
        if (activeCategory !== 'all') return { [activeCategory]: filteredTools };

        const groups: Record<string, AITool[]> = {};
        filteredTools.forEach(tool => {
            if (!groups[tool.category]) {
                groups[tool.category] = [];
            }
            groups[tool.category].push(tool);
        });
        return groups;
    }, [filteredTools, activeCategory]);

    // Handle tool click
    const handleToolClick = useCallback((toolId: string) => {
        onSelectTool(toolId);
    }, [onSelectTool]);

    // Get recent tools from localStorage
    const recentTools = useMemo(() => {
        try {
            const stored = localStorage.getItem('gnexus_recent_tools');
            if (stored) {
                const ids = JSON.parse(stored) as string[];
                return ids.map(id => allTools.find(t => t.id === id)).filter(Boolean) as AITool[];
            }
        } catch {}
        return [];
    }, [allTools]);

    // Record tool usage
    const recordToolUsage = useCallback((toolId: string) => {
        try {
            const stored = localStorage.getItem('gnexus_recent_tools');
            let recent = stored ? JSON.parse(stored) as string[] : [];
            recent = [toolId, ...recent.filter((id: string) => id !== toolId)].slice(0, 10);
            localStorage.setItem('gnexus_recent_tools', JSON.stringify(recent));
        } catch {}
    }, []);

    return (
        <TooltipProvider>
            <div className={cn('flex flex-col h-full bg-[#0d0d0d]', className)}>
                {/* Header */}
                <div className="p-3 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            Tools
                        </h3>
                        <Badge variant="secondary" className="text-xs bg-white/10">
                            {allTools.length} tools
                        </Badge>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tools..."
                            className="pl-9 bg-white/5 border-white/10 text-sm"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                {!compact && (
                    <div className="flex gap-1 p-2 overflow-x-auto border-b border-white/10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveCategory('all')}
                            className={cn(
                                'text-xs shrink-0',
                                activeCategory === 'all' && 'bg-orange-500/20 text-orange-400'
                            )}
                        >
                            All
                        </Button>
                        {suggestions.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveCategory('suggested')}
                                className={cn(
                                    'text-xs shrink-0',
                                    activeCategory === 'suggested' && 'bg-orange-500/20 text-orange-400'
                                )}
                            >
                                <Star className="w-3 h-3 mr-1" />
                                Suggested
                            </Button>
                        )}
                        {(Object.keys(CATEGORY_CONFIG) as ToolCategory[]).map(cat => (
                            <Button
                                key={cat}
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    'text-xs shrink-0 gap-1',
                                    activeCategory === cat && 'bg-orange-500/20 text-orange-400'
                                )}
                                style={{ color: activeCategory === cat ? CATEGORY_CONFIG[cat].color : undefined }}
                            >
                                {CATEGORY_CONFIG[cat].icon}
                                {CATEGORY_CONFIG[cat].label}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Tools List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-4">
                        {/* Recent Tools */}
                        {activeCategory === 'all' && recentTools.length > 0 && !searchQuery && (
                            <div>
                                <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    Recent
                                </div>
                                <div className="space-y-1">
                                    {recentTools.slice(0, 3).map(tool => (
                                        <ToolCard
                                            key={tool.id}
                                            tool={tool}
                                            isSelected={selectedTool === tool.id}
                                            onClick={() => handleToolClick(tool.id)}
                                            compact
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested Tools */}
                        {activeCategory === 'suggested' && suggestions.length > 0 && (
                            <div className="space-y-2">
                                {suggestions.map((suggestion) => (
                                    <div key={suggestion.tool.id}>
                                        <ToolCard
                                            tool={suggestion.tool}
                                            isSelected={selectedTool === suggestion.tool.id}
                                            onClick={() => handleToolClick(suggestion.tool.id)}
                                            showConfidence
                                            confidence={suggestion.confidence}
                                            reason={suggestion.reason}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Grouped Tools */}
                        {activeCategory !== 'suggested' && Object.entries(groupedTools).map(([category, tools]) => (
                            <div key={category}>
                                {activeCategory === 'all' && (
                                    <div
                                        className="flex items-center gap-2 px-2 py-1 text-xs uppercase"
                                        style={{ color: CATEGORY_CONFIG[category as ToolCategory]?.color }}
                                    >
                                        {CATEGORY_CONFIG[category as ToolCategory]?.icon}
                                        {CATEGORY_CONFIG[category as ToolCategory]?.label || category}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {tools.map(tool => (
                                        <ToolCard
                                            key={tool.id}
                                            tool={tool}
                                            isSelected={selectedTool === tool.id}
                                            onClick={() => {
                                                handleToolClick(tool.id);
                                                recordToolUsage(tool.id);
                                            }}
                                            compact={compact}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* No Results */}
                        {filteredTools.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No tools found</p>
                                <p className="text-xs mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Tool Info Panel */}
                <AnimatePresence>
                    {showInfo && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10 overflow-hidden"
                        >
                            {(() => {
                                const tool = allTools.find(t => t.id === showInfo);
                                if (!tool) return null;
                                return (
                                    <div className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-white">{tool.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setShowInfo(null)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {tool.keywords.slice(0, 5).map(kw => (
                                                <Badge key={kw} variant="outline" className="text-xs">
                                                    {kw}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}

// Tool Card Component
interface ToolCardProps {
    tool: AITool;
    isSelected: boolean;
    onClick: () => void;
    compact?: boolean;
    showConfidence?: boolean;
    confidence?: number;
    reason?: string;
}

function ToolCard({ tool, isSelected, onClick, compact, showConfidence, confidence, reason }: ToolCardProps) {
    const categoryConfig = CATEGORY_CONFIG[tool.category];

    return (
        <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={cn(
                'w-full text-left p-2 rounded-lg transition-all border',
                isSelected
                    ? 'bg-orange-500/20 border-orange-500/50'
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
            )}
        >
            <div className="flex items-center gap-2">
                <span className="text-lg shrink-0">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{tool.name}</span>
                        {tool.streamingSupported && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-cyan-500/50 text-cyan-400">
                                Stream
                            </Badge>
                        )}
                    </div>
                    {!compact && (
                        <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                    )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
            </div>

            {/* Confidence indicator for suggestions */}
            {showConfidence && confidence !== undefined && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{reason}</span>
                        <span>{Math.round(confidence * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence * 100}%` }}
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                        />
                    </div>
                </div>
            )}
        </motion.button>
    );
}

export default ToolPalette;
