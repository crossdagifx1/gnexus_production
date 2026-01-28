import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AI_MODELS, generateText, AgentTask } from '@/lib/ai';
import { Play, Save, Trash2, Plus, Settings, GitBranch, Zap, Brain, Code, TrendingUp } from 'lucide-react';

interface WorkflowNode {
    id: string;
    type: 'agent' | 'input' | 'output' | 'condition';
    agentType?: string;
    prompt?: string;
    position: { x: number; y: number };
    config?: Record<string, any>;
}

interface WorkflowConnection {
    id: string;
    source: string;
    target: string;
    condition?: string;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    status: 'draft' | 'running' | 'completed' | 'error';
    createdAt: Date;
    updatedAt: Date;
}

const agentIcons = {
    coder: Code,
    marketing: TrendingUp,
    planner: GitBranch,
    analyst: Brain,
    agentic: Zap,
};

const WorkflowBuilder: React.FC = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [executionResults, setExecutionResults] = useState<AgentTask[]>([]);
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const createNewWorkflow = () => {
        const newWorkflow: Workflow = {
            id: `workflow_${Date.now()}`,
            name: `Workflow ${workflows.length + 1}`,
            description: '',
            nodes: [],
            connections: [],
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setCurrentWorkflow(newWorkflow);
        setWorkflows([...workflows, newWorkflow]);
    };

    const addNode = (type: WorkflowNode['type'], agentType?: string) => {
        if (!currentWorkflow) return;

        const newNode: WorkflowNode = {
            id: `node_${Date.now()}`,
            type,
            agentType,
            position: { x: 100 + currentWorkflow.nodes.length * 50, y: 100 + currentWorkflow.nodes.length * 30 },
        };

        const updatedWorkflow = {
            ...currentWorkflow,
            nodes: [...currentWorkflow.nodes, newNode],
            updatedAt: new Date(),
        };

        setCurrentWorkflow(updatedWorkflow);
        setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    };

    const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
        if (!currentWorkflow) return;

        const updatedWorkflow = {
            ...currentWorkflow,
            nodes: currentWorkflow.nodes.map(node =>
                node.id === nodeId ? { ...node, ...updates } : node
            ),
            updatedAt: new Date(),
        };

        setCurrentWorkflow(updatedWorkflow);
        setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    };

    const deleteNode = (nodeId: string) => {
        if (!currentWorkflow) return;

        const updatedWorkflow = {
            ...currentWorkflow,
            nodes: currentWorkflow.nodes.filter(node => node.id !== nodeId),
            connections: currentWorkflow.connections.filter(
                conn => conn.source !== nodeId && conn.target !== nodeId
            ),
            updatedAt: new Date(),
        };

        setCurrentWorkflow(updatedWorkflow);
        setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    };

    const executeWorkflow = async () => {
        if (!currentWorkflow) return;
        setIsRunning(true);
        setExecutionResults([]);

        try {
            const tasks: AgentTask[] = [];
            const agentNodes = currentWorkflow.nodes.filter(node => node.type === 'agent');

            for (const node of agentNodes) {
                if (node.agentType && node.prompt) {
                    const task: AgentTask = {
                        id: `task_${Date.now()}_${node.id}`,
                        agent: node.agentType as any,
                        prompt: node.prompt,
                        status: 'pending',
                    };

                    tasks.push(task);

                    // Execute the task
                    task.status = 'processing';
                    task.startTime = new Date();
                    setExecutionResults(prev => [...prev, { ...task }]);

                    const response = await generateText(node.agentType as any, node.prompt);

                    task.status = response.success ? 'completed' : 'failed';
                    task.result = response.data || response.error;
                    task.endTime = new Date();

                    setExecutionResults(prev =>
                        prev.map(t => t.id === task.id ? { ...task } : t)
                    );
                }
            }

            // Update workflow status
            const updatedWorkflow = {
                ...currentWorkflow,
                status: (tasks.every(t => t.status === 'completed') ? 'completed' : 'error') as 'completed' | 'error',
                updatedAt: new Date(),
            };

            setCurrentWorkflow(updatedWorkflow);
            setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));

        } catch (error) {
            console.error('Workflow execution failed:', error);
        } finally {
            setIsRunning(false);
        }
    };

    const onDragEnd = (result: any) => {
        if (!result.destination || !currentWorkflow) return;

        const items = Array.from(currentWorkflow.nodes);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedWorkflow = {
            ...currentWorkflow,
            nodes: items,
            updatedAt: new Date(),
        };

        setCurrentWorkflow(updatedWorkflow);
        setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    };

    const renderNode = (node: WorkflowNode) => {
        const Icon = node.agentType && agentIcons[node.agentType as keyof typeof agentIcons]
            ? agentIcons[node.agentType as keyof typeof agentIcons]
            : Settings;

        return (
            <div
                key={node.id}
                className={`absolute bg-card border rounded-lg p-4 cursor-move shadow-lg hover:shadow-xl transition-shadow ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                    }`}
                style={{ left: node.position.x, top: node.position.y }}
                onClick={() => setSelectedNode(node)}
            >
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">
                        {node.type === 'agent' ? AI_MODELS[node.agentType || 'planner']?.name : node.type}
                    </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                        }}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>

                {node.type === 'agent' && (
                    <div className="text-xs text-muted-foreground">
                        {node.prompt ? node.prompt.substring(0, 50) + '...' : 'No prompt set'}
                    </div>
                )}

                <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Input" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" title="Output" />
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Workflow Builder</h1>
                    <p className="text-muted-foreground">Create powerful multi-agent automation workflows</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={createNewWorkflow}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Workflow
                    </Button>
                </div>
            </div>

            {currentWorkflow && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{currentWorkflow.name}</span>
                            <div className="flex gap-2">
                                <Badge variant={currentWorkflow.status === 'draft' ? 'secondary' : 'default'}>
                                    {currentWorkflow.status}
                                </Badge>
                                <Button
                                    onClick={executeWorkflow}
                                    disabled={isRunning || currentWorkflow.nodes.length === 0}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {isRunning ? 'Running...' : 'Execute'}
                                </Button>
                                <Button variant="outline">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="w-48 space-y-2">
                                <h3 className="font-medium">Add Nodes</h3>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => addNode('input')}
                                >
                                    Input Node
                                </Button>

                                {Object.entries(AI_MODELS).map(([key, model]) => {
                                    const Icon = agentIcons[key as keyof typeof agentIcons];
                                    return (
                                        <Button
                                            key={key}
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => addNode('agent', key)}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {model.name}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => addNode('output')}
                                >
                                    Output Node
                                </Button>
                            </div>

                            <div
                                ref={canvasRef}
                                className="flex-1 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 relative min-h-[500px]"
                            >
                                {currentWorkflow.nodes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Start building your workflow by adding nodes</p>
                                        </div>
                                    </div>
                                )}

                                {currentWorkflow.nodes.map(renderNode)}
                            </div>
                        </div>

                        {executionResults.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-medium mb-2">Execution Results</h3>
                                <div className="space-y-2">
                                    {executionResults.map((result) => (
                                        <div key={result.id} className="p-3 bg-muted rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{result.agent}</span>
                                                <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
                                                    {result.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {result.result}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Node Configuration Dialog */}
            <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configure Node</DialogTitle>
                    </DialogHeader>
                    {selectedNode && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Prompt</label>
                                <Textarea
                                    value={selectedNode.prompt || ''}
                                    onChange={(e) => updateNode(selectedNode.id, { prompt: e.target.value })}
                                    placeholder="Enter the prompt for this agent..."
                                    className="mt-1"
                                />
                            </div>
                            {selectedNode.type === 'agent' && (
                                <div>
                                    <label className="text-sm font-medium">Agent Type</label>
                                    <Select
                                        value={selectedNode.agentType}
                                        onValueChange={(value) => updateNode(selectedNode.id, { agentType: value })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(AI_MODELS).map(([key, model]) => (
                                                <SelectItem key={key} value={key}>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Workflow List */}
            {workflows.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Workflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workflows.map((workflow) => (
                                <div
                                    key={workflow.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${currentWorkflow?.id === workflow.id
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted/50'
                                        }`}
                                    onClick={() => setCurrentWorkflow(workflow)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">{workflow.name}</h3>
                                        <Badge variant={workflow.status === 'draft' ? 'secondary' : 'default'}>
                                            {workflow.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {workflow.nodes.length} nodes • {workflow.connections.length} connections
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Updated {workflow.updatedAt.toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default WorkflowBuilder;
