import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Code2, Loader2, Check, AlertCircle, TrendingUp } from 'lucide-react';

interface CodeAnalyzerNodeData {
    type: 'code-analyzer';
    label?: string;
    code?: string;
    analysis?: {
        lines: number;
        functions: number;
        classes: number;
        imports: number;
        complexity?: string;
        patterns?: string[];
        suggestions?: string[];
    };
    formatted?: string;
    status?: 'idle' | 'analyzing' | 'completed' | 'failed';
}

const CodeAnalyzerNode = memo(({ data, selected }: NodeProps<CodeAnalyzerNodeData>) => {
    const isAnalyzing = data.status === 'analyzing';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    return (
        <div
            className={`
                bg-gradient-to-br from-indigo-900/90 to-violet-900/90 
                backdrop-blur-sm rounded-xl border-2 
                ${isAnalyzing ? 'border-indigo-400 shadow-xl shadow-indigo-500/30' : ''}
                ${isCompleted ? 'border-indigo-600' : ''}
                ${isFailed ? 'border-red-600' : ''}
                ${selected ? 'ring-2 ring-indigo-300' : 'border-indigo-800'}
                min-w-[320px] max-w-[420px]
                transition-all duration-300
            `}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />

            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-white">
                            {data.label || 'Code Analyzer'}
                        </span>
                    </div>
                    {isAnalyzing && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
            </div>

            {/* Status */}
            {isAnalyzing && (
                <div className="px-4 py-3 text-sm text-indigo-300">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        Analyzing code...
                    </div>
                </div>
            )}

            {/* Metrics */}
            {isCompleted && data.analysis && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-lg p-2">
                            <div className="text-xs text-indigo-300">Lines</div>
                            <div className="text-lg font-bold text-white">{data.analysis.lines}</div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2">
                            <div className="text-xs text-indigo-300">Functions</div>
                            <div className="text-lg font-bold text-white">{data.analysis.functions}</div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2">
                            <div className="text-xs text-indigo-300">Classes</div>
                            <div className="text-lg font-bold text-white">{data.analysis.classes}</div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2">
                            <div className="text-xs text-indigo-300">Complexity</div>
                            <div className={`text-sm font-bold ${data.analysis.complexity === 'Low' ? 'text-green-400' :
                                    data.analysis.complexity === 'High' ? 'text-red-400' :
                                        'text-yellow-400'
                                }`}>
                                {data.analysis.complexity}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Patterns */}
            {isCompleted && data.analysis?.patterns && data.analysis.patterns.length > 0 && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Patterns Detected
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {data.analysis.patterns.slice(0, 6).map((pattern, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-200 rounded-full"
                            >
                                {pattern}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {isCompleted && data.analysis?.suggestions && data.analysis.suggestions.length > 0 && (
                <div className="px-4 py-3">
                    <div className="text-xs font-semibold text-indigo-300 mb-2">💡 Suggestions</div>
                    <div className="space-y-2">
                        {data.analysis.suggestions.map((suggestion, i) => (
                            <div key={i} className="text-xs text-gray-300 bg-black/20 rounded px-2 py-1.5">
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Full Analysis */}
            {isCompleted && data.formatted && (
                <details className="px-4 py-2 border-t border-white/10">
                    <summary className="text-xs font-semibold text-indigo-300 cursor-pointer hover:text-indigo-200">
                        View Full Analysis
                    </summary>
                    <pre className="mt-2 text-xs text-gray-300 font-mono bg-black/30 rounded p-2 max-h-48 overflow-auto custom-scrollbar whitespace-pre-wrap">
                        {data.formatted}
                    </pre>
                </details>
            )}

            {/* Error */}
            {isFailed && (
                <div className="px-4 py-3 text-sm text-red-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Analysis failed
                    </div>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    );
});

CodeAnalyzerNode.displayName = 'CodeAnalyzerNode';

export default CodeAnalyzerNode;
