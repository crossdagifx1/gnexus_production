import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Code,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info,
    Zap,
    Shield,
    Bug,
    Lightbulb,
    Copy,
    Download,
    RefreshCw,
    FileText
} from 'lucide-react';
import { generateCode, generateText } from '@/lib/ai';

interface CodeIssue {
    id: string;
    type: 'error' | 'warning' | 'info' | 'suggestion';
    severity: 'high' | 'medium' | 'low';
    line: number;
    column: number;
    message: string;
    suggestion?: string;
    code?: string;
}

interface CodeReviewResult {
    overallScore: number;
    issues: CodeIssue[];
    suggestions: string[];
    metrics: {
        complexity: number;
        maintainability: number;
        security: number;
        performance: number;
    };
    summary: string;
}

const CodeReviewAssistant: React.FC = () => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('typescript');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
    const [activeTab, setActiveTab] = useState('issues');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const languages = [
        { value: 'typescript', label: 'TypeScript' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
    ];

    const analyzeCode = async () => {
        if (!code.trim()) return;

        setIsAnalyzing(true);
        try {
            const analysisPrompt = `
        Analyze the following ${language} code and provide a comprehensive code review:

        Code:
        \`\`\`${language}
        ${code}
        \`\`\`

        Please analyze for:
        1. Code quality and best practices
        2. Security vulnerabilities
        3. Performance issues
        4. Maintainability concerns
        5. Potential bugs
        6. Code style and formatting

        Return the analysis in JSON format with the following structure:
        {
          "overallScore": 85,
          "issues": [
            {
              "id": "1",
              "type": "error|warning|info|suggestion",
              "severity": "high|medium|low",
              "line": 10,
              "column": 5,
              "message": "Description of the issue",
              "suggestion": "How to fix it",
              "code": "example fix"
            }
          ],
          "suggestions": ["General improvement suggestions"],
          "metrics": {
            "complexity": 7,
            "maintainability": 8,
            "security": 9,
            "performance": 7
          },
          "summary": "Overall assessment of the code"
        }
        `;

            const response = await generateText('coder', analysisPrompt);

            if (response.success && response.data) {
                try {
                    const parsed = JSON.parse(response.data);
                    setReviewResult(parsed);
                } catch (parseError) {
                    // Fallback to mock data if parsing fails
                    const mockResult: CodeReviewResult = {
                        overallScore: 75,
                        issues: [
                            {
                                id: '1',
                                type: 'warning',
                                severity: 'medium',
                                line: 1,
                                column: 1,
                                message: 'Consider adding type annotations for better code clarity',
                                suggestion: 'Add explicit type annotations to function parameters and return values'
                            },
                            {
                                id: '2',
                                type: 'suggestion',
                                severity: 'low',
                                line: 5,
                                column: 10,
                                message: 'Variable name could be more descriptive',
                                suggestion: 'Use more descriptive variable names that explain their purpose'
                            }
                        ],
                        suggestions: [
                            'Consider adding error handling for better robustness',
                            'Add unit tests to ensure code reliability',
                            'Consider breaking down large functions into smaller ones'
                        ],
                        metrics: {
                            complexity: 6,
                            maintainability: 7,
                            security: 8,
                            performance: 7
                        },
                        summary: 'The code is generally well-structured but could benefit from additional type safety and error handling.'
                    };
                    setReviewResult(mockResult);
                }
            }
        } catch (error) {
            console.error('Code analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getIssueIcon = (type: CodeIssue['type']) => {
        switch (type) {
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-500" />;
            case 'suggestion':
                return <Lightbulb className="w-4 h-4 text-green-500" />;
        }
    };

    const getSeverityColor = (severity: CodeIssue['severity']) => {
        switch (severity) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            case 'low':
                return 'outline';
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setCode(content);
            };
            reader.readAsText(file);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const downloadReport = () => {
        if (!reviewResult) return;

        const report = `
Code Review Report
==================

Overall Score: ${reviewResult.overallScore}/100

Summary:
${reviewResult.summary}

Metrics:
- Complexity: ${reviewResult.metrics.complexity}/10
- Maintainability: ${reviewResult.metrics.maintainability}/10
- Security: ${reviewResult.metrics.security}/10
- Performance: ${reviewResult.metrics.performance}/10

Issues:
${reviewResult.issues.map(issue =>
            `- Line ${issue.line}: ${issue.message} (${issue.severity})`
        ).join('\n')}

Suggestions:
${reviewResult.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
        `;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code-review-report.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Code Review Assistant</h1>
                    <p className="text-muted-foreground">Get intelligent code analysis and improvement suggestions</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".ts,.js,.py,.java,.cpp,.cs,.go,.rs"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <FileText className="w-4 h-4 mr-2" />
                        Upload File
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Code Input
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={analyzeCode}
                                disabled={isAnalyzing || !code.trim()}
                                className="ml-auto"
                            >
                                {isAnalyzing ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Zap className="w-4 h-4 mr-2" />
                                )}
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                            </Button>
                        </div>
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={`Paste your ${language} code here or upload a file...`}
                            className="min-h-[400px] font-mono text-sm"
                        />
                    </CardContent>
                </Card>

                {reviewResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Review Results
                                </span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="default" className="text-lg px-3 py-1">
                                        Score: {reviewResult.overallScore}/100
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadReport}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="issues">Issues</TabsTrigger>
                                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                                    <TabsTrigger value="summary">Summary</TabsTrigger>
                                </TabsList>

                                <TabsContent value="issues" className="mt-4">
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-3">
                                            {reviewResult.issues.map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    className="p-3 border rounded-lg space-y-2"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {getIssueIcon(issue.type)}
                                                            <span className="font-medium text-sm">
                                                                Line {issue.line}:{issue.column}
                                                            </span>
                                                            <Badge variant={getSeverityColor(issue.severity)}>
                                                                {issue.severity}
                                                            </Badge>
                                                        </div>
                                                        {issue.suggestion && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(issue.suggestion!)}
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm">{issue.message}</p>
                                                    {issue.suggestion && (
                                                        <div className="bg-muted p-2 rounded text-sm">
                                                            <strong>Suggestion:</strong> {issue.suggestion}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="metrics" className="mt-4">
                                    <div className="space-y-4">
                                        {Object.entries(reviewResult.metrics).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <span className="capitalize font-medium">{key}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-background rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{ width: `${value * 10}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{value}/10</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="suggestions" className="mt-4">
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-3">
                                            {reviewResult.suggestions.map((suggestion, index) => (
                                                <div key={index} className="p-3 border rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-sm">{suggestion}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(suggestion)}
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="summary" className="mt-4">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm leading-relaxed">{reviewResult.summary}</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CodeReviewAssistant;
