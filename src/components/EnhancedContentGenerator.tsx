import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Image as ImageIcon, 
    Sparkles, 
    Download,
    Copy,
    Zap
} from 'lucide-react';
import { generateText, generateImage, AI_MODELS, IMAGE_MODELS } from '@/lib/ai';
import { toast } from 'sonner';

interface GeneratedContent {
    text?: string;
    images?: Array<{
        url: string;
        prompt: string;
        model: string;
        cost?: number;
    }>;
    timestamp: Date;
    contentType: string;
}

const EnhancedContentGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [contentType, setContentType] = useState('blog');
    const [textModel, setTextModel] = useState('planner');
    const [imageModel, setImageModel] = useState('flux');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

    const contentTypes = [
        { value: 'blog', label: 'Blog Post' },
        { value: 'social', label: 'Social Media' },
        { value: 'email', label: 'Email Campaign' },
        { value: 'product', label: 'Product Description' },
        { value: 'article', label: 'Article' },
        { value: 'marketing', label: 'Marketing Copy' }
    ];

    const handleGenerateText = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        try {
            const textPrompt = `Create ${contentType} content about: ${prompt}`;
            const result = await generateText(textModel as any, textPrompt);

            if (result.success && result.data) {
                const newContent: GeneratedContent = {
                    text: result.data,
                    timestamp: new Date(),
                    contentType: contentType
                };
                setGeneratedContent(prev => [newContent, ...prev]);
                toast.success('Content generated successfully!');
            } else {
                toast.error(result.error || 'Failed to generate content');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateImages = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateImage(prompt, imageModel, { num_images: 3 });

            if (result.success && result.data) {
                const newContent: GeneratedContent = {
                    images: result.data.map(img => ({
                        url: img.url,
                        prompt: img.revised_prompt || prompt,
                        model: img.model || imageModel,
                        cost: result.cost_estimate ? result.cost_estimate / result.data.length : undefined
                    })),
                    timestamp: new Date(),
                    contentType: 'images'
                };
                setGeneratedContent(prev => [newContent, ...prev]);
                toast.success('Images generated successfully!');
            } else {
                toast.error(result.error || 'Failed to generate images');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate images');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Content copied to clipboard!');
    };

    const handleDownload = (content: GeneratedContent) => {
        const element = document.createElement('a');
        const file = new Blob([content.text || ''], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${content.contentType}-${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Content downloaded!');
    };

    const handleDownloadImage = (imageUrl: string, prompt: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `generated-image-${prompt.slice(0, 20).replace(/\s+/g, '-')}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded!');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Enhanced AI Content Generator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content Type</label>
                                <Select value={contentType} onValueChange={setContentType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contentTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Text Model</label>
                                <Select value={textModel} onValueChange={setTextModel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(AI_MODELS).map(([key, model]) => (
                                            <SelectItem key={key} value={key}>
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image Model</label>
                                <Select value={imageModel} onValueChange={setImageModel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(IMAGE_MODELS).map(([key, model]) => (
                                            <SelectItem key={key} value={key}>
                                                {model.name} - ${model.cost}/image
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prompt</label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe what content you want to generate..."
                                className="min-h-24"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleGenerateText}
                            disabled={isGenerating}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Text
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleGenerateImages}
                            disabled={isGenerating}
                            variant="outline"
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Generate Images
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {generatedContent.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Generated Content</h3>
                    <div className="grid gap-4">
                        {generatedContent.map((content, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {content.contentType === 'images' ? 'Generated Images' : `${content.contentType} Content`}
                                        </CardTitle>
                                        <Badge variant="outline">
                                            {content.timestamp.toLocaleTimeString()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {content.text && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">Generated Text</h4>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCopy(content.text!)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownload(content)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-md">
                                                <p className="text-sm whitespace-pre-wrap">{content.text}</p>
                                            </div>
                                        </div>
                                    )}

                                    {content.images && content.images.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Generated Images</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {content.images.map((image, imgIndex) => (
                                                    <div key={imgIndex} className="space-y-2">
                                                        <img
                                                            src={image.url}
                                                            alt={image.prompt}
                                                            className="w-full h-32 object-cover rounded-md"
                                                        />
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground truncate">{image.prompt}</p>
                                                            <div className="flex justify-between items-center">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {image.model}
                                                                </Badge>
                                                                {image.cost && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ${image.cost.toFixed(3)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDownloadImage(image.url, image.prompt)}
                                                                className="w-full"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedContentGenerator;
