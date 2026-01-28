/**
 * AddNode - Branch Creation Node (Pink Plus Button)
 * Allows users to create new conversation branches
 * Dark theme styling
 */

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

// Define node data type
type AddNodeData = {
    onClick?: () => void;
    label?: string;
};

// Define the node type
type AddNodeType = Node<AddNodeData, 'add'>;

const AddNode = memo(({ data, selected }: NodeProps<AddNodeType>) => {
    return (
        <div
            className={`
                relative min-w-[180px] p-5
                bg-gradient-to-br from-[#0a0a0a] to-[#1a0a1a]
                border-2 border-dashed rounded-xl
                transition-all duration-300 cursor-pointer
                hover:border-pink-500 hover:bg-pink-500/5
                ${selected
                    ? 'border-pink-500 shadow-xl shadow-pink-500/20'
                    : 'border-gray-700'
                }
            `}
            onClick={data.onClick}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-pink-300 !-top-1.5"
            />

            {/* Content */}
            <div className="flex flex-col items-center gap-3">
                <div className="
                    w-12 h-12 rounded-full
                    bg-gradient-to-br from-pink-500 to-pink-600
                    flex items-center justify-center
                    shadow-lg shadow-pink-500/40
                    hover:scale-110 transition-transform
                ">
                    <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-400 font-medium">
                    {data.label || 'Add Branch'}
                </span>
            </div>
        </div>
    );
});

AddNode.displayName = 'AddNode';

export default AddNode;
export type { AddNodeData, AddNodeType };
