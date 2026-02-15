/**
 * DynamicWorkflowCanvas - Unlimited Parallel Research Workflow
 * Features:
 * - Single input node start
 * - Dynamic node spawning
 * - Parallel API calls
 * - Collaborator synthesis
 * - Live HTML preview
 * - Dark theme with white text accents
 */

import { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Panel,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { RotateCcw, Image, Info, ZoomIn, ZoomOut, Maximize, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Store & Hooks
import { useWorkflowStore } from '@/stores/workflowStore';
import { useDynamicWorkflow } from '@/hooks/useWorkflowExecutor';

import DynamicInputNode from './nodes/DynamicInputNode';
import ResearchNode from './nodes/ResearchNode';
import CollaboratorNode from './nodes/CollaboratorNode';
import PreviewNode from './nodes/PreviewNode';
import WebSearchNode from './nodes/WebSearchNode';
import CalculatorNode from './nodes/CalculatorNode';
import ApiCallerNode from './nodes/ApiCallerNode';
import CodeAnalyzerNode from './nodes/CodeAnalyzerNode';

// =============================================================================
// NODE & EDGE TYPES
// =============================================================================

const nodeTypes = {
    // All node type variations used in the workflow
    'dynamic-input': DynamicInputNode,
    'inputNode': DynamicInputNode,
    research: ResearchNode,
    'researchNode': ResearchNode,
    'web-search': WebSearchNode,
    'webSearchNode': WebSearchNode,
    calculator: CalculatorNode,
    'calculatorNode': CalculatorNode,
    'api-caller': ApiCallerNode,
    'apiCallerNode': ApiCallerNode,
    'code-analyzer': CodeAnalyzerNode,
    'codeAnalyzerNode': CodeAnalyzerNode,
    collaborator: CollaboratorNode,
    'collaboratorNode': CollaboratorNode,
    preview: PreviewNode,
    'previewNode': PreviewNode,
};

// =============================================================================
// CANVAS CONTENT
// =============================================================================

function WorkflowCanvasContent() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { fitView, zoomIn, zoomOut } = useReactFlow();

    // Store state
    const nodes = useWorkflowStore((state) => state.nodes);
    const edges = useWorkflowStore((state) => state.edges);
    const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
    const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
    const onConnect = useWorkflowStore((state) => state.onConnect);

    // Workflow executor
    const { isExecuting, resetWorkflow } = useDynamicWorkflow();

    // Export functions
    const exportToPng = useCallback(async () => {
        if (!reactFlowWrapper.current) return;

        try {
            const dataUrl = await toPng(reactFlowWrapper.current, {
                backgroundColor: '#0a0a0a',
                quality: 1,
            });

            const link = document.createElement('a');
            link.download = `gnexus-workflow-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Workflow exported as PNG');
        } catch {
            toast.error('Failed to export');
        }
    }, []);

    // Handle reset
    const handleReset = useCallback(() => {
        resetWorkflow();
        toast.info('Ready for new flow');
    }, [resetWorkflow]);

    return (
        <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                proOptions={{ hideAttribution: true }}
                className="!bg-[#0a0a0a]"
                minZoom={0.1}
                maxZoom={2}
            >
                {/* Dot Grid Background - dark theme */}
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1}
                    color="rgba(249, 115, 22, 0.15)"
                />

                {/* Mini Map - dark styled */}
                <MiniMap
                    nodeColor={(node) => {
                        const nodeType = node.data?.type as string;
                        switch (nodeType) {
                            case 'input': return '#f97316';
                            case 'research': return '#3b82f6';
                            case 'collaborator': return '#8b5cf6';
                            case 'preview': return '#10b981';
                            default: return '#6b7280';
                        }
                    }}
                    maskColor="rgba(0, 0, 0, 0.7)"
                    className="!bg-[#111111] !border !border-orange-500/20 !rounded-lg"
                    nodeStrokeWidth={3}
                />

                {/* Controls - dark styled */}
                <Controls
                    showZoom={false}
                    showFitView={false}
                    showInteractive={false}
                    className="!bg-[#111111] !border !border-gray-800 !rounded-lg !shadow-xl"
                />

                {/* Info Panel - dark glassmorphism */}
                <Panel position="top-center" className="flex gap-2 items-center">
                    <div className="bg-[#111111]/90 backdrop-blur-xl border border-orange-500/20 rounded-xl px-5 py-2.5 flex items-center gap-3 shadow-xl shadow-black/50">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-sm font-medium text-white">
                            {isExecuting ? 'Workflow Running...' : 'Enter a goal to start'}
                        </span>
                    </div>
                </Panel>

                {/* Toolbar - dark styled */}
                <Panel position="top-right" className="flex gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleReset}
                        disabled={isExecuting}
                        className="bg-orange-600 hover:bg-orange-700 text-white border border-orange-500 shadow-lg shadow-orange-900/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Flow
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPng}
                        className="bg-[#111111]/90 backdrop-blur-xl border-gray-800 text-white hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400"
                    >
                        <Image className="w-4 h-4 mr-2" />
                        PNG
                    </Button>
                </Panel>

                {/* Zoom Controls - dark styled */}
                <Panel position="top-left" className="flex gap-1.5">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => zoomIn()}
                        className="bg-[#111111]/90 backdrop-blur-xl border-gray-800 text-white hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400 h-9 w-9"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => zoomOut()}
                        className="bg-[#111111]/90 backdrop-blur-xl border-gray-800 text-white hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400 h-9 w-9"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fitView({ padding: 0.3, duration: 500 })}
                        className="bg-[#111111]/90 backdrop-blur-xl border-gray-800 text-white hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400 h-9 w-9"
                    >
                        <Maximize className="w-4 h-4" />
                    </Button>
                </Panel>

                {/* Legend - dark glassmorphism */}
                <Panel position="bottom-left" className="bg-[#111111]/90 backdrop-blur-xl border border-gray-800 rounded-xl p-4 shadow-xl shadow-black/50">
                    <div className="text-xs font-semibold text-white/80 mb-3 uppercase tracking-wider">Node Types</div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/30" />
                            <span className="text-xs text-white/70">Input</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
                            <span className="text-xs text-white/70">Research</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/30" />
                            <span className="text-xs text-white/70">Web Search</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30" />
                            <span className="text-xs text-white/70">Calculator</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
                            <span className="text-xs text-white/70">API Caller</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30" />
                            <span className="text-xs text-white/70">Code Analyzer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30" />
                            <span className="text-xs text-white/70">Collaborator</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                            <span className="text-xs text-white/70">Preview</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

// =============================================================================
// MAIN EXPORT (with Provider)
// =============================================================================

export default function WorkflowCanvas() {
    return (
        <ReactFlowProvider>
            <WorkflowCanvasContent />
        </ReactFlowProvider>
    );
}
