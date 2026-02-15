/**
 * G-Nexus Chart Renderer
 * Renders various chart types using Recharts
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { Visualization, ChartType } from '../input/types';

interface ChartRendererProps {
    visualization: Visualization;
    interactive?: boolean;
    className?: string;
}

// Default colors for charts
const DEFAULT_COLORS = [
    '#f97316', '#06b6d4', '#8b5cf6', '#10b981',
    '#ef4444', '#f59e0b', '#3b82f6', '#ec4899'
];

export function ChartRenderer({
    visualization,
    interactive = true,
    className = '',
}: ChartRendererProps) {
    const [zoom, setZoom] = useState(1);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Handle zoom
    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.25, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    }, []);

    const handleResetZoom = useCallback(() => {
        setZoom(1);
    }, []);

    // Render chart based on type
    const renderChart = () => {
        const { type, data, config } = visualization;
        const colors = config.colors || DEFAULT_COLORS;

        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                            {config.legend && <Legend />}
                            {Object.keys(data[0] || {}).filter(k => k !== 'name').map((key, i) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={colors[i % colors.length]}
                                    strokeWidth={2}
                                    dot={{ fill: colors[i % colors.length], strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                            {config.legend && <Legend />}
                            {Object.keys(data[0] || {}).filter(k => k !== 'name').map((key, i) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    fill={colors[i % colors.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                onMouseEnter={(_, index) => interactive && setActiveIndex(index)}
                                onMouseLeave={() => interactive && setActiveIndex(null)}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                            {config.legend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                            {config.legend && <Legend />}
                            {Object.keys(data[0] || {}).filter(k => k !== 'name').map((key, i) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={colors[i % colors.length]}
                                    fill={colors[i % colors.length]}
                                    fillOpacity={0.3}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'scatter':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="x"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                name="X"
                            />
                            <YAxis
                                dataKey="y"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                name="Y"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                            {config.legend && <Legend />}
                            <Scatter
                                name="Data"
                                data={data}
                                fill={colors[0]}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        Chart type "{type}" not supported
                    </div>
                );
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Chart Controls */}
            {interactive && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleZoomOut}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-400" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleResetZoom}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <Maximize2 className="w-4 h-4 text-gray-400" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleZoomIn}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-400" />
                    </motion.button>
                </div>
            )}

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
            >
                {renderChart()}
            </motion.div>

            {/* Zoom Indicator */}
            {zoom !== 1 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-gray-400">
                    {Math.round(zoom * 100)}%
                </div>
            )}
        </div>
    );
}

export default ChartRenderer;
