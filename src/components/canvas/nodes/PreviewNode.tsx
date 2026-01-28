/**
 * PreviewNode - Live HTML Preview with iframe Sandbox
 * Renders final HTML output safely in an isolated iframe
 * Dark theme styling
 */

import { memo, useCallback, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Eye, Download, Code, Maximize2, Minimize2, FileCode, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { WorkflowNodeData } from '@/stores/workflowStore';

// Define the node type
type PreviewNodeType = Node<WorkflowNodeData, 'previewNode'>;

const PreviewNode = memo(({ data, selected }: NodeProps<PreviewNodeType>) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const hasHTML = !!data.htmlCode;
    const isCompleted = data.status === 'completed';

    const handleDownload = useCallback(() => {
        if (data.htmlCode) {
            const blob = new Blob([data.htmlCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gnexus-output-${Date.now()}.html`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('HTML downloaded!');
        }
    }, [data.htmlCode]);

    const handleOpenInNewTab = useCallback(() => {
        if (data.htmlCode) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(data.htmlCode);
                newWindow.document.close();
            }
        }
    }, [data.htmlCode]);

    return (
        <div
            className={`
                relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
                bg-gradient-to-br from-[#0a0a0a] to-[#0d1512]
                ${isCompleted ? 'border-emerald-500/70 shadow-xl shadow-emerald-500/20' : 'border-gray-800'}
                ${selected ? 'ring-2 ring-emerald-400' : ''}
                ${isExpanded ? 'w-[600px]' : 'w-[380px]'}
            `}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-emerald-300 !-top-2"
            />

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileCode className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                        {data.label || 'HTML Preview'}
                    </p>
                    <p className="text-[10px] text-emerald-100">
                        {hasHTML ? `${(data.htmlCode?.length || 0 / 1024).toFixed(1)}KB` : 'Waiting for synthesis...'}
                    </p>
                </div>

                {/* Toggle Buttons */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
            </div>

            {/* Preview Area */}
            <div className="p-4">
                {hasHTML ? (
                    <div className="space-y-3">
                        {/* Tab Buttons */}
                        <div className="flex gap-1 bg-black/50 p-1 rounded-lg">
                            <button
                                onClick={() => setShowCode(false)}
                                className={`
                                    flex-1 py-2 px-3 text-xs font-medium rounded-md
                                    flex items-center justify-center gap-2
                                    transition-all
                                    ${!showCode
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-gray-500 hover:text-gray-300'}
                                `}
                            >
                                <Eye className="w-3 h-3" />
                                Preview
                            </button>
                            <button
                                onClick={() => setShowCode(true)}
                                className={`
                                    flex-1 py-2 px-3 text-xs font-medium rounded-md
                                    flex items-center justify-center gap-2
                                    transition-all
                                    ${showCode
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-gray-500 hover:text-gray-300'}
                                `}
                            >
                                <Code className="w-3 h-3" />
                                Code
                            </button>
                        </div>

                        {/* Content */}
                        {showCode ? (
                            /* Code View */
                            <div className="bg-black/50 rounded-lg overflow-hidden border border-gray-800">
                                <pre className={`
                                    p-3 text-[10px] font-mono text-emerald-400 overflow-auto
                                    ${isExpanded ? 'max-h-[400px]' : 'max-h-[200px]'}
                                `}>
                                    {data.htmlCode}
                                </pre>
                            </div>
                        ) : (
                            /* iframe Preview */
                            <div className="bg-white rounded-lg overflow-hidden border border-gray-700">
                                <iframe
                                    title="HTML Preview"
                                    srcDoc={data.htmlCode}
                                    className={`
                                        w-full border-none
                                        ${isExpanded ? 'h-[400px]' : 'h-[200px]'}
                                    `}
                                    sandbox="allow-scripts"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenInNewTab}
                                className="flex-1 text-xs bg-transparent border-gray-700 text-white hover:bg-emerald-500/20 hover:border-emerald-500/50"
                            >
                                <ExternalLink className="w-3 h-3 mr-1.5" />
                                Open Preview
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownload}
                                className="flex-1 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
                            >
                                <Download className="w-3 h-3 mr-1.5" />
                                Download
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="py-10 text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                            <FileCode className="w-7 h-7 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500">
                            Waiting for HTML generation...
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Run the workflow to generate output
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

PreviewNode.displayName = 'PreviewNode';

export default PreviewNode;
