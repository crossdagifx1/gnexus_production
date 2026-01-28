/**
 * Advanced Agent Controls Panel
 * Dark theme styling with orange accents
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HTML_TEMPLATES, getTemplateById } from '@/lib/htmlGenerators';
import { Settings, Zap, RotateCcw, Save, Sparkles } from 'lucide-react';

export function AgentControls() {
    const [branchCount, setBranchCount] = useState(4);
    const [selectedTemplate, setSelectedTemplate] = useState('modern-landing');

    const selectedTemplateData = getTemplateById(selectedTemplate);

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
                    {HTML_TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
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

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
                <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
            </div>
        </div>
    );
}
