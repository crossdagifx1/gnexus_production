/**
 * ResponseNode - AI Response Node (Solid Border)
 * Displays AI-generated content
 * Dark theme styling
 */

import { memo, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Bot, Copy, Loader2, Check } from 'lucide-react';

// Define node data type
type ResponseNodeData = {
    content?: string;
    status?: 'idle' | 'processing' | 'completed' | 'failed';
    timestamp?: Date;
    agentName?: string;
};

// Define the node type
type ResponseNodeType = Node<ResponseNodeData, 'response'>;

const ResponseNode = memo(({ data, selected }: NodeProps<ResponseNodeType>) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (data.content) {
            navigator.clipboard.writeText(data.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isProcessing = data.status === 'processing';
    const isFailed = data.status === 'failed';
    const isCompleted = data.status === 'completed';

    return (
        <div
            className={`
                relative min-w-[340px] max-w-[500px]
                bg-gradient-to-br from-[#0a0a0a] to-[#1a1520]
                border-2 rounded-2xl overflow-hidden
                transition-all duration-300
                ${selected ? 'ring-2 ring-blue-400' : ''}
                ${isProcessing ? 'border-blue-500 shadow-xl shadow-blue-500/20' : ''}
                ${isCompleted ? 'border-blue-500/70' : ''}
                ${isFailed ? 'border-red-500/70' : ''}
                ${!isProcessing && !isCompleted && !isFailed ? 'border-gray-800' : ''}
            `}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300 !-top-1.5"
            />

            {/* Header */}
            <div className={`
                flex items-center gap-3 px-4 py-3 border-b border-gray-800
                ${isProcessing ? 'bg-blue-500/10' : ''}
                ${isCompleted ? 'bg-blue-500/5' : ''}
                ${isFailed ? 'bg-red-500/10' : ''}
            `}>
                <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center
                    ${isProcessing ? 'bg-blue-500/20' : ''}
                    ${isCompleted ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                    ${isFailed ? 'bg-red-500/20' : ''}
                    ${!isProcessing && !isCompleted && !isFailed ? 'bg-gray-800' : ''}
                `}>
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                        <Bot className={`w-4 h-4 ${isFailed ? 'text-red-400' : isCompleted ? 'text-white' : 'text-gray-500'}`} />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        {isProcessing ? 'Generating...' : isFailed ? 'Error' : 'Response'}
                    </p>
                    <p className="text-sm font-semibold text-white">
                        {data.agentName || 'G-Nexus Intelligence'}
                    </p>
                </div>
                {data.content && !isProcessing && (
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-500 hover:text-white" />
                        )}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4 max-h-[300px] overflow-y-auto">
                {isProcessing ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
                        <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6" />
                    </div>
                ) : isFailed ? (
                    <p className="text-red-400 text-sm">
                        {data.content || 'Failed to generate response'}
                    </p>
                ) : (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {data.content || 'No content yet...'}
                    </p>
                )}
            </div>

            {/* Footer */}
            {data.timestamp && (
                <div className="px-4 py-2 border-t border-gray-800 flex justify-end">
                    <span className="text-[10px] text-gray-600">
                        {data.timestamp.toLocaleTimeString()}
                    </span>
                </div>
            )}

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300 !-bottom-1.5"
            />
        </div>
    );
});

ResponseNode.displayName = 'ResponseNode';

export default ResponseNode;
export type { ResponseNodeData, ResponseNodeType };
