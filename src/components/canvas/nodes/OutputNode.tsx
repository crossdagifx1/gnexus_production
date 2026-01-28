/**
 * OutputNode - HTML Export Node
 * Final output that generates downloadable HTML
 * Dark theme styling
 */

import { memo, useCallback } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { FileCode, Download, Eye, Loader2, Check } from 'lucide-react';

// Define node data type
type OutputNodeData = {
    htmlContent?: string;
    status?: 'idle' | 'generating' | 'ready' | 'failed';
    onPreview?: () => void;
    onDownload?: () => void;
};

// Define the node type
type OutputNodeType = Node<OutputNodeData, 'output'>;

const OutputNode = memo(({ data, selected }: NodeProps<OutputNodeType>) => {
    const isGenerating = data.status === 'generating';
    const isReady = data.status === 'ready';

    const handleDownload = useCallback(() => {
        if (data.htmlContent) {
            const blob = new Blob([data.htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gnexus-output-${Date.now()}.html`;
            link.click();
            URL.revokeObjectURL(url);
        }
        data.onDownload?.();
    }, [data]);

    const handlePreview = useCallback(() => {
        if (data.htmlContent) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(data.htmlContent);
                newWindow.document.close();
            }
        }
        data.onPreview?.();
    }, [data]);

    return (
        <div
            className={`
                relative min-w-[300px] max-w-[400px]
                bg-gradient-to-br from-[#0a0a0a] to-[#0d1512]
                border-2 rounded-2xl overflow-hidden
                transition-all duration-300
                ${selected
                    ? 'border-emerald-500 ring-2 ring-emerald-400'
                    : isReady
                        ? 'border-emerald-500/70 shadow-xl shadow-emerald-500/20'
                        : 'border-gray-800'
                }
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
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-100 font-medium">
                        Output
                    </p>
                    <p className="text-sm font-bold text-white">
                        HTML Export
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {isGenerating ? (
                    <div className="flex items-center gap-3 text-emerald-400 py-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Generating HTML...</span>
                    </div>
                ) : isReady ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">HTML Ready!</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handlePreview}
                                className="
                                    flex-1 py-2.5 px-4
                                    bg-black/30 border border-gray-700
                                    text-white text-sm font-medium
                                    rounded-xl flex items-center justify-center gap-2
                                    hover:bg-emerald-500/10 hover:border-emerald-500/50
                                    transition-all
                                "
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </button>
                            <button
                                onClick={handleDownload}
                                className="
                                    flex-1 py-2.5 px-4
                                    bg-gradient-to-r from-emerald-500 to-emerald-600
                                    text-white text-sm font-medium
                                    rounded-xl flex items-center justify-center gap-2
                                    hover:from-emerald-600 hover:to-emerald-700
                                    shadow-lg shadow-emerald-500/30
                                    transition-all
                                "
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <FileCode className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500 text-sm">
                            Connect AI responses to generate HTML
                        </p>
                    </div>
                )}
            </div>

            {/* File Size Info */}
            {isReady && data.htmlContent && (
                <div className="px-4 pb-3">
                    <p className="text-[10px] text-gray-500 text-center">
                        {(data.htmlContent.length / 1024).toFixed(1)} KB
                    </p>
                </div>
            )}
        </div>
    );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;
export type { OutputNodeData, OutputNodeType };
