/**
 * G-Nexus File Upload Component
 * Advanced file upload with drag-drop, preview, and validation
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, File, Image, Video, Music, FileText,
    FileSpreadsheet, Code, Link, AlertCircle, CheckCircle,
    Loader2, Trash2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import {
    ContentType, InputData, InputMetadata, FileUploadConfig,
    DEFAULT_FILE_CONFIG, MIME_TYPE_MAP, CONTENT_TYPE_ICONS, CONTENT_TYPE_COLORS
} from './types';

// Generate unique ID
const generateId = () => `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get content type from MIME
function getContentType(mimeType: string): ContentType {
    return MIME_TYPE_MAP[mimeType] || 'document';
}

// Get icon component for content type
function getTypeIcon(type: ContentType) {
    const icons: Record<ContentType, React.ReactNode> = {
        image: <Image className="w-5 h-5" />,
        video: <Video className="w-5 h-5" />,
        audio: <Music className="w-5 h-5" />,
        pdf: <FileText className="w-5 h-5" />,
        spreadsheet: <FileSpreadsheet className="w-5 h-5" />,
        document: <FileText className="w-5 h-5" />,
        code: <Code className="w-5 h-5" />,
        url: <Link className="w-5 h-5" />,
        text: <FileText className="w-5 h-5" />,
        markdown: <FileText className="w-5 h-5" />,
        json: <Code className="w-5 h-5" />,
        csv: <FileSpreadsheet className="w-5 h-5" />,
    };
    return icons[type] || <File className="w-5 h-5" />;
}

// Format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface FileUploadProps {
    config?: Partial<FileUploadConfig>;
    onFilesSelected: (files: InputData[]) => void;
    onError?: (error: string) => void;
    className?: string;
    disabled?: boolean;
}

export function FileUpload({
    config = {},
    onFilesSelected,
    onError,
    className = '',
    disabled = false,
}: FileUploadProps) {
    const finalConfig: FileUploadConfig = { ...DEFAULT_FILE_CONFIG, ...config };
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<InputData[]>([]);
    const [previews, setPreviews] = useState<Map<string, string>>(new Map());
    const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle drag events
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Process files
    const processFiles = useCallback(async (fileList: FileList | File[]) => {
        const fileArray = Array.from(fileList);
        const newFiles: InputData[] = [];
        const newPreviews = new Map(previews);
        const newLoading = new Set(loadingFiles);

        for (const file of fileArray) {
            // Validate file size
            if (file.size > finalConfig.maxFileSize) {
                onError?.(`File "${file.name}" exceeds maximum size of ${formatFileSize(finalConfig.maxFileSize)}`);
                continue;
            }

            const fileId = generateId();
            const contentType = getContentType(file.type);
            
            // Check if type is accepted
            if (finalConfig.acceptedTypes.length > 0 && !finalConfig.acceptedTypes.includes(contentType)) {
                onError?.(`File type "${contentType}" is not accepted`);
                continue;
            }

            newLoading.add(fileId);

            const inputData: InputData = {
                id: fileId,
                type: contentType,
                content: file,
                metadata: {
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                },
                timestamp: new Date(),
            };

            // Generate preview for images
            if (finalConfig.preview && contentType === 'image') {
                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            setPreviews(prev => new Map(prev).set(fileId, e.target!.result as string));
                        }
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Preview generation failed:', error);
                }
            }

            // Get video/audio duration
            if (contentType === 'video' || contentType === 'audio') {
                const url = URL.createObjectURL(file);
                const media = document.createElement(contentType === 'video' ? 'video' : 'audio');
                media.onloadedmetadata = () => {
                    inputData.metadata.duration = media.duration;
                    URL.revokeObjectURL(url);
                };
                media.src = url;
            }

            newFiles.push(inputData);
        }

        setLoadingFiles(newLoading);
        setFiles(prev => [...prev, ...newFiles]);
        
        if (newFiles.length > 0) {
            onFilesSelected(newFiles);
            toast.success(`${newFiles.length} file(s) added`);
        }

        // Simulate loading complete
        setTimeout(() => {
            setLoadingFiles(prev => {
                const updated = new Set(prev);
                newFiles.forEach(f => updated.delete(f.id));
                return updated;
            });
        }, 500);
    }, [finalConfig, previews, loadingFiles, onFilesSelected, onError]);

    // Handle drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        }
    }, [disabled, processFiles]);

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    // Handle paste
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (disabled) return;
            
            const items = e.clipboardData?.items;
            if (!items) return;

            const files: File[] = [];
            for (const item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }

            if (files.length > 0) {
                processFiles(files);
                toast.success('Pasted content added');
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [disabled, processFiles]);

    // Remove file
    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setPreviews(prev => {
            const updated = new Map(prev);
            updated.delete(fileId);
            return updated;
        });
    }, []);

    // Clear all files
    const clearFiles = useCallback(() => {
        setFiles([]);
        setPreviews(new Map());
    }, []);

    // Open file dialog
    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Drop Zone */}
            <motion.div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                animate={{
                    scale: isDragging ? 1.02 : 1,
                    borderColor: isDragging ? 'rgba(249, 115, 22, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: isDragging ? 'rgba(249, 115, 22, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                }}
                className="relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer"
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={finalConfig.multiple}
                    accept={finalConfig.acceptedTypes.map(t => {
                        switch (t) {
                            case 'image': return 'image/*';
                            case 'video': return 'video/*';
                            case 'audio': return 'audio/*';
                            case 'pdf': return '.pdf';
                            case 'spreadsheet': return '.xlsx,.xls,.csv';
                            case 'document': return '.doc,.docx,.txt,.md';
                            case 'json': return '.json';
                            default: return '*';
                        }
                    }).join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="flex flex-col items-center justify-center text-center">
                    <motion.div
                        animate={{
                            y: isDragging ? -10 : 0,
                            scale: isDragging ? 1.1 : 1,
                        }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center mb-4"
                    >
                        <Upload className="w-8 h-8 text-orange-500" />
                    </motion.div>

                    <h3 className="text-lg font-medium text-white mb-2">
                        {isDragging ? 'Drop files here' : 'Upload Files'}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-4">
                        Drag and drop files, or click to browse
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {finalConfig.acceptedTypes.slice(0, 5).map(type => (
                            <span
                                key={type}
                                className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-400"
                            >
                                {CONTENT_TYPE_ICONS[type]} {type}
                            </span>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                        Max file size: {formatFileSize(finalConfig.maxFileSize)}
                    </p>
                </div>

                {/* Loading Overlay */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-orange-500/10 rounded-xl flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Upload className="w-12 h-12 text-orange-500" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">
                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={clearFiles}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear all
                            </button>
                        </div>

                        {files.map((file, index) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                            >
                                {/* Preview or Icon */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                    {previews.has(file.id) ? (
                                        <img
                                            src={previews.get(file.id)}
                                            alt={file.metadata.fileName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ backgroundColor: `${CONTENT_TYPE_COLORS[file.type]}20` }}
                                        >
                                            <span style={{ color: CONTENT_TYPE_COLORS[file.type] }}>
                                                {getTypeIcon(file.type)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white truncate">
                                            {file.metadata.fileName}
                                        </span>
                                        <span
                                            className="text-[10px] px-1.5 py-0.5 rounded"
                                            style={{
                                                backgroundColor: `${CONTENT_TYPE_COLORS[file.type]}20`,
                                                color: CONTENT_TYPE_COLORS[file.type],
                                            }}
                                        >
                                            {file.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatFileSize(file.metadata.fileSize || 0)}
                                        {file.metadata.duration && ` • ${Math.round(file.metadata.duration)}s`}
                                    </div>
                                </div>

                                {/* Status */}
                                {loadingFiles.has(file.id) ? (
                                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}

                                {/* Actions */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(file.id);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FileUpload;
