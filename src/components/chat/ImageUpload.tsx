import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ImageFile {
    file: File;
    preview: string;
    id: string;
}

interface ImageUploadProps {
    onUpload: (files: File[]) => Promise<void>;
    maxFiles?: number;
    maxSizeMB?: number;
}

export function ImageUpload({ onUpload, maxFiles = 5, maxSizeMB = 10 }: ImageUploadProps) {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        // Validate file count
        if (images.length + files.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} images allowed`);
            return;
        }

        // Validate file types and sizes
        const validFiles: ImageFile[] = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                continue;
            }

            if (file.size > maxSizeMB * 1024 * 1024) {
                toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
                continue;
            }

            const preview = URL.createObjectURL(file);
            validFiles.push({
                file,
                preview,
                id: Math.random().toString(36).substr(2, 9)
            });
        }

        setImages(prev => [...prev, ...validFiles]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (id: string) => {
        setImages(prev => {
            const image = prev.find(img => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
            return prev.filter(img => img.id !== id);
        });
    };

    const handleUpload = async () => {
        if (images.length === 0) return;

        setIsUploading(true);
        try {
            await onUpload(images.map(img => img.file));

            // Clear images after successful upload
            images.forEach(img => URL.revokeObjectURL(img.preview));
            setImages([]);
            toast.success('Images uploaded successfully');
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);

        // Create synthetic event for handleFileSelect
        const syntheticEvent = {
            target: { files }
        } as unknown as ChangeEvent<HTMLInputElement>;

        handleFileSelect(syntheticEvent);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    Click or drag images here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Max {maxFiles} images, up to {maxSizeMB}MB each
                </p>
            </div>

            {/* Image previews */}
            <AnimatePresence>
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((image) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group"
                                >
                                    <Card className="overflow-hidden aspect-square">
                                        <img
                                            src={image.preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </Card>
                                    <button
                                        onClick={() => removeImage(image.id)}
                                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full mt-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload {images.length} image{images.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
