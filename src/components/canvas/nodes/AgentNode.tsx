/**
 * AgentNode - Dynamic Agent Node with Status Indicators
 * Shows running/complete/failed states for each agent
 * Dark theme styling
 */

import { memo, useState, useCallback } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Bot, Loader2, Check, AlertCircle, Zap, Code, Palette, Layout, Send } from 'lucide-react';
import type { WorkflowNodeData } from '@/stores/workflowStore';

// Define the node type
type AgentNodeType = Node<WorkflowNodeData, 'agentNode'>;

// Agent type icons
const agentIcons: Record<string, React.ReactNode> = {
    coder: <Code className="w-4 h-4" />,
    planner: <Layout className="w-4 h-4" />,
    designer: <Palette className="w-4 h-4" />,
    default: <Bot className="w-4 h-4" />,
};

// Status colors - dark theme
const statusColors = {
    idle: 'border-gray-700 bg-gradient-to-br from-[#0a0a0a] to-[#151515]',
    waiting: 'border-blue-500/50 bg-gradient-to-br from-[#0a0a0a] to-[#0a1020]',
    running: 'border-orange-500 bg-gradient-to-br from-[#0a0a0a] to-[#1a1005] shadow-lg shadow-orange-500/20',
    completed: 'border-green-500/70 bg-gradient-to-br from-[#0a0a0a] to-[#0a1510]',
    failed: 'border-red-500/70 bg-gradient-to-br from-[#0a0a0a] to-[#1a0a0a]',
};

const AgentNode = memo(({ data, selected }: NodeProps<AgentNodeType>) => {
    const [inputValue, setInputValue] = useState('');

    const isInput = data.type === 'input';
    const isRunning = data.status === 'running';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    const handleInputSubmit = useCallback(() => {
        if (inputValue.trim() && (data as any).onSubmit) {
            (data as any).onSubmit(inputValue.trim());
        }
    }, [inputValue, data]);

    return (
        <div
            className={`
                relative min-w-[200px] max-w-[300px]
                rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${statusColors[data.status as keyof typeof statusColors] || statusColors.idle}
                ${selected ? 'ring-2 ring-orange-400' : ''}
            `}
        >
            {/* Top Handle (except for input) */}
            {!isInput && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300 !-top-1.5"
                />
            )}

            {/* Header */}
            <div className={`
                flex items-center gap-2 px-3 py-2.5 border-b
                ${isCompleted ? 'border-green-500/30' : isFailed ? 'border-red-500/30' : 'border-gray-800'}
            `}>
                {/* Status Icon */}
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${isRunning ? 'bg-orange-500/20' : ''}
                    ${isCompleted ? 'bg-green-500/20' : ''}
                    ${isFailed ? 'bg-red-500/20' : ''}
                    ${data.status === 'idle' || data.status === 'waiting' ? 'bg-gray-800' : ''}
                `}>
                    {isRunning ? (
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    ) : isCompleted ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : isFailed ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                        agentIcons[(data.agentType as string)] || agentIcons.default || <Zap className="w-4 h-4 text-gray-500" />
                    )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                        {data.label}
                    </p>
                    {data.agentType && (
                        <p className="text-[10px] text-gray-500 uppercase">
                            {data.agentType}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                {isInput ? (
                    /* Input Field */
                    <div className="space-y-2">
                        <textarea
                            value={data.prompt || inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter your prompt..."
                            className="
                                w-full min-h-[60px] p-2
                                bg-black/50 border border-gray-700 rounded-lg
                                text-xs text-white placeholder:text-gray-500
                                focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500
                                resize-none
                            "
                            disabled={isRunning || isCompleted}
                        />
                        {!isCompleted && (
                            <button
                                onClick={handleInputSubmit}
                                disabled={!inputValue.trim()}
                                className="
                                    w-full py-2 px-3
                                    bg-gradient-to-r from-orange-500 to-orange-600
                                    text-white text-xs font-medium
                                    rounded-lg flex items-center justify-center gap-1.5
                                    hover:from-orange-600 hover:to-orange-700
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all shadow-lg shadow-orange-500/30
                                "
                            >
                                <Send className="w-3 h-3" />
                                Start
                            </button>
                        )}
                    </div>
                ) : isRunning ? (
                    /* Running state */
                    <div className="flex items-center gap-2 text-orange-400">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.1s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                        </div>
                        <span className="text-xs">Processing...</span>
                    </div>
                ) : isCompleted && data.result ? (
                    /* Completed with result */
                    <div className="text-xs text-gray-400 max-h-[60px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono text-[10px] bg-black/30 p-2 rounded border border-gray-800">
                            {data.result.slice(0, 100)}{data.result.length > 100 ? '...' : ''}
                        </pre>
                    </div>
                ) : isFailed ? (
                    /* Failed state */
                    <p className="text-xs text-red-400">
                        ⚠️ {data.error || 'Execution failed'}
                    </p>
                ) : (
                    /* Idle state */
                    <p className="text-xs text-gray-500 text-center py-2">
                        Waiting for input...
                    </p>
                )}
            </div>

            {/* Timestamp */}
            {data.timestamp && (
                <div className="px-3 pb-2">
                    <p className="text-[9px] text-gray-600 text-right">
                        {data.timestamp.toLocaleTimeString()}
                    </p>
                </div>
            )}

            {/* Bottom Handle (except for preview) */}
            {data.type !== 'preview' && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300 !-bottom-1.5"
                />
            )}
        </div>
    );
});

AgentNode.displayName = 'AgentNode';

export default AgentNode;
