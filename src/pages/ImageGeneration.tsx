import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHero } from '@/components/PageHero';
import AdvancedImagePreview from '@/components/AdvancedImagePreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Image as ImageIcon,
    Zap,
    Settings,
    Palette,
    Sparkles,
    TrendingUp,
    DollarSign,
    Clock,
    Layers
} from 'lucide-react';
import { generateContentImages, IMAGE_MODELS } from '@/lib/ai';
import { toast } from 'sonner';

const ImageGeneration: React.FC = () => {
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);

    const handleContentImageGeneration = async () => {
        setIsGeneratingContent(true);
        try {
            const sampleContent = `
                In today's digital landscape, artificial intelligence is revolutionizing how we create and consume content. 
                From automated writing assistants to advanced image generation, AI tools are empowering creators 
                to produce high-quality content at scale. The integration of machine learning algorithms with 
                creative workflows has opened up new possibilities for businesses and individuals alike.
            `;

            const result = await generateContentImages(sampleContent, 'blog', 3);

            if (result.success && result.data) {
                toast.success(`Generated ${result.data.length} content-aware images!`);
            } else {
                toast.error(result.error || 'Failed to generate content images');
            }
        } catch (error) {
            console.error('Content image generation error:', error);
            toast.error('Failed to generate content images');
        } finally {
            setIsGeneratingContent(false);
        }
    };

    const features = [
        {
            icon: <ImageIcon className="w-6 h-6" />,
            title: "Multiple AI Models",
            description: "Choose from Adis (አዲስ), Tikus (ትኩስ), Zema (ዜማ), and Wub (ውብ)",
            color: "text-blue-600"
        },
        {
            icon: <Palette className="w-6 h-6" />,
            title: "Advanced Customization",
            description: "Control dimensions, quality, style, and negative prompts",
            color: "text-purple-600"
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Content-Aware Generation",
            description: "Automatically generate relevant images based on your text content",
            color: "text-yellow-600"
        },
        {
            icon: <Layers className="w-6 h-6" />,
            title: "Batch Processing",
            description: "Generate multiple images at once with consistent styling",
            color: "text-green-600"
        }
    ];

    const modelStats = [
        { name: 'Zema (ዜማ)', cost: '$0.055', quality: 'High', speed: 'Fast', bestFor: 'Professional content' },
        { name: 'Adis (አዲስ)', cost: '$0.04', quality: 'High', speed: 'Medium', bestFor: 'Creative concepts' },
        { name: 'Wub (ውብ)', cost: '$0.04', quality: 'High', speed: 'Slow', bestFor: 'Artistic styles' },
        { name: 'Tikus (ትኩስ)', cost: '$0.01', quality: 'Standard', speed: 'Fast', bestFor: 'Quick drafts' }
    ];

    return (
        <PageLayout>
            <PageHero
                title="Advanced AI Image Generation"
                subtitle="Create stunning images with state-of-the-art AI models"
                badge="AI Powered"
            />

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="generator" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generator">Image Generator</TabsTrigger>
                        <TabsTrigger value="content-aware">Content-Aware</TabsTrigger>
                        <TabsTrigger value="models">Model Comparison</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generator" className="space-y-8">
                        <AdvancedImagePreview />
                    </TabsContent>

                    <TabsContent value="content-aware" className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Content-Aware Image Generation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">
                                    Automatically generate relevant images based on your text content. Our AI analyzes your content
                                    and creates images that complement your message perfectly.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Sample Blog Content</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                "In today's digital landscape, artificial intelligence is revolutionizing how we create and consume content..."
                                            </p>
                                            <button
                                                onClick={handleContentImageGeneration}
                                                disabled={isGeneratingContent}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {isGeneratingContent ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-4 h-4" />
                                                        Generate Content Images
                                                    </>
                                                )}
                                            </button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">How It Works</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">1</div>
                                                <div>
                                                    <p className="font-medium">Content Analysis</p>
                                                    <p className="text-sm text-muted-foreground">AI extracts key concepts and themes</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">2</div>
                                                <div>
                                                    <p className="font-medium">Prompt Generation</p>
                                                    <p className="text-sm text-muted-foreground">Creates optimized image prompts</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">3</div>
                                                <div>
                                                    <p className="font-medium">Image Creation</p>
                                                    <p className="text-sm text-muted-foreground">Generates multiple relevant images</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="models" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <Card key={index} className="text-center">
                                    <CardContent className="pt-6">
                                        <div className={`mx-auto mb-4 ${feature.color}`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    AI Model Comparison
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">Model</th>
                                                <th className="text-left p-2">Cost/Image</th>
                                                <th className="text-left p-2">Quality</th>
                                                <th className="text-left p-2">Speed</th>
                                                <th className="text-left p-2">Best For</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelStats.map((model, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 font-medium">{model.name}</td>
                                                    <td className="p-2">{model.cost}</td>
                                                    <td className="p-2">
                                                        <Badge variant={model.quality === 'High' ? 'default' : 'secondary'}>
                                                            {model.quality}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2">
                                                        <Badge
                                                            variant={
                                                                model.speed === 'Fast' ? 'default' :
                                                                    model.speed === 'Medium' ? 'secondary' : 'outline'
                                                            }
                                                        >
                                                            {model.speed}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2 text-sm text-muted-foreground">{model.bestFor}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
};

export default ImageGeneration;
