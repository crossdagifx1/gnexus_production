/**
 * G-Nexus Code Renderer
 * Renders code with syntax highlighting and line numbers
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, Download, Expand, Shrink } from 'lucide-react';
import { toast } from 'sonner';

interface CodeRendererProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    highlightLines?: number[];
    className?: string;
}

// Simple syntax highlighting (basic tokenization)
function highlightCode(code: string, language: string): string {
    let highlighted = code;

    // Escape HTML
    highlighted = highlighted
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>');

    // Keywords
    const keywords: Record<string, string[]> = {
        javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'],
        typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined', 'string', 'number', 'boolean', 'any', 'void', 'never'],
        python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'],
        sql: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET'],
    };

    const langKeywords = keywords[language.toLowerCase()] || keywords.javascript;

    // Highlight keywords
    langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        highlighted = highlighted.replace(regex, '<span class="token-keyword">$1</span>');
    });

    // Strings
    highlighted = highlighted.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="token-string">$&</span>');

    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>');

    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="token-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

    // Functions
    highlighted = highlighted.replace(/(\w+)(?=\s*\()/g, '<span class="token-function">$1</span>');

    return highlighted;
}

export function CodeRenderer({
    code,
    language = 'javascript',
    showLineNumbers = true,
    highlightLines = [],
    className = '',
}: CodeRendererProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Highlight code
    const highlightedCode = useMemo(() => {
        return highlightCode(code, language);
    }, [code, language]);

    // Split into lines
    const lines = useMemo(() => {
        return code.split('\n');
    }, [code]);

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success('Code copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy code');
        }
    }, [code]);

    // Download code
    const handleDownload = useCallback(() => {
        const extensions: Record<string, string> = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            sql: 'sql',
            html: 'html',
            css: 'css',
            json: 'json',
        };
        const ext = extensions[language.toLowerCase()] || 'txt';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Code downloaded');
    }, [code, language]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase">{language}</span>
                    <span className="text-xs text-gray-600">{lines.length} lines</span>
                </div>
                <div className="flex items-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpanded(!expanded)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                        {expanded ? (
                            <Shrink className="w-4 h-4 text-gray-400" />
                        ) : (
                            <Expand className="w-4 h-4 text-gray-400" />
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                        <Download className="w-4 h-4 text-gray-400" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                        {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Code */}
            <div
                className={`overflow-auto ${expanded ? 'max-h-[80vh]' : 'max-h-[400px]'}`}
            >
                <div className="flex">
                    {/* Line Numbers */}
                    {showLineNumbers && (
                        <div className="flex-shrink-0 py-4 px-3 text-right select-none bg-black/20 border-r border-white/5">
                            {lines.map((_, i) => (
                                <div
                                    key={i}
                                    className={`text-xs leading-6 ${highlightLines.includes(i + 1)
                                            ? 'text-orange-400'
                                            : 'text-gray-600'
                                        }`}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Code Content */}
                    <pre className="flex-1 p-4 overflow-x-auto">
                        <code
                            className="text-sm leading-6 font-mono"
                            dangerouslySetInnerHTML={{ __html: highlightedCode }}
                        />
                    </pre>
                </div>
            </div>

            {/* Footer */}
            {lines.length > 20 && !expanded && (
                <div className="px-4 py-2 bg-white/5 border-t border-white/10 text-center">
                    <button
                        onClick={() => setExpanded(true)}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        Show all {lines.length} lines
                    </button>
                </div>
            )}

            {/* Styles */}
            <style>{`
                .token-keyword { color: #ff7b72; }
                .token-string { color: #a5d6ff; }
                .token-number { color: #79c0ff; }
                .token-comment { color: #8b949e; font-style: italic; }
                .token-function { color: #d2a8ff; }
            `}</style>
        </motion.div>
    );
}

export default CodeRenderer;
