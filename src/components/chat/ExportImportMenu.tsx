/**
 * ExportImportMenu Component
 * Export and import chat data in various formats
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, Upload, FileJson, FileText, FileSpreadsheet, Trash2,
    Check, X, AlertCircle, ExternalLink, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useExportImport, useStorageStats } from '@/hooks/useChatStorage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExportImportMenuProps {
    sessionId?: string;
    className?: string;
}

type ExportFormat = 'json' | 'markdown' | 'csv';

export function ExportImportMenu({ sessionId, className }: ExportImportMenuProps) {
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [importData, setImportData] = useState<string>('');
    const [importError, setImportError] = useState<string | null>(null);

    const { exportAll, exportOne, importAll, clearAll, loading } = useExportImport();
    const { stats, refresh: refreshStats } = useStorageStats();

    // Export to JSON
    const handleExportJSON = useCallback(async () => {
        const data = sessionId ? await exportOne(sessionId) : await exportAll();

        if (!data) {
            toast.error('Failed to export data');
            return;
        }

        const jsonStr = JSON.stringify(data, null, 2);
        downloadFile(jsonStr, `gnexus-chat-${sessionId || 'all'}-${Date.now()}.json`, 'application/json');
        toast.success('Exported as JSON');
    }, [sessionId, exportAll, exportOne]);

    // Export to Markdown
    const handleExportMarkdown = useCallback(async () => {
        const data = sessionId ? await exportOne(sessionId) : await exportAll();

        if (!data) {
            toast.error('Failed to export data');
            return;
        }

        const markdown = convertToMarkdown(data);
        downloadFile(markdown, `gnexus-chat-${sessionId || 'all'}-${Date.now()}.md`, 'text/markdown');
        toast.success('Exported as Markdown');
    }, [sessionId, exportAll, exportOne]);

    // Export to CSV
    const handleExportCSV = useCallback(async () => {
        const data = sessionId ? await exportOne(sessionId) : await exportAll();

        if (!data) {
            toast.error('Failed to export data');
            return;
        }

        const csv = convertToCSV(data);
        downloadFile(csv, `gnexus-chat-${sessionId || 'all'}-${Date.now()}.csv`, 'text/csv');
        toast.success('Exported as CSV');
    }, [sessionId, exportAll, exportOne]);

    // Handle import
    const handleImport = useCallback(async () => {
        if (!importData.trim()) {
            setImportError('Please paste valid JSON data');
            return;
        }

        try {
            const parsed = JSON.parse(importData);
            const success = await importAll(parsed);

            if (success) {
                toast.success('Data imported successfully');
                setShowImportDialog(false);
                setImportData('');
                refreshStats();
            } else {
                setImportError('Failed to import data. Please check the format.');
            }
        } catch (err) {
            setImportError('Invalid JSON format');
        }
    }, [importData, importAll, refreshStats]);

    // Handle clear all data
    const handleClearAll = useCallback(async () => {
        const success = await clearAll();

        if (success) {
            toast.success('All data cleared');
            setShowClearDialog(false);
            refreshStats();
        } else {
            toast.error('Failed to clear data');
        }
    }, [clearAll, refreshStats]);

    // Download helper
    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Convert to Markdown
    const convertToMarkdown = (data: any): string => {
        let md = `# G-Nexus Chat Export\n\n`;
        md += `Exported: ${new Date(data.exported_at).toLocaleString()}\n\n`;

        for (const session of data.sessions) {
            md += `## ${session.title}\n\n`;
            md += `**Created:** ${new Date(session.created_at).toLocaleString()}\n`;
            md += `**Model:** ${session.model}\n\n`;

            const sessionMessages = data.messages.filter((m: any) => m.session_id === session.id);

            for (const msg of sessionMessages) {
                const role = msg.role === 'user' ? '**You**' : '**G-Nexus**';
                md += `### ${role}\n\n`;
                md += `${msg.content}\n\n---\n\n`;
            }
        }

        return md;
    };

    // Convert to CSV
    const convertToCSV = (data: any): string => {
        let csv = 'Session,Role,Content,Timestamp\n';

        for (const msg of data.messages) {
            const session = data.sessions.find((s: any) => s.id === msg.session_id);
            const title = session ? session.title : 'Unknown';
            const content = msg.content.replace(/"/g, '""').replace(/\n/g, ' ');
            csv += `"${title}","${msg.role}","${content}","${new Date(msg.created_at).toISOString()}"\n`;
        }

        return csv;
    };

    // Format file size
    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={cn('gap-2', className)}>
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleExportJSON}>
                        <FileJson className="w-4 h-4 mr-2" />
                        Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportMarkdown}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCSV}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export as CSV
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setShowClearDialog(true)}
                        className="text-red-400 focus:text-red-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Import Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Import Chat Data</DialogTitle>
                        <DialogDescription>
                            Paste your exported JSON data below to import chat sessions and messages.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <textarea
                            value={importData}
                            onChange={(e) => {
                                setImportData(e.target.value);
                                setImportError(null);
                            }}
                            placeholder='{"version":"1.0.0","sessions":[],"messages":[]}'
                            className="w-full h-48 p-3 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-gray-300 resize-none focus:outline-none focus:border-cyan-500/50"
                        />

                        {importError && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {importError}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowImportDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={loading}>
                            {loading ? 'Importing...' : 'Import'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Data Dialog */}
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Clear All Data</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all your chat sessions and messages. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Warning</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            You have {stats.sessionCount} sessions and {stats.messageCount} messages.
                            This will free up {formatSize(stats.storageUsed)} of storage.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowClearDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearAll}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {loading ? 'Clearing...' : 'Clear All Data'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ExportImportMenu;
