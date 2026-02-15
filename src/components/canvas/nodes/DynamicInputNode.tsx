/**
 * DynamicInputNode - Single Starting Point
 * User enters goal here to spawn parallel research nodes
 */

import { memo, useState, useCallback } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import type { WorkflowNodeData } from '@/stores/workflowStore';

type InputNodeType = Node<WorkflowNodeData, 'inputNode'>;

// Import the hook
import { useDynamicWorkflow } from '@/hooks/useWorkflowExecutor';

const DynamicInputNode = memo(({ data, selected }: NodeProps<InputNodeType>) => {
    const [goal, setGoal] = useState('');
    const [branchCount, setBranchCount] = useState(5);
    const isProcessing = data.status === 'running';
    const isCompleted = data.status === 'completed';

    // Use the hook
    const { startWorkflow } = useDynamicWorkflow();

    const handleSubmit = useCallback(() => {
        if (goal.trim()) {
            startWorkflow(goal.trim());
        }
    }, [goal, branchCount, startWorkflow]);

    return (
        <div
            className={`
                min-w-[380px] max-w-[450px]
                bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]
                border-2 rounded-2xl overflow-hidden
                transition-all duration-300
                ${selected ? 'border-orange-500 shadow-2xl shadow-orange-500/20' : 'border-orange-500/30'}
                ${isCompleted ? 'border-green-500/50' : ''}
            `}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">G-NEXUS WORKFLOW</p>
                    <p className="text-orange-100 text-xs">Parallel AI Research Engine</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Goal Input */}
                <div>
                    <label className="text-orange-400 text-xs font-medium mb-2 block">
                        What do you want to build?
                    </label>
                    <textarea
                        value={isCompleted ? (data.prompt || goal) : goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., Build a high-performance dashboard for crypto trading..."
                        className="
                            w-full min-h-[100px] p-3
                            bg-black/50 border border-orange-500/30 rounded-lg
                            text-white text-sm placeholder:text-gray-500
                            focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50
                            resize-none
                        "
                        disabled={isProcessing || isCompleted}
                    />
                </div>

                {/* Branch Count Slider */}
                {!isCompleted && (
                    <div>
                        <label className="text-orange-400 text-xs font-medium mb-2 flex justify-between">
                            <span>Research Branches</span>
                            <span className="text-white">{branchCount}</span>
                        </label>
                        <input
                            type="range"
                            min="2"
                            max="8"
                            value={branchCount}
                            onChange={(e) => setBranchCount(Number(e.target.value))}
                            className="w-full accent-orange-500"
                            disabled={isProcessing}
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                            <span>Fast (2)</span>
                            <span>Deep (8)</span>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                {!isCompleted && (
                    <button
                        onClick={handleSubmit}
                        disabled={!goal.trim() || isProcessing}
                        className="
                            w-full py-3 px-4
                            bg-gradient-to-r from-orange-500 to-orange-600
                            text-white font-medium text-sm
                            rounded-lg flex items-center justify-center gap-2
                            hover:from-orange-600 hover:to-orange-700
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all shadow-lg shadow-orange-500/30
                        "
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Spawning Research Agents...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Launch Parallel Research
                            </>
                        )}
                    </button>
                )}

                {/* Completed State */}
                {isCompleted && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Research branches spawned
                    </div>
                )}
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

DynamicInputNode.displayName = 'DynamicInputNode';

export default DynamicInputNode;
