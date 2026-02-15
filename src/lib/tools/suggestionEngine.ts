/**
 * G-Nexus Tool Suggestion Engine
 * Intelligent tool suggestions based on user input and context
 */

import type { AITool, ToolCategory } from '../ai-chat-types';

// =============================================================================
// TYPES
// =============================================================================

export interface ToolSuggestion {
    tool: AITool;
    confidence: number;
    reason: string;
    matchedKeywords: string[];
}

export interface SuggestionContext {
    input: string;
    previousMessages?: string[];
    activeTools?: string[];
    userPreferences?: UserPreferences;
}

export interface UserPreferences {
    frequentlyUsedTools: Record<string, number>;
    preferredCategories: Record<ToolCategory, number>;
    lastUsedTools: string[];
}

// =============================================================================
// KEYWORD PATTERNS
// =============================================================================

const INTENT_PATTERNS: Record<string, RegExp[]> = {
    code: [
        /\b(write|create|generate|build|make)\s+(a\s+)?(function|script|code|program|app|application)\b/i,
        /\b(debug|fix|solve|resolve)\s+(this\s+)?(code|error|bug|issue)\b/i,
        /\b(refactor|optimize|improve|clean)\s+(this\s+)?(code)\b/i,
        /\b(explain|understand|analyze)\s+(this\s+)?(code)\b/i,
        /\b(python|javascript|typescript|java|c\+\+|rust|go|ruby)\b/i,
    ],
    image: [
        /\b(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|illustration|artwork)\b/i,
        /\b(image|picture|photo|artwork)\s+(generation|creation)\b/i,
        /\b(visual|graphic|design)\b/i,
    ],
    document: [
        /\b(summarize|summary|tldr)\b/i,
        /\b(analyze|analysis)\s+(this\s+)?(document|text|article|paper)\b/i,
        /\b(extract|parse)\s+(information|data|text)\b/i,
        /\b(pdf|document|article|paper)\b/i,
    ],
    search: [
        /\b(search|find|lookup|google)\b/i,
        /\b(what is|who is|where is|when is|how to)\b/i,
        /\b(look up|find out|research)\b/i,
    ],
    translate: [
        /\b(translate|convert)\s+(to|from|into)\b/i,
        /\b(in\s+(spanish|french|german|chinese|japanese|korean|arabic|portuguese|italian|russian))\b/i,
        /\b(spanish|french|german|chinese|japanese|korean|arabic|portuguese|italian|russian)\s+(translation|version)\b/i,
    ],
    data: [
        /\b(analyze|analysis)\s+(this\s+)?(data|dataset|spreadsheet|csv|excel)\b/i,
        /\b(chart|graph|visualization|visualize)\b/i,
        /\b(statistics|stats|metrics|numbers)\b/i,
        /\b(spreadsheet|excel|csv|data)\b/i,
    ],
    business: [
        /\b(business|startup|company|venture)\s+(idea|plan|concept|strategy)\b/i,
        /\b(generate|create|brainstorm)\s+(business|startup)\s+(ideas?|concepts?)\b/i,
        /\b(market|competitive)\s+(analysis|research)\b/i,
    ],
    presentation: [
        /\b(create|make|generate)\s+(a\s+)?(presentation|slideshow|slides|deck|powerpoint)\b/i,
        /\b(presentation|slideshow|slides|deck)\b/i,
    ],
    video: [
        /\b(analyze|process)\s+(this\s+)?(video|movie|clip|footage)\b/i,
        /\b(video|movie|clip|footage|youtube)\b/i,
    ],
    calculation: [
        /\b(calculate|compute|solve)\b/i,
        /\b(math|mathematics|equation|formula)\b/i,
        /\b(what is|what's)\s+[\d\s+\-*/]+\s*=\s*\?/i,
    ],
    writing: [
        /\b(write|compose|draft|create)\s+(a\s+)?(email|letter|article|blog|post|story|essay)\b/i,
        /\b(improve|enhance|edit|rewrite)\s+(this\s+)?(text|writing|content)\b/i,
        /\b(grammar|spelling|style)\s+(check|fix|improve)\b/i,
    ],
};

const CATEGORY_PRIORITY: Record<ToolCategory, number> = {
    development: 1,
    analysis: 2,
    creation: 3,
    search: 4,
    productivity: 5,
    communication: 6,
    utility: 7,
};

// =============================================================================
// SUGGESTION ENGINE CLASS
// =============================================================================

export class ToolSuggestionEngine {
    private tools: Map<string, AITool> = new Map();
    private userPreferences: UserPreferences = {
        frequentlyUsedTools: {},
        preferredCategories: {
            analysis: 0,
            creation: 0,
            development: 0,
            search: 0,
            communication: 0,
            productivity: 0,
            utility: 0,
        },
        lastUsedTools: [],
    };

    constructor(tools: AITool[] = []) {
        tools.forEach(tool => this.registerTool(tool));
        this.loadUserPreferences();
    }

    // -------------------------------------------------------------------------
    // TOOL REGISTRATION
    // -------------------------------------------------------------------------

    registerTool(tool: AITool): void {
        this.tools.set(tool.id, tool);
    }

    unregisterTool(toolId: string): void {
        this.tools.delete(toolId);
    }

    // -------------------------------------------------------------------------
    // USER PREFERENCES
    // -------------------------------------------------------------------------

    private loadUserPreferences(): void {
        try {
            const stored = localStorage.getItem('gnexus_tool_preferences');
            if (stored) {
                this.userPreferences = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load tool preferences:', error);
        }
    }

    private saveUserPreferences(): void {
        try {
            localStorage.setItem('gnexus_tool_preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('Failed to save tool preferences:', error);
        }
    }

    recordToolUsage(toolId: string): void {
        const tool = this.tools.get(toolId);
        if (!tool) return;

        // Update frequency
        this.userPreferences.frequentlyUsedTools[toolId] =
            (this.userPreferences.frequentlyUsedTools[toolId] || 0) + 1;

        // Update category preference
        this.userPreferences.preferredCategories[tool.category] =
            (this.userPreferences.preferredCategories[tool.category] || 0) + 1;

        // Update last used
        this.userPreferences.lastUsedTools = [
            toolId,
            ...this.userPreferences.lastUsedTools.filter(id => id !== toolId),
        ].slice(0, 10);

        this.saveUserPreferences();
    }

    // -------------------------------------------------------------------------
    // SUGGESTION METHODS
    // -------------------------------------------------------------------------

    suggestTools(context: SuggestionContext): ToolSuggestion[] {
        const suggestions: ToolSuggestion[] = [];
        const input = context.input.toLowerCase();

        // Analyze input for intent patterns
        const intentScores = this.analyzeIntent(input);

        // Score each tool
        this.tools.forEach(tool => {
            const score = this.scoreTool(tool, input, intentScores, context);
            if (score.confidence > 0.1) {
                suggestions.push(score);
            }
        });

        // Sort by confidence
        suggestions.sort((a, b) => b.confidence - a.confidence);

        // Return top suggestions
        return suggestions.slice(0, 5);
    }

    private analyzeIntent(input: string): Record<string, number> {
        const scores: Record<string, number> = {};

        Object.entries(INTENT_PATTERNS).forEach(([intent, patterns]) => {
            let score = 0;
            patterns.forEach(pattern => {
                if (pattern.test(input)) {
                    score += 1;
                }
            });
            scores[intent] = Math.min(score, 1); // Cap at 1
        });

        return scores;
    }

    private scoreTool(
        tool: AITool,
        input: string,
        intentScores: Record<string, number>,
        context: SuggestionContext
    ): ToolSuggestion {
        let confidence = 0;
        const matchedKeywords: string[] = [];
        const reasons: string[] = [];

        // Keyword matching
        const inputWords = input.toLowerCase().split(/\s+/);
        tool.keywords.forEach(keyword => {
            if (inputWords.some(word => word.includes(keyword.toLowerCase()))) {
                confidence += 0.15;
                matchedKeywords.push(keyword);
            }
        });

        // Intent matching
        const toolIntentMap: Record<string, string[]> = {
            'code-interpreter': ['code'],
            'image-analyzer': ['image'],
            'image-generator': ['image'],
            'document-analyzer': ['document'],
            'web-search': ['search'],
            'translator': ['translate'],
            'spreadsheet-analyzer': ['data'],
            'business-generator': ['business'],
            'presentation-generator': ['presentation'],
            'video-analyzer': ['video'],
        };

        const toolIntents = toolIntentMap[tool.id] || [];
        toolIntents.forEach(intent => {
            if (intentScores[intent] > 0) {
                confidence += intentScores[intent] * 0.3;
                reasons.push(`Detected ${intent} intent`);
            }
        });

        // Category matching
        const categoryIntentMap: Record<ToolCategory, string[]> = {
            development: ['code'],
            analysis: ['document', 'data', 'video', 'image'],
            creation: ['image', 'business', 'presentation', 'writing'],
            search: ['search'],
            productivity: ['data', 'calculation'],
            communication: ['translate', 'writing'],
            utility: ['calculation'],
        };

        const categoryIntents = categoryIntentMap[tool.category] || [];
        categoryIntents.forEach(intent => {
            if (intentScores[intent] > 0) {
                confidence += 0.1;
            }
        });

        // User preference boost
        const usageCount = this.userPreferences.frequentlyUsedTools[tool.id] || 0;
        if (usageCount > 0) {
            confidence += Math.min(usageCount * 0.05, 0.2);
            reasons.push('Frequently used');
        }

        // Recent usage boost
        const recentIndex = this.userPreferences.lastUsedTools.indexOf(tool.id);
        if (recentIndex !== -1) {
            confidence += 0.1 * (1 - recentIndex / 10);
            reasons.push('Recently used');
        }

        // Category preference boost
        const categoryPreference = this.userPreferences.preferredCategories[tool.category] || 0;
        if (categoryPreference > 0) {
            confidence += Math.min(categoryPreference * 0.02, 0.1);
        }

        // Normalize confidence
        confidence = Math.min(confidence, 1);

        return {
            tool,
            confidence,
            reason: reasons.length > 0 ? reasons.join(', ') : 'Keyword match',
            matchedKeywords,
        };
    }

    // -------------------------------------------------------------------------
    // QUICK SUGGESTIONS
    // -------------------------------------------------------------------------

    getQuickSuggestions(): AITool[] {
        // Return most frequently used tools
        const sortedTools = Object.entries(this.userPreferences.frequentlyUsedTools)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([toolId]) => this.tools.get(toolId))
            .filter((tool): tool is AITool => tool !== undefined);

        // If no usage history, return default tools
        if (sortedTools.length === 0) {
            return [
                this.tools.get('code-interpreter'),
                this.tools.get('web-search'),
                this.tools.get('document-analyzer'),
                this.tools.get('image-analyzer'),
            ].filter((tool): tool is AITool => tool !== undefined);
        }

        return sortedTools;
    }

    getRecentTools(): AITool[] {
        return this.userPreferences.lastUsedTools
            .map(toolId => this.tools.get(toolId))
            .filter((tool): tool is AITool => tool !== undefined);
    }

    getToolsByCategory(): Record<ToolCategory, AITool[]> {
        const categories: Record<ToolCategory, AITool[]> = {
            analysis: [],
            creation: [],
            development: [],
            search: [],
            communication: [],
            productivity: [],
            utility: [],
        };

        this.tools.forEach(tool => {
            categories[tool.category].push(tool);
        });

        return categories;
    }

    // -------------------------------------------------------------------------
    // CONTEXT-AWARE SUGGESTIONS
    // -------------------------------------------------------------------------

    suggestBasedOnContext(
        previousMessages: string[],
        currentInput: string
    ): ToolSuggestion[] {
        // Build context from previous messages
        const contextText = previousMessages.slice(-5).join(' ');

        // Combine with current input
        const fullContext = `${contextText} ${currentInput}`;

        return this.suggestTools({
            input: fullContext,
            previousMessages,
        });
    }

    suggestForContentType(contentType: string): AITool[] {
        const contentTypeMap: Record<string, string[]> = {
            'image': ['image-analyzer', 'image-generator'],
            'video': ['video-analyzer'],
            'document': ['document-analyzer'],
            'spreadsheet': ['spreadsheet-analyzer'],
            'code': ['code-interpreter'],
            'url': ['web-search'],
        };

        const toolIds = contentTypeMap[contentType] || [];
        return toolIds
            .map(id => this.tools.get(id))
            .filter((tool): tool is AITool => tool !== undefined);
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let engineInstance: ToolSuggestionEngine | null = null;

export function getToolSuggestionEngine(): ToolSuggestionEngine {
    if (!engineInstance) {
        engineInstance = new ToolSuggestionEngine();
    }
    return engineInstance;
}

export function initializeToolSuggestionEngine(tools: AITool[]): ToolSuggestionEngine {
    engineInstance = new ToolSuggestionEngine(tools);
    return engineInstance;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function suggestTools(input: string, context?: Partial<SuggestionContext>): ToolSuggestion[] {
    const engine = getToolSuggestionEngine();
    return engine.suggestTools({
        input,
        ...context,
    });
}

export function getQuickToolSuggestions(): AITool[] {
    const engine = getToolSuggestionEngine();
    return engine.getQuickSuggestions();
}

export function recordToolUsage(toolId: string): void {
    const engine = getToolSuggestionEngine();
    engine.recordToolUsage(toolId);
}
