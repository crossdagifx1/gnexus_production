/**
 * Advanced Prompt Engineering System
 * Dynamic prompt generation and optimization for different AI models
 */

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    category: 'research' | 'analysis' | 'generation' | 'synthesis' | 'custom';
    template: (context: PromptContext) => string;
    variables: string[];
    optimizedFor: string[];
}

export interface PromptContext {
    goal: string;
    analysis?: string;
    researchResults?: Array<{ label: string; content: string }>;
    nodeType?: string;
    additionalData?: Record<string, any>;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        id: 'technical-research',
        name: 'Technical Research',
        description: 'Analyze best technical stack and architecture',
        category: 'research',
        template: (context) => `Analyze the best technical stack, architecture, and implementation approach for: ${context.goal}

Focus on:
1. Technology recommendations (frameworks, databases, infrastructure)
2. Architecture patterns and best practices
3. Performance considerations
4. Security requirements
5. Scalability planning
6. Development workflow recommendations

Provide specific, actionable recommendations with reasoning.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3', 'nemotron']
    },
    {
        id: 'ux-design',
        name: 'UX/UI Design',
        description: 'User experience and interface design recommendations',
        category: 'research',
        template: (context) => `Provide comprehensive UX/UI design recommendations for: ${context.goal}

Include:
1. User interface design principles
2. User experience best practices
3. Accessibility considerations (WCAG 2.1)
4. Responsive design approach
5. Visual design guidelines
6. Interaction patterns
7. Mobile-first design strategy

Consider modern design trends and usability principles.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3', 'dall-e']
    },
    {
        id: 'market-analysis',
        name: 'Market Analysis',
        description: 'Market research and competitive analysis',
        category: 'research',
        template: (context) => `Conduct comprehensive market analysis for: ${context.goal}

Analyze:
1. Target market and audience demographics
2. Competitive landscape analysis
3. Market trends and opportunities
4. SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
5. Market positioning strategy
6. Pricing models and revenue streams
7. Go-to-market strategy

Provide data-driven insights and strategic recommendations.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3', 'nemotron']
    },
    {
        id: 'chief-architect',
        name: 'Chief Architect Synthesis',
        description: 'Synthesize research into unified blueprint',
        category: 'synthesis',
        template: (context) => `As Chief Architect, synthesize the following research into a comprehensive implementation plan:

# User Goal
${context.goal}

# Research Results
${context.researchResults?.map(r => `
## ${r.label}
${r.content}
`).join('\n---\n') || ''}

# Your Analysis Required

Provide:
1. **Executive Summary** (2-3 sentences)
2. **Key Insights** from each research branch
3. **Conflict Resolution** for any contradictions
4. **Unified Recommendations** organized by priority
5. **Technical Specifications** and architecture
6. **Implementation Timeline** with phases
7. **Risk Assessment** and mitigation strategies

Make executive decisions with clear reasoning. Be thorough and actionable.`,
        variables: ['goal', 'researchResults'],
        optimizedFor: ['gpt-4', 'claude-3', 'nemotron']
    },
    {
        id: 'html-generator',
        name: 'HTML Generator',
        description: 'Generate production-ready HTML from analysis',
        category: 'generation',
        template: (context) => `Generate a complete, production-ready HTML website based on:

# Project Goal
${context.goal}

# Analysis & Research
${context.analysis || ''}

# Requirements
- Modern, responsive design with dark theme
- Orange (#f97316) and purple (#8b5cf6) accent colors
- Professional animations and micro-interactions
- SEO optimized meta tags
- Mobile-first responsive layout
- Accessibility compliant (WCAG 2.1)
- Self-contained (all CSS inline)

# Sections to Include
1. Hero section with compelling headline and CTA
2. Features/benefits showcase
3. Technical specifications or services
4. Social proof/testimonials
5. Pricing or offerings (if applicable)
6. FAQ section
7. Contact or footer with links

Generate ONLY complete HTML starting with <!DOCTYPE html> and ending with </html>.`,
        variables: ['goal', 'analysis'],
        optimizedFor: ['gpt-4', 'claude-3', 'gemini-pro']
    }
];

export function getPromptTemplate(id: string): PromptTemplate | undefined {
    return PROMPT_TEMPLATES.find(template => template.id === id);
}

export function getPromptsByCategory(category: string): PromptTemplate[] {
    return PROMPT_TEMPLATES.filter(template => template.category === category);
}

export function generatePrompt(templateId: string, context: PromptContext): string {
    const template = getPromptTemplate(templateId);
    if (!template) {
        return context.goal;
    }
    return template.template(context);
}

export function optimizePromptForModel(prompt: string, model: string): string {
    // Model-specific optimizations
    const modelOptimizations: Record<string, string> = {
        'gpt-4': 'Be detailed and comprehensive in your response.',
        'claude-3': 'Focus on clarity and structure. Use markdown formatting.',
        'nemotron-3-nano': 'Be concise but thorough. Prioritize actionable insights.',
        'gemini-pro': 'Provide technical depth with practical examples.'
    };

    const optimization = modelOptimizations[model];
    return optimization ? `${prompt}\n\n${optimization}` : prompt;
}
