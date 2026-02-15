import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe, Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiCallerNodeData {
    type: 'api-caller';
    label?: string;
    endpoint?: string;
    method?: string;
    data?: any;
    formatted?: string;
    statusCode?: number;
    status?: 'idle' | 'calling' | 'completed' | 'failed';
}

const ApiCallerNode = memo(({ data, selected }: NodeProps<ApiCallerNodeData>) => {
    const isCalling = data.status === 'calling';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    return (
        <div
            className={`
                bg-gradient-to-br from-green-900/90 to-emerald-900/90 
                backdrop-blur-sm rounded-xl border-2 
                ${isCalling ? 'border-green-400 shadow-xl shadow-green-500/30' : ''}
                ${isCompleted ? 'border-green-600' : ''}
                ${isFailed ? 'border-red-600' : ''}
                ${selected ? 'ring-2 ring-green-300' : 'border-green-800'}
                min-w-[300px] max-w-[400px]
                transition-all duration-300
            `}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />

            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-white">
                            {data.label || 'API Caller'}
                        </span>
                    </div>
                    {isCalling && <Loader2 className="w-4 h-4 text-green-400 animate-spin" />}
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                {data.endpoint && (
                    <div className="mt-2 flex items-center gap-2">
                        <div className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded font-mono">
                            {data.method || 'GET'}
                        </div>
                        <a
                            href={data.endpoint}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-200 hover:text-green-100 font-mono flex items-center gap-1 truncate flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="truncate">{data.endpoint}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                    </div>
                )}
            </div>

            {/* Status */}
            {isCalling && (
                <div className="px-4 py-3 text-sm text-green-300">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Calling API...
                    </div>
                </div>
            )}

            {/* Response */}
            {isCompleted && data.formatted && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-green-300">Response</div>
                        {data.statusCode && (
                            <div className={`text-xs px-2 py-0.5 rounded font-mono ${data.statusCode >= 200 && data.statusCode < 300
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                {data.statusCode}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-300 font-mono bg-black/30 rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                        {data.formatted}
                    </div>
                </div>
            )}

            {/* Raw JSON (collapsed) */}
            {isCompleted && data.data && (
                <details className="px-4 py-2">
                    <summary className="text-xs font-semibold text-green-300 cursor-pointer hover:text-green-200">
                        View Raw JSON
                    </summary>
                    <pre className="mt-2 text-xs text-gray-400 font-mono bg-black/30 rounded p-2 max-h-32 overflow-auto custom-scrollbar">
                        {JSON.stringify(data.data, null, 2)}
                    </pre>
                </details>
            )}

            {/* Error */}
            {isFailed && (
                <div className="px-4 py-3 text-sm text-red-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        API call failed
                    </div>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
        </div>
    );
});

ApiCallerNode.displayName = 'ApiCallerNode';

export default ApiCallerNode;
