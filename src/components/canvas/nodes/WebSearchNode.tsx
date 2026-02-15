import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Search, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';

interface WebSearchNodeData {
    type: 'web-search';
    label?: string;
    query?: string;
    results?: Array<{
        title: string;
        url: string;
        snippet: string;
        score?: number;
    }>;
    answer?: string;
    status?: 'idle' | 'searching' | 'completed' | 'failed';
}

const WebSearchNode = memo(({ data, selected }: NodeProps<WebSearchNodeData>) => {
    const isSearching = data.status === 'searching';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';
    const results = data.results || [];

    return (
        <div
            className={`
                bg-gradient-to-br from-blue-900/90 to-indigo-900/90 
                backdrop-blur-sm rounded-xl border-2 
                ${isSearching ? 'border-blue-400 shadow-xl shadow-blue-500/30' : ''}
                ${isCompleted ? 'border-blue-600' : ''}
                ${isFailed ? 'border-red-600' : ''}
                ${selected ? 'ring-2 ring-blue-300' : 'border-blue-800'}
                min-w-[320px] max-w-[400px]
                transition-all duration-300
            `}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />

            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-white">
                            {data.label || 'Web Search'}
                        </span>
                    </div>
                    {isSearching && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                {data.query && (
                    <div className="mt-2 text-xs text-blue-200 font-mono bg-black/20 rounded px-2 py-1">
                        "{data.query}"
                    </div>
                )}
            </div>

            {/* Status */}
            {isSearching && (
                <div className="px-4 py-3 text-sm text-blue-300">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        Searching the web...
                    </div>
                </div>
            )}

            {/* AI Answer */}
            {isCompleted && data.answer && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-xs font-semibold text-blue-300 mb-1">Quick Answer</div>
                    <div className="text-sm text-gray-200 leading-relaxed">
                        {data.answer}
                    </div>
                </div>
            )}

            {/* Results */}
            {isCompleted && results.length > 0 && (
                <div className="px-4 py-3 max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-semibold text-blue-300 mb-2">
                        Found {results.length} results
                    </div>
                    <div className="space-y-2">
                        {results.map((result, i) => (
                            <a
                                key={i}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors group"
                            >
                                <div className="flex items-start gap-2">
                                    <ExternalLink className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0 group-hover:text-blue-300" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-blue-200 group-hover:text-blue-100 line-clamp-1">
                                            {result.title}
                                        </div>
                                        <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                                            {result.snippet}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1 truncate">
                                            {result.url}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {isFailed && (
                <div className="px-4 py-3 text-sm text-red-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Search failed
                    </div>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
        </div>
    );
});

WebSearchNode.displayName = 'WebSearchNode';

export default WebSearchNode;
