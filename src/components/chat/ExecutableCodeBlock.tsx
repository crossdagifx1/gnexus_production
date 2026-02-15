import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

interface ExecutableCodeBlockProps {
    code: string;
    language: string;
    messageId?: string;
}

export function ExecutableCodeBlock({ code, language, messageId }: ExecutableCodeBlockProps) {
    const [output, setOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [exitCode, setExitCode] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [executionTime, setExecutionTime] = useState<number | null>(null);

    const supportedLanguages = ['python', 'javascript', 'js', 'php'];
    const isExecutable = supportedLanguages.includes(language.toLowerCase());

    const executeCode = async () => {
        setIsExecuting(true);
        setOutput('');
        setExitCode(null);
        setExecutionTime(null);

        const startTime = Date.now();

        try {
            const response = await fetch('/api.php?action=execute_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    code,
                    language: language.toLowerCase(),
                    message_id: messageId
                })
            });

            const data = await response.json();

            if (data.success) {
                setOutput(data.data.output || '(No output)');
                setExitCode(data.data.exitCode ?? 0);
                setExecutionTime(Date.now() - startTime);

                if (data.data.exitCode === 0) {
                    toast.success('Code executed successfully');
                } else {
                    toast.warning('Code executed with errors');
                }
            } else {
                throw new Error(data.error || 'Execution failed');
            }
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
            setExitCode(1);
            toast.error('Execution failed');
        } finally {
            setIsExecuting(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copied');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden my-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                        {language}
                    </Badge>
                    {executionTime && (
                        <Badge variant="outline" className="text-xs">
                            {executionTime}ms
                        </Badge>
                    )}
                    {exitCode !== null && (
                        <Badge
                            variant={exitCode === 0 ? 'default' : 'destructive'}
                            className="text-xs"
                        >
                            Exit: {exitCode}
                        </Badge>
                    )}
                </div>

                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyCode}
                        className="h-7 px-2"
                    >
                        {copied ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                    </Button>

                    {isExecutable && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={executeCode}
                            disabled={isExecuting}
                            className="h-7 px-2"
                        >
                            {isExecuting ? (
                                <>
                                    <Square className="w-3 h-3 mr-1" />
                                    Stop
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Run
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Code */}
            <div className="relative">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        fontSize: '0.875rem'
                    }}
                    showLineNumbers
                >
                    {code}
                </SyntaxHighlighter>
            </div>

            {/* Output */}
            <AnimatePresence>
                {output && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t overflow-hidden"
                    >
                        <div className="bg-black text-green-400 p-4 font-mono text-xs">
                            <div className="flex items-start gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400">Output:</span>
                            </div>
                            <pre className="whitespace-pre-wrap">{output}</pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {
                !isExecutable && (
                    <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-t">
                        Code execution not supported for {language}
                    </div>
                )
            }
        </Card >
    );
}
