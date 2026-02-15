/**
 * G-NEXUS Advanced HTML Generator Component
 * Full-featured UI for AI research + design HTML generation
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Sparkles,
    Code,
    Eye,
    Download,
    Copy,
    ExternalLink,
    Smartphone,
    Tablet,
    Monitor,
    Loader2,
    CheckCircle,
    Brain,
    Palette,
    FileCode,
    Zap,
    Search,
    BarChart3,
    Users,
    Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { generateText } from '@/lib/ai';
import {
    generateHTMLWithAI,
    generateHTMLWithAIStreaming,
    getTemplateTypeById,
    getAllTemplateTypes,
    selectBestTemplateType,
    TEMPLATE_TYPES,
    type TemplateType,
    type GenerationContext
} from '@/lib/htmlGenerators';
import { detectIndustry, INDUSTRY_PROFILES } from '@/lib/designIntelligence';
import { generationCache, formatCacheStats, type CacheStats } from '@/lib/generationCache';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface GenerationStage {
    id: string;
    name: string;
    icon: React.ElementType;
    status: 'pending' | 'active' | 'completed' | 'error';
    progress: number;
    result?: string;
    duration?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AdvancedHTMLGenerator: React.FC = () => {
    // State
    const [prompt, setPrompt] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('future-os');
    const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
    const [enableResearch, setEnableResearch] = useState(true);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState('config');

    // Streaming state
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedHTML, setStreamedHTML] = useState<string>('');
    const [streamProgress, setStreamProgress] = useState({ charCount: 0, isValid: false });

    const [stages, setStages] = useState<GenerationStage[]>([
        { id: 'analyze', name: 'Analyzing Prompt', icon: Search, status: 'pending', progress: 0 },
        { id: 'research', name: 'AI Research', icon: Brain, status: 'pending', progress: 0 },
        { id: 'generate', name: 'HTML Generation', icon: FileCode, status: 'pending', progress: 0 }
    ]);

    // Cache stats
    const [cacheStats, setCacheStats] = useState<CacheStats>(generationCache.getStats());

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Detect industry from prompt
    const detectedIndustry = prompt ? detectIndustry(prompt) : null;
    const activeIndustry = selectedIndustry
        ? INDUSTRY_PROFILES.find(p => p.id === selectedIndustry)
        : detectedIndustry;

    // Get template type info
    const activeTemplateType = getTemplateTypeById(selectedTemplate);

    // Update stage status
    const updateStage = useCallback((stageId: string, updates: Partial<GenerationStage>) => {
        setStages(prev => prev.map(stage =>
            stage.id === stageId ? { ...stage, ...updates } : stage
        ));
    }, []);

    // Reset stages
    const resetStages = useCallback(() => {
        setStages(prev => prev.map(stage => ({
            ...stage,
            status: 'pending',
            progress: 0,
            result: undefined,
            duration: undefined
        })));
    }, []);

    // Generate HTML
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        resetStages();
        setGeneratedHTML(null);
        setActiveTab('progress');

        const startTime = Date.now();
        let analysis = '';

        try {
            // Stage 1: Analyze Prompt
            updateStage('analyze', { status: 'active', progress: 50 });
            await new Promise(r => setTimeout(r, 500));
            updateStage('analyze', { status: 'completed', progress: 100, duration: Date.now() - startTime });

            // Stage 2: AI Research (if enabled)
            // Optimization: Skip backend AI for FutureOS as it uses client-side NeuralCore
            const isFutureOS = selectedTemplate === 'future-os';

            if (enableResearch && !isFutureOS) {
                const researchStart = Date.now();
                updateStage('research', { status: 'active', progress: 20 });

                const researchPrompt = `Research and analyze: ${prompt}
                
Provide comprehensive analysis including:
1. Market overview and trends
2. Key features and benefits
3. Target audience insights
4. Competitive landscape
5. Technical recommendations
6. Implementation considerations

Format with clear headers and bullet points.`;

                try {
                    // Add race condition to prevent hanging
                    const researchResult = await Promise.race([
                        generateText('analyst', researchPrompt),
                        new Promise<any>(resolve => setTimeout(() => resolve({ success: true, data: '' }), 8000))
                    ]);

                    if (researchResult.success && researchResult.data) {
                        analysis = researchResult.data;
                    }
                } catch (e) {
                    console.warn('Research failed, proceeding with generation', e);
                }

                updateStage('research', {
                    status: 'completed',
                    progress: 100,
                    result: analysis.slice(0, 200) + '...',
                    duration: Date.now() - researchStart
                });
            } else {
                // For FutureOS or disabled research, just simulate brief delay
                if (isFutureOS) {
                    updateStage('research', { status: 'active', progress: 50 });
                    await new Promise(r => setTimeout(r, 800)); // Cinematic delay
                }
                updateStage('research', { status: 'completed', progress: 100, result: 'Neural Core Active' });
            }

            // Stage 3: HTML Generation with Streaming
            const htmlStart = Date.now();
            updateStage('generate', { status: 'active', progress: 20 });

            // Create generation context
            const generationContext: GenerationContext = {
                goal: prompt,
                analysis: analysis,
                industry: selectedIndustry || undefined
            };

            // Generate HTML using streaming
            let html = '';
            try {
                setIsStreaming(true);
                html = await generateHTMLWithAIStreaming(
                    selectedTemplate,
                    generationContext,
                    (partialHTML, progress) => {
                        // Update preview in real-time
                        setStreamedHTML(partialHTML);
                        setStreamProgress({
                            charCount: progress.charCount,
                            isValid: progress.isValid
                        });

                        // Update generation progress based on character count
                        const estimatedProgress = Math.min(95, 20 + (progress.charCount / 100));
                        updateStage('generate', { progress: estimatedProgress });
                    }
                );
                setIsStreaming(false);
            } catch (error) {
                console.error('HTML generation failed:', error);
                setIsStreaming(false);
                throw error;
            }

            updateStage('generate', {
                status: 'completed',
                progress: 100,
                duration: Date.now() - htmlStart
            });

            setGeneratedHTML(html);
            setActiveTab('preview');
            toast.success('HTML generated successfully!');

        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate HTML');

            setStages(prev => prev.map(stage =>
                stage.status === 'active' ? { ...stage, status: 'error' } : stage
            ));
        } finally {
            setIsGenerating(false);
            // Update cache stats
            setCacheStats(generationCache.getStats());
        }
    };

    // Clear cache
    const handleClearCache = () => {
        generationCache.clear();
        setCacheStats(generationCache.getStats());
        toast.success('Cache cleared successfully!');
    };

    // Copy HTML to clipboard
    const handleCopy = () => {
        if (generatedHTML) {
            navigator.clipboard.writeText(generatedHTML);
            toast.success('HTML copied to clipboard!');
        }
    };

    // Download HTML file
    const handleDownload = () => {
        if (generatedHTML) {
            const blob = new Blob([generatedHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gnexus-${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('HTML file downloaded!');
        }
    };

    // Open in new tab
    const handleOpenInNewTab = () => {
        if (generatedHTML) {
            const blob = new Blob([generatedHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };

    // Get preview width based on device
    const getPreviewWidth = () => {
        switch (previewDevice) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            default: return '100%';
        }
    };

    // Calculate overall progress
    const overallProgress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length;

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                        Advanced HTML Generator
                    </h1>
                    <p className="text-muted-foreground">
                        AI-powered research + design for production-ready HTML
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Cache Stats */}
                    {cacheStats.size > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                {formatCacheStats(cacheStats)}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearCache}
                                title="Clear cache"
                            >
                                Clear Cache
                            </Button>
                        </div>
                    )}
                    {activeIndustry && (
                        <Badge
                            variant="outline"
                            className="flex items-center gap-2"
                            style={{ borderColor: activeIndustry.colors.primary }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: activeIndustry.colors.primary }}
                            />
                            {activeIndustry.name}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Configuration */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <Label>Describe your research topic or website</Label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., AI healthcare startup that helps doctors diagnose patients faster..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        {/* Template Selection */}
                        <div className="space-y-2">
                            <Label>Output Template</Label>
                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEMPLATE_TYPES.map(template => (
                                        <SelectItem key={template.id} value={template.id}>
                                            <div className="flex flex-col">
                                                <span>{template.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {template.description}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Industry Selection */}
                        <div className="space-y-2">
                            <Label>Industry (auto-detected or override)</Label>
                            <Select
                                value={selectedIndustry || ''}
                                onValueChange={(val) => setSelectedIndustry(val || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={detectedIndustry?.name || 'Auto-detect'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Auto-detect</SelectItem>
                                    {INDUSTRY_PROFILES.map(profile => (
                                        <SelectItem key={profile.id} value={profile.id}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: profile.colors.primary }}
                                                />
                                                {profile.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <Label className="text-sm">Enable AI Research</Label>
                            </div>
                            <Switch
                                checked={enableResearch}
                                onCheckedChange={setEnableResearch}
                            />
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full h-12 text-lg"
                            size="lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating... ({Math.round(overallProgress)}%)
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate HTML
                                </>
                            )}
                        </Button>

                        {/* Generation Progress */}
                        {isGenerating && (
                            <div className="space-y-3">
                                <Progress value={overallProgress} className="h-2" />
                                <div className="space-y-2">
                                    {stages.map(stage => (
                                        <div
                                            key={stage.id}
                                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${stage.status === 'active' ? 'bg-orange-500/10' :
                                                stage.status === 'completed' ? 'bg-green-500/10' :
                                                    stage.status === 'error' ? 'bg-red-500/10' :
                                                        'bg-muted/30'
                                                }`}
                                        >
                                            {stage.status === 'active' ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                            ) : stage.status === 'completed' ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <stage.icon className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <span className={`text-sm flex-1 ${stage.status === 'active' ? 'text-orange-500 font-medium' :
                                                stage.status === 'completed' ? 'text-green-500' :
                                                    'text-muted-foreground'
                                                }`}>
                                                {stage.name}
                                            </span>
                                            {stage.duration && (
                                                <span className="text-xs text-muted-foreground">
                                                    {(stage.duration / 1000).toFixed(1)}s
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Panel - Preview */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Preview
                            </CardTitle>

                            {generatedHTML && (
                                <div className="flex items-center gap-2">
                                    {/* Device Toggle */}
                                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                                        <Button
                                            variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => setPreviewDevice('desktop')}
                                        >
                                            <Monitor className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => setPreviewDevice('tablet')}
                                        >
                                            <Tablet className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-7 px-2"
                                            onClick={() => setPreviewDevice('mobile')}
                                        >
                                            <Smartphone className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Actions */}
                                    <Button variant="outline" size="sm" onClick={handleCopy}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleDownload}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <TabsList className="mx-4">
                                <TabsTrigger value="config">Templates</TabsTrigger>
                                <TabsTrigger value="progress">Progress</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                                <TabsTrigger value="code">Code</TabsTrigger>
                            </TabsList>

                            <TabsContent value="config" className="flex-1 m-0 p-4">
                                <ScrollArea className="h-[500px]">
                                    <div className="grid grid-cols-1 gap-3">
                                        {TEMPLATE_TYPES.map(template => (
                                            <div
                                                key={template.id}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTemplate === template.id
                                                    ? 'border-orange-500 bg-orange-500/10'
                                                    : 'border-muted hover:border-orange-500/50'
                                                    }`}
                                                onClick={() => setSelectedTemplate(template.id)}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-medium">{template.name}</h4>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {template.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {template.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="progress" className="flex-1 m-0 p-4">
                                <ScrollArea className="h-[500px]">
                                    {stages.map((stage) => (
                                        <div key={stage.id} className="mb-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage.status === 'completed' ? 'bg-green-500' :
                                                    stage.status === 'active' ? 'bg-orange-500' :
                                                        stage.status === 'error' ? 'bg-red-500' :
                                                            'bg-muted'
                                                    }`}>
                                                    {stage.status === 'active' ? (
                                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                    ) : stage.status === 'completed' ? (
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <stage.icon className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{stage.name}</h4>
                                                    {stage.duration && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Completed in {(stage.duration / 1000).toFixed(1)}s
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {stage.result && (
                                                <div className="ml-11 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                                                    {stage.result}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="preview" className="flex-1 m-0">
                                <div className="h-[500px] bg-muted/50 flex items-center justify-center overflow-auto relative">
                                    {generatedHTML || streamedHTML ? (
                                        <div
                                            className="h-full bg-white transition-all duration-300"
                                            style={{ width: getPreviewWidth() }}
                                        >
                                            <iframe
                                                ref={iframeRef}
                                                srcDoc={isStreaming ? streamedHTML : generatedHTML || ''}
                                                className="w-full h-full border-0"
                                                title="Preview"
                                                sandbox="allow-scripts"
                                            />
                                            {isStreaming && (
                                                <div className="absolute bottom-4 right-4 bg-black/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-sm font-medium">
                                                        Streaming... {streamProgress.charCount.toLocaleString()} chars
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Preview will appear here</p>
                                            <p className="text-sm">Generate HTML to see the result</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="code" className="flex-1 m-0 p-4">
                                <div className="h-[500px]">
                                    {generatedHTML ? (
                                        <ScrollArea className="h-full">
                                            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                                                <code>{generatedHTML}</code>
                                            </pre>
                                        </ScrollArea>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No code generated yet</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdvancedHTMLGenerator;
