/**
 * CustomEdge - Clean Connection Line
 * Bezier curve with circle anchor markers
 * Dark theme styling
 */

import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            {/* Glow effect when selected */}
            {selected && (
                <BaseEdge
                    id={`${id}-glow`}
                    path={edgePath}
                    style={{
                        stroke: '#f97316',
                        strokeWidth: 6,
                        opacity: 0.3,
                        filter: 'blur(4px)',
                    }}
                />
            )}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: selected ? '#f97316' : '#4b5563',
                    strokeWidth: 2,
                    ...style,
                }}
            />
            {/* Source Circle */}
            <circle
                cx={sourceX}
                cy={sourceY}
                r={5}
                fill={selected ? '#f97316' : '#1f2937'}
                stroke={selected ? '#f97316' : '#4b5563'}
                strokeWidth={2}
            />
            {/* Target Circle */}
            <circle
                cx={targetX}
                cy={targetY}
                r={5}
                fill={selected ? '#f97316' : '#1f2937'}
                stroke={selected ? '#f97316' : '#4b5563'}
                strokeWidth={2}
            />
        </>
    );
};

export default CustomEdge;
