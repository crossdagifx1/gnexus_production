import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileText,
    Image,
    Video,
    Code,
    Mail,
    MessageSquare,
    Copy,
    Download,
    RefreshCw,
    Sparkles,
    Zap,
    Target,
    TrendingUp,
    Users,
    Clock,
    CheckCircle
} from 'lucide-react';
import { generateText, generateMarketingContent } from '@/lib/ai';

interface GeneratedContent {
    id: string;
    type: string;
    title: string;
    content: string;
    metadata: {
        tone: string;
        audience: string;
        purpose: string;
        length: number;
        keywords: string[];
    };
    timestamp: Date;
}

const ContentGenerator: React.FC = () => {
    const [contentType, setContentType] = useState('blog');
    const [topic, setTopic] = useState('');
    const [targetAudience, setTargetAudience] = useState('general');
    const [tone, setTone] = useState('professional');
    const [purpose, setPurpose] = useState('inform');
    const [length, setLength] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

    const contentTypes = [
        { value: 'blog', label: 'Blog Post', icon: FileText },
        { value: 'social', label: 'Social Media', icon: MessageSquare },
        { value: 'email', label: 'Email Campaign', icon: Mail },
        { value: 'product', label: 'Product Description', icon: Target },
        { value: 'video', label: 'Video Script', icon: Video },
        { value: 'code', label: 'Code Documentation', icon: Code },
        { value: 'marketing', label: 'Marketing Copy', icon: TrendingUp },
    ];

    const audiences = [
        { value: 'general', label: 'General Audience' },
        { value: 'technical', label: 'Technical Professionals' },
        { value: 'business', label: 'Business Executives' },
        { value: 'students', label: 'Students' },
        { value: 'developers', label: 'Developers' },
        { value: 'marketers', label: 'Marketing Professionals' },
    ];

    const tones = [
        { value: 'professional', label: 'Professional' },
        { value: 'casual', label: 'Casual' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'authoritative', label: 'Authoritative' },
    ];

    const purposes = [
        { value: 'inform', label: 'Inform' },
        { value: 'persuade', label: 'Persuade' },
        { value: 'entertain', label: 'Entertain' },
        { value: 'educate', label: 'Educate' },
        { value: 'convert', label: 'Convert/Sell' },
    ];

    const lengths = [
        { value: 'short', label: 'Short (100-200 words)' },
        { value: 'medium', label: 'Medium (300-500 words)' },
        { value: 'long', label: 'Long (600-1000 words)' },
        { value: 'comprehensive', label: 'Comprehensive (1000+ words)' },
    ];

    const generateContent = async () => {
        if (!topic.trim()) return;

        setIsGenerating(true);
        try {
            const prompt = `Generate ${contentType} content about "${topic}" for ${targetAudience} audience in a ${tone} tone. The purpose is to ${purpose}. Target length: ${length}.`;

            const response = await generateText('marketing', prompt);

            if (response.success && response.data) {
                const newContent: GeneratedContent = {
                    id: Date.now().toString(),
                    type: contentType,
                    title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} about ${topic}`,
                    content: response.data,
                    metadata: {
                        tone,
                        audience: targetAudience,
                        purpose,
                        length: response.data.split(' ').length,
                        keywords: extractKeywords(response.data)
                    },
                    timestamp: new Date()
                };

                setGeneratedContent(prev => [newContent, ...prev]);
            }
        } catch (error) {
            console.error('Content generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const extractKeywords = (text: string): string[] => {
        const words = text.toLowerCase().split(/\s+/);
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their', 'them', 'there', 'here', 'from', 'up', 'out', 'about', 'into', 'over', 'time', 'what', 'which', 'when', 'where', 'why', 'how', 'all', 'any', 'can', 'will', 'just', 'should', 'could', 'would', 'may', 'might', 'must'];

        return words
            .filter(word => word.length > 3 && !commonWords.includes(word))
            .slice(0, 10)
            .filter((word, index, arr) => arr.indexOf(word) === index);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const downloadContent = (content: GeneratedContent) => {
        const element = document.createElement('a');
        const file = new Blob([content.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${content.type}-${content.id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
    };

    const clearAll = () => {
        setGeneratedContent([]);
        setTopic('');
    };

    const getContentIcon = (type: string) => {
        const contentType = contentTypes.find(t => t.value === type);
        return contentType?.icon || FileText;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Content Generator</h1>
                    <p className="text-muted-foreground">Create high-quality content with AI assistant</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {generatedContent.length} items generated
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Content Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Content Type</label>
                            <Select value={contentType} onValueChange={setContentType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {contentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Topic</label>
                            <Textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter your topic here..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Audience</label>
                                <Select value={targetAudience} onValueChange={setTargetAudience}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {audiences.map((audience) => (
                                            <SelectItem key={audience.value} value={audience.value}>
                                                {audience.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tone</label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tones.map((tone) => (
                                            <SelectItem key={tone.value} value={tone.value}>
                                                {tone.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Purpose</label>
                            <Select value={purpose} onValueChange={setPurpose}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {purposes.map((purpose) => (
                                        <SelectItem key={purpose.value} value={purpose.value}>
                                            {purpose.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Length</label>
                            <Select value={length} onValueChange={setLength}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {lengths.map((length) => (
                                        <SelectItem key={length.value} value={length.value}>
                                            {length.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={generateContent}
                            disabled={isGenerating || !topic.trim()}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Content
                                </>
                            )}
                        </Button>

                        {generatedContent.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={clearAll}
                                className="w-full"
                            >
                                Clear All
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Generated Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px]">
                            {generatedContent.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No content generated yet</p>
                                    <p className="text-sm">Configure your settings and generate your first piece of content</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {generatedContent.map((content) => (
                                        <Card key={content.id}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {React.createElement(getContentIcon(content.type), { className: "w-4 h-4" })}
                                                        <CardTitle className="text-lg">{content.title}</CardTitle>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{content.type}</Badge>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(content.content)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => downloadContent(content)}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        <Badge variant="secondary">
                                                            {content.metadata.tone}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            {content.metadata.audience}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            {content.metadata.purpose}
                                                        </Badge>
                                                        <Badge variant="secondary">
                                                            {content.metadata.length} words
                                                        </Badge>
                                                    </div>

                                                    <div className="prose prose-sm max-w-none">
                                                        <p className="whitespace-pre-wrap">{content.content}</p>
                                                    </div>

                                                    {content.metadata.keywords.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2">Keywords:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {content.metadata.keywords.map((keyword, index) => (
                                                                    <Badge key={index} variant="outline" className="text-xs">
                                                                        {keyword}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="text-xs text-muted-foreground">
                                                        Generated: {content.timestamp.toLocaleString()}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContentGenerator;
