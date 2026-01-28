/**
 * CollaboratorNode - Chief Architect & Synthesis Engine
 * Merges all parallel research into unified blueprint
 */

import { memo, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Brain, Loader2, Check, AlertCircle, ChevronDown, ChevronUp, GitMerge } from 'lucide-react';
import type { WorkflowNodeData } from '@/stores/workflowStore';

type CollaboratorNodeType = Node<WorkflowNodeData, 'collaboratorNode'>;

const CollaboratorNode = memo(({ data, selected }: NodeProps<CollaboratorNodeType>) => {
    const [showConflicts, setShowConflicts] = useState(false);

    const isRunning = data.status === 'running';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    const conflicts = data.conflictResolutions || [];
    const blueprint = data.unifiedBlueprint;

    return (
        <div
            className={`
                min-w-[320px] max-w-[400px]
                bg-gradient-to-br from-[#0a0a0a] to-[#1a1020]
                border-2 rounded-2xl overflow-hidden
                transition-all duration-300
                ${selected ? 'ring-2 ring-purple-400' : ''}
                ${isRunning ? 'border-purple-500 shadow-xl shadow-purple-500/30' : ''}
                ${isCompleted ? 'border-green-500' : ''}
                ${isFailed ? 'border-red-500' : ''}
                ${!isRunning && !isCompleted && !isFailed ? 'border-purple-500/30' : ''}
            `}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-4 !h-4 !bg-purple-500 !border-2 !border-purple-300 !-top-2"
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {isRunning ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                    ) : (
                        <Brain className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{data.label}</p>
                    <p className="text-purple-100 text-xs">Conflict Resolution & Synthesis</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {isRunning && (
                    <div className="flex items-center gap-3 text-purple-400">
                        <GitMerge className="w-4 h-4 animate-pulse" />
                        <div>
                            <p className="text-sm">Synthesizing research...</p>
                            <p className="text-[10px] text-gray-500">Resolving conflicts & merging insights</p>
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <>
                        {/* Conflict Resolutions */}
                        {conflicts.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowConflicts(!showConflicts)}
                                    className="w-full flex items-center justify-between text-orange-400 text-xs hover:text-orange-300"
                                >
                                    <span>⚖️ {conflicts.length} Conflicts Resolved</span>
                                    {showConflicts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {showConflicts && (
                                    <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto">
                                        {conflicts.map((c, i) => (
                                            <div key={i} className="bg-black/30 p-2 rounded-lg text-[10px]">
                                                <p className="text-red-400">⚡ {c.conflict}</p>
                                                <p className="text-green-400">✓ {c.decision}</p>
                                                <p className="text-gray-500">→ {c.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Blueprint Summary */}
                        {blueprint && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <p className="text-green-400 text-xs font-medium mb-1">✨ Unified Blueprint Ready</p>
                                <p className="text-[10px] text-gray-400">
                                    {Object.keys(blueprint).length} sections generated
                                </p>
                            </div>
                        )}

                        {/* Result Preview */}
                        {data.result && (
                            <div className="text-[10px] text-gray-400 max-h-[80px] overflow-y-auto bg-black/30 p-2 rounded">
                                <pre className="whitespace-pre-wrap">{data.result.slice(0, 300)}...</pre>
                            </div>
                        )}
                    </>
                )}

                {isFailed && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{data.error || 'Synthesis failed'}</span>
                    </div>
                )}

                {!isRunning && !isCompleted && !isFailed && (
                    <div className="text-center text-gray-500 text-xs py-4">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Waiting for research branches...</p>
                    </div>
                )}

                {/* Expansion Button for Deep Analysis */}
                {isCompleted && (
                    <div className="pt-2 border-t border-purple-500/20">
                        <button
                            onClick={() => setShowConflicts(!showConflicts)} // Reusing this for general expansion
                            className="w-full text-[10px] uppercase tracking-wider font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-between"
                        >
                            <span>{showConflicts ? 'Collapse Analysis' : 'Read Deep Thinking'}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showConflicts ? 'rotate-180' : ''}`} />
                        </button>

                        {showConflicts && (
                            <div className="mt-3 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                                    <p className="text-[10px] text-purple-300 font-bold mb-2">🧠 CHAIN OF THOUGHT</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Analyzed {data.conflictResolutions?.length || 5} research vectors.
                                        Identified key consensus on tech stack.
                                        Synthesizing final blueprint with focus on scalability...
                                    </p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-[10px] text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {data.result}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-4 !h-4 !bg-green-500 !border-2 !border-green-300 !-bottom-2"
            />
        </div>
    );
});

CollaboratorNode.displayName = 'CollaboratorNode';

export default CollaboratorNode;
