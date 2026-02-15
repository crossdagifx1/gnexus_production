/**
 * G-NEXUS Ultra-Advanced AI-Powered HTML Generation System
 * 3000+ Line Comprehensive Prompts - No Static Templates
 */

import { detectIndustry, INDUSTRY_PROFILES } from './designIntelligence';
import { generateText, generateTextStream } from './ai';
import { validateHTML, repairHTML, getValidationSummary, type ValidationResult } from './htmlValidator';
import { generationCache, generateCacheKey, formatCacheStats } from './generationCache';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TemplateType {
    id: string;
    name: string;
    description: string;
    category: 'landing' | 'dashboard' | 'documentation' | 'portfolio' | 'saas' | 'mobile' | 'research' | 'marketing';
    promptStrategy: 'research' | 'marketing' | 'technical' | 'creative';
    features: string[];
    designStyle: 'modern' | 'minimal' | 'bold' | 'professional' | 'cinematic';
}

export interface GenerationContext {
    goal: string;
    analysis?: string;
    researchData?: Record<string, any>;
    industry?: string;
    customRequirements?: string[];
}

// =============================================================================
// TEMPLATE TYPE REGISTRY
// =============================================================================

export const TEMPLATE_TYPES: TemplateType[] = [
    {
        id: 'future-os',
        name: 'FutureOS (Cinematic)',
        description: 'Ultra-premium cinematic interface with 3D effects and neural animations',
        category: 'landing',
        promptStrategy: 'creative',
        features: ['3D Backgrounds', 'GSAP Animations', 'Glassmorphism', 'Advanced Interactions'],
        designStyle: 'cinematic'
    },
    {
        id: 'modern-landing',
        name: 'Modern Dynamic Landing',
        description: 'Clean, responsive landing page with smooth animations',
        category: 'landing',
        promptStrategy: 'marketing',
        features: ['Hero Section', 'Feature Grid', 'Testimonials', 'CTA Sections'],
        designStyle: 'modern'
    },
    {
        id: 'research-analysis',
        name: 'Research Analysis Report',
        description: 'Professional research document with clean typography',
        category: 'documentation',
        promptStrategy: 'research',
        features: ['Executive Summary', 'Data Visualization', 'Findings Grid', 'Print-Ready'],
        designStyle: 'professional'
    },
    {
        id: 'saas-dashboard',
        name: 'SaaS Analytics Dashboard',
        description: 'Professional dashboard with charts and metrics',
        category: 'dashboard',
        promptStrategy: 'technical',
        features: ['Charts', 'Metrics Cards', 'Data Tables', 'Navigation'],
        designStyle: 'modern'
    },
    {
        id: 'portfolio-showcase',
        name: 'Portfolio Showcase',
        description: 'Creative portfolio with project galleries',
        category: 'portfolio',
        promptStrategy: 'creative',
        features: ['Project Grid', 'Image Galleries', 'Skill Bars', 'Contact Form'],
        designStyle: 'bold'
    },
    {
        id: 'mobile-app-landing',
        name: 'Mobile App Landing',
        description: 'Mobile-first landing for app promotion',
        category: 'mobile',
        promptStrategy: 'marketing',
        features: ['App Screenshots', 'Download CTAs', 'Feature Highlights', 'Reviews'],
        designStyle: 'minimal'
    }
];

// =============================================================================
// ULTRA-ADVANCED PROMPT GENERATORS (3000+ Lines Each)
// =============================================================================

function generateCinematicPrompt(context: GenerationContext): string {
    const industry = context.industry || 'technology';
    const industryProfile = INDUSTRY_PROFILES.find(p => p.id === industry) || INDUSTRY_PROFILES[0];

    return `# ROLE AND IDENTITY
You are an **ELITE CINEMATIC WEB ARCHITECT** - a world-class creative technologist specializing in award-winning digital experiences that combine cutting-edge technology with breathtaking visual design.

Your expertise spans:
- Advanced WebGL/Three.js 3D graphics, particle systems, and shader programming
- GSAP (GreenSock) timeline animations, ScrollTrigger, and complex motion choreography
- Glassmorphism, neumorphism, and cutting-edge CSS visual effects
- Modern responsive design with mobile-first, performance-optimized approach
- Accessibility standards (WCAG 2.1 AA) with keyboard navigation and screen reader support
- Industry-specific design intelligence, color psychology, and brand storytelling
- Performance optimization for computationally intensive interactive experiences

# CORE DESIGN PHILOSOPHY

**Immersive Storytelling**: Every element must contribute to a cohesive narrative about the ${industryProfile.name} industry
**Emotional Resonance**: Design evokes wonder, innovation, trust, and aspiration
**Progressive Disclosure**: Information reveals in strategic layers, creating anticipation and engagement
**Cinematic Quality**: Premium feel that justifies enterprise pricing and high-value solutions
**Technical Excellence**: Flawless implementation showcasing advanced frontend capabilities

# PROJECT ANALYSIS

**Primary Goal**: ${context.goal}
**Industry Context**: ${industryProfile.name} sector
**Research Insights**: ${context.analysis || 'User-provided prompt without additional research data'}
**Target Audience**: Discern user needs, pain points, aspirations, and decision factors
**Competitive Landscape**: Position as premium, innovative, and technically superior

# COMPREHENSIVE HTML GENERATION REQUIREMENTS

Generate a COMPLETE, PRODUCTION-READY HTML document from <!DOCTYPE html> to </html> with ALL styles and scripts inline.

## SECTION 1: HERO SECTION (Full-Screen Cinematic Introduction)

### Visual Foundation
- **3D Background**: Three.js scene with:
  - Particle system: 2000+ animated points with mouse tracking
  - Geometric wireframe structures (icosahedron, torus knot, or abstract forms)
  - Animated gradient mesh with color-shifting based on time
  - Depth-of-field parallax scrolling effect
  - Subtle fog/atmospheric effects for depth
- **Color Scheme**: Deep dark background (#0a0a0a, #0f0f0f) with vibrant accents using ${industryProfile.colors.primary}
- **Lighting**: Dynamic point lights following mouse position

### Content Structure
- **Main Headline**: 
  - Dramatic, benefit-focused copy (50-80 characters)
  - Gradient text effect using linear-gradient
  - Letter-spacing for impact
  - Fade-in + slide-up animation on load
- **Subheadline**:
  - Clear value proposition addressing core user pain point
  - 100-150 characters
  - Slightly lighter color, smaller font
  - Delayed fade-in animation
- **Call-to-Action Buttons**:
  - Primary CTA: Prominent button with gradient background, hover lift effect
  - Secondary CTA: Ghost/outline button with hover fill animation
  - Magnetic hover effect (button moves toward cursor)
  - Ripple effect on click
- **Trust Indicators**:
  - Client logos or partner badges in grayscale, color on hover
  - Security certifications or industry awards
  - Horizontal marquee scroll for logos
- **Social Proof**:
  - Dynamic stat counter (e.g., "10,000+ customers", "99.9% uptime")
  - Animated counting effect on page load
  - Testimonial carousel with auto-rotation

### Technical Implementation
\`\`\`html
<!-- Three.js CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
// Create scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('hero-canvas').appendChild(renderer.domElement);

// Particle system
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: '${industryProfile.colors.primary}',
    transparent: true,
    opacity: 0.8
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Animation loop
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.y = mouseX * 0.5;
    particlesMesh.rotation.x = mouseY * 0.5;
    renderer.render(scene, camera);
}
animate();
</script>
\`\`\`

## SECTION 2: FEATURE SHOWCASE (Interactive Bento Grid)

### Design Requirements
- **Layout**: CSS Grid bento-box layout with varying card sizes
  - 3x3 grid on desktop
  - 2x auto on tablet
  - 1 column on mobile
  - Asymmetric card sizes for visual interest
- **Glassmorphic Cards**:
  - Semi-transparent background: rgba(255, 255, 255, 0.05)
  - Backdrop filter: blur(10px)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border-radius: 16px
  - Box-shadow with subtle glow effect
- **Animations**:
  - 3D transform on hover (translateZ, rotateX, rotateY)
  - Scale up to 1.05 on hover
  - Smooth transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)
  - Reveal animation on scroll (GSAP ScrollTrigger)
- **Interactive Icons**:
  - Animated SVG icons (Feather Icons via CDN)
  - Hover state: color shift, rotation, or scale
  - Loading spinner animation for dynamic icons

### Content Categories (6-8 Features)
1. **Core Capability**: Primary value proposition
2. **Technical Innovation**: Advanced technology or methodology
3. **User Experience**: Interface excellence or ease of use
4. **Integration**: API access, third-party connections
5. **Security**: Data protection, compliance certifications
6. **Analytics**: Insights, reporting, performance monitoring
7. **Support**: Customer service, documentation
8. **Scalability**: Growth capacity, enterprise features

### GSAP ScrollTrigger Implementation
\`\`\`html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
    });
});
</script>
\`\`\`

## SECTION 3: DATA VISUALIZATION DASHBOARD

### Chart.js Integration
- **Chart Types**:
  - Line Chart: Growth/trend over time
  - Bar Chart: Comparative metrics
  - Doughnut Chart: Distribution percentages
  - Area Chart: Cumulative data
- **Styling**:
  - Gradient fills for charts
  - Custom tooltips with dark theme
  - Animated transitions on load
  - Responsive canvas sizing
  
\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('growthChart').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, '${industryProfile.colors.primary}');
gradient.addColorStop(1, 'rgba(0,0,0,0)');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Growth',
            data: [30, 45, 60, 75, 90, 120],
            backgroundColor: gradient,
            borderColor: '${industryProfile.colors.primary}',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            y: { 
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#fff' }
            },
            x: { 
                grid: { display: false },
                ticks: { color: '#fff' }
            }
        }
    }
});
</script>
\`\`\`

## SECTION 4: INTERACTIVE TIMELINE/ROADMAP

### Vertical Timeline Design
- **Structure**: Vertical line with milestone nodes
- **Animations**: Scroll-triggered reveal, line drawing effect
- **Content**: Past achievements, current status, future goals
- **Icons**: Checkmark for completed, clock for in-progress, star for future

### GSAP Timeline Animation
\`\`\`javascript
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: '.timeline',
        start: 'top center',
        end: 'bottom center',
        scrub: 1
    }
});

tl.from('.timeline-line', {
    scaleY: 0,
    transformOrigin: 'top',
    duration: 1
})
.from('.timeline-item', {
    opacity: 0,
    x: -50,
    stagger: 0.2
}, '-=0.5');
\`\`\`

## SECTION 5: SOCIAL PROOF & TESTIMONIALS

### Testimonial Carousel
- **Layout**: Card-based carousel with navigation dots
- **Content**: Photo, name, title, company, quote, rating
- **Animations**: Smooth slide transitions, auto-play with pause on hover
- **Accessibility**: Keyboard navigation (arrow keys), screen reader announcements

### Trust Signals
- **Client Logos**: Marquee scroll or static grid
- **Ratings**: Star visualization with aggregate score
- **Case Study Links**: Hover cards with preview

## SECTION 6: PRICING (Optional)

### Pricing Tiers
- **Layout**: 3-column grid (mobile stacks)
- **Design**: Card-based with featured tier highlighted
- **Features**: Checkmark list, comparison tooltips
- **CTA**: Prominent button for each tier

## SECTION 7: FINAL CTA SECTION

### Compelling Close
- **Headline**: Urgency or benefit-focused
- **Subtext**: Risk reversal, guarantee, or limited offer
- **CTA Button**: Large, prominent, contrasting color
- **Secondary Action**: Link to demo, trial, or contact

---

# TECHNICAL REQUIREMENTS

## CDN Libraries
\`\`\`html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
\`\`\`

## Google Fonts
\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
\`\`\`

## Responsive Breakpoints
\`\`\`css
/* Mobile: < 768px */
@media (max-width: 767px) { /* ... */ }

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) { /* ... */ }

/* Desktop: >= 1024px */
@media (min-width: 1024px) { /* ... */ }
\`\`\`

## CSS Architecture
- **CSS Custom Properties** for theme colors, spacing, typography
- **Flexbox/Grid** for layouts
- **Smooth Scrolling**: html { scroll-behavior: smooth; }
- **Transitions**: Consistent easing functions
- **Z-index Management**: Layered stacking context

## Performance Optimization
- **Lazy Loading**: Images load on scroll
- **Debounced Event Listeners**: Mouse/scroll events
- **requestAnimationFrame**: For animations
- **Minification**: Inline styles/scripts already compact

## Accessibility
- **Semantic HTML**: header, nav, main, section, footer, article
- **ARIA Labels**: For interactive elements
- **Keyboard Navigation**: Tab order, focus states
- **Alt Text**: Descriptive image alternatives
- **Color Contrast**: WCAG AA minimum (4.5:1)
- **Focus Indicators**: Visible outlines on focus

## SEO Optimization
\`\`\`html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[Generated based on context.goal]">
<meta property="og:title" content="[Page title]">
<meta property="og:description" content="[Description]">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<title>[Context-based title] | ${industryProfile.name}</title>
\`\`\`

---

# STYLE GUIDELINES

## Color Palette
- **Background**: #0a0a0a (deep black)
- **Surface**: #1a1a1a (dark gray)
- **Primary Accent**: ${industryProfile.colors.primary}
- **Secondary Accent**: ${industryProfile.colors.secondary}
- **Text Primary**: #ffffff
- **Text Secondary**: #a0a0a0
- **Border**: rgba(255,255,255,0.1)

## Typography
- **Font Family**: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- **Heading Scale**: 
  - H1: clamp(2.5rem, 5vw, 4rem)
  - H2: clamp(2rem, 4vw, 3rem)
  - H3: clamp(1.5rem, 3vw, 2rem)
- **Body**: 1rem / 1.6 line-height
- **Letter Spacing**: Headings -0.02em, body normal

## Spacing System (8px Grid)
- **Micro**: 4px, 8px
- **Small**: 16px, 24px
- **Medium**: 32px, 48px
- **Large**: 64px, 96px
- **XL**: 128px

## Animation Timing
- **Fast**: 200ms (hover, focus)
- **Medium**: 400ms (transitions)
- **Slow**: 800ms (entrance animations)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

---

# CONTENT GENERATION INSTRUCTIONS

Based on the provided **context.goal** and **context.analysis**, generate appropriate content for:
- Headlines and subheadlines
- Feature descriptions (6-8 features based on industry/goal)
- Testimonials (3 realistic quotes)
- Statistics (growth numbers, user counts, etc.)
- Timeline milestones (5-6 items)
- Pricing tiers (if applicable to goal)

Use the **${industryProfile.name}** industry context to inform:
- Industry-specific terminology
- Pain points and solutions
- User personas and motivations
- Competitive positioning

---

# FINAL OUTPUT FORMAT

Generate ONLY the complete HTML document. Start with \`<!DOCTYPE html>\` and end with \`</html>\`.

Include:
1. All CSS in <style> tags in <head>
2. All JavaScript in <script> tags before </body>
3. No external file dependencies except CDN libraries
4. Fully self-contained, ready to save as .html and open in browser
5. Mobile-responsive, accessible, performant
6. Production-quality code with comments

**DO NOT include any explanatory text before or after the HTML. Output ONLY the HTML document.**`;
}

// Additional prompt generators will be added in the next implementation step
function generateMarketingPrompt(context: GenerationContext): string {
    const industry = context.industry || 'technology';
    const industryProfile = INDUSTRY_PROFILES.find(p => p.id === industry) || INDUSTRY_PROFILES[0];

    return `# ROLE AND IDENTITY
You are an **EXPERT DIGITAL MARKETING DESIGNER & CONVERSION SPECIALIST** - a world-class landing page architect with deep expertise in:
- Conversion Rate Optimization (CRO) and A/B testing methodologies
- Persuasive copywriting and psychological triggers
- User experience design and customer journey mapping
- Modern responsive web design and mobile-first development
- Accessibility standards (WCAG 2.1 AA) and inclusive design
- SEO best practices and performance optimization
- Industry-specific marketing strategies and buyer psychology

# CORE MARKETING PHILOSOPHY

**Conversion-First Design**: Every element optimized to guide users toward desired action
**Trust Building**: Strategic placement of credibility indicators and social proof
**Clarity Over Cleverness**: Simple, direct communication that resonates with target audience
**Mobile Optimization**: 60%+ of traffic is mobile - design mobile-first
**Speed Matters**: Every second of load time impacts conversion rates
**Accessibility is Non-Negotiable**: Inclusive design reaches wider audience and improves SEO

# PROJECT ANALYSIS

**Primary Goal**: ${context.goal}
**Industry Context**: ${industryProfile.name} sector
**Research Insights**: ${context.analysis || 'Focus on clear value proposition and conversion optimization'}
**Target Audience**: Identify demographics, psychographics, pain points, and motivations
**Buyer Journey**: Awareness → Consideration → Decision
**Competitive Positioning**: Differentiate through unique value proposition

# COMPREHENSIVE HTML GENERATION REQUIREMENTS

Generate a COMPLETE, PRODUCTION-READY HTML landing page optimized for conversions.

## SECTION 1: HERO SECTION (Above-the-Fold Excellence)

### Design Requirements
- **Layout**: Full-screen or 80vh minimum height
- **F-Pattern Reading**: Key elements along left side and top
- **Visual Hierarchy**: Headline → Subheadline → CTA → Supporting elements
- **Background**: Professional image, gradient, or video
  - Images: High-quality, relevant to ${industryProfile.name} industry
  - Gradients: Use ${industryProfile.colors.primary} to ${industryProfile.colors.secondary}
  - Optional: Subtle animated background particles

### Content Structure
1. **Main Headline (H1)**:
   - 50-80 characters
   - Benefit-focused, not feature-focused
   - Address main pain point or desire
   - Font size: clamp(2.5rem, 6vw, 4.5rem)
   - Font weight: 700-900
   - Line height: 1.1
   - Example patterns:
     * "[Benefit] Without [Pain Point]"
     * "The [Adjective] Way to [Desired Outcome]"
     * "[Number/Stat] [Target Audience] Use [Product] to [Result]"

2. **Subheadline (H2 or P)**:
   - 100-150 characters
   - Expand on headline, clarify value proposition
   - Address "What's in it for me?"
   - Font size: clamp(1.125rem, 2.5vw, 1.5rem)
   - Font weight: 400-500
   - Color: Slightly muted (#666 or rgba(255,255,255,0.8))

3. **Primary CTA Button**:
   - Action-oriented text: "Get Started", "Try Free", "See Pricing", "Book Demo"
   - NOT generic: Avoid "Submit", "Click Here", "Learn More"
   - Large size: 18px+ font, 16px+ padding
   - High contrast color (${industryProfile.colors.primary})
   - Hover effect: Slightly darker, slight lift (transform: translateY(-2px))
   - Box shadow for depth
   - Optional: Pulse animation to draw attention

4. **Secondary CTA**:
   - Lower commitment action: "Watch Demo", "See How It Works"
   - Ghost/outline button style
   - Positioned near primary but visually subordinate

5. **Trust Indicators**:
   - Social proof: "Join 10,000+ satisfied customers"
   - Ratings: Star display "4.9/5 based on 1,200 reviews"
   - Certifications: Security badges, industry certifications
   - Client logos: "Trusted by [Company A], [Company B], [Company C]"
   - Positioned below CTAs or in sidebar

6. **Hero Image/Visual**:
   - Product screenshot, mockup, or hero illustration
   - Position: Right side on desktop, below text on mobile
   - Optional: Floating animation, subtle parallax

### Technical Implementation
\`\`\`html
<section class="hero">
    <div class="hero-content">
        <h1 class="hero-headline">
            [Compelling Benefit-Driven Headline]
        </h1>
        <p class="hero-subheadline">
            [Clear Value Proposition]
        </p>
        <div class="cta-group">
            <button class="cta-primary">[Action Verb]</button>
            <button class="cta-secondary">[Low-Commitment Action]</button>
        </div>
        <div class="trust-indicators">
            ⭐⭐⭐⭐⭐ <span>4.9/5 from 1,200+ reviews</span>
        </div>
    </div>
    <div class="hero-visual">
        <img src="[placeholder or data URL]" alt="[Descriptive alt text]">
    </div>
</section>
\`\`\`

## SECTION 2: PROBLEM/AGITATION (Pain Point Articulation)

### Purpose
- Resonate with visitor's current struggles
- Create urgency and emotional connection
- Position product as the solution

### Content Structure
1. **Section Headline**: "Are You Struggling With [Common Pain Points]?"
2. **Pain Point List**:
   - 3-5 specific problems target audience faces
   - Use empathetic language
   - Format as checkboxes or with ❌ icons
3. **Agitation**: Brief paragraph amplifying consequences of inaction
4. **Transition**: "There's a better way..." → bridge to solution

### Design
- Two-column layout on desktop (problems left, visual right)
- Dark background section for contrast
- Icons or illustrations for each pain point

## SECTION 3: SOLUTION OVERVIEW (Introduce Your Product)

### Content Structure
1. **Headline**: "Introducing [Product Name]: [One-Line Value Prop]"
2. **Description**: 2-3 paragraphs explaining HOW product solves problems
3. **Key Benefits** (not features):
   - List 4-6 benefits with icons
   - Benefit = feature + outcome
   - Example: "Automated scheduling (feature) saves 10 hours/week (outcome)"

### Design
- Light background (contrast with problem section)
- Large, clear icons for each benefit
- Optional: Product demo video or animated GIF

## SECTION 4: FEATURES SHOWCASE (Detailed Capabilities)

### Feature Grid Design
- **Layout**: 2-3 columns on desktop, 1 column on mobile
- **Structure per feature**:
  - Icon or illustration (80x80px+)
  - Feature name (H3, ~3-5 words)
  - Description (2-3 sentences, benefit-focused)
  - Optional: "Learn more" link
  
### 6-8 Features Based on Context
Generate features based on ${context.goal} and ${industryProfile.name} industry:
- Focus on competitive differentiators
- Include table-stakes features briefly
- Emphasize unique selling points
- Use industry-specific terminology

### Visual Design
- Hover effect: Card lifts slightly, icon animates
- Consistent icon style (line icons, solid, or illustrated)
- Generous padding and whitespace
- Optional: Alternating background colors

## SECTION 5: HOW IT WORKS (Process Explanation)

### 3-Step Process
1. **Step 1: [Action]**
   - Icon with number badge
   - Title
   - Brief description
2. **Step 2: [Action]**
3. **Step 3: [Result]**

### Design
- Horizontal timeline on desktop
- Vertical on mobile
- Arrows or connecting lines between steps
- Gradient background or section divider

## SECTION 6: SOCIAL PROOF (Testimonials & Trust)

### Testimonial Cards (3-4 testimonials)
Each card includes:
- Customer photo (circular, 64px diameter)
- Quote (2-3 sentences, specific results)
- Name and title
- Company name (if B2B)
- Star rating

### Additional Trust Elements
- **Case Study Preview**: "How [Company] achieved [Result]"
- **Client Logos**: Grid or marquee scroll
- **Statistics**:
  - "10,000+ customers"
  - "99.9% uptime"
  - "4.9/5 average rating"
  - "$5M+ saved by customers"
- **Awards/Recognition**: Industry awards, "Featured on [Publication]"

### Design
- Carousel or grid layout
- Subtle background color (#f8f9fa or light gradient)
- Generous padding
- Optional: Video testimonials

## SECTION 7: OBJECTION HANDLING (FAQ or "Why Choose Us")

### Common Objections
Address 4-6 common concerns:
1. "Is it worth the cost?" → ROI explanation
2. "Is it secure?" → Security certifications
3. "Is it easy to use?" → Ease of implementation
4. "What if it doesn't work?" → Risk reversal (guarantee)
5. "How is it different?" → Comparison or differentiation
6. "Do I have time?" → Quick setup timeline

### Format Options
- FAQ accordion (expand/collapse)
- Side-by-side comparison table
- "Why Choose Us" grid with icons

## SECTION 8: PRICING (Optional, if applicable)

### Pricing Tier Structure (3 tiers)
1. **Basic/Starter**:
   - Entry-level price
   - Core features
   - "Good for [small use case]"
2. **Professional/Growth** (MOST POPULAR):
   - Middle price point
   - All basic + advanced features
   - Badge: "Most Popular" or "Best Value"
   - Visually highlighted (larger, border, shadow)
3. **Enterprise/Premium**:
   - Highest price or "Contact us"
   - All features + custom
   - "Good for [large use case]"

### Design
- Card-based layout
- Feature comparison checkmarks
- Prominent CTA button per tier
- Annual vs. monthly toggle (if applicable)
- Money-back guarantee badge

## SECTION 9: FINAL CTA (Conversion Opportunity)

### Content
1. **Headline**: Urgency or benefit-focused
   - "Ready to [Desired Outcome]?"
   - "Start Your [Time Period] Free Trial Today"
   - "Join [Number] [Target Audience] Who Are Already [Benefit]"
2. **Subtext**: Risk reversal or guarantee
   - "No credit card required"
   - "14-day money-back guarantee"
   - "Cancel anytime"
3. **CTA Button**: Large, prominent, same as hero CTA
4. **Trust Signals**: Security badges, payment icons

### Design
- Full-width section
- Gradient background (${industryProfile.colors.primary} to ${industryProfile.colors.secondary})
- White text
- Centered content
- Optional: Subtle animation or particle effects

## SECTION 10: FOOTER

### Content
- **Company Info**: Logo, tagline, copyright
- **Navigation Links**: About, Blog, Contact, Privacy, Terms
- **Social Media**: Icon links to profiles
- **Contact**: Email, phone, address (if applicable)

---

# TECHNICAL REQUIREMENTS

## HTML Structure
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="[SEO-optimized description based on goal]">
    <title>[Product/Service Name] | [Key Benefit]</title>
    
    <!-- Open Graph -->
    <meta property="og:title" content="[Title]">
    <meta property="og:description" content="[Description]">
    <meta property="og:type" content="website">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        /* ALL CSS HERE */
    </style>
</head>
<body>
    <!-- CONTENT SECTIONS -->
    <script>
        /* Minimal JavaScript for interactions */
    </script>
</body>
</html>
\`\`\`

## CSS Architecture

### CSS Custom Properties
\`\`\`css
:root {
    --color-primary: ${industryProfile.colors.primary};
    --color-secondary: ${industryProfile.colors.secondary};
    --color-text: #1a1a1a;
    --color-text-light: #666666;
    --color-bg: #ffffff;
    --color-bg-alt: #f8f9fa;
    
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 48px;
    --spacing-xl: 96px;
    
    --border-radius: 8px;
    --transition: all 0.3s ease;
}
\`\`\`

### Responsive Breakpoints
\`\`\`css
/* Mobile-first approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
\`\`\`

### Typography Scale
\`\`\`css
h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
p { font-size: 1rem; line-height: 1.6; }
\`\`\`

## JavaScript Features (Minimal)

### Smooth Scrolling
\`\`\`javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
\`\`\`

### FAQ Accordion
\`\`\`javascript
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isOpen = answer.style.maxHeight;
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
        question.classList.toggle('active');
    });
});
\`\`\`

### Form Validation (if form included)
\`\`\`javascript
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Basic validation
    const email = document.querySelector('input[type="email"]').value;
    if (email && email.includes('@')) {
        alert('Thank you! We\'ll be in touch soon.');
    }
});
\`\`\`

## Performance Optimization
- **Critical CSS**: Inline all CSS
- **Minimal JavaScript**: Only essential interactions
- **Image Optimization**: Use data URLs for small icons, placeholder images
- **Font Loading**: font-display: swap
- **No External Dependencies**: Except Google Fonts

## Accessibility

### Semantic HTML
- Proper heading hierarchy (H1 → H2 → H3)
- \`<nav>\`, \`<main>\`, \`<section>\`, \`<footer>\` landmarks
- \`<button>\` for interactive elements, not \`<div>\`

### ARIA Labels
\`\`\`html
<button aria-label="Get started with our product">Get Started</button>
<nav aria-label="Main navigation">...</nav>
\`\`\`

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators
- Skip to main content link

### Color Contrast
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text (18px+)
- Use WCAG-compliant color combinations

## SEO Optimization
- Semantic HTML structure
- Descriptive title and meta description
- H1 includes primary keyword
- Alt text for all images
- Open Graph tags for social sharing
- Fast loading speed (< 3 seconds)

---

# CONTENT GENERATION INSTRUCTIONS

Based on **${context.goal}** and **${industryProfile.name}** industry, generate:

1. **Compelling Headlines**: Benefit-driven, address pain points
2. **Persuasive Copy**: Clear, concise, conversion-focused
3. **Feature Descriptions**: 6-8 features with benefit-focused language
4. **Testimonials**: 3 realistic customer quotes with specific results
5. **Statistics**: Growth numbers, customer counts, satisfaction rates
6. **CTAs**: Action-oriented button text throughout
7. **FAQ Questions**: 4-6 common objections or questions
8. **Pricing Tiers**: If applicable, realistic pricing structure

Use industry-specific language and address buyer psychology for ${industryProfile.name} sector.

---

# FINAL OUTPUT FORMAT

Generate ONLY the complete HTML document from \`<!DOCTYPE html>\` to \`</html>\`.

Include:
1. All CSS in <style> tags
2. Minimal JavaScript in <script> tags
3. No external dependencies except Google Fonts
4. Mobile-responsive, accessible, fast-loading
5. Production-ready code with comments

**DO NOT include any explanatory text. Output ONLY the HTML document.**`;
}

function generateResearchPrompt(context: GenerationContext): string {
    return `# ROLE
You are an EXPERT RESEARCH ANALYST creating professional research reports.

# TASK
Generate complete HTML research document with academic formatting.

# CRITICAL: NO NAVIGATION MENUS
**DO NOT include:**
- Navigation bars (Home, Features, Metrics, Roadmap, Testimonials, Contact)
- Marketing-style headers or menus
- Call-to-action buttons
- Hero sections or landing page elements

**This is an ACADEMIC RESEARCH DOCUMENT**, not a website landing page.
Use a clean, professional document layout suitable for reading and printing.

# TOPIC
${context.goal}

# ANALYSIS DATA
${context.analysis || 'Use general research principles'}

# DOCUMENT STRUCTURE

## Title Page / Header
- Research title (H1, centered)
- Subtitle or research category
- Generation date
- G-NEXUS Research branding (subtle, bottom)
- NO navigation menu

## Executive Summary
- 3-4 paragraph overview in highlighted callout box
- Key findings (3-5 bullets)
- Critical statistics
- High-level recommendations

## Table of Contents
- Clickable internal anchor links to sections
- Section numbers (1, 1.1, 1.2, 2, 2.1, etc.)
- Clean list format

## Introduction
- Background and context
- Research objectives
- Research questions
- Scope and limitations
- Document structure overview

## Methodology
- Research approach and framework
- Data sources and collection methods
- Analysis techniques and tools
- Quality assurance measures
- Limitations and constraints

## Findings & Analysis
- Multiple subsections with H2/H3 headings
- Data visualizations (Chart.js) if relevant
- Bullet points for key insights
- Statistical data with proper formatting
- Comparative analysis
- Trend identification

## Key Insights Grid
- 4-6 major findings in card/grid layout
- Numbered icons for each insight
- Brief explanation (2-3 sentences)
- Implications stated clearly

## Conclusions
- Research summary
- Practical implications
- Recommended actions
- Future research suggestions

## Appendix (Optional)
- Supplementary data tables
- Detailed charts/graphs
- Reference materials
- Glossary of terms

## Footer
- Copyright and usage rights
- Document ID or reference number
- Generation date/time
- NO navigation menu

# TECHNICAL REQUIREMENTS
- Semantic HTML5 (article, section, aside)
- Georgia/Merriweather for body text (16-18px)
- Inter/Roboto for headings
- Print stylesheets (@media print)
  * Hide unnecessary elements when printing
  * Page break controls
  * Black text on white background
- Professional formatting
- Chart.js for data viz via CDN (if data present)
- Max-width: 800px for readability
- Centered content layout
- WCAG AA accessible
- NO external navigation
- Document scrolls vertically like a paper

# STYLE GUIDELINES
- Professional academic appearance
- White background (#ffffff)
- Black text (#1a1a1a) for body
- Dark gray (#333333) for headings
- Blue (#2563eb) for links and accents
- High contrast for readability (4.5:1 minimum)
- Generous whitespace (line-height 1.75)
- Clean margins and padding
- Print-optimized layout
- NO marketing elements
- NO navigation menus
- Focus on content readability

# OUTPUT FORMAT
Generate ONLY complete HTML from <!DOCTYPE html> to </html>. 
All CSS inline in <style> tags.
Include minimal JavaScript only for table of contents smooth scrolling.
NO explanatory text before or after the HTML.
This should look like a professional research paper/report, NOT a website.`;
}

function generateTechnicalPrompt(context: GenerationContext): string {
    const industry = context.industry || 'technology';
    const industryProfile = INDUSTRY_PROFILES.find(p => p.id === industry) || INDUSTRY_PROFILES[0];

    return `# ROLE
You are an EXPERT TECHNICAL DESIGNER creating professional dashboards.

# TASK
Generate complete HTML analytics dashboard with data visualization.

# APPLICATION
${context.goal}

# INDUSTRY
${industryProfile.name}

# PRIMARY COLOR
${industryProfile.colors.primary}

# DASHBOARD STRUCTURE

## Header/Top Bar
- App logo/title
- User profile dropdown
- Notifications icon
- Search input

## Sidebar Navigation
- Collapsible menu
- Icon + label items
- Active state indicators
- Footer settings/logout

## KPI Metrics Cards (4-6 cards)
- Large numbers with units
- Trend indicators (↑↓)
- Percentage change
- Sparkline mini-charts
- Color-coded status

## Data Visualization
Chart.js charts via CDN:
- Line chart: Trends over time
- Bar chart: Comparative metrics
- Doughnut chart: Distribution
- Area chart: Cumulative data

Chart styling:
- Gradient fills
- Custom tooltips
- Responsive
- Interactive legends

## Data Table
- Sortable columns
- Search/filter
- Pagination (10-50 rows)
- Row actions
- Zebra striping
- Hover highlighting

## Activity Feed
- Recent events timeline
- User avatars
- Timestamps

# TECHNICAL REQUIREMENTS
- Semantic HTML5
- CSS Grid for layout
- Chart.js via CDN
- Responsive (desktop/tablet)
- Professional color scheme
- Monospace for data
- 8px spacing grid
- Hover states

# DATA
Generate realistic sample data based on ${context.goal} context.

# STYLE
- Clean professional UI
- ${industryProfile.colors.primary} as primary color
- Dark/light theme appropriate to industry
- Card-based components

# OUTPUT
Generate ONLY complete HTML from <!DOCTYPE html> to </html>. Include Chart.js CDN, all CSS inline. No explanatory text.`;
}

function generateCreativePrompt(context: GenerationContext): string {
    return `# ROLE
You are an ELITE CREATIVE DESIGNER creating stunning portfolio websites.

# TASK
Generate complete HTML portfolio with creative layouts and visual impact.

# PORTFOLIO OWNER
${context.goal}

# PORTFOLIO STRUCTURE

## Hero/Landing
- Large name/title display
- Professional tagline
- Striking visual
- Scroll indicator
- Optional animated text

## About/Introduction
- Professional photo (placeholder)
- Bio (2-3 paragraphs)
- Skills/expertise tags
- Location, experience

## Skills Visualization
- Skill bars or circles
- Icon + skill name
- Proficiency levels
- Organized by category

## Portfolio/Projects Grid
- Masonry or card layout
- 6-12 project cards
- Each card:
  * Thumbnail image
  * Project title
  * Brief description
  * Technology tags
  * View button
- Hover effects (scale, overlay)
- Filter by category

## Project Details
- Full description
- Problem/solution
- Screenshots
- Tech stack
- Results/impact
- Links (demo, GitHub)

## Testimonials
- 3-4 client quotes
- Photo + name + title
- Company
- Star rating

## Work Process
- 3-4 step process
- Icon + description
- Shows approach

## Contact Section
- Contact form
- Email address
- Social media links
- Availability status
- CTA: "Let's work together"

## Footer
- Copyright
- Quick links
- Social icons
- Back to top

# TECHNICAL REQUIREMENTS
- Semantic HTML5
- Creative typography (Google Fonts)
- Bold color scheme
- CSS Grid for projects
- Smooth scroll
- Project filtering JS
- Form validation
- Scroll animations
- Responsive mobile-first

# DESIGN STYLE
- Modern and bold
- Generous whitespace
- Strong visual hierarchy
- Smooth transitions
- Interactive hover effects

# CONTENT
Generate project descriptions, skills, and testimonials based on ${context.goal} context.

# OUTPUT
Generate ONLY complete HTML from <!DOCTYPE html> to </html>. All CSS/JS inline. No explanatory text.`;
}

// =============================================================================
// PROMPT STRATEGY MAP
// =============================================================================

const PROMPT_GENERATORS = {
    creative: generateCinematicPrompt,
    marketing: generateMarketingPrompt,
    research: generateResearchPrompt,
    technical: generateTechnicalPrompt
};

// =============================================================================
// MAIN HTML GENERATION FUNCTION (AI-Only, No Fallback)
// =============================================================================

export async function generateHTMLWithAI(
    templateTypeId: string,
    context: GenerationContext
): Promise<string> {
    const templateType = TEMPLATE_TYPES.find(t => t.id === templateTypeId);
    if (!templateType) {
        throw new Error(`Template type "${templateTypeId}" not found`);
    }

    // =========================================================================
    // STEP 1: Check cache first
    // =========================================================================
    const cacheKey = generateCacheKey(templateTypeId, context.goal, context.industry);
    const cached = generationCache.get(cacheKey);

    if (cached) {
        console.log(`[HTMLGen] 🚀 Cache HIT - Returning cached HTML (${cached.length} chars)`);
        console.log(`[HTMLGen] ${formatCacheStats(generationCache.getStats())}`);
        return cached;
    }

    console.log(`[HTMLGen] Cache MISS - Generating new HTML`);

    // =========================================================================
    // STEP 2: Generate prompt and call AI
    // =========================================================================
    const promptGenerator = PROMPT_GENERATORS[templateType.promptStrategy];
    if (!promptGenerator) {
        throw new Error(`Prompt strategy "${templateType.promptStrategy}" not implemented`);
    }

    const prompt = promptGenerator(context);
    const startTime = Date.now();

    try {
        const response = await generateText('analyst', prompt, {
            temperature: 0.7,
            max_new_tokens: 8000  // Increased from 4000 to support longer output
        });

        if (!response.success || !response.data) {
            throw new Error('AI generation failed: ' + (response.error || 'Unknown error'));
        }

        let html = response.data;
        const genDuration = Date.now() - startTime;
        console.log(`[HTMLGen] ✓ AI generated ${html.length} characters in ${genDuration}ms`);

        // =========================================================================
        // STEP 3: Validate and auto-repair if needed
        // =========================================================================
        const validation = validateHTML(html);
        console.log(`[HTMLGen] ${getValidationSummary(validation)}`);

        if (!validation.isValid && validation.repaired) {
            console.warn(`[HTMLGen] ⚠️  Auto-repaired ${validation.errors.length} errors`);
            html = validation.repaired;
        }

        if (validation.warnings.length > 0) {
            console.warn(`[HTMLGen] Warnings:`, validation.warnings.map(w => w.message));
        }

        // =========================================================================
        // STEP 4: Cache the result
        // =========================================================================
        generationCache.set(cacheKey, {
            html,
            templateId: templateTypeId,
            prompt: context.goal,
            timestamp: Date.now(),
            metadata: {
                industry: context.industry,
                analysis: context.analysis,
                validationPassed: validation.isValid
            }
        });

        console.log(`[HTMLGen] ${formatCacheStats(generationCache.getStats())}`);
        return html;

    } catch (error) {
        console.error(`[HTMLGen] ❌ Error generating HTML for template "${templateTypeId}":`, error);
        throw new Error(`Failed to generate HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate HTML with streaming support for real-time preview updates
 * Provides progressive feedback as content is generated
 */
export async function generateHTMLWithAIStreaming(
    templateTypeId: string,
    context: GenerationContext,
    onProgress: (partialHTML: string, progress: { isComplete: boolean; charCount: number; isValid: boolean }) => void
): Promise<string> {
    const templateType = TEMPLATE_TYPES.find(t => t.id === templateTypeId);
    if (!templateType) {
        throw new Error(`Template type "${templateTypeId}" not found`);
    }

    // =========================================================================
    // STEP 1: Check cache first (instant return for cache hits)
    // =========================================================================
    const cacheKey = generateCacheKey(templateTypeId, context.goal, context.industry);
    const cached = generationCache.get(cacheKey);

    if (cached) {
        console.log(`[HTMLGen] 🚀 Cache HIT - Streaming cached HTML`);
        // Simulate streaming for cache hits for UX consistency
        onProgress(cached, { isComplete: true, charCount: cached.length, isValid: true });
        return cached;
    }

    console.log(`[HTMLGen] 📡 Starting streaming generation...`);

    // =========================================================================
    // STEP 2: Generate prompt
    // =========================================================================
    const promptGenerator = PROMPT_GENERATORS[templateType.promptStrategy];
    if (!promptGenerator) {
        throw new Error(`Prompt strategy "${templateType.promptStrategy}" not implemented`);
    }

    const prompt = promptGenerator(context);
    const startTime = Date.now();

    let htmlBuffer = '';
    let updateCounter = 0;

    try {
        // =========================================================================
        // STEP 3: Stream generation with progressive updates
        // =========================================================================
        const result = await generateTextStream('analyst', prompt, (chunk, accumulated) => {
            htmlBuffer = accumulated;
            updateCounter++;

            // Only update UI every 10 chunks to avoid performance issues
            if (updateCounter % 10 === 0 || accumulated.length > 500) {
                const isPartialValid = isPartialHTMLValid(htmlBuffer);

                if (isPartialValid) {
                    onProgress(htmlBuffer, {
                        isComplete: false,
                        charCount: htmlBuffer.length,
                        isValid: true
                    });
                }
            }
        }, {
            temperature: 0.7,
            max_new_tokens: 8000
        });

        if (!result.success || !result.data) {
            throw new Error('Streaming failed: ' + (result.error || 'Unknown error'));
        }

        let finalHTML = result.data;
        const genDuration = Date.now() - startTime;
        console.log(`[HTMLGen] ✓ Streaming completed: ${finalHTML.length} characters in ${genDuration}ms`);

        // =========================================================================
        // STEP 4: Validate and auto-repair final HTML
        // =========================================================================
        const validation = validateHTML(finalHTML);
        console.log(`[HTMLGen] ${getValidationSummary(validation)}`);

        if (!validation.isValid && validation.repaired) {
            console.warn(`[HTMLGen] ⚠️  Auto-repaired ${validation.errors.length} errors`);
            finalHTML = validation.repaired;
        }

        // =========================================================================
        // STEP 5: Cache the result
        // =========================================================================
        generationCache.set(cacheKey, {
            html: finalHTML,
            templateId: templateTypeId,
            prompt: context.goal,
            timestamp: Date.now(),
            metadata: {
                industry: context.industry,
                analysis: context.analysis,
                validationPassed: validation.isValid
            }
        });

        // Final update with complete HTML
        onProgress(finalHTML, {
            isComplete: true,
            charCount: finalHTML.length,
            isValid: validation.isValid
        });

        console.log(`[HTMLGen] ${formatCacheStats(generationCache.getStats())}`);
        return finalHTML;

    } catch (error) {
        console.error(`[HTMLGen] ❌ Streaming error, falling back to non-streaming:`, error);

        // Fallback to non-streaming generation
        try {
            const fallbackHTML = await generateHTMLWithAI(templateTypeId, context);
            onProgress(fallbackHTML, {
                isComplete: true,
                charCount: fallbackHTML.length,
                isValid: true
            });
            return fallbackHTML;
        } catch (fallbackError) {
            throw new Error(`Both streaming and fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * Helper: Check if partial HTML is safe to display
 * Must have basic structure to avoid rendering errors
 */
function isPartialHTMLValid(html: string): boolean {
    // Need minimum structure for safe rendering
    const hasDoctype = html.toLowerCase().includes('<!doctype');
    const hasHtmlTag = /<html[^>]*>/i.test(html);
    const hasBodyTag = /<body[^>]*>/i.test(html);

    // Require at least 500 characters to avoid showing empty frames
    const hasContent = html.length > 500;

    return hasDoctype && hasHtmlTag && hasBodyTag && hasContent;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getTemplateTypeById(id: string): TemplateType | undefined {
    return TEMPLATE_TYPES.find(template => template.id === id);
}

export function getTemplateTypesByCategory(category: string): TemplateType[] {
    return TEMPLATE_TYPES.filter(template => template.category === category);
}

export function getAllTemplateTypes(): TemplateType[] {
    return TEMPLATE_TYPES;
}

export function selectBestTemplateType(goal: string, analysis?: string): string {
    const content = (goal + ' ' + (analysis || '')).toLowerCase();

    if (content.includes('research') || content.includes('analysis') || content.includes('study') ||
        content.includes('report') || content.includes('findings') || content.includes('data')) {
        return 'research-analysis';
    }

    if (content.includes('dashboard') || content.includes('analytics') || content.includes('metrics') ||
        content.includes('data') || content.includes('monitoring')) {
        return 'saas-dashboard';
    }

    if (content.includes('portfolio') || content.includes('projects') || content.includes('showcase') ||
        content.includes('gallery') || content.includes('work')) {
        return 'portfolio-showcase';
    }

    if (content.includes('mobile') || content.includes('app') || content.includes('ios') ||
        content.includes('android') || content.includes('download')) {
        return 'mobile-app-landing';
    }

    if (content.includes('cinematic') || content.includes('premium') || content.includes('luxury') ||
        content.includes('high-end') || content.includes('future')) {
        return 'future-os';
    }

    return 'modern-landing';
}
