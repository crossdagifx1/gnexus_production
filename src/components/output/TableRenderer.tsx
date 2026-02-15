/**
 * G-Nexus Table Renderer
 * Renders structured data as interactive tables
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronUp, ChevronDown, ChevronsUpDown, Search,
    Download, Filter, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { StructuredData } from '../input/types';

interface TableRendererProps {
    data: StructuredData;
    pageSize?: number;
    searchable?: boolean;
    sortable?: boolean;
    exportable?: boolean;
    className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function TableRenderer({
    data,
    pageSize = 10,
    searchable = true,
    sortable = true,
    exportable = true,
    className = '',
}: TableRendererProps) {
    // State
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Parse data into rows
    const { headers, rows } = useMemo(() => {
        if (data.type === 'json' && Array.isArray(data.data)) {
            const headers = Object.keys(data.data[0] || {});
            const rows = data.data.map((item: any) => headers.map(h => item[h]));
            return { headers, rows };
        }
        if (data.type === 'csv' && typeof data.data === 'string') {
            const lines = data.data.split('\n');
            const headers = lines[0]?.split(',') || [];
            const rows = lines.slice(1).map(line => line.split(','));
            return { headers, rows };
        }
        if (data.type === 'table') {
            return {
                headers: data.schema?.fields.map(f => f.name) || Object.keys(data.data[0] || {}),
                rows: Array.isArray(data.data) ? data.data.map((item: any) => Object.values(item)) : [],
            };
        }
        return { headers: [], rows: [] };
    }, [data]);

    // Filter rows by search
    const filteredRows = useMemo(() => {
        if (!search.trim()) return rows;
        const searchLower = search.toLowerCase();
        return rows.filter((row: any[]) =>
            row.some(cell =>
                String(cell).toLowerCase().includes(searchLower)
            )
        );
    }, [rows, search]);

    // Sort rows
    const sortedRows = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredRows;
        const colIndex = headers.indexOf(sortColumn);
        if (colIndex === -1) return filteredRows;

        return [...filteredRows].sort((a, b) => {
            const aVal = a[colIndex];
            const bVal = b[colIndex];

            // Handle numbers
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // Handle strings
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredRows, sortColumn, sortDirection, headers]);

    // Paginate
    const totalPages = Math.ceil(sortedRows.length / pageSize);
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedRows.slice(start, start + pageSize);
    }, [sortedRows, currentPage, pageSize]);

    // Handle sort
    const handleSort = useCallback((column: string) => {
        if (!sortable) return;

        if (sortColumn === column) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortable, sortColumn, sortDirection]);

    // Handle row selection
    const toggleRow = useCallback((index: number) => {
        setSelectedRows(prev => {
            const updated = new Set(prev);
            if (updated.has(index)) {
                updated.delete(index);
            } else {
                updated.add(index);
            }
            return updated;
        });
    }, []);

    // Export as CSV
    const handleExport = useCallback(() => {
        const csv = [
            headers.join(','),
            ...sortedRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported as CSV');
    }, [headers, sortedRows]);

    // Render sort icon
    const renderSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return <ChevronsUpDown className="w-3 h-3 text-gray-600" />;
        }
        if (sortDirection === 'asc') {
            return <ChevronUp className="w-3 h-3 text-orange-500" />;
        }
        return <ChevronDown className="w-3 h-3 text-orange-500" />;
    };

    // Format cell value
    const formatCell = (value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    if (headers.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No tabular data available
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden ${className}`}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    {searchable && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search..."
                                className="pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-3 h-3 text-gray-500" />
                                </button>
                            )}
                        </div>
                    )}
                    <span className="text-xs text-gray-500">
                        {sortedRows.length} rows
                    </span>
                </div>

                {exportable && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Download className="w-3 h-3" />
                        Export CSV
                    </motion.button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/5">
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    onClick={() => handleSort(header)}
                                    className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-white/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{header}</span>
                                        {sortable && renderSortIcon(header)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedRows.map((row, rowIndex) => {
                            const actualIndex = (currentPage - 1) * pageSize + rowIndex;
                            const isSelected = selectedRows.has(actualIndex);

                            return (
                                <motion.tr
                                    key={rowIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: rowIndex * 0.02 }}
                                    onClick={() => toggleRow(actualIndex)}
                                    className={`${isSelected ? 'bg-orange-500/10' : 'hover:bg-white/5'
                                        } cursor-pointer transition-colors`}
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap"
                                        >
                                            {formatCell(cell)}
                                        </td>
                                    ))}
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {paginatedRows.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    {search ? 'No results found' : 'No data available'}
                </div>
            )}
        </motion.div>
    );
}

export default TableRenderer;
