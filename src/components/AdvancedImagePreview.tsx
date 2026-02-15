import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Image as ImageIcon,
    Download,
    RefreshCw,
    Zap,
    Settings,
    Copy,
    Eye,
    Trash2
} from 'lucide-react';
import { generateImage, IMAGE_MODELS } from '@/lib/ai';
import { toast } from 'sonner';

interface GeneratedImageData {
    url: string;
    prompt: string;
    model: string;
    timestamp: Date;
    cost?: number;
    width?: number;
    height?: number;
}

interface AdvancedImagePreviewProps {
    onImageGenerated?: (images: GeneratedImageData[]) => void;
    className?: string;
}

const AdvancedImagePreview: React.FC<AdvancedImagePreviewProps> = ({
    onImageGenerated,
    className = ""
}) => {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('flux');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
    const [selectedImage, setSelectedImage] = useState<GeneratedImageData | null>(null);
    const [advancedSettings, setAdvancedSettings] = useState({
        width: 1024,
        height: 1024,
        quality: 'high',
        style: 'natural',
        negativePrompt: '',
        numImages: 1,
        guidanceScale: 7.5,
        inferenceSteps: 50
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleGenerateImage = useCallback(async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateImage(prompt, selectedModel, {
                width: advancedSettings.width,
                height: advancedSettings.height,
                quality: advancedSettings.quality === 'high' ? 1 : 0,
                style: advancedSettings.style,
                negative_prompt: advancedSettings.negativePrompt,
                num_images: advancedSettings.numImages,
                guidance_scale: advancedSettings.guidanceScale,
                num_inference_steps: advancedSettings.inferenceSteps
            });

            if (result.success && result.data) {
                const newImages: GeneratedImageData[] = result.data.map(img => ({
                    url: img.url,
                    prompt: img.revised_prompt || prompt,
                    model: result.model_used || selectedModel,
                    timestamp: new Date(),
                    cost: result.cost_estimate ? result.cost_estimate / result.data.length : undefined,
                    width: img.width,
                    height: img.height
                }));

                setGeneratedImages(prev => [...newImages, ...prev]);
                onImageGenerated?.(newImages);
                toast.success(`Generated ${newImages.length} image(s) successfully!`);
            } else {
                toast.error(result.error || 'Failed to generate image');
            }
        } catch (error) {
            console.error('Image generation error:', error);
            toast.error('Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, selectedModel, advancedSettings, onImageGenerated]);

    const handleDownloadImage = useCallback((imageData: GeneratedImageData) => {
        const link = document.createElement('a');
        link.href = imageData.url;
        link.download = `generated-image-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded!');
    }, []);

    const handleCopyPrompt = useCallback((promptText: string) => {
        navigator.clipboard.writeText(promptText);
        toast.success('Prompt copied to clipboard!');
    }, []);

    const handleDeleteImage = useCallback((imageToDelete: GeneratedImageData) => {
        setGeneratedImages(prev => prev.filter(img => img.url !== imageToDelete.url));
        if (selectedImage?.url === imageToDelete.url) {
            setSelectedImage(null);
        }
        toast.success('Image deleted!');
    }, []);

    return (
        <div className={`space-y-6 ${className}`}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Advanced AI Image Generation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="generate" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="generate">Generate</TabsTrigger>
                            <TabsTrigger value="gallery">Gallery ({generatedImages.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="generate" className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">AI Model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    {Object.entries(IMAGE_MODELS).map(([key, model]) => (
                                        <option key={key} value={key}>
                                            {model.name} - ${model.cost}/image
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the image you want to generate..."
                                    className="w-full p-3 border rounded-md resize-none h-24"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleGenerateImage}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="flex-1"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 mr-2" />
                                            Generate Image
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>

                            {showAdvanced && (
                                <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Width</label>
                                            <input
                                                type="number"
                                                value={advancedSettings.width}
                                                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 1024 }))}
                                                className="w-full p-2 border rounded-md"
                                                min="256"
                                                max="1024"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Height</label>
                                            <input
                                                type="number"
                                                value={advancedSettings.height}
                                                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 1024 }))}
                                                className="w-full p-2 border rounded-md"
                                                min="256"
                                                max="1024"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Quality</label>
                                        <select
                                            value={advancedSettings.quality}
                                            onChange={(e) => setAdvancedSettings(prev => ({ ...prev, quality: e.target.value }))}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="high">High (HD)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Style</label>
                                        <select
                                            value={advancedSettings.style}
                                            onChange={(e) => setAdvancedSettings(prev => ({ ...prev, style: e.target.value }))}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="natural">Natural</option>
                                            <option value="vivid">Vivid</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Negative Prompt</label>
                                        <textarea
                                            value={advancedSettings.negativePrompt}
                                            onChange={(e) => setAdvancedSettings(prev => ({ ...prev, negativePrompt: e.target.value }))}
                                            placeholder="What you don't want in the image..."
                                            className="w-full p-2 border rounded-md resize-none h-16"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Number of Images</label>
                                        <input
                                            type="number"
                                            value={advancedSettings.numImages}
                                            onChange={(e) => setAdvancedSettings(prev => ({ ...prev, numImages: parseInt(e.target.value) || 1 }))}
                                            className="w-full p-2 border rounded-md"
                                            min="1"
                                            max="4"
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="gallery" className="space-y-4">
                            {generatedImages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No images generated yet</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-96">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {generatedImages.map((image, index) => (
                                            <Card key={`${image.url}-${index}`} className="overflow-hidden">
                                                <div className="relative group">
                                                    <img
                                                        src={image.url}
                                                        alt={image.prompt}
                                                        className="w-full h-48 object-cover cursor-pointer"
                                                        onClick={() => setSelectedImage(image)}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => setSelectedImage(image)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleDownloadImage(image)}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleCopyPrompt(image.prompt)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteImage(image)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardContent className="p-3">
                                                    <p className="text-sm font-medium truncate mb-2">{image.prompt}</p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <Badge variant="outline">{image.model}</Badge>
                                                        <span>{image.timestamp.toLocaleTimeString()}</span>
                                                    </div>
                                                    {image.cost && (
                                                        <p className="text-xs text-gray-500 mt-1">Cost: ${image.cost.toFixed(4)}</p>
                                                    )}
                                                    {image.width && image.height && (
                                                        <p className="text-xs text-gray-500">{image.width}x{image.height}</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {selectedImage && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Image Preview</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedImage(null)}
                            >
                                ×
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.prompt}
                            className="w-full rounded-lg mb-4"
                        />
                        <div className="space-y-2">
                            <p className="text-sm"><strong>Prompt:</strong> {selectedImage.prompt}</p>
                            <p className="text-sm"><strong>Model:</strong> {selectedImage.model}</p>
                            <p className="text-sm"><strong>Generated:</strong> {selectedImage.timestamp.toLocaleString()}</p>
                            {selectedImage.width && selectedImage.height && (
                                <p className="text-sm"><strong>Dimensions:</strong> {selectedImage.width}x{selectedImage.height}</p>
                            )}
                            {selectedImage.cost && (
                                <p className="text-sm"><strong>Cost:</strong> ${selectedImage.cost.toFixed(4)}</p>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleDownloadImage(selectedImage)} className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button variant="outline" onClick={() => handleCopyPrompt(selectedImage.prompt)} className="flex-1">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Prompt
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdvancedImagePreview;
