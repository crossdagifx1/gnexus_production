/**
 * DynamicPreviewNode - Live HTML Preview with Download
 * Renders final HTML output from Collaborator's blueprint
 */

import { memo, useCallback, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Eye, Download, Code, Maximize2, Minimize2, FileCode, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { WorkflowNodeData } from '@/stores/workflowStore';

type PreviewNodeType = Node<WorkflowNodeData, 'previewNode'>;

const DynamicPreviewNode = memo(({ data, selected }: NodeProps<PreviewNodeType>) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const hasHTML = !!data.htmlCode;
    const isRunning = data.status === 'running';
    const isCompleted = data.status === 'completed';

    const handleDownload = useCallback(() => {
        if (data.htmlCode) {
            const blob = new Blob([data.htmlCode as string], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gnexus-output-${Date.now()}.html`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('HTML downloaded!');
        }
    }, [data.htmlCode]);

    const handleOpenPreview = useCallback(() => {
        if (data.htmlCode) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(data.htmlCode as string);
                newWindow.document.close();
            }
        }
    }, [data.htmlCode]);

    return (
        <div
            className={`
                bg-gradient-to-br from-[#0a0a0a] to-[#0a1a15]
                border-2 rounded-2xl overflow-hidden
                transition-all duration-300
                ${selected ? 'ring-2 ring-green-400' : ''}
                ${isCompleted ? 'border-green-500' : 'border-green-500/30'}
                ${isExpanded ? 'min-w-[600px]' : 'min-w-[380px] max-w-[420px]'}
            `}
        >
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-4 !h-4 !bg-green-500 !border-2 !border-green-300 !-top-2"
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {isRunning ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : isCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                    ) : (
                        <FileCode className="w-4 h-4 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-white font-bold text-sm">{data.label}</p>
                    <p className="text-green-100 text-xs">
                        {hasHTML ? `${((data.htmlCode as string).length / 1024).toFixed(1)}KB` : 'Waiting for synthesis...'}
                    </p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-white/20 rounded"
                >
                    {isExpanded ? (
                        <Minimize2 className="w-4 h-4 text-white" />
                    ) : (
                        <Maximize2 className="w-4 h-4 text-white" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {isRunning && (
                    <div className="flex items-center gap-3 text-green-400 py-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Generating HTML...</span>
                    </div>
                )}

                {hasHTML && isCompleted && (
                    <div className="space-y-3">
                        {/* Tab Buttons */}
                        <div className="flex gap-1 bg-black/50 p-1 rounded-lg">
                            <button
                                onClick={() => setShowCode(false)}
                                className={`
                                    flex-1 py-2 px-3 text-xs font-medium rounded-md
                                    flex items-center justify-center gap-1.5 transition-colors
                                    ${!showCode ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300'}
                                `}
                            >
                                <Eye className="w-3 h-3" />
                                Preview
                            </button>
                            <button
                                onClick={() => setShowCode(true)}
                                className={`
                                    flex-1 py-2 px-3 text-xs font-medium rounded-md
                                    flex items-center justify-center gap-1.5 transition-colors
                                    ${showCode ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300'}
                                `}
                            >
                                <Code className="w-3 h-3" />
                                Code
                            </button>
                        </div>

                        {/* Content View */}
                        {showCode ? (
                            <div className="bg-black rounded-lg overflow-hidden">
                                <pre className={`
                                    p-3 text-[10px] font-mono text-green-400 overflow-auto
                                    ${isExpanded ? 'max-h-[400px]' : 'max-h-[200px]'}
                                `}>
                                    {data.htmlCode as string}
                                </pre>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg overflow-hidden">
                                <iframe
                                    title="HTML Preview"
                                    srcDoc={data.htmlCode as string}
                                    className={`w-full border-none ${isExpanded ? 'h-[400px]' : 'h-[200px]'}`}
                                    sandbox="allow-scripts"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenPreview}
                                className="flex-1 bg-black/50 border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                Open Preview
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownload}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Download HTML
                            </Button>
                        </div>
                    </div>
                )}

                {!hasHTML && !isRunning && (
                    <div className="text-center py-8">
                        <FileCode className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                        <p className="text-xs text-gray-500">
                            HTML will be generated after synthesis
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

DynamicPreviewNode.displayName = 'DynamicPreviewNode';

export default DynamicPreviewNode;
