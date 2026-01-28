import { X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    language: string;
    title?: string;
}

export function PreviewModal({ isOpen, onClose, code, language, title = "Live Preview" }: PreviewModalProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [key, setKey] = useState(0); // key to force iframe refresh

    // Refresh the preview
    const handleRefresh = () => {
        setKey(prev => prev + 1);
    };

    // Construct the HTML content for the iframe
    const getSrcDoc = () => {
        if (language === 'html' || language === 'xml' || language === 'markup') {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
                        /* Add some basic resets */
                        * { box-sizing: border-box; }
                    </style>
                </head>
                <body>
                    ${code}
                </body>
                </html>
            `;
        }

        if (language === 'css') {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
                        ${code}
                    </style>
                </head>
                <body>
                    <div class="preview-element">
                        <h1>CSS Preview</h1>
                        <p>The styles defined in the CSS are applied to this page.</p>
                        <button>Button Example</button>
                        <div class="card">Card Example</div>
                    </div>
                </body>
                </html>
            `;
        }

        if (language === 'javascript' || language === 'js') {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
                        #console { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; margin-top: 20px; }
                        .log-entry { border-bottom: 1px solid #333; padding: 2px 0; }
                    </style>
                </head>
                <body>
                    <h2>JavaScript Console Output</h2>
                    <div id="app"></div>
                    <div id="console"></div>
                    <script>
                        const consoleDiv = document.getElementById('console');
                        const originalLog = console.log;
                        console.log = (...args) => {
                            originalLog.apply(console, args);
                            const entry = document.createElement('div');
                            entry.className = 'log-entry';
                            entry.textContent = '>' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
                            consoleDiv.appendChild(entry);
                        };
                        try {
                            ${code}
                        } catch (err) {
                            console.error(err);
                            const entry = document.createElement('div');
                            entry.style.color = 'red';
                            entry.textContent = 'Error: ' + err.message;
                            consoleDiv.appendChild(entry);
                        }
                    </script>
                </body>
                </html>
            `;
        }

        // Default fallback
        return `
            <!DOCTYPE html>
            <html>
            <body>
                <pre>${code}</pre>
            </body>
            </html>
        `;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={`
                            relative bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col
                            ${isExpanded ? 'w-[95vw] h-[95vh]' : 'w-full max-w-4xl h-[600px]'}
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-medium text-gray-200">{title}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                                    {language}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRefresh}
                                    title="Reload Preview"
                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    title={isExpanded ? "Minimize" : "Maximize"}
                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    title="Close"
                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Iframe Container */}
                        <div className="flex-1 bg-white relative">
                            <iframe
                                key={key}
                                srcDoc={getSrcDoc()}
                                title="Code Preview"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
