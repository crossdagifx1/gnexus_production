/**
 * G-NEXUS Design Intelligence System
 * 
 * AI-powered design decision engine that automatically selects
 * colors, typography, layouts, and animations based on industry
 * context and prompt analysis.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    success: string;
    warning: string;
    error: string;
    gradient: {
        from: string;
        via?: string;
        to: string;
        angle: number;
    };
}

export interface TypographySet {
    heading: string;
    body: string;
    mono: string;
    headingWeight: number;
    bodyWeight: number;
    sizes: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        body: string;
        small: string;
    };
    lineHeight: {
        heading: number;
        body: number;
    };
}

export interface AnimationPreset {
    name: string;
    entranceAnimation: string;
    hoverScale: number;
    transitionDuration: string;
    transitionTiming: string;
    scrollReveal: boolean;
    parallax: boolean;
    floatingElements: boolean;
}

export interface LayoutPreset {
    name: string;
    maxWidth: string;
    gridColumns: number;
    sectionPadding: string;
    cardBorderRadius: string;
    buttonBorderRadius: string;
    shadowStyle: string;
}

export interface IndustryProfile {
    id: string;
    name: string;
    keywords: string[];
    colors: ColorPalette;
    typography: TypographySet;
    layout: LayoutPreset;
    animations: AnimationPreset;
    icons: string[];
    heroStyle: 'centered' | 'left-aligned' | 'split' | 'video-background' | 'animated';
    testimonialStyle: 'cards' | 'carousel' | 'quotes' | 'avatars';
    ctaStyle: 'bold' | 'subtle' | 'gradient' | 'outline' | 'glow';
}

export interface DesignBrief {
    industry: IndustryProfile;
    customizations: Partial<IndustryProfile>;
    sections: string[];
    features: string[];
    targetAudience: string;
    brandTone: 'professional' | 'friendly' | 'bold' | 'elegant' | 'playful' | 'technical';
}

// =============================================================================
// INDUSTRY PROFILES
// =============================================================================

export const INDUSTRY_PROFILES: IndustryProfile[] = [
    // =========================================================================
    // FINANCE & BANKING
    // =========================================================================
    {
        id: 'finance',
        name: 'Finance & Banking',
        keywords: ['finance', 'bank', 'trading', 'investment', 'stock', 'portfolio', 'wealth', 'capital', 'fintech', 'payment', 'wallet', 'money'],
        colors: {
            primary: '#10b981',
            secondary: '#3b82f6',
            accent: '#f59e0b',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f8fafc',
            muted: '#94a3b8',
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444',
            gradient: {
                from: '#10b981',
                via: '#3b82f6',
                to: '#8b5cf6',
                angle: 135
            }
        },
        typography: {
            heading: 'Inter',
            body: 'Inter',
            mono: 'JetBrains Mono',
            headingWeight: 700,
            bodyWeight: 400,
            sizes: { h1: '4rem', h2: '2.5rem', h3: '1.75rem', h4: '1.25rem', body: '1rem', small: '0.875rem' },
            lineHeight: { heading: 1.2, body: 1.6 }
        },
        layout: {
            name: 'dashboard-grid',
            maxWidth: '1400px',
            gridColumns: 12,
            sectionPadding: '6rem',
            cardBorderRadius: '1rem',
            buttonBorderRadius: '0.5rem',
            shadowStyle: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        },
        animations: {
            name: 'subtle-professional',
            entranceAnimation: 'fadeInUp',
            hoverScale: 1.02,
            transitionDuration: '0.3s',
            transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
            scrollReveal: true,
            parallax: false,
            floatingElements: false
        },
        icons: ['TrendingUp', 'DollarSign', 'PieChart', 'Shield', 'Wallet', 'BarChart3'],
        heroStyle: 'split',
        testimonialStyle: 'cards',
        ctaStyle: 'gradient'
    },

    // =========================================================================
    // HEALTHCARE & MEDICAL
    // =========================================================================
    {
        id: 'healthcare',
        name: 'Healthcare & Medical',
        keywords: ['health', 'medical', 'hospital', 'clinic', 'doctor', 'patient', 'care', 'wellness', 'therapy', 'medicine', 'pharma', 'treatment'],
        colors: {
            primary: '#0891b2',
            secondary: '#10b981',
            accent: '#6366f1',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#0f172a',
            muted: '#64748b',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: {
                from: '#0891b2',
                to: '#10b981',
                angle: 135
            }
        },
        typography: {
            heading: 'Open Sans',
            body: 'Lato',
            mono: 'Fira Code',
            headingWeight: 700,
            bodyWeight: 400,
            sizes: { h1: '3.5rem', h2: '2.25rem', h3: '1.5rem', h4: '1.125rem', body: '1rem', small: '0.875rem' },
            lineHeight: { heading: 1.3, body: 1.7 }
        },
        layout: {
            name: 'trust-focused',
            maxWidth: '1200px',
            gridColumns: 12,
            sectionPadding: '5rem',
            cardBorderRadius: '1.5rem',
            buttonBorderRadius: '2rem',
            shadowStyle: '0 10px 40px -10px rgba(0, 0, 0, 0.1)'
        },
        animations: {
            name: 'calm-reassuring',
            entranceAnimation: 'fadeIn',
            hoverScale: 1.01,
            transitionDuration: '0.4s',
            transitionTiming: 'ease-out',
            scrollReveal: true,
            parallax: false,
            floatingElements: false
        },
        icons: ['Heart', 'Activity', 'Stethoscope', 'Shield', 'Users', 'Clock'],
        heroStyle: 'centered',
        testimonialStyle: 'avatars',
        ctaStyle: 'bold'
    },

    // =========================================================================
    // TECHNOLOGY & AI STARTUPS
    // =========================================================================
    {
        id: 'technology',
        name: 'Technology & AI',
        keywords: ['tech', 'ai', 'startup', 'software', 'saas', 'platform', 'digital', 'innovation', 'machine learning', 'automation', 'cloud', 'api'],
        colors: {
            primary: '#8b5cf6',
            secondary: '#f97316',
            accent: '#22d3ee',
            background: '#0a0a0a',
            surface: '#171717',
            text: '#fafafa',
            muted: '#a3a3a3',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: {
                from: '#8b5cf6',
                via: '#ec4899',
                to: '#f97316',
                angle: 135
            }
        },
        typography: {
            heading: 'Space Grotesk',
            body: 'Inter',
            mono: 'JetBrains Mono',
            headingWeight: 700,
            bodyWeight: 400,
            sizes: { h1: '4.5rem', h2: '2.75rem', h3: '1.75rem', h4: '1.25rem', body: '1rem', small: '0.875rem' },
            lineHeight: { heading: 1.1, body: 1.6 }
        },
        layout: {
            name: 'dynamic-modern',
            maxWidth: '1400px',
            gridColumns: 12,
            sectionPadding: '7rem',
            cardBorderRadius: '1.5rem',
            buttonBorderRadius: '0.75rem',
            shadowStyle: '0 25px 50px -12px rgba(139, 92, 246, 0.25)'
        },
        animations: {
            name: 'bold-interactive',
            entranceAnimation: 'slideInUp',
            hoverScale: 1.05,
            transitionDuration: '0.25s',
            transitionTiming: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            scrollReveal: true,
            parallax: true,
            floatingElements: true
        },
        icons: ['Cpu', 'Zap', 'Sparkles', 'Rocket', 'Code2', 'Brain'],
        heroStyle: 'animated',
        testimonialStyle: 'carousel',
        ctaStyle: 'glow'
    },

    // =========================================================================
    // CRYPTOCURRENCY & BLOCKCHAIN
    // =========================================================================
    {
        id: 'crypto',
        name: 'Cryptocurrency & Blockchain',
        keywords: ['crypto', 'bitcoin', 'blockchain', 'defi', 'nft', 'token', 'wallet', 'trading', 'ethereum', 'web3', 'dao', 'staking'],
        colors: {
            primary: '#a855f7',
            secondary: '#22d3ee',
            accent: '#facc15',
            background: '#030712',
            surface: '#111827',
            text: '#f9fafb',
            muted: '#6b7280',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: {
                from: '#a855f7',
                via: '#22d3ee',
                to: '#facc15',
                angle: 120
            }
        },
        typography: {
            heading: 'Orbitron',
            body: 'Exo 2',
            mono: 'Fira Code',
            headingWeight: 700,
            bodyWeight: 400,
            sizes: { h1: '4rem', h2: '2.5rem', h3: '1.5rem', h4: '1.125rem', body: '0.95rem', small: '0.8rem' },
            lineHeight: { heading: 1.15, body: 1.5 }
        },
        layout: {
            name: 'trading-dashboard',
            maxWidth: '1600px',
            gridColumns: 12,
            sectionPadding: '5rem',
            cardBorderRadius: '1rem',
            buttonBorderRadius: '0.5rem',
            shadowStyle: '0 0 40px rgba(168, 85, 247, 0.2)'
        },
        animations: {
            name: 'dynamic-realtime',
            entranceAnimation: 'fadeInScale',
            hoverScale: 1.03,
            transitionDuration: '0.2s',
            transitionTiming: 'ease-out',
            scrollReveal: true,
            parallax: true,
            floatingElements: true
        },
        icons: ['Bitcoin', 'Wallet', 'ArrowUpDown', 'LineChart', 'Lock', 'Layers'],
        heroStyle: 'animated',
        testimonialStyle: 'cards',
        ctaStyle: 'glow'
    },

    // =========================================================================
    // E-COMMERCE & RETAIL
    // =========================================================================
    {
        id: 'ecommerce',
        name: 'E-commerce & Retail',
        keywords: ['shop', 'store', 'ecommerce', 'retail', 'product', 'buy', 'cart', 'marketplace', 'fashion', 'sale', 'order', 'shipping'],
        colors: {
            primary: '#f97316',
            secondary: '#ec4899',
            accent: '#10b981',
            background: '#fafafa',
            surface: '#ffffff',
            text: '#171717',
            muted: '#737373',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: {
                from: '#f97316',
                to: '#ec4899',
                angle: 135
            }
        },
        typography: {
            heading: 'Montserrat',
            body: 'Lato',
            mono: 'Roboto Mono',
            headingWeight: 700,
            bodyWeight: 400,
            sizes: { h1: '3.5rem', h2: '2.25rem', h3: '1.5rem', h4: '1.125rem', body: '1rem', small: '0.875rem' },
            lineHeight: { heading: 1.2, body: 1.6 }
        },
        layout: {
            name: 'product-grid',
            maxWidth: '1400px',
            gridColumns: 12,
            sectionPadding: '5rem',
            cardBorderRadius: '1rem',
            buttonBorderRadius: '2rem',
            shadowStyle: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
        },
        animations: {
            name: 'engaging-playful',
            entranceAnimation: 'bounceIn',
            hoverScale: 1.08,
            transitionDuration: '0.3s',
            transitionTiming: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            scrollReveal: true,
            parallax: false,
            floatingElements: true
        },
        icons: ['ShoppingCart', 'Package', 'Star', 'Truck', 'CreditCard', 'Tag'],
        heroStyle: 'split',
        testimonialStyle: 'carousel',
        ctaStyle: 'bold'
    },

    // =========================================================================
    // EDUCATION & LEARNING
    // =========================================================================
    {
        id: 'education',
        name: 'Education & Learning',
        keywords: ['education', 'school', 'learn', 'course', 'student', 'teacher', 'university', 'training', 'tutorial', 'academy', 'certificate', 'skills'],
        colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#f59e0b',
            background: '#fffbeb',
            surface: '#ffffff',
            text: '#1e293b',
            muted: '#64748b',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: {
                from: '#3b82f6',
                to: '#8b5cf6',
                angle: 135
            }
        },
        typography: {
            heading: 'Nunito',
            body: 'Poppins',
            mono: 'Source Code Pro',
            headingWeight: 700,
            bodyWeight: 400,
            sizes: { h1: '3.25rem', h2: '2.25rem', h3: '1.5rem', h4: '1.125rem', body: '1.05rem', small: '0.9rem' },
            lineHeight: { heading: 1.3, body: 1.7 }
        },
        layout: {
            name: 'content-focused',
            maxWidth: '1200px',
            gridColumns: 12,
            sectionPadding: '5rem',
            cardBorderRadius: '1.25rem',
            buttonBorderRadius: '1rem',
            shadowStyle: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        },
        animations: {
            name: 'friendly-encouraging',
            entranceAnimation: 'fadeInUp',
            hoverScale: 1.03,
            transitionDuration: '0.35s',
            transitionTiming: 'ease-out',
            scrollReveal: true,
            parallax: false,
            floatingElements: true
        },
        icons: ['GraduationCap', 'BookOpen', 'Trophy', 'Users', 'Play', 'Award'],
        heroStyle: 'centered',
        testimonialStyle: 'avatars',
        ctaStyle: 'gradient'
    }
];

// =============================================================================
// DETECTION & SELECTION FUNCTIONS
// =============================================================================

/**
 * Detect industry from user prompt
 */
export function detectIndustry(prompt: string): IndustryProfile {
    const lowerPrompt = prompt.toLowerCase();

    let bestMatch: IndustryProfile | null = null;
    let bestScore = 0;

    for (const profile of INDUSTRY_PROFILES) {
        let score = 0;
        for (const keyword of profile.keywords) {
            if (lowerPrompt.includes(keyword)) {
                score += keyword.length; // Longer keywords = more specific match
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = profile;
        }
    }

    // Default to technology if no match
    return bestMatch || INDUSTRY_PROFILES.find(p => p.id === 'technology')!;
}

/**
 * Get industry profile by ID
 */
export function getIndustryProfile(id: string): IndustryProfile | undefined {
    return INDUSTRY_PROFILES.find(p => p.id === id);
}

/**
 * Generate CSS variables from color palette
 */
export function generateCSSVariables(colors: ColorPalette): string {
    return `
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-accent: ${colors.accent};
        --color-background: ${colors.background};
        --color-surface: ${colors.surface};
        --color-text: ${colors.text};
        --color-muted: ${colors.muted};
        --color-success: ${colors.success};
        --color-warning: ${colors.warning};
        --color-error: ${colors.error};
        --gradient: linear-gradient(${colors.gradient.angle}deg, ${colors.gradient.from}${colors.gradient.via ? `, ${colors.gradient.via}` : ''}, ${colors.gradient.to});
    `.trim();
}

/**
 * Generate Google Fonts import URL
 */
export function generateFontImport(typography: TypographySet): string {
    const fonts = [
        `family=${typography.heading.replace(/ /g, '+')}:wght@${typography.headingWeight}`,
        `family=${typography.body.replace(/ /g, '+')}:wght@${typography.bodyWeight};500`,
        `family=${typography.mono.replace(/ /g, '+')}`
    ];

    return `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=swap`;
}

/**
 * Generate animation keyframes
 */
export function generateAnimationCSS(animations: AnimationPreset): string {
    const keyframes: Record<string, string> = {
        fadeIn: `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `,
        fadeInUp: `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `,
        fadeInScale: `
            @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `,
        slideInUp: `
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `,
        bounceIn: `
            @keyframes bounceIn {
                0% { opacity: 0; transform: scale(0.3); }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
            }
        `,
        float: `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
        `,
        pulse: `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `,
        shimmer: `
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
        `
    };

    return Object.values(keyframes).join('\n');
}

/**
 * Generate full design system CSS
 */
export function generateDesignSystemCSS(profile: IndustryProfile): string {
    const { colors, typography, layout, animations } = profile;

    return `
/* ============================================
   G-NEXUS DESIGN SYSTEM
   Industry: ${profile.name}
   Generated by AI Design Intelligence
   ============================================ */

@import url('${generateFontImport(typography)}');

:root {
    ${generateCSSVariables(colors)}
    
    /* Typography */
    --font-heading: '${typography.heading}', sans-serif;
    --font-body: '${typography.body}', sans-serif;
    --font-mono: '${typography.mono}', monospace;
    --font-size-h1: ${typography.sizes.h1};
    --font-size-h2: ${typography.sizes.h2};
    --font-size-h3: ${typography.sizes.h3};
    --font-size-h4: ${typography.sizes.h4};
    --font-size-body: ${typography.sizes.body};
    --font-size-small: ${typography.sizes.small};
    --line-height-heading: ${typography.lineHeight.heading};
    --line-height-body: ${typography.lineHeight.body};
    
    /* Layout */
    --max-width: ${layout.maxWidth};
    --grid-columns: ${layout.gridColumns};
    --section-padding: ${layout.sectionPadding};
    --card-radius: ${layout.cardBorderRadius};
    --button-radius: ${layout.buttonBorderRadius};
    --shadow: ${layout.shadowStyle};
    
    /* Animations */
    --transition-duration: ${animations.transitionDuration};
    --transition-timing: ${animations.transitionTiming};
    --hover-scale: ${animations.hoverScale};
}

${generateAnimationCSS(animations)}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-body);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    color: var(--color-text);
    background: var(--color-background);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: ${typography.headingWeight};
    line-height: var(--line-height-heading);
}

h1 { font-size: var(--font-size-h1); }
h2 { font-size: var(--font-size-h2); }
h3 { font-size: var(--font-size-h3); }
h4 { font-size: var(--font-size-h4); }

a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-duration) var(--transition-timing);
}

a:hover {
    color: var(--color-secondary);
}

.container {
    width: 100%;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 2rem;
}

.section {
    padding: var(--section-padding) 0;
}

.card {
    background: var(--color-surface);
    border-radius: var(--card-radius);
    box-shadow: var(--shadow);
    transition: transform var(--transition-duration) var(--transition-timing),
                box-shadow var(--transition-duration) var(--transition-timing);
}

.card:hover {
    transform: scale(var(--hover-scale));
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: var(--button-radius);
    cursor: pointer;
    transition: all var(--transition-duration) var(--transition-timing);
}

.btn-primary {
    background: var(--gradient);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
    background: transparent;
    color: var(--color-text);
    border: 2px solid var(--color-muted);
}

.btn-secondary:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

.gradient-text {
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.animate-on-scroll {
    opacity: 0;
    animation: ${animations.entranceAnimation} 0.8s var(--transition-timing) forwards;
}

${animations.floatingElements ? `
.floating {
    animation: float 6s ease-in-out infinite;
}
` : ''}

/* Responsive */
@media (max-width: 1024px) {
    :root {
        --font-size-h1: calc(${typography.sizes.h1} * 0.8);
        --font-size-h2: calc(${typography.sizes.h2} * 0.85);
        --section-padding: calc(${layout.sectionPadding} * 0.75);
    }
}

@media (max-width: 768px) {
    :root {
        --font-size-h1: calc(${typography.sizes.h1} * 0.6);
        --font-size-h2: calc(${typography.sizes.h2} * 0.7);
        --section-padding: calc(${layout.sectionPadding} * 0.5);
    }
    
    .container {
        padding: 0 1rem;
    }
}
    `.trim();
}

/**
 * Create a design brief from prompt analysis
 */
export function createDesignBrief(prompt: string, analysis?: string): DesignBrief {
    const industry = detectIndustry(prompt);

    // Detect brand tone from prompt
    let brandTone: DesignBrief['brandTone'] = 'professional';
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('fun') || lowerPrompt.includes('playful') || lowerPrompt.includes('casual')) {
        brandTone = 'playful';
    } else if (lowerPrompt.includes('elegant') || lowerPrompt.includes('luxury') || lowerPrompt.includes('premium')) {
        brandTone = 'elegant';
    } else if (lowerPrompt.includes('bold') || lowerPrompt.includes('exciting') || lowerPrompt.includes('dynamic')) {
        brandTone = 'bold';
    } else if (lowerPrompt.includes('friendly') || lowerPrompt.includes('warm') || lowerPrompt.includes('welcoming')) {
        brandTone = 'friendly';
    } else if (lowerPrompt.includes('technical') || lowerPrompt.includes('developer') || lowerPrompt.includes('api')) {
        brandTone = 'technical';
    }

    // Detect required sections
    const sections: string[] = ['hero', 'features'];
    if (lowerPrompt.includes('pricing') || lowerPrompt.includes('plan')) sections.push('pricing');
    if (lowerPrompt.includes('testimonial') || lowerPrompt.includes('review')) sections.push('testimonials');
    if (lowerPrompt.includes('faq') || lowerPrompt.includes('question')) sections.push('faq');
    if (lowerPrompt.includes('team') || lowerPrompt.includes('about')) sections.push('team');
    if (lowerPrompt.includes('contact') || lowerPrompt.includes('demo')) sections.push('contact');
    sections.push('footer');

    // Detect features
    const features: string[] = [];
    if (lowerPrompt.includes('dark') || lowerPrompt.includes('night')) features.push('dark-mode');
    if (lowerPrompt.includes('animation') || lowerPrompt.includes('interactive')) features.push('animations');
    if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph') || lowerPrompt.includes('data')) features.push('data-viz');
    if (lowerPrompt.includes('mobile') || lowerPrompt.includes('responsive')) features.push('responsive');

    return {
        industry,
        customizations: {},
        sections,
        features,
        targetAudience: industry.name,
        brandTone
    };
}

export default {
    INDUSTRY_PROFILES,
    detectIndustry,
    getIndustryProfile,
    generateCSSVariables,
    generateFontImport,
    generateAnimationCSS,
    generateDesignSystemCSS,
    createDesignBrief
};
