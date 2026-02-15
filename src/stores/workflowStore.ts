/**
 * Dynamic Workflow Store - Zustand State Management
 * Features:
 * - Single input node start
 * - Dynamic unlimited node spawning
 * - Parallel research branches
 * - Collaborator synthesis node
 */

import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';

// =============================================================================
// TYPES
// =============================================================================

export type NodeStatus = 'idle' | 'waiting' | 'running' | 'completed' | 'failed';
export type NodeType = 'input' | 'research' | 'web-search' | 'calculator' | 'api-caller' | 'code-analyzer' | 'collaborator' | 'preview';

export interface WorkflowNodeData {
    [key: string]: unknown;
    type: NodeType;
    status: NodeStatus;
    label?: string;
    // Input specific
    goal?: string;
    // Research node specific
    researchType?: string;
    prompt?: string;
    result?: string;
    // Web search specific
    query?: string;
    results?: Array<{ title: string; url: string; snippet: string; score?: number }>;
    answer?: string;
    // Calculator specific
    expression?: string;
    formatted?: string;
    steps?: string[];
    // API Caller specific
    endpoint?: string;
    method?: string;
    data?: any;
    statusCode?: number;
    // Code Analyzer specific
    code?: string;
    analysis?: {
        lines: number;
        functions: number;
        classes: number;
        imports: number;
        complexity?: string;
        patterns?: string[];
        suggestions?: string[];
    };
    // Collaborator specific
    conflictResolutions?: Array<{ conflict: string; decision: string; reason: string }>;
    unifiedBlueprint?: string;
    // Preview specific
    htmlCode?: string;
    generatedFiles?: Array<{
        name: string;
        path: string;
        content: string;
        language: string;
    }>;
    // Meta
    error?: string;
    timestamp?: Date;
    apiEndpoint?: string;
}

export type WorkflowNode = Node<WorkflowNodeData>;

// Research branch types
export const RESEARCH_BRANCHES = [
    { key: 'tech_research', label: 'Tech Research', icon: '🔧', prompt: 'Analyze the best technical stack and architecture for: ' },
    { key: 'ux_design', label: 'UX Design', icon: '🎨', prompt: 'Provide UX/UI design recommendations for: ' },
    { key: 'market_analysis', label: 'Market Analysis', icon: '📊', prompt: 'Analyze market trends and competitors for: ' },
    { key: 'user_psychology', label: 'User Psychology', icon: '🧠', prompt: 'Analyze user behavior and psychology for: ' },
    { key: 'seo_content', label: 'SEO & Content', icon: '📝', prompt: 'Provide SEO and content strategy for: ' },
    { key: 'performance', label: 'Performance', icon: '⚡', prompt: 'Analyze performance requirements and optimizations for: ' },
    { key: 'accessibility', label: 'Accessibility', icon: '♿', prompt: 'Provide accessibility guidelines for: ' },
    { key: 'monetization', label: 'Monetization', icon: '💰', prompt: 'Suggest monetization strategies for: ' },
];

export interface WorkflowState {
    // Graph State
    nodes: WorkflowNode[];
    edges: Edge[];

    // Execution State
    isExecuting: boolean;
    completedNodes: Set<string>;
    userGoal: string;

    // Results
    parallelResults: Array<{ sourceNode: string; content: string }>;
    finalBlueprint: Record<string, unknown> | null;
    finalHTML: string;

    // Advanced Features
    selectedTemplate: string;
    selectedModel: string;
    promptHistory: Array<{ timestamp: Date; prompt: string; response: string }>;
    executionStats: {
        totalExecutions: number;
        successRate: number;
        averageExecutionTime: number;
    };

    // Actions
    setUserGoal: (goal: string) => void;
    setSelectedTemplate: (template: string) => void;
    spawnResearchNodes: (count: number) => void;
    addCollaboratorNode: () => void;
    addPreviewNode: () => void;

    // Node Management
    updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
    onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;

    // Execution
    setExecuting: (executing: boolean) => void;
    setNodeStatus: (nodeId: string, status: NodeStatus) => void;
    markNodeCompleted: (nodeId: string, result: string) => void;
    markNodeFailed: (nodeId: string, error: string) => void;
    addParallelResult: (sourceNode: string, content: string) => void;
    setFinalBlueprint: (blueprint: Record<string, unknown>) => void;
    setFinalHTML: (html: string) => void;

    // Reset
    resetWorkflow: () => void;
}

// =============================================================================
// INITIAL STATE - ONLY INPUT NODE
// =============================================================================

const createInitialNodes = (): WorkflowNode[] => [
    {
        id: 'input-1',
        type: 'dynamic-input',
        position: { x: 400, y: 50 },
        data: {
            label: 'Your Goal',
            type: 'input',
            status: 'idle',
            prompt: '',
        },
    },
];

// =============================================================================
// STORE
// =============================================================================

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    // Initial State
    nodes: createInitialNodes(),
    edges: [],
    isExecuting: false,
    completedNodes: new Set<string>(),
    userGoal: '',
    parallelResults: [],
    finalBlueprint: null,
    finalHTML: '',
    selectedTemplate: 'modern-landing',
    selectedModel: 'nvidia/nemotron-3-nano-30b-a3b:free',
    promptHistory: [],
    executionStats: {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
    },

    // Set user goal
    setUserGoal: (goal) => set({ userGoal: goal }),

    // Set selected template
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),

    // Spawn research nodes dynamically
    spawnResearchNodes: (count) => set((state) => {
        const branchesToUse = RESEARCH_BRANCHES.slice(0, Math.min(count, RESEARCH_BRANCHES.length));
        const spacing = 180;
        const totalWidth = branchesToUse.length * spacing;
        const startX = 400 - (totalWidth / 2) + (spacing / 2);

        const newNodes: WorkflowNode[] = branchesToUse.map((branch, index) => ({
            id: `research-${branch.key}-${Date.now()}`,
            type: 'researchNode',
            position: { x: startX + (index * spacing), y: 200 },
            data: {
                label: branch.label,
                type: 'research' as NodeType,
                status: 'idle' as NodeStatus,
                researchType: branch.key,
                prompt: branch.prompt + state.userGoal,
            },
        }));

        const newEdges: Edge[] = newNodes.map((node) => ({
            id: `edge-input-${node.id}`,
            source: 'input-1',
            target: node.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#f97316', strokeWidth: 2 },
        }));

        return {
            nodes: [...state.nodes, ...newNodes],
            edges: [...state.edges, ...newEdges],
        };
    }),

    // Add collaborator node
    addCollaboratorNode: () => set((state) => {
        const researchNodes = state.nodes.filter(n => n.data.type === 'research');
        const collaboratorId = `collaborator-${Date.now()}`;

        const newNode: WorkflowNode = {
            id: collaboratorId,
            type: 'collaboratorNode',
            position: { x: 400, y: 450 },
            data: {
                label: 'Chief Architect',
                type: 'collaborator',
                status: 'idle',
            },
        };

        const newEdges: Edge[] = researchNodes.map((node) => ({
            id: `edge-${node.id}-${collaboratorId}`,
            source: node.id,
            target: collaboratorId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
        }));

        return {
            nodes: [...state.nodes, newNode],
            edges: [...state.edges, ...newEdges],
        };
    }),

    // Add preview node
    addPreviewNode: () => set((state) => {
        const collaboratorNode = state.nodes.find(n => n.data.type === 'collaborator');
        if (!collaboratorNode) return state;

        const previewId = `preview-${Date.now()}`;
        const newNode: WorkflowNode = {
            id: previewId,
            type: 'previewNode',
            position: { x: 400, y: 700 },
            data: {
                label: 'HTML Output',
                type: 'preview',
                status: 'idle',
            },
        };

        const newEdge: Edge = {
            id: `edge-${collaboratorNode.id}-${previewId}`,
            source: collaboratorNode.id,
            target: previewId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 },
        };

        return {
            nodes: [...state.nodes, newNode],
            edges: [...state.edges, newEdge],
        };
    }),

    // Update node
    updateNode: (nodeId, data) => set((state) => ({
        nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        ),
    })),

    // React Flow handlers
    onNodesChange: (changes) => set((state) => ({
        nodes: applyNodeChanges(changes, state.nodes),
    })),

    onEdgesChange: (changes) => set((state) => ({
        edges: applyEdgeChanges(changes, state.edges),
    })),

    onConnect: (connection) => set((state) => ({
        edges: addEdge({ ...connection, type: 'smoothstep', animated: true }, state.edges),
    })),

    // Execution
    setExecuting: (executing) => set({ isExecuting: executing }),

    setNodeStatus: (nodeId, status) => set((state) => ({
        nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status } } : n
        ),
    })),

    markNodeCompleted: (nodeId, result) => set((state) => {
        const newCompleted = new Set(state.completedNodes);
        newCompleted.add(nodeId);
        return {
            nodes: state.nodes.map((n) =>
                n.id === nodeId
                    ? { ...n, data: { ...n.data, status: 'completed' as NodeStatus, result, timestamp: new Date() } }
                    : n
            ),
            completedNodes: newCompleted,
        };
    }),

    markNodeFailed: (nodeId, error) => set((state) => ({
        nodes: state.nodes.map((n) =>
            n.id === nodeId
                ? { ...n, data: { ...n.data, status: 'failed' as NodeStatus, error } }
                : n
        ),
    })),

    addParallelResult: (sourceNode, content) => set((state) => ({
        parallelResults: [...state.parallelResults, { sourceNode, content }],
    })),

    setFinalBlueprint: (blueprint) => set({ finalBlueprint: blueprint }),

    setFinalHTML: (html) => set({ finalHTML: html }),

    // Reset
    resetWorkflow: () => set({
        nodes: createInitialNodes(),
        edges: [],
        isExecuting: false,
        completedNodes: new Set<string>(),
        userGoal: '',
        parallelResults: [],
        finalBlueprint: null,
        finalHTML: '',
    }),
}));
