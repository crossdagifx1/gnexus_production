/**
 * FlowCanvas - Main React Flow Canvas Component
 * Tree-based workflow: Input → Branches → Process → HTML Output
 */

import { useCallback, useRef, useMemo, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    Panel,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import { Download, Image, FileCode, ZoomIn, ZoomOut, Maximize, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Node Components
import InputNode from './nodes/InputNode';
import ResponseNode from './nodes/ResponseNode';
import AddNode from './nodes/AddNode';
import ProcessNode from './nodes/ProcessNode';
import OutputNode from './nodes/OutputNode';
import CustomEdge from './edges/CustomEdge';

// =============================================================================
// TYPES
// =============================================================================

export interface FlowCanvasProps {
    onNodeSubmit?: (nodeId: string, value: string) => void;
    onGenerateHTML?: (content: string) => void;
}

// =============================================================================
// NODE & EDGE TYPES
// =============================================================================

const nodeTypes = {
    input: InputNode,
    response: ResponseNode,
    add: AddNode,
    process: ProcessNode,
    output: OutputNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

// =============================================================================
// INITIAL TREE STRUCTURE
// =============================================================================

const createInitialNodes = (): Node[] => [
    // Input at top
    {
        id: 'input-1',
        type: 'input',
        position: { x: 400, y: 0 },
        data: { label: 'In' },
    },
    // Level 1 - Two branches
    {
        id: 'process-1a',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Branch 1', status: 'idle' },
    },
    {
        id: 'process-1b',
        type: 'process',
        position: { x: 500, y: 150 },
        data: { label: 'Branch 2', status: 'idle' },
    },
    // Level 2 - Sub-branches from left
    {
        id: 'process-2a',
        type: 'process',
        position: { x: 80, y: 300 },
        data: { label: 'Sub 1.1', status: 'idle' },
    },
    {
        id: 'process-2b',
        type: 'process',
        position: { x: 200, y: 300 },
        data: { label: 'Sub 1.2', status: 'idle' },
    },
    // Level 2 - Sub-branches from right
    {
        id: 'process-2c',
        type: 'process',
        position: { x: 400, y: 300 },
        data: { label: 'Sub 2.1', status: 'idle' },
    },
    {
        id: 'process-2d',
        type: 'process',
        position: { x: 520, y: 300 },
        data: { label: 'Sub 2.2', status: 'idle' },
    },
    {
        id: 'process-2e',
        type: 'process',
        position: { x: 640, y: 300 },
        data: { label: 'Sub 2.3', status: 'idle' },
    },
    // Level 3 - Merge nodes
    {
        id: 'merge-1',
        type: 'response',
        position: { x: 180, y: 450 },
        data: { content: '', status: 'idle', agentName: 'Merge 1' },
    },
    {
        id: 'merge-2',
        type: 'response',
        position: { x: 450, y: 450 },
        data: { content: '', status: 'idle', agentName: 'Merge 2' },
    },
    // HTML Output at bottom
    {
        id: 'output-1',
        type: 'output',
        position: { x: 320, y: 650 },
        data: { status: 'idle' },
    },
];

const createInitialEdges = (): Edge[] => [
    // Input to Level 1
    { id: 'e-in-1a', source: 'input-1', target: 'process-1a', type: 'custom' },
    { id: 'e-in-1b', source: 'input-1', target: 'process-1b', type: 'custom' },
    // Level 1 to Level 2 (left branch)
    { id: 'e-1a-2a', source: 'process-1a', target: 'process-2a', type: 'custom' },
    { id: 'e-1a-2b', source: 'process-1a', target: 'process-2b', type: 'custom' },
    // Level 1 to Level 2 (right branch)
    { id: 'e-1b-2c', source: 'process-1b', target: 'process-2c', type: 'custom' },
    { id: 'e-1b-2d', source: 'process-1b', target: 'process-2d', type: 'custom' },
    { id: 'e-1b-2e', source: 'process-1b', target: 'process-2e', type: 'custom' },
    // Level 2 to Merge
    { id: 'e-2a-m1', source: 'process-2a', target: 'merge-1', type: 'custom' },
    { id: 'e-2b-m1', source: 'process-2b', target: 'merge-1', type: 'custom' },
    { id: 'e-2c-m2', source: 'process-2c', target: 'merge-2', type: 'custom' },
    { id: 'e-2d-m2', source: 'process-2d', target: 'merge-2', type: 'custom' },
    { id: 'e-2e-m2', source: 'process-2e', target: 'merge-2', type: 'custom' },
    // Merge to Output
    { id: 'e-m1-out', source: 'merge-1', target: 'output-1', type: 'custom' },
    { id: 'e-m2-out', source: 'merge-2', target: 'output-1', type: 'custom' },
];

// =============================================================================
// CANVAS CONTENT
// =============================================================================

function FlowCanvasContent({ onNodeSubmit, onGenerateHTML }: FlowCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { fitView, zoomIn, zoomOut } = useReactFlow();
    const [isRunning, setIsRunning] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());

    // Handle new connections
    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
        },
        [setEdges]
    );

    // Run the workflow
    const runWorkflow = useCallback(async () => {
        setIsRunning(true);
        toast.info('Running workflow...');

        // Get input value from input node
        const inputNode = nodes.find(n => n.id === 'input-1');
        const inputValue = (inputNode?.data as { value?: string })?.value || 'Sample input';

        // Simulate processing through levels
        const processOrder = [
            ['process-1a', 'process-1b'],
            ['process-2a', 'process-2b', 'process-2c', 'process-2d', 'process-2e'],
            ['merge-1', 'merge-2'],
        ];

        for (const level of processOrder) {
            // Update nodes to processing
            setNodes(nds => nds.map(n =>
                level.includes(n.id)
                    ? { ...n, data: { ...n.data, status: 'processing' } }
                    : n
            ));

            await new Promise(resolve => setTimeout(resolve, 800));

            // Update nodes to completed
            setNodes(nds => nds.map(n =>
                level.includes(n.id)
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            status: 'completed',
                            content: n.type === 'response'
                                ? `Processed: ${inputValue}\nNode: ${n.id}`
                                : undefined
                        }
                    }
                    : n
            ));
        }

        // Generate HTML output
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>G-Nexus Assistant Output</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #fff;
            min-height: 100vh;
            padding: 40px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { 
            font-size: 2.5rem; 
            background: linear-gradient(90deg, #f97316, #fb923c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
        }
        .card h2 { color: #f97316; font-size: 1.2rem; margin-bottom: 12px; }
        .card p { color: #a3a3a3; line-height: 1.6; }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            color: #525252;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 G-Nexus Assistant Output</h1>
        
        <div class="card">
            <h2>Input Received</h2>
            <p>${inputValue}</p>
        </div>
        
        <div class="card">
            <h2>Processing Summary</h2>
            <p>✓ Branch 1 processed with 2 sub-nodes</p>
            <p>✓ Branch 2 processed with 3 sub-nodes</p>
            <p>✓ Results merged successfully</p>
        </div>
        
        <div class="card">
            <h2>Generated Content</h2>
            <p>This HTML was generated by the G-Nexus Assistant workflow tree.</p>
            <p>All branches processed successfully and merged into this output.</p>
        </div>
        
        <div class="footer">
            Generated by G-Nexus Assistant • ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

        // Update output node
        setNodes(nds => nds.map(n =>
            n.id === 'output-1'
                ? { ...n, data: { ...n.data, status: 'ready', htmlContent } }
                : n
        ));

        setIsRunning(false);
        toast.success('Workflow complete! HTML ready to download.');
        onGenerateHTML?.(htmlContent);
    }, [nodes, setNodes, onGenerateHTML]);

    // Reset workflow
    const resetWorkflow = useCallback(() => {
        setNodes(createInitialNodes());
        setEdges(createInitialEdges());
        toast.info('Workflow reset');
    }, [setNodes, setEdges]);

    // Update input node with submit handler
    const nodesWithHandlers = useMemo(
        () =>
            nodes.map((node) => {
                if (node.type === 'input' && !node.data.onSubmit) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            onSubmit: (value: string) => {
                                setNodes(nds => nds.map(n =>
                                    n.id === node.id
                                        ? { ...n, data: { ...n.data, value } }
                                        : n
                                ));
                                onNodeSubmit?.(node.id, value);
                            },
                        },
                    };
                }
                return node;
            }),
        [nodes, setNodes, onNodeSubmit]
    );

    // Export functions
    const exportToPng = useCallback(async () => {
        if (!reactFlowWrapper.current) return;

        try {
            const dataUrl = await toPng(reactFlowWrapper.current, {
                backgroundColor: '#f8fafc',
                quality: 1,
            });

            const link = document.createElement('a');
            link.download = `gnexus-workflow-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Workflow exported as PNG');
        } catch (error) {
            toast.error('Failed to export');
        }
    }, []);

    const exportToSvg = useCallback(async () => {
        if (!reactFlowWrapper.current) return;

        try {
            const dataUrl = await toSvg(reactFlowWrapper.current, {
                backgroundColor: '#f8fafc',
            });

            const link = document.createElement('a');
            link.download = `gnexus-workflow-${Date.now()}.svg`;
            link.href = dataUrl;
            link.click();

            toast.success('Workflow exported as SVG');
        } catch (error) {
            toast.error('Failed to export');
        }
    }, []);

    return (
        <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
                nodes={nodesWithHandlers}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                className="bg-slate-50"
            >
                {/* Dot Grid Background */}
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#cbd5e1"
                />

                {/* Mini Map */}
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'input': return '#f97316';
                            case 'response': return '#3b82f6';
                            case 'process': return '#8b5cf6';
                            case 'output': return '#10b981';
                            case 'add': return '#ec4899';
                            default: return '#6b7280';
                        }
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                    className="!bg-white/80 !border !border-gray-200 !rounded-lg"
                />

                {/* Controls */}
                <Controls
                    showZoom={false}
                    showFitView={false}
                    showInteractive={false}
                    className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm"
                />

                {/* Run Workflow Button */}
                <Panel position="top-center" className="flex gap-2">
                    <Button
                        onClick={runWorkflow}
                        disabled={isRunning}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunning ? 'Running...' : 'Run Workflow'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={resetWorkflow}
                        disabled={isRunning}
                        className="bg-white"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </Panel>

                {/* Export Toolbar */}
                <Panel position="top-right" className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPng}
                        className="bg-white/90 backdrop-blur-sm"
                    >
                        <Image className="w-4 h-4 mr-2" />
                        PNG
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToSvg}
                        className="bg-white/90 backdrop-blur-sm"
                    >
                        <FileCode className="w-4 h-4 mr-2" />
                        SVG
                    </Button>
                </Panel>

                {/* Zoom Controls */}
                <Panel position="top-left" className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => zoomIn()}
                        className="bg-white/90 backdrop-blur-sm h-8 w-8"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => zoomOut()}
                        className="bg-white/90 backdrop-blur-sm h-8 w-8"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fitView({ padding: 0.2, duration: 500 })}
                        className="bg-white/90 backdrop-blur-sm h-8 w-8"
                    >
                        <Maximize className="w-4 h-4" />
                    </Button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

// =============================================================================
// MAIN EXPORT (with Provider)
// =============================================================================

export default function FlowCanvas(props: FlowCanvasProps) {
    return (
        <ReactFlowProvider>
            <FlowCanvasContent {...props} />
        </ReactFlowProvider>
    );
}
