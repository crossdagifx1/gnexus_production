/**
 * ResearchNode - Parallel Research Branch
 * Each node makes a unique API call for specific research
 */

import { memo, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Loader2, Check, AlertCircle, Search, Zap, ChevronDown } from 'lucide-react';
import type { WorkflowNodeData } from '@/stores/workflowStore';

type ResearchNodeType = Node<WorkflowNodeData, 'researchNode'>;

// Research type icons
const researchIcons: Record<string, string> = {
    tech_research: '🔧',
    ux_design: '🎨',
    market_analysis: '📊',
    user_psychology: '🧠',
    seo_content: '📝',
    performance: '⚡',
    accessibility: '♿',
    monetization: '💰',
};

const ResearchNode = memo(({ data, selected }: NodeProps<ResearchNodeType>) => {
    const isRunning = data.status === 'running';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    const icon = researchIcons[data.researchType || ''] || '🔍';
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`
                min-w-[160px] 
                ${isExpanded ? 'w-[400px] z-50' : 'max-w-[200px]'}
                bg-gradient-to-br from-[#0a0a0a] to-[#151520]
                border-2 rounded-xl overflow-hidden
                transition-all duration-300
                ${selected ? 'ring-2 ring-orange-400' : ''}
                ${isRunning ? 'border-orange-500 shadow-lg shadow-orange-500/30' : ''}
                ${isCompleted ? 'border-green-500/70' : ''}
                ${isFailed ? 'border-red-500/70' : ''}
                ${!isRunning && !isCompleted && !isFailed ? 'border-gray-700' : ''}
            `}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300 !-top-1.5"
            />

            {/* Header */}
            <div className={`
                px-3 py-2 flex items-center gap-2
                ${isRunning ? 'bg-orange-500/20' : ''}
                ${isCompleted ? 'bg-green-500/20' : ''}
                ${isFailed ? 'bg-red-500/20' : ''}
                ${!isRunning && !isCompleted && !isFailed ? 'bg-gray-800/50' : ''}
            `}>
                <span className="text-lg">{icon}</span>
                <span className="text-white text-xs font-medium truncate flex-1">
                    {data.label}
                </span>
                {isRunning && <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />}
                {isCompleted && <Check className="w-3 h-3 text-green-400" />}
                {isFailed && <AlertCircle className="w-3 h-3 text-red-400" />}
            </div>

            {/* Content */}
            <div className="px-3 py-2">
                {isRunning && (
                    <div className="flex items-center gap-2 text-orange-400">
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" />
                            <div className="w-1 h-1 rounded-full bg-orange-500 animate-bounce [animation-delay:0.1s]" />
                            <div className="w-1 h-1 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                        </div>
                        <span className="text-[10px] animate-pulse">Analyzing API Stream...</span>
                    </div>
                )}

                {isCompleted && data.result && (
                    <div className="text-[10px] text-gray-400 overflow-hidden transition-all">
                        <p className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}>
                            {isExpanded ? data.result : `${data.result.slice(0, 120)}...`}
                        </p>
                    </div>
                )}

                {isFailed && (
                    <p className="text-[10px] text-red-400">{data.error || 'Research failed'}</p>
                )}

                {!isRunning && !isCompleted && !isFailed && (
                    <p className="text-[10px] text-gray-500">Waiting...</p>
                )}
            </div>

            {/* Expansion Button */}
            {(isCompleted || isRunning) && (
                <div className="px-3 pb-2 pt-1 border-t border-white/5 mt-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full text-[9px] uppercase tracking-wider font-bold text-orange-500 hover:text-orange-400 transition-colors flex items-center justify-between"
                    >
                        <span>{isExpanded ? 'Collapse' : 'Load Details'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-gray-600">
                            <div className="flex justify-between">
                                <span>API Status:</span>
                                <span className={isCompleted ? "text-green-500" : "text-orange-500"}>
                                    {isCompleted ? "200 OK" : "Stream Active"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Model:</span>
                                <span>Llama-3-70b</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* API Indicator */}
            {!isExpanded && (
                <div className="px-3 pb-2 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-yellow-500" />
                    <span className="text-[9px] text-gray-600">Unique API Call</span>
                </div>
            )}

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300 !-bottom-1.5"
            />
        </div>
    );
});

ResearchNode.displayName = 'ResearchNode';

export default ResearchNode;
