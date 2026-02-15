/**
 * Code Analyzer Service
 * Analyzes code patterns, complexity, and quality
 */

export interface CodeAnalysisResult {
    success: boolean;
    analysis?: {
        lines: number;
        functions: number;
        classes: number;
        imports: number;
        complexity?: string;
        patterns?: string[];
        suggestions?: string[];
    };
    formatted?: string;
    error?: string;
}

/**
 * Analyze code and provide insights
 */
export async function analyzeCode(code: string, context?: string): Promise<CodeAnalysisResult> {
    try {
        console.log(`[CodeAnalyzer] Analyzing code (${code.length} chars)`);

        // Basic code metrics
        const lines = code.split('\n').length;
        const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*\(.*?\)\s*=>/g);
        const classMatches = code.match(/class\s+\w+/g);
        const importMatches = code.match(/import\s+.*?from/g);

        const functions = functionMatches ? functionMatches.length : 0;
        const classes = classMatches ? classMatches.length : 0;
        const imports = importMatches ? importMatches.length : 0;

        // Pattern detection
        const patterns: string[] = [];
        if (code.includes('async') || code.includes('await')) {
            patterns.push('Async/Await');
        }
        if (code.includes('useState') || code.includes('useEffect')) {
            patterns.push('React Hooks');
        }
        if (code.includes('try') && code.includes('catch')) {
            patterns.push('Error Handling');
        }
        if (code.includes('map') || code.includes('filter') || code.includes('reduce')) {
            patterns.push('Functional Programming');
        }

        // Use AI for deeper analysis
        const { generateText } = await import('./ai');

        const analysisPrompt = `Analyze this code and provide insights:

\`\`\`
${code.slice(0, 2000)}
\`\`\`

${context ? `Context: ${context}\n` : ''}
Provide:
1. Complexity assessment (Low/Medium/High)
2. Key patterns used
3. 2-3 specific improvement suggestions

Format as JSON:
{
  "complexity": "Low/Medium/High",
  "patterns": ["pattern1", "pattern2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

        const aiResult = await generateText('agentic', analysisPrompt, {
            temperature: 0.3,
            max_new_tokens: 300
        });

        let aiAnalysis: any = { complexity: 'Unknown', patterns: [], suggestions: [] };

        if (aiResult.success && aiResult.data) {
            try {
                let jsonText = aiResult.data.trim();
                if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
                }
                aiAnalysis = JSON.parse(jsonText);
            } catch (e) {
                console.warn('[CodeAnalyzer] Failed to parse AI response');
            }
        }

        // Combine metrics with AI insights
        const analysis = {
            lines,
            functions,
            classes,
            imports,
            complexity: aiAnalysis.complexity || 'Medium',
            patterns: [...patterns, ...(aiAnalysis.patterns || [])],
            suggestions: aiAnalysis.suggestions || []
        };

        const formatted = formatAnalysis(analysis);

        return {
            success: true,
            analysis,
            formatted
        };

    } catch (error: any) {
        console.error('[CodeAnalyzer] Error:', error);
        return {
            success: false,
            error: error.message || 'Code analysis failed'
        };
    }
}

/**
 * Format analysis for display
 */
function formatAnalysis(analysis: any): string {
    const parts = [
        `📊 Code Metrics:`,
        `  Lines: ${analysis.lines}`,
        `  Functions: ${analysis.functions}`,
        `  Classes: ${analysis.classes}`,
        `  Imports: ${analysis.imports}`,
        ``,
        `🔍 Complexity: ${analysis.complexity}`,
    ];

    if (analysis.patterns && analysis.patterns.length > 0) {
        parts.push(``);
        parts.push(`🎨 Patterns Detected:`);
        analysis.patterns.slice(0, 5).forEach((p: string) => parts.push(`  • ${p}`));
    }

    if (analysis.suggestions && analysis.suggestions.length > 0) {
        parts.push(``);
        parts.push(`💡 Suggestions:`);
        analysis.suggestions.forEach((s: string) => parts.push(`  • ${s}`));
    }

    return parts.join('\n');
}
