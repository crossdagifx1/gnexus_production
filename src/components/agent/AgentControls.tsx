/**
 * Advanced Agent Controls Panel
 * Dark theme styling with orange accents
 * Connected to workflow execution and state management
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEMPLATE_TYPES, getTemplateTypeById } from '@/lib/htmlGenerators';
import { Settings, Zap, RotateCcw, Save, Sparkles, Play, Pause } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useDynamicWorkflow } from '@/hooks/useWorkflowExecutor';
import { toast } from 'sonner';

export function AgentControls() {
    const [branchCount, setBranchCount] = useState(4);
    const [localSelectedTemplate, setLocalSelectedTemplate] = useState('modern-landing');

    // Workflow state and execution
    const { isExecuting, userGoal, finalHTML, resetWorkflow, selectedTemplate, setSelectedTemplate } = useWorkflowStore();
    const { startWorkflow } = useDynamicWorkflow();

    const selectedTemplateData = getTemplateTypeById(selectedTemplate);

    const handleStartWorkflow = () => {
        if (!userGoal.trim()) {
            toast.error('Please enter a goal in the input node first');
            return;
        }
        startWorkflow(userGoal.trim());
    };

    const handleTemplateChange = (templateId: string) => {
        setLocalSelectedTemplate(templateId);
        setSelectedTemplate(templateId);
    };

    const handleReset = () => {
        resetWorkflow();
        toast.info('Workflow reset successfully');
    };

    const handleDownload = () => {
        if (finalHTML) {
            const blob = new Blob([finalHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gnexus-${userGoal.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('HTML downloaded successfully!');
        }
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-white font-bold">Agent Controls</h2>
                    <p className="text-gray-500 text-xs">Configure workflow settings</p>
                </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    HTML Template
                </h3>
                <div className="space-y-2">
                    {TEMPLATE_TYPES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleTemplateChange(template.id)}
                            className={`
                                w-full p-3 rounded-xl border-2 transition-all text-left
                                ${selectedTemplate === template.id
                                    ? 'border-orange-500 bg-orange-500/10'
                                    : 'border-gray-800 hover:border-gray-700 bg-black/30'
                                }
                            `}
                        >
                            <div className="font-medium text-sm text-white">{template.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Branch Configuration */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Research Branches
                </h3>
                <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Parallel branches</span>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {branchCount} branches
                        </Badge>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="8"
                        value={branchCount}
                        onChange={(e) => setBranchCount(Number(e.target.value))}
                        className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                        <span>Fast (2)</span>
                        <span>Balanced (5)</span>
                        <span>Deep (8)</span>
                    </div>
                </div>
            </div>

            {/* Template Info */}
            {selectedTemplateData && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-orange-400">Selected Template</h3>
                    <div className="p-4 bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="font-medium text-white">{selectedTemplateData.name}</span>
                            <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-[10px]">
                                {selectedTemplateData.category}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{selectedTemplateData.description}</p>
                    </div>
                </div>
            )}

            {/* Workflow Status */}
            {userGoal && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-orange-400">Current Workflow</h3>
                    <div className="p-3 bg-black/30 border border-gray-800 rounded-xl">
                        <div className="text-xs text-gray-400 mb-1">Goal:</div>
                        <div className="text-sm text-white font-medium truncate">{userGoal}</div>
                        {isExecuting && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-xs text-orange-400">Executing workflow...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={isExecuting}
                        className="flex-1 bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    {finalHTML && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    )}
                </div>

                {userGoal && !isExecuting && (
                    <Button
                        onClick={handleStartWorkflow}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Workflow
                    </Button>
                )}
            </div>
        </div>
    );
}
