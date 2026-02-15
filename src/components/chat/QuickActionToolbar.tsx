import React from 'react';
import { motion } from 'framer-motion';
import {
    Copy, Check, Volume2, ThumbsUp, ThumbsDown,
    MoreHorizontal, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuickActionToolbarProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    onCopy: () => void;
    onReadAloud: () => void;
    onFeedback: (type: 'good' | 'bad') => void;
    onMore: () => void;
    onRegenerate?: () => void;
    className?: string;
}

export function QuickActionToolbar({
    role,
    content,
    onCopy,
    onReadAloud,
    onFeedback,
    onMore,
    onRegenerate,
    className
}: QuickActionToolbarProps) {
    const isAssistant = role === 'assistant';
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TooltipProvider>
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg",
                    className
                )}
            >
                {/* Copy Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="h-8 w-8 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? 'Copied!' : 'Copy message'}</TooltipContent>
                </Tooltip>

                {isAssistant && (
                    <>
                        {/* TTS Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onReadAloud}
                                    className="h-8 w-8 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Read Aloud</TooltipContent>
                        </Tooltip>

                        {/* Regenerate Button */}
                        {onRegenerate && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onRegenerate}
                                        className="h-8 w-8 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Regenerate</TooltipContent>
                            </Tooltip>
                        )}

                        <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

                        {/* Feedback Group */}
                        <div className="flex items-center gap-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onFeedback('good')}
                                        className="h-8 w-8 rounded-full hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition-all"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Good response</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onFeedback('bad')}
                                        className="h-8 w-8 rounded-full hover:bg-white/10 text-gray-500 hover:text-red-400 transition-all"
                                    >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Bad response</TooltipContent>
                            </Tooltip>
                        </div>
                    </>
                )}

                <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

                {/* More Options */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMore}
                            className="h-8 w-8 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>More actions</TooltipContent>
                </Tooltip>
            </motion.div>
        </TooltipProvider>
    );
}
