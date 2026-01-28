/**
 * ProcessNode - Processing/Branch Node
 * Intermediate nodes in the workflow tree
 * Dark theme styling
 */

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Loader2, Check, Zap, AlertCircle } from 'lucide-react';

// Define node data type
type ProcessNodeData = {
    label?: string;
    status?: 'idle' | 'processing' | 'completed' | 'failed';
    content?: string;
};

// Define the node type
type ProcessNodeType = Node<ProcessNodeData, 'process'>;

const ProcessNode = memo(({ data, selected }: NodeProps<ProcessNodeType>) => {
    const isProcessing = data.status === 'processing';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    return (
        <div
            className={`
                relative min-w-[160px] max-w-[240px]
                bg-gradient-to-br from-[#0a0a0a] to-[#151520]
                border-2 rounded-xl overflow-hidden
                transition-all duration-300
                ${selected ? 'ring-2 ring-purple-400' : ''}
                ${isProcessing ? 'border-purple-500 shadow-lg shadow-purple-500/20' : ''}
                ${isCompleted ? 'border-green-500/70' : ''}
                ${isFailed ? 'border-red-500/70' : ''}
                ${!isProcessing && !isCompleted && !isFailed ? 'border-gray-800' : ''}
            `}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300 !-top-1.5"
            />

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${isProcessing ? 'bg-purple-500/20' : ''}
                        ${isCompleted ? 'bg-green-500/20' : ''}
                        ${isFailed ? 'bg-red-500/20' : ''}
                        ${!isProcessing && !isCompleted && !isFailed ? 'bg-gray-800' : ''}
                    `}>
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        ) : isCompleted ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : isFailed ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                            <Zap className="w-4 h-4 text-gray-500" />
                        )}
                    </div>
                    <span className="text-sm font-medium text-white truncate">
                        {data.label || 'Process'}
                    </span>
                </div>

                {/* Content Preview */}
                {data.content && (
                    <p className="mt-3 text-xs text-gray-500 line-clamp-2 pl-11">
                        {data.content}
                    </p>
                )}
            </div>

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300 !-bottom-1.5"
            />
        </div>
    );
});

ProcessNode.displayName = 'ProcessNode';

export default ProcessNode;
export type { ProcessNodeData, ProcessNodeType };
