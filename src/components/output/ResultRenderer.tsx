/**
 * G-Nexus Result Renderer
 * Main component for rendering analysis results with appropriate visualizations
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, Share2, Copy, CheckCircle, AlertCircle, Clock,
    BarChart3, TrendingUp, Lightbulb, FileText, Code, Image,
    ChevronDown, ChevronUp, ExternalLink, RefreshCw, Bookmark,
    MoreVertical, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AnalysisResult, ResultType, ResultStatus, Insight,
    Visualization, Recommendation, ExportFormat
} from '../input/types';
import { ChartRenderer } from './ChartRenderer';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CodeRenderer } from './CodeRenderer';
import { TableRenderer } from './TableRenderer';

// Status colors
const STATUS_COLORS: Record<ResultStatus, string> = {
    processing: '#f59e0b',
    streaming: '#06b6d4',
    completed: '#10b981',
    error: '#ef4444',
};

// Result type icons
const RESULT_TYPE_ICONS: Record<ResultType, string> = {
    text_analysis: '📝',
    image_analysis: '🖼️',
    video_analysis: '🎬',
    audio_transcription: '🎤',
    document_summary: '📄',
    data_insights: '📊',
    code_execution: '💻',
    web_content: '🌐',
    translation: '🌍',
    business_ideas: '💡',
};

interface ResultRendererProps {
    result: AnalysisResult;
    view?: 'compact' | 'full' | 'expanded';
    showMetadata?: boolean;
    showConfidence?: boolean;
    interactive?: boolean;
    exportable?: boolean;
    shareable?: boolean;
    onExport?: (format: ExportFormat) => void;
    onShare?: () => void;
    onDrillDown?: (data: any) => void;
    onRefresh?: () => void;
    className?: string;
}

export function ResultRenderer({
    result,
    view = 'full',
    showMetadata = true,
    showConfidence = true,
    interactive = true,
    exportable = true,
    shareable = true,
    onExport,
    onShare,
    onDrillDown,
    onRefresh,
    className = '',
}: ResultRendererProps) {
    const [expanded, setExpanded] = useState(view === 'expanded');
    const [activeTab, setActiveTab] = useState<'summary' | 'insights' | 'visualizations' | 'recommendations'>('summary');
    const [copied, setCopied] = useState(false);

    // Toggle expanded view
    const toggleExpanded = useCallback(() => {
        setExpanded(prev => !prev);
    }, []);

    // Copy content to clipboard
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(result.content);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy');
        }
    }, [result.content]);

    // Handle export
    const handleExport = useCallback((format: ExportFormat) => {
        onExport?.(format);
        toast.success(`Exporting as ${format.toUpperCase()}`);
    }, [onExport]);

    // Format processing time
    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    // Render status indicator
    const renderStatus = () => (
        <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {result.status === 'processing' && (
                <>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <RefreshCw className="w-4 h-4" style={{ color: STATUS_COLORS.processing }} />
                    </motion.div>
                    <span className="text-sm" style={{ color: STATUS_COLORS.processing }}>
                        Processing...
                    </span>
                </>
            )}
            {result.status === 'streaming' && (
                <>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <TrendingUp className="w-4 h-4" style={{ color: STATUS_COLORS.streaming }} />
                    </motion.div>
                    <span className="text-sm" style={{ color: STATUS_COLORS.streaming }}>
                        Streaming...
                    </span>
                </>
            )}
            {result.status === 'completed' && (
                <>
                    <CheckCircle className="w-4 h-4" style={{ color: STATUS_COLORS.completed }} />
                    <span className="text-sm" style={{ color: STATUS_COLORS.completed }}>
                        Complete
                    </span>
                </>
            )}
            {result.status === 'error' && (
                <>
                    <AlertCircle className="w-4 h-4" style={{ color: STATUS_COLORS.error }} />
                    <span className="text-sm" style={{ color: STATUS_COLORS.error }}>
                        Error
                    </span>
                </>
            )}
        </motion.div>
    );

    // Render progress bar
    const renderProgress = () => {
        if (result.status !== 'processing' && result.status !== 'streaming') return null;

        return (
            <motion.div
                className="h-1 bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        );
    };

    // Render tabs
    const renderTabs = () => {
        const tabs = [
            { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
            { id: 'insights', label: `Insights (${result.insights.length})`, icon: <Lightbulb className="w-4 h-4" /> },
        ];

        if (result.visualizations && result.visualizations.length > 0) {
            tabs.push({
                id: 'visualizations',
                label: `Charts (${result.visualizations.length})`,
                icon: <BarChart3 className="w-4 h-4" />,
            });
        }

        if (result.recommendations && result.recommendations.length > 0) {
            tabs.push({
                id: 'recommendations',
                label: `Actions (${result.recommendations.length})`,
                icon: <TrendingUp className="w-4 h-4" />,
            });
        }

        return (
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${activeTab === tab.id
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </motion.button>
                ))}
            </div>
        );
    };

    // Render summary content
    const renderSummary = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {/* Main Content */}
            <div className="prose prose-invert max-w-none">
                <MarkdownRenderer content={result.content} />
            </div>

            {/* Structured Data */}
            {result.data && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Structured Data</h4>
                    <TableRenderer data={result.data} />
                </div>
            )}
        </motion.div>
    );

    // Render insights
    const renderInsights = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
        >
            {result.insights.map((insight, index) => (
                <InsightCard
                    key={insight.id}
                    insight={insight}
                    index={index}
                    onDrillDown={onDrillDown}
                />
            ))}
            {result.insights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No insights available
                </div>
            )}
        </motion.div>
    );

    // Render visualizations
    const renderVisualizations = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
            {result.visualizations?.map((viz, index) => (
                <motion.div
                    key={viz.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                    <h4 className="text-sm font-medium text-gray-300 mb-3">{viz.title}</h4>
                    <ChartRenderer visualization={viz} interactive={interactive} />
                </motion.div>
            ))}
            {(!result.visualizations || result.visualizations.length === 0) && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                    No visualizations available
                </div>
            )}
        </motion.div>
    );

    // Render recommendations
    const renderRecommendations = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
        >
            {result.recommendations?.map((rec, index) => (
                <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    index={index}
                />
            ))}
            {(!result.recommendations || result.recommendations.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                    No recommendations available
                </div>
            )}
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl overflow-hidden ${className}`}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{
                                background: `linear-gradient(135deg, ${STATUS_COLORS[result.status]}20, ${STATUS_COLORS[result.status]}10)`,
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            {RESULT_TYPE_ICONS[result.type]}
                        </motion.div>

                        <div>
                            <h3 className="font-medium text-white">
                                {result.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                {renderStatus()}
                                {showMetadata && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(result.metadata.processingTime)}
                                    </span>
                                )}
                                {showConfidence && (
                                    <span className="text-xs text-gray-500">
                                        {Math.round(result.metadata.confidence * 100)}% confidence
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onRefresh}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 text-gray-400" />
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                            )}
                        </motion.button>

                        {exportable && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4 text-gray-400" />
                                    </motion.button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                        Export as PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('png')}>
                                        Export as Image
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('json')}>
                                        Export as JSON
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                                        Export as CSV
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleExpanded}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {expanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Progress */}
                {renderProgress()}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Tabs */}
                        <div className="px-4 pt-4">
                            {renderTabs()}
                        </div>

                        {/* Tab Content */}
                        <ScrollArea className="p-4 max-h-[500px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'summary' && renderSummary()}
                                {activeTab === 'insights' && renderInsights()}
                                {activeTab === 'visualizations' && renderVisualizations()}
                                {activeTab === 'recommendations' && renderRecommendations()}
                            </AnimatePresence>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed Summary */}
            {!expanded && (
                <div className="p-4">
                    <p className="text-sm text-gray-400 line-clamp-2">{result.summary}</p>
                </div>
            )}
        </motion.div>
    );
}

// Insight Card Component
function InsightCard({
    insight,
    index,
    onDrillDown,
}: {
    insight: Insight;
    index: number;
    onDrillDown?: (data: any) => void;
}) {
    const importanceColors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981',
    };

    const typeIcons = {
        observation: '👁️',
        pattern: '🔄',
        anomaly: '⚠️',
        trend: '📈',
        key_point: '🔑',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => onDrillDown?.(insight.data)}
        >
            <span className="text-xl">{typeIcons[insight.type]}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: importanceColors[insight.importance] }}
                    />
                </div>
                <p className="text-xs text-gray-400">{insight.description}</p>
            </div>
        </motion.div>
    );
}

// Recommendation Card Component
function RecommendationCard({
    recommendation,
    index,
}: {
    recommendation: Recommendation;
    index: number;
}) {
    const priorityColors = {
        critical: '#ef4444',
        high: '#f97316',
        medium: '#f59e0b',
        low: '#10b981',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white/5 border border-white/10 rounded-xl"
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${priorityColors[recommendation.priority]}20` }}
                >
                    <Lightbulb className="w-4 h-4" style={{ color: priorityColors[recommendation.priority] }} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{recommendation.title}</h4>
                        <span
                            className="text-[10px] px-2 py-0.5 rounded-full uppercase"
                            style={{
                                backgroundColor: `${priorityColors[recommendation.priority]}20`,
                                color: priorityColors[recommendation.priority],
                            }}
                        >
                            {recommendation.priority}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{recommendation.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {recommendation.actions.map(action => (
                            <Button
                                key={action.id}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default ResultRenderer;
