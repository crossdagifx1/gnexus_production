import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Calculator, Loader2, Check, AlertCircle } from 'lucide-react';

interface CalculatorNodeData {
    type: 'calculator';
    label?: string;
    expression?: string;
    result?: number | string;
    formatted?: string;
    steps?: string[];
    status?: 'idle' | 'calculating' | 'completed' | 'failed';
}

const CalculatorNode = memo(({ data, selected }: NodeProps<CalculatorNodeData>) => {
    const isCalculating = data.status === 'calculating';
    const isCompleted = data.status === 'completed';
    const isFailed = data.status === 'failed';

    return (
        <div
            className={`
                bg-gradient-to-br from-amber-900/90 to-orange-900/90 
                backdrop-blur-sm rounded-xl border-2 
                ${isCalculating ? 'border-amber-400 shadow-xl shadow-amber-500/30' : ''}
                ${isCompleted ? 'border-amber-600' : ''}
                ${isFailed ? 'border-red-600' : ''}
                ${selected ? 'ring-2 ring-amber-300' : 'border-amber-800'}
                min-w-[280px] max-w-[350px]
                transition-all duration-300
            `}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />

            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-semibold text-white">
                            {data.label || 'Calculator'}
                        </span>
                    </div>
                    {isCalculating && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                {data.expression && (
                    <div className="mt-2 text-xs text-amber-200 font-mono bg-black/20 rounded px-2 py-1">
                        {data.expression}
                    </div>
                )}
            </div>

            {/* Status */}
            {isCalculating && (
                <div className="px-4 py-3 text-sm text-amber-300">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        Calculating...
                    </div>
                </div>
            )}

            {/* Result */}
            {isCompleted && data.formatted && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-xs font-semibold text-amber-300 mb-1">Result</div>
                    <div className="text-2xl font-bold text-white bg-black/30 rounded-lg p-3 text-center">
                        {data.formatted}
                    </div>
                </div>
            )}

            {/* Steps */}
            {isCompleted && data.steps && data.steps.length > 0 && (
                <div className="px-4 py-3">
                    <div className="text-xs font-semibold text-amber-300 mb-2">Calculation Steps</div>
                    <div className="space-y-1">
                        {data.steps.map((step, i) => (
                            <div key={i} className="text-xs text-gray-300 font-mono bg-black/20 rounded px-2 py-1">
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error */}
            {isFailed && (
                <div className="px-4 py-3 text-sm text-red-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Calculation failed
                    </div>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500" />
        </div>
    );
});

CalculatorNode.displayName = 'CalculatorNode';

export default CalculatorNode;
