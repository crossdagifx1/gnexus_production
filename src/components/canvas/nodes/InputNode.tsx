/**
 * InputNode - User Input Node (Dashed Border)
 * Top-level node for user prompts
 * Dark theme styling
 */

import { memo, useState, useCallback } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

// Define node data type
type InputNodeData = {
    label?: string;
    value?: string;
    onSubmit?: (value: string) => void;
    isProcessing?: boolean;
};

// Define the node type
type InputNodeType = Node<InputNodeData, 'input'>;

const InputNode = memo(({ data, selected }: NodeProps<InputNodeType>) => {
    const [inputValue, setInputValue] = useState(data.value || '');

    const handleSubmit = useCallback(() => {
        if (inputValue.trim() && data.onSubmit) {
            data.onSubmit(inputValue.trim());
        }
    }, [inputValue, data]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    return (
        <div
            className={`
                relative min-w-[320px] max-w-[480px]
                bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]
                border-2 border-dashed rounded-2xl overflow-hidden
                transition-all duration-300
                ${selected
                    ? 'border-orange-500 shadow-xl shadow-orange-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }
            `}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                    {data.label || 'Your Input'}
                </span>
            </div>

            {/* Input Area */}
            <div className="p-4">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your prompt..."
                    className="
                        w-full min-h-[80px] p-3
                        bg-black/50 border border-gray-700 rounded-xl
                        text-sm text-white placeholder:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500
                        resize-none
                    "
                    disabled={data.isProcessing}
                />

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || data.isProcessing}
                    className="
                        mt-3 w-full py-3 px-4
                        bg-gradient-to-r from-orange-500 to-orange-600
                        text-white text-sm font-medium
                        rounded-xl flex items-center justify-center gap-2
                        hover:from-orange-600 hover:to-orange-700
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        shadow-lg shadow-orange-500/30
                    "
                >
                    {data.isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Generate
                        </>
                    )}
                </button>
            </div>

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-4 !h-4 !bg-orange-500 !border-2 !border-orange-300 !-bottom-2"
            />
        </div>
    );
});

InputNode.displayName = 'InputNode';

export default InputNode;
export type { InputNodeData, InputNodeType };
