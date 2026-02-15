/**
 * G-Nexus Unified Input Component
 * Single component handling all input types: text, files, URL, voice
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Paperclip, Mic, MicOff, Link, X, Image, Video,
    Music, FileText, Code, Sparkles, Loader2, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from './FileUpload';
import {
    ContentType, InputData, FileUploadConfig,
    CONTENT_TYPE_ICONS, CONTENT_TYPE_COLORS
} from './types';

// Generate unique ID
const generateId = () => `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// URL detection regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

// Input mode types
type InputMode = 'text' | 'file' | 'url' | 'voice';

interface UnifiedInputProps {
    // Configuration
    acceptedTypes?: ContentType[];
    maxFileSize?: number;
    enableVoice?: boolean;
    enableUrl?: boolean;
    enableFiles?: boolean;
    autoDetect?: boolean;

    // Behavior
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;

    // Callbacks
    onSubmit: (data: InputData) => void;
    onFilesSelected?: (files: InputData[]) => void;
    onError?: (error: string) => void;

    // Styling
    className?: string;
}

export function UnifiedInput({
    acceptedTypes = ['text', 'image', 'video', 'audio', 'pdf', 'spreadsheet', 'document'],
    maxFileSize = 50 * 1024 * 1024,
    enableVoice = true,
    enableUrl = true,
    enableFiles = true,
    autoDetect = true,
    placeholder = 'Type a message, paste content, or attach files...',
    disabled = false,
    loading = false,
    onSubmit,
    onFilesSelected,
    onError,
    className = '',
}: UnifiedInputProps) {
    // State
    const [mode, setMode] = useState<InputMode>('text');
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [attachedFiles, setAttachedFiles] = useState<InputData[]>([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [detectedType, setDetectedType] = useState<ContentType | null>(null);

    // Refs
    const textInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Auto-detect content type from text
    useEffect(() => {
        if (!autoDetect || !text.trim()) {
            setDetectedType(null);
            return;
        }

        const lowerText = text.toLowerCase();

        // Code detection
        if (lowerText.includes('function') || lowerText.includes('const ') ||
            lowerText.includes('import ') || lowerText.includes('class ')) {
            setDetectedType('code');
        }
        // URL detection
        else if (URL_REGEX.test(text)) {
            setDetectedType('url');
        }
        // Markdown detection
        else if (text.includes('#') || text.includes('**') || text.includes('```')) {
            setDetectedType('markdown');
        }
        // Default
        else {
            setDetectedType('text');
        }
    }, [text, autoDetect]);

    // Handle text submit
    const handleTextSubmit = useCallback(() => {
        if (!text.trim() || disabled || loading) return;

        const inputData: InputData = {
            id: generateId(),
            type: detectedType || 'text',
            content: text.trim(),
            metadata: {
                language: detectedType === 'code' ? 'javascript' : undefined,
            },
            timestamp: new Date(),
        };

        onSubmit(inputData);
        setText('');
        setDetectedType(null);
    }, [text, disabled, loading, detectedType, onSubmit]);

    // Handle URL submit
    const handleUrlSubmit = useCallback(async () => {
        if (!url.trim() || disabled || loading) return;

        if (!URL_REGEX.test(url)) {
            onError?.('Please enter a valid URL');
            return;
        }

        const inputData: InputData = {
            id: generateId(),
            type: 'url',
            content: url.trim(),
            metadata: {
                url: url.trim(),
            },
            timestamp: new Date(),
        };

        onSubmit(inputData);
        setUrl('');
        setMode('text');
    }, [url, disabled, loading, onError, onSubmit]);

    // Handle files selected
    const handleFilesSelected = useCallback((files: InputData[]) => {
        setAttachedFiles(prev => [...prev, ...files]);
        onFilesSelected?.(files);
    }, [onFilesSelected]);

    // Submit with attached files
    const handleSubmitWithFiles = useCallback(() => {
        if (attachedFiles.length === 0 && !text.trim()) return;

        // Submit text first if present
        if (text.trim()) {
            handleTextSubmit();
        }

        // Submit files
        attachedFiles.forEach(file => {
            onSubmit(file);
        });

        setAttachedFiles([]);
        setShowFileUpload(false);
    }, [attachedFiles, text, handleTextSubmit, onSubmit]);

    // Voice recording
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const inputData: InputData = {
                    id: generateId(),
                    type: 'audio',
                    content: audioBlob,
                    metadata: {
                        mimeType: 'audio/webm',
                        duration: recordingTime,
                    },
                    timestamp: new Date(),
                };
                onSubmit(inputData);
                audioChunksRef.current = [];
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            onError?.('Failed to access microphone');
            console.error('Microphone error:', error);
        }
    }, [recordingTime, onError, onSubmit]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    }, [isRecording]);

    // Format recording time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle key press
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (mode === 'url') {
                handleUrlSubmit();
            } else {
                handleTextSubmit();
            }
        }
    }, [mode, handleTextSubmit, handleUrlSubmit]);

    // Remove attached file
    const removeFile = useCallback((fileId: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    return (
        <div className={`w-full ${className}`}>
            {/* Attached Files Preview */}
            <AnimatePresence>
                {attachedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 flex flex-wrap gap-2"
                    >
                        {attachedFiles.map(file => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                            >
                                <span>{CONTENT_TYPE_ICONS[file.type]}</span>
                                <span className="text-sm text-gray-300 max-w-[150px] truncate">
                                    {file.metadata.fileName || `${file.type} input`}
                                </span>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-0.5 hover:bg-white/10 rounded"
                                >
                                    <X className="w-3 h-3 text-gray-400" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Upload Panel */}
            <AnimatePresence>
                {showFileUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3"
                    >
                        <FileUpload
                            config={{
                                acceptedTypes: acceptedTypes.filter(t => t !== 'text' && t !== 'url'),
                                maxFileSize,
                                multiple: true,
                                dragDrop: true,
                                preview: true,
                            }}
                            onFilesSelected={handleFilesSelected}
                            onError={onError}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Input Area */}
            <motion.div
                className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2"
                whileFocus-within={{ borderColor: 'rgba(249, 115, 22, 0.5)' }}
            >
                {/* Left Actions */}
                <div className="flex items-center gap-1">
                    {/* File Upload Toggle */}
                    {enableFiles && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFileUpload(!showFileUpload)}
                            className={`p-2 rounded-lg transition-colors ${showFileUpload ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-white/10 text-gray-400'
                                }`}
                            disabled={disabled}
                        >
                            <Paperclip className="w-5 h-5" />
                        </motion.button>
                    )}

                    {/* URL Mode Toggle */}
                    {enableUrl && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMode(mode === 'url' ? 'text' : 'url')}
                            className={`p-2 rounded-lg transition-colors ${mode === 'url' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-white/10 text-gray-400'
                                }`}
                            disabled={disabled}
                        >
                            <Link className="w-5 h-5" />
                        </motion.button>
                    )}
                </div>

                {/* Input Field */}
                <div className="flex-1 relative">
                    {mode === 'url' ? (
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter URL to analyze..."
                                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-500"
                                disabled={disabled || loading}
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <Input
                                ref={textInputRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={placeholder}
                                className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-500 pr-16"
                                disabled={disabled || loading || isRecording}
                            />

                            {/* Detected Type Badge */}
                            <AnimatePresence>
                                {detectedType && autoDetect && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <span
                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: `${CONTENT_TYPE_COLORS[detectedType]}20`,
                                                color: CONTENT_TYPE_COLORS[detectedType],
                                            }}
                                        >
                                            {CONTENT_TYPE_ICONS[detectedType]} {detectedType}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Recording Indicator */}
                    <AnimatePresence>
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-red-500/10 rounded-lg"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-red-400 font-medium">{formatTime(recordingTime)}</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    {/* Voice Recording */}
                    {enableVoice && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-2 rounded-lg transition-colors ${isRecording
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'hover:bg-white/10 text-gray-400'
                                }`}
                            disabled={disabled}
                        >
                            {isRecording ? (
                                <MicOff className="w-5 h-5" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </motion.button>
                    )}

                    {/* Submit Button */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={() => {
                                if (attachedFiles.length > 0) {
                                    handleSubmitWithFiles();
                                } else if (mode === 'url') {
                                    handleUrlSubmit();
                                } else {
                                    handleTextSubmit();
                                }
                            }}
                            disabled={
                                disabled ||
                                loading ||
                                isRecording ||
                                (mode === 'url' ? !url.trim() : !text.trim() && attachedFiles.length === 0)
                            }
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            size="icon"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-4 mt-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setText('Analyze this: ');
                        textInputRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <Sparkles className="w-3 h-3" />
                    Quick Analyze
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFileUpload(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <Image className="w-3 h-3" />
                    Upload Image
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setMode('url');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <Globe className="w-3 h-3" />
                    From URL
                </motion.button>
            </div>
        </div>
    );
}

export default UnifiedInput;
