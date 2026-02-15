/**
 * G-NEXUS Advanced Prompt Engineering System
 * Dynamic prompt generation and optimization for AI research and design
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    category: 'research' | 'analysis' | 'generation' | 'synthesis' | 'design' | 'custom';
    template: (context: PromptContext) => string;
    variables: string[];
    optimizedFor: string[];
    estimatedTokens: number;
}

export interface PromptContext {
    goal: string;
    analysis?: string;
    researchResults?: Array<{ label: string; content: string }>;
    nodeType?: string;
    industry?: string;
    additionalData?: Record<string, unknown>;
}

export interface ResearchPipeline {
    id: string;
    name: string;
    description: string;
    stages: string[];
    prompts: string[];
}

// =============================================================================
// RESEARCH PROMPT TEMPLATES
// =============================================================================

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    // =========================================================================
    // DEEP RESEARCH TEMPLATES
    // =========================================================================
    {
        id: 'deep-market-research',
        name: 'Deep Market Research',
        description: 'Comprehensive market analysis with data-driven insights',
        category: 'research',
        template: (context) => `Conduct comprehensive market research for: ${context.goal}

## Research Scope

### 1. Market Size & Opportunity
- Total Addressable Market (TAM) with dollar figures
- Serviceable Addressable Market (SAM)
- Serviceable Obtainable Market (SOM)
- Year-over-year growth rates (last 5 years)
- 5-year forward projections
- Market maturity stage

### 2. Target Audience Analysis
- Primary demographics (age, location, income, education)
- Psychographics (values, interests, lifestyle, attitudes)
- Behavioral patterns (buying frequency, decision factors)
- Pain points and unmet needs
- Customer journey mapping
- Willingness to pay analysis

### 3. Competitive Landscape
- Top 5 direct competitors with market share
- Indirect competitors and substitutes
- Competitive positioning matrix
- Pricing strategy comparison
- Feature comparison table
- Competitive advantages and gaps

### 4. Industry Trends
- Emerging technologies impacting the space
- Regulatory environment and changes
- Economic factors and dependencies
- Consumer behavior shifts
- Sustainability and ESG considerations

### 5. Go-to-Market Insights
- Optimal pricing strategies
- Distribution channels
- Marketing channel effectiveness
- Partnership opportunities
- Market entry barriers

Provide specific data points, statistics, percentages, and dollar figures where possible.
Format insights with clear headers and bullet points for easy parsing.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3', 'gemini-pro'],
        estimatedTokens: 2000
    },

    {
        id: 'competitor-deep-dive',
        name: 'Competitor Deep Dive',
        description: 'In-depth competitive analysis with strategic recommendations',
        category: 'research',
        template: (context) => `Conduct an in-depth competitive analysis for: ${context.goal}

## Competitor Analysis Framework

### Direct Competitors (Top 5)
For each competitor, analyze:

1. **Company Overview**
   - Company name and founding year
   - Headquarters location
   - Team size and key leadership
   - Funding status and investors
   - Annual revenue (if available)

2. **Product/Service Analysis**
   - Core offerings and features
   - Unique selling propositions
   - Technology stack (if known)
   - Platform availability (web, mobile, API)
   - Integration ecosystem

3. **Pricing Strategy**
   - Pricing model (subscription, usage-based, freemium)
   - Price points and tiers
   - Free trial availability
   - Discount strategies

4. **Market Position**
   - Target customer segments
   - Market share estimate
   - Brand perception
   - Customer reviews summary (avg rating)

5. **Strengths & Weaknesses**
   - Key competitive advantages
   - Notable weaknesses or gaps
   - Customer complaints/pain points

### Strategic Recommendations
- Differentiation opportunities
- Features to prioritize
- Pricing recommendations
- Positioning statement
- Competitive moat strategies

Present findings in a structured format with clear sections and data points.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3'],
        estimatedTokens: 1800
    },

    {
        id: 'technical-architecture-research',
        name: 'Technical Architecture Research',
        description: 'Technology stack and architecture recommendations',
        category: 'research',
        template: (context) => `Analyze the optimal technical architecture for: ${context.goal}

## Technical Research Areas

### 1. Technology Stack Recommendations

**Frontend:**
- Framework recommendation (React, Vue, Next.js, etc.)
- UI component library
- State management approach
- Styling solution

**Backend:**
- Language and framework
- API architecture (REST, GraphQL, gRPC)
- Authentication strategy
- File storage solution

**Database:**
- Primary database (SQL vs NoSQL)
- Caching layer
- Search engine (if needed)
- Data warehouse (for analytics)

**Infrastructure:**
- Cloud provider recommendation
- Container orchestration
- CI/CD pipeline
- Monitoring and observability

### 2. Architecture Patterns
- Microservices vs Monolith analysis
- Event-driven architecture considerations
- API gateway requirements
- Message queue needs

### 3. Performance Considerations
- Expected traffic patterns
- Latency requirements
- Caching strategies
- CDN recommendations

### 4. Security Requirements
- Authentication methods (OAuth, JWT, etc.)
- Authorization patterns
- Data encryption (at rest, in transit)
- Compliance requirements (GDPR, HIPAA, SOC2)

### 5. Scalability Planning
- Horizontal vs vertical scaling
- Database sharding strategy
- Load balancing approach
- Cost optimization strategies

### 6. Development Workflow
- Version control strategy
- Code review process
- Testing approach (unit, integration, e2e)
- Documentation standards

Provide specific technology choices with reasoning for each decision.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3', 'nemotron'],
        estimatedTokens: 2200
    },

    {
        id: 'user-research-synthesis',
        name: 'User Research Synthesis',
        description: 'User experience research and persona development',
        category: 'research',
        template: (context) => `Conduct user research synthesis for: ${context.goal}

## User Research Framework

### 1. User Personas (Create 3-4)
For each persona:
- Name and demographic profile
- Job title and industry
- Goals and motivations
- Pain points and frustrations
- Technology comfort level
- Quote that captures their mindset
- Key behaviors and habits

### 2. User Journey Mapping
- Awareness stage: How do users discover solutions?
- Consideration stage: What factors influence decisions?
- Decision stage: What triggers conversion?
- Onboarding stage: First-time user experience
- Retention stage: What keeps users engaged?
- Advocacy stage: What drives referrals?

### 3. Jobs-to-be-Done Analysis
- Functional jobs (what tasks need completing)
- Emotional jobs (how users want to feel)
- Social jobs (how users want to be perceived)
- Related jobs (adjacent needs)

### 4. Pain Point Prioritization
| Pain Point | Severity (1-10) | Frequency | Current Solutions | Opportunity |
|------------|-----------------|-----------|-------------------|-------------|

### 5. Feature Prioritization Matrix
Based on user research:
- Must-have features (critical for launch)
- Should-have features (important for adoption)
- Nice-to-have features (competitive advantage)
- Future considerations (roadmap items)

### 6. UX Recommendations
- Navigation patterns
- Information architecture
- Key user flows
- Accessibility considerations
- Mobile experience priorities

Synthesize findings into actionable insights with clear prioritization.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3'],
        estimatedTokens: 1900
    },

    // =========================================================================
    // DESIGN PROMPT TEMPLATES
    // =========================================================================
    {
        id: 'design-brief-generator',
        name: 'Design Brief Generator',
        description: 'Generate comprehensive design specifications',
        category: 'design',
        template: (context) => `Generate a comprehensive design brief for: ${context.goal}

## Context
${context.analysis || 'No additional context provided.'}

## Design Brief Output

### 1. Visual Identity

**Color Palette:**
- Primary color: [Hex code] - Used for: [CTAs, key elements]
- Secondary color: [Hex code] - Used for: [Accents, links]
- Background: [Hex code] - Main background
- Surface: [Hex code] - Cards, elevated elements
- Text: [Hex code] - Primary text
- Muted: [Hex code] - Secondary text, placeholders
- Success/Warning/Error colors

**Color Psychology Justification:**
Explain why these colors work for the industry and target audience.

**Gradient Specifications:**
- Primary gradient: [direction, color stops]
- Accent gradient: [direction, color stops]

### 2. Typography System

**Font Families:**
- Heading: [Font name] - [Google Fonts URL]
- Body: [Font name] - [Google Fonts URL]
- Monospace: [Font name] - For code/data

**Type Scale:**
- H1: [size] / [line-height] / [weight]
- H2: [size] / [line-height] / [weight]
- H3: [size] / [line-height] / [weight]
- Body: [size] / [line-height] / [weight]
- Small: [size] / [line-height] / [weight]

### 3. Spacing & Layout

**Spacing Scale:**
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

**Container:**
- Max width: [value]
- Padding: [value]

**Grid System:**
- Columns: [number]
- Gutter: [value]
- Breakpoints: mobile (0-768), tablet (768-1024), desktop (1024+)

### 4. Component Specifications

**Buttons:**
- Primary: [background, text, border-radius, padding]
- Secondary: [background, text, border-radius, padding]
- Hover states, active states, disabled states

**Cards:**
- Background, border, border-radius, shadow, padding

**Inputs:**
- Border, border-radius, padding, focus state

### 5. Animation Guidelines

**Transitions:**
- Duration: [value]
- Timing function: [value]
- Properties to animate: transform, opacity, color

**Micro-interactions:**
- Button hover: [effect]
- Card hover: [effect]
- Link hover: [effect]

**Scroll Animations:**
- Entrance animation: [name]
- Stagger delay: [value]
- Trigger threshold: [value]

### 6. Iconography
- Style: [outline/filled/duotone]
- Size: [default size]
- Stroke width: [value]
- Recommended icon library

Provide all values in exact CSS units (px, rem, %, etc.) ready for implementation.`,
        variables: ['goal', 'analysis'],
        optimizedFor: ['gpt-4', 'claude-3'],
        estimatedTokens: 2100
    },

    {
        id: 'ux-design-research',
        name: 'UX/UI Design Research',
        description: 'User experience and interface design recommendations',
        category: 'design',
        template: (context) => `Provide comprehensive UX/UI design recommendations for: ${context.goal}

## Design Research Output

### 1. Design Principles
Define 5 core design principles that should guide all decisions:
1. [Principle name]: [Description and application]
2. [Continue for all 5]

### 2. User Interface Patterns
Recommend specific UI patterns for:
- Navigation (header, sidebar, breadcrumbs)
- Data display (tables, cards, lists)
- Forms and inputs
- Modals and overlays
- Feedback and notifications
- Empty states and loading states
- Error handling

### 3. Layout Recommendations
- Hero section approach
- Content hierarchy
- F-pattern vs Z-pattern considerations
- Above-the-fold content priorities
- Section ordering rationale

### 4. Accessibility Compliance (WCAG 2.1)
- Color contrast requirements
- Keyboard navigation
- Screen reader considerations
- Focus indicators
- Alt text guidelines
- Form labels and errors

### 5. Responsive Strategy
- Mobile-first vs desktop-first recommendation
- Breakpoint strategy
- Component behavior at each breakpoint
- Touch target sizes
- Mobile navigation pattern

### 6. Performance Considerations
- Image optimization strategies
- Font loading strategy
- Animation performance
- Perceived performance techniques

### 7. Design System Components
List the essential components needed:
- [Component name]: [Purpose and variants]

Provide specific, actionable recommendations with reasoning.`,
        variables: ['goal'],
        optimizedFor: ['gpt-4', 'claude-3'],
        estimatedTokens: 1700
    },

    // =========================================================================
    // SYNTHESIS TEMPLATES
    // =========================================================================
    {
        id: 'chief-architect-synthesis',
        name: 'Chief Architect Synthesis',
        description: 'Synthesize all research into unified blueprint',
        category: 'synthesis',
        template: (context) => `As Chief Architect, synthesize the following research into a comprehensive implementation blueprint:

# Project Goal
${context.goal}

# Research Results
${context.researchResults?.map(r => `
## ${r.label}
${r.content}
`).join('\n---\n') || 'No research results provided.'}

# Your Synthesis

## 1. Executive Summary
Provide a 2-3 sentence summary of the key findings and recommended approach.

## 2. Key Insights Matrix

| Research Area | Key Finding | Impact | Priority |
|--------------|-------------|--------|----------|
| Market | | High/Med/Low | P1/P2/P3 |
| Competition | | | |
| Technical | | | |
| Users | | | |
| Design | | | |

## 3. Strategic Recommendations
Synthesize findings into 5-7 prioritized strategic recommendations:
1. **[Recommendation]**: [Rationale based on research]

## 4. Conflict Resolution
Identify any contradictions between research areas and provide resolution:
- Conflict: [Description]
  Resolution: [Your decision with reasoning]

## 5. Technical Blueprint

**Architecture Decision:**
[Monolith/Microservices and why]

**Technology Stack:**
- Frontend: [Choice and reasoning]
- Backend: [Choice and reasoning]
- Database: [Choice and reasoning]
- Infrastructure: [Choice and reasoning]

## 6. Design Direction

**Visual Identity:**
- Industry positioning: [Modern/Traditional/Bold/Minimal]
- Color psychology: [Primary emotion to evoke]
- Typography approach: [Professional/Friendly/Technical]

**Key Design Decisions:**
1. [Decision with rationale]

## 7. Implementation Roadmap

**Phase 1: Foundation (Weeks 1-4)**
- [ ] [Task]

**Phase 2: Core Features (Weeks 5-8)**
- [ ] [Task]

**Phase 3: Enhancement (Weeks 9-12)**
- [ ] [Task]

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| | Low/Med/High | Low/Med/High | |

## 9. Success Metrics
Define measurable KPIs:
- [Metric]: [Target] by [Timeline]

Make executive decisions with clear reasoning. Be specific and actionable.`,
        variables: ['goal', 'researchResults'],
        optimizedFor: ['gpt-4', 'claude-3', 'nemotron'],
        estimatedTokens: 2500
    },

    // =========================================================================
    // HTML GENERATION TEMPLATES
    // =========================================================================
    {
        id: 'html-generator-advanced',
        name: 'Advanced HTML Generator',
        description: 'Generate production-ready HTML with research integration',
        category: 'generation',
        template: (context) => `Generate a complete, production-ready HTML website based on:

# Project Goal
${context.goal}

# Analysis & Research
${context.analysis || ''}

# Industry Context
${context.industry || 'technology'}

# Requirements
- Modern, responsive design with sophisticated aesthetics
- Industry-appropriate color scheme and typography
- Professional animations and micro-interactions
- SEO optimized meta tags
- Mobile-first responsive layout
- Accessibility compliant (WCAG 2.1)
- Self-contained (all CSS inline, no external dependencies except fonts)
- Dark mode support

# Sections to Generate

1. **Hero Section**
   - Compelling headline with gradient text
   - Subheadline summarizing value proposition
   - Primary and secondary CTA buttons
   - Trust indicators (stats, logos, badges)
   - Animated background elements

2. **Features Section**
   - 6 feature cards with icons
   - Hover animations
   - Learn more links

3. **Pricing Section**
   - 3-tier pricing table
   - Featured/popular tier highlighted
   - Feature comparison list
   - CTA buttons

4. **Testimonials Section**
   - 3 customer testimonials
   - Star ratings
   - Author avatars and info

5. **FAQ Section**
   - 4-6 expandable FAQ items
   - Smooth accordion animation

6. **CTA Section**
   - Gradient background
   - Compelling copy
   - Action buttons

7. **Footer**
   - Logo and description
   - Link columns (Product, Company, Legal)
   - Social media links
   - Copyright

# Technical Requirements
- Use CSS custom properties for theming
- Include scroll reveal animations
- Add hover effects on interactive elements
- Implement responsive breakpoints (768px, 1024px)
- Use semantic HTML5 elements
- Include structured data (JSON-LD)

Generate ONLY the complete HTML starting with <!DOCTYPE html> and ending with </html>.
Include all CSS in a <style> tag and all JavaScript in a <script> tag.`,
        variables: ['goal', 'analysis', 'industry'],
        optimizedFor: ['gpt-4', 'claude-3', 'gemini-pro'],
        estimatedTokens: 4000
    }
];

// =============================================================================
// RESEARCH PIPELINES
// =============================================================================

export const RESEARCH_PIPELINES: ResearchPipeline[] = [
    {
        id: 'full-research',
        name: 'Full Research Pipeline',
        description: 'Complete research coverage for new projects',
        stages: ['Market Research', 'Competitor Analysis', 'Technical Research', 'User Research', 'Design Brief'],
        prompts: ['deep-market-research', 'competitor-deep-dive', 'technical-architecture-research', 'user-research-synthesis', 'design-brief-generator']
    },
    {
        id: 'quick-research',
        name: 'Quick Research Pipeline',
        description: 'Fast research for simple projects',
        stages: ['Market Overview', 'Design Brief'],
        prompts: ['deep-market-research', 'design-brief-generator']
    },
    {
        id: 'technical-focus',
        name: 'Technical Focus Pipeline',
        description: 'Deep technical research for complex systems',
        stages: ['Technical Research', 'User Research', 'Chief Architect Synthesis'],
        prompts: ['technical-architecture-research', 'user-research-synthesis', 'chief-architect-synthesis']
    }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

export function getResearchPipeline(id: string): ResearchPipeline | undefined {
    return RESEARCH_PIPELINES.find(pipeline => pipeline.id === id);
}

export function getPipelinePrompts(pipelineId: string): PromptTemplate[] {
    const pipeline = getResearchPipeline(pipelineId);
    if (!pipeline) return [];

    return pipeline.prompts
        .map(promptId => getPromptTemplate(promptId))
        .filter((p): p is PromptTemplate => p !== undefined);
}

export function optimizePromptForModel(prompt: string, model: string): string {
    const modelOptimizations: Record<string, string> = {
        'gpt-4': 'Be detailed and comprehensive. Use markdown formatting for structure.',
        'claude-3': 'Focus on clarity and logical structure. Use headers and bullet points.',
        'nemotron': 'Be concise but thorough. Prioritize actionable insights.',
        'gemini-pro': 'Provide technical depth with practical examples. Use tables where appropriate.'
    };

    const optimization = modelOptimizations[model];
    return optimization ? `${prompt}\n\n${optimization}` : prompt;
}

export function estimateTotalTokens(templateIds: string[]): number {
    return templateIds.reduce((total, id) => {
        const template = getPromptTemplate(id);
        return total + (template?.estimatedTokens || 0);
    }, 0);
}

export default {
    PROMPT_TEMPLATES,
    RESEARCH_PIPELINES,
    getPromptTemplate,
    getPromptsByCategory,
    generatePrompt,
    getResearchPipeline,
    getPipelinePrompts,
    optimizePromptForModel,
    estimateTotalTokens
};
