/**
 * useDynamicWorkflow - Dynamic Parallel Execution Engine
 * Features:
 * - Spawns research nodes dynamically
 * - Each node makes unique API call
 * - Collaborator synthesizes all results
 * - AI generates advanced HTML from analysis
 */

import { useCallback } from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { toast } from 'sonner';
import { HTML_TEMPLATES, getTemplateById } from '@/lib/htmlGenerators';

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const COLLABORATOR_SYSTEM_PROMPT = `# Role
You are **Flowith-Clone**, an autonomous AI assistant designed to help users brainstorm, prototype, and iterate on creative projects (product ideas, stories, designs, marketing campaigns, etc.). Your behavior should mirror the original Flowith AI Agent in tone, style, and functionality.

--- INSTRUCTION ---------------------------------------------------------------
- Act as a collaborative partner, not just a tool. Offer suggestions, ask clarifying questions, and refine ideas iteratively.
- Maintain a friendly, upbeat, and slightly witty tone. Use emojis sparingly to add warmth.
- Keep responses concise (1‑3 short paragraphs) unless the user explicitly asks for a deep dive.
- Always cite your sources when you reference external facts, using a simple “(Source: …)” format.
- Respect user privacy: never store or recall personal data across sessions.

--- DOMAIN --------------------------------------------------------------------
- Creative ideation: product concepts, startup pitches, story plots, character development, UI/UX sketches, marketing angles.
- Rapid prototyping: outline MVP features, draft user flows, suggest tech stacks, generate mock copy.
- Feedback loops: critique user‑provided drafts, suggest improvements, ask probing questions to uncover hidden requirements.
- Knowledge cutoff: 2024‑06 (or the model’s own cutoff). If you’re unsure about a recent trend, acknowledge the limitation.

--- ACTIONS -------------------------------------------------------------------
When a user asks for help:
1. **Clarify** – ask 1‑2 targeted questions if the request is vague.
2. **Generate** – produce a structured output (bullet list, table, or short paragraph) that directly addresses the request.
3. **Iterate** – invite the user to refine: “Would you like to dive deeper into any of these points?”
4. **Reference** – if you quote statistics or trends, append a simple source tag.

--- CONSTRAINTS ---------------------------------------------------------------
- Do **not** fabricate data. If you don’t know, say “I’m not sure, but here’s how you could find out…”.
- Avoid overly technical jargon unless the user explicitly requests it.
- Keep all advice legal and ethical; do not suggest actions that could violate privacy, copyright, or safety regulations.
- Limit any self‑referencing to the name “Flowith‑Clone” – do not claim to be the original Flowith AI Agent.`;

const HTML_GENERATOR_SYSTEM_PROMPT = `# Role
You are an **Expert Creative Technologist & Frontend Architect** specialized in building award-winning, interactive web experiences suitable for Awwwards/FWA.

# Your Task
Generate a complete, production-ready **Advanced Interactive Website** based on the provided analysis.
The site MUST go beyond static HTML/CSS and include rich interactivity, data visualization, and dynamic effects.

# Visual & UX Requirements
- **Ultra-Premium Aesthetics:** Deep dark theme (#030712), sophisticated typography (Plus Jakarta Sans/Inter), and realistic glassmorphism.
- **Advanced Interactivity:**
  - **Live Charts:** Use **Chart.js** (via CDN) for data visualization.
  - **3D Backgrounds:** Use **Three.js** (via CDN) for an immersive 3D particle starfield or connecting network mesh.
  - **Pro Animations:** Use **GSAP (GreenSock)** (via CDN) for timeline-based entrance animations (stagger, seamless reveal).
- **Navigation:** Floating, glassmorphic pill-shaped navigation bar that follows the user.

# Required Structure (Long-Scrolling)
1. **Hero:** Full-screen immersive intro with THREE.JS 3D background.
2. **Analysis/Strategy:** Interactive cards displaying key insights.
3. **Features:** Bento-grid style layout with hover effects.
4. **Live Metrics:** A section dedicated to CHART.JS visualizations.
5. **Roadmap:** Vertical interactive timeline with GSAP triggers.
6. **Team:** Leadership grid.
7. **Contact:** Functional-looking form.

# Technical specs
- **Libraries (MUST USE CDNs):**
  - GSAP: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
  - ScrollTrigger: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
  - Three.js: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
  - Chart.js: https://cdn.jsdelivr.net/npm/chart.js
  - Fonts: Google Fonts (Plus Jakarta Sans).
- All CSS in <style>.
- All JS in <script>.
- Use Lucide icons (SVG strings).

Generate ONLY the complete HTML code. Start with <!DOCTYPE html>.`;

// =============================================================================
// WORKING MODEL
// =============================================================================

// =============================================================================
// WORKING MODEL & FALLBACKS
// =============================================================================

const FALLBACK_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3-8b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'nvidia/nemotron-3-nano-30b-a3b:free', // Keeping as last resort since it's erroring
    'mistralai/mistral-7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free'
];

// =============================================================================
// API CALLER
// =============================================================================

const callOpenRouterAPI = async (
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 2000
): Promise<{ success: boolean; content: string; error?: string }> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openrouter_api_key');

    // Immediate Mock Mode if no API key
    if (!apiKey) {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
        return {
            success: true,
            content: generateMockResponse(prompt, systemPrompt),
        };
    }

    console.log(`[G-Nexus] Calling API with ${maxTokens} max tokens...`);

    // Try models in sequence
    for (const model of FALLBACK_MODELS) {
        try {
            console.log(`[G-Nexus] Trying model: ${model}`);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'G-Nexus Workflow',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                        { role: 'user', content: prompt },
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData?.error?.message || `API error: ${response.status}`;
                console.warn(`[G-Nexus] Model ${model} Failed:`, errorMsg);
                // Continue to next model
                continue;
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
                return { success: true, content };
            } else {
                console.warn(`[G-Nexus] Model ${model} returned empty content`);
            }

        } catch (error) {
            console.warn(`[G-Nexus] Error with ${model}:`, error);
        }
    }

    // If all models fail, fallback to local mock generator
    console.error('[G-Nexus] All models failed. Falling back to Mock Generator.');
    toast.error('API rate limits hit. Switching to simulated research mode.');

    return {
        success: true,
        content: generateMockResponse(prompt, systemPrompt),
    };
};

// Mock response generator for demo
function generateMockResponse(prompt: string, systemPrompt?: string): string {
    if (systemPrompt?.includes('HTML')) {
        return generateAdvancedHTML('Demo Project', {});
    }
    if (systemPrompt?.includes('Flowith-Clone') || systemPrompt?.includes('Architect')) {
        return `## 🎨 Creative Synthesis & Strategy
This is a comprehensive blueprint generated based on your research streams.

## 💡 Key Insights
### Market Trends
- High demand for personalized user experiences
- Shift towards minimal but interactive designs
- Gamification is increasing engagement by 40%

### Technical Feasibility
- React + Vite is the optimal lightweight stack
- Supabase provides instant backend capabilities
- TailwindCSS ensuring rapid styling iteration

## 🚀 Proposed Solution
**Concept:** A unified digital ecosystem that adapts to user behavior.
**Core Value:** Simplicity meets power.

## 🛠️ Implementation Plan
1. **Phase 1:** Core Architecture (Next.js + TypeScript)
2. **Phase 2:** MVP Features & User Auth
3. **Phase 3:** Interactive Layer (GSAP Animations)
4. **Phase 4:** Polish & Launch

(Source: TechCrunch 2024 Trends, internal pattern matching)`;
    }
    return `## Research Analysis

**Topic:** ${prompt.slice(0, 80)}...

### Key Findings
1. Industry best practices recommend modern approaches
2. User experience should be prioritized
3. Performance optimization is essential
4. Security cannot be overlooked

### Detailed Recommendations
- Start with solid architecture foundation
- Implement iterative development cycles
- Test early and continuously
- Gather and incorporate user feedback
- Monitor and optimize performance`;
}

// =============================================================================
// EXECUTOR HOOK
// =============================================================================

export const useDynamicWorkflow = () => {
    const nodes = useWorkflowStore((state) => state.nodes);
    const isExecuting = useWorkflowStore((state) => state.isExecuting);

    const setUserGoal = useWorkflowStore((state) => state.setUserGoal);
    const setExecuting = useWorkflowStore((state) => state.setExecuting);
    const spawnResearchNodes = useWorkflowStore((state) => state.spawnResearchNodes);
    const addCollaboratorNode = useWorkflowStore((state) => state.addCollaboratorNode);
    const addPreviewNode = useWorkflowStore((state) => state.addPreviewNode);
    const setNodeStatus = useWorkflowStore((state) => state.setNodeStatus);
    const markNodeCompleted = useWorkflowStore((state) => state.markNodeCompleted);
    const markNodeFailed = useWorkflowStore((state) => state.markNodeFailed);
    const updateNode = useWorkflowStore((state) => state.updateNode);
    const addParallelResult = useWorkflowStore((state) => state.addParallelResult);
    const setFinalBlueprint = useWorkflowStore((state) => state.setFinalBlueprint);
    const setFinalHTML = useWorkflowStore((state) => state.setFinalHTML);
    const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);

    const startWorkflow = useCallback(async (goal: string, branchCount: number) => {
        setExecuting(true);
        setUserGoal(goal);

        // Mark input as completed
        const inputNode = nodes.find(n => n.data.type === 'input');
        if (inputNode) {
            updateNode(inputNode.id, { status: 'completed', prompt: goal });
        }

        toast.info(`🚀 Spawning ${branchCount} research branches...`);

        // Step 1: Spawn research nodes
        spawnResearchNodes(branchCount);
        await new Promise(r => setTimeout(r, 500));

        // Step 2: Execute all research nodes in parallel
        const currentNodes = useWorkflowStore.getState().nodes;
        const researchNodes = currentNodes.filter(n => n.data.type === 'research');

        toast.info(`⚡ Running ${researchNodes.length} parallel API calls...`);
        researchNodes.forEach(n => setNodeStatus(n.id, 'running'));

        // Execute in parallel
        const results = await Promise.all(
            researchNodes.map(async (node) => {
                const result = await callOpenRouterAPI(node.data.prompt || goal);

                if (result.success) {
                    markNodeCompleted(node.id, result.content);
                    addParallelResult(node.data.label || node.id, result.content);
                    return { nodeId: node.id, label: node.data.label, content: result.content, success: true };
                } else {
                    markNodeFailed(node.id, result.error || 'Failed');
                    return { nodeId: node.id, label: node.data.label, content: '', success: false };
                }
            })
        );

        const successCount = results.filter(r => r.success).length;
        toast.success(`✓ ${successCount}/${researchNodes.length} research branches complete`);

        // Step 3: Add Collaborator node and run analysis
        addCollaboratorNode();
        await new Promise(r => setTimeout(r, 300));

        const collaboratorNode = useWorkflowStore.getState().nodes.find(n => n.data.type === 'collaborator');
        let analysisContent = '';

        if (collaboratorNode) {
            setNodeStatus(collaboratorNode.id, 'running');
            toast.info('🧠 Chief Architect analyzing all research...');

            // Build comprehensive input for collaborator with Deep Thinking Protocol
            const collaboratorInput = `
# User Goal
${goal}

# Research Results from Parallel Branches
${results.filter(r => r.success).map(r => `
## ${r.label}
${r.content}
`).join('\n---\n')}

# INTENSIVE REASONING PROTOCOL
Before synthesizing, you MUST engage in "Deep Thinking".
1.  **Deconstruct:** Break down the goal into first principles.
2.  **Cross-Reference:** Compare findings from research branches to find hidden connections.
3.  **Critique:** Challenge your own assumptions.
4.  **Synthesize:** Create a unified blueprint that is greater than the sum of its parts.

Please provide a comprehensive analysis and synthesis of all the above research.`;

            const collaboratorResult = await callOpenRouterAPI(
                collaboratorInput,
                COLLABORATOR_SYSTEM_PROMPT,
                6000 // DOUBLED for Deep Thinking Analysis
            );

            if (collaboratorResult.success) {
                analysisContent = collaboratorResult.content;

                updateNode(collaboratorNode.id, {
                    status: 'completed',
                    result: collaboratorResult.content,
                });
                setFinalBlueprint({ analysis: collaboratorResult.content });
                markNodeCompleted(collaboratorNode.id, collaboratorResult.content);

                toast.success('✨ Analysis complete!');
            } else {
                markNodeFailed(collaboratorNode.id, collaboratorResult.error || 'Analysis failed');
                analysisContent = results.filter(r => r.success).map(r => r.content).join('\n\n');
            }
        }

        // Step 4: Add Preview node and generate HTML with AI
        addPreviewNode();
        await new Promise(r => setTimeout(r, 300));

        const previewNode = useWorkflowStore.getState().nodes.find(n => n.data.type === 'preview');
        if (previewNode) {
            setNodeStatus(previewNode.id, 'running');
            toast.info('🎨 AI generating advanced HTML...');

            // Call AI to generate HTML from the analysis
            const htmlPrompt = `
# Project Goal
${goal}

# Comprehensive Analysis & Research
${analysisContent}

Based on the above analysis, generate a MASSIVE, LONG-SCROLLING website with 6-10 distinct sections.
It must be a single page that scrolls smoothly from top to bottom.
Includes Hero, Features, Stats, Roadmap, Team, and more.
Make it visually stunning with scroll animations.`;

            const htmlResult = await callOpenRouterAPI(
                htmlPrompt,
                HTML_GENERATOR_SYSTEM_PROMPT,
                16000 // MAXIMUM tokens for massive CSS/JS generation
            );

            let finalHTML = '';
            if (htmlResult.success) {
                // Extract HTML from response
                const htmlMatch = htmlResult.content.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
                if (htmlMatch) {
                    finalHTML = htmlMatch[0];
                } else if (htmlResult.content.includes('<html')) {
                    finalHTML = htmlResult.content;
                } else {
                    // Generate fallback HTML with the analysis content
                    finalHTML = generateAdvancedHTML(goal, { analysis: analysisContent });
                }
            } else {
                // Fallback to generated HTML
                finalHTML = generateAdvancedHTML(goal, { analysis: analysisContent });
            }

            updateNode(previewNode.id, {
                status: 'completed',
                htmlCode: finalHTML,
            });
            setFinalHTML(finalHTML);
            markNodeCompleted(previewNode.id, 'HTML generated');

            toast.success('🎉 Advanced HTML generated!');
        }

        setExecuting(false);
    }, [nodes, setExecuting, setUserGoal, updateNode, spawnResearchNodes, addCollaboratorNode, addPreviewNode, setNodeStatus, markNodeCompleted, markNodeFailed, addParallelResult, setFinalBlueprint, setFinalHTML]);

    return {
        isExecuting,
        startWorkflow,
        resetWorkflow,
    };
};

// =============================================================================
// ADVANCED HTML GENERATOR (Fallback)
// =============================================================================

function generateAdvancedHTML(goal: string, data: Record<string, unknown>): string {
    const analysis = (data.analysis as string) || '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${goal} | G-Nexus Generated</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #f97316;
            --secondary: #8b5cf6;
            --bg-dark: #0a0a0a;
            --bg-card: #111111;
            --text-primary: #ffffff;
            --text-secondary: #a3a3a3;
            --border: rgba(255,255,255,0.1);
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.3); }
            50% { box-shadow: 0 0 40px rgba(249,115,22,0.5); }
        }
        
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease forwards;
            opacity: 0;
        }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        
        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }
        
        /* Navigation */
        .nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(10,10,10,0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            padding: 16px 0;
        }
        
        .nav-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .nav-links {
            display: flex;
            gap: 32px;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 120px 24px 80px;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%);
            pointer-events: none;
        }
        
        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 900px;
        }
        
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(249,115,22,0.1);
            border: 1px solid rgba(249,115,22,0.3);
            border-radius: 100px;
            padding: 8px 20px;
            font-size: 0.875rem;
            color: var(--primary);
            margin-bottom: 24px;
        }
        
        .hero h1 {
            font-size: clamp(2.5rem, 8vw, 5rem);
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            background: linear-gradient(135deg, #fff 0%, #a3a3a3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero h1 span {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto 40px;
        }
        
        .hero-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            text-decoration: none;
            transition: all 0.3s;
            cursor: pointer;
            border: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), #ea580c);
            color: white;
            box-shadow: 0 4px 20px rgba(249,115,22,0.4);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(249,115,22,0.5);
        }
        
        .btn-secondary {
            background: rgba(255,255,255,0.05);
            color: white;
            border: 1px solid var(--border);
        }
        
        .btn-secondary:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--primary);
        }
        
        /* Features Section */
        .features {
            padding: 120px 24px;
            background: linear-gradient(180deg, transparent, rgba(139,92,246,0.03));
        }
        
        .section-header {
            text-align: center;
            max-width: 600px;
            margin: 0 auto 60px;
        }
        
        .section-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .section-header p {
            color: var(--text-secondary);
            font-size: 1.125rem;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }
        
        .feature-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 32px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-8px);
            border-color: rgba(249,115,22,0.3);
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        
        .feature-card:hover::before {
            opacity: 1;
        }
        
        .feature-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(139,92,246,0.2));
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .feature-card p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
        
        /* Analysis Section */
        .analysis {
            padding: 120px 24px;
        }
        
        .analysis-content {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 48px;
            white-space: pre-wrap;
            font-family: inherit;
            line-height: 1.8;
            color: var(--text-secondary);
        }
        
        .analysis-content h2, .analysis-content h3 {
            color: var(--primary);
            margin-top: 24px;
            margin-bottom: 12px;
        }
        
        /* Stats Section */
        .stats {
            padding: 80px 24px;
            background: rgba(249,115,22,0.03);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 40px;
            text-align: center;
        }
        
        .stat-item h3 {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        
        .stat-item p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
        
        /* CTA Section */
        .cta {
            padding: 120px 24px;
            text-align: center;
        }
        
        .cta-box {
            background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(139,92,246,0.1));
            border: 1px solid rgba(249,115,22,0.2);
            border-radius: 32px;
            padding: 80px 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .cta h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .cta p {
            color: var(--text-secondary);
            font-size: 1.125rem;
            margin-bottom: 32px;
        }
        
        /* Footer */
        .footer {
            padding: 60px 24px;
            border-top: 1px solid var(--border);
            text-align: center;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .footer p {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        .footer-links {
            display: flex;
            gap: 24px;
        }
        
        .footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s;
        }
        
        .footer-links a:hover {
            color: var(--primary);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .hero h1 { font-size: 2.5rem; }
            .features-grid { grid-template-columns: 1fr; }
            .footer-content { flex-direction: column; text-align: center; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="container nav-content">
            <div class="logo">G-Nexus</div>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#analysis">Analysis</a></li>
                <li><a href="#stats">Stats</a></li>
                <li><a href="#cta">Get Started</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge animate-in">
                ⚡ AI-Powered Research Engine
            </div>
            <h1 class="animate-in delay-1">
                ${goal.split(' ').slice(0, 3).join(' ')} <span>${goal.split(' ').slice(3, 6).join(' ') || 'Solution'}</span>
            </h1>
            <p class="animate-in delay-2">
                This comprehensive analysis was generated by G-Nexus parallel AI workflow, 
                synthesizing insights from multiple research branches into a unified vision.
            </p>
            <div class="hero-buttons animate-in delay-3">
                <a href="#analysis" class="btn btn-primary">View Analysis →</a>
                <a href="#features" class="btn btn-secondary">Explore Features</a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="container">
            <div class="section-header">
                <h2>Key Capabilities</h2>
                <p>Powerful features derived from comprehensive AI research and analysis</p>
            </div>
            <div class="features-grid">
                <div class="feature-card animate-in">
                    <div class="feature-icon">🔧</div>
                    <h3>Technical Excellence</h3>
                    <p>Built on modern architecture with best practices for scalability and performance.</p>
                </div>
                <div class="feature-card animate-in delay-1">
                    <div class="feature-icon">🎨</div>
                    <h3>Stunning Design</h3>
                    <p>User-centered interface with attention to detail and seamless experience.</p>
                </div>
                <div class="feature-card animate-in delay-2">
                    <div class="feature-icon">📊</div>
                    <h3>Data-Driven</h3>
                    <p>Insights backed by comprehensive market and user research analysis.</p>
                </div>
                <div class="feature-card animate-in delay-3">
                    <div class="feature-icon">⚡</div>
                    <h3>High Performance</h3>
                    <p>Optimized for speed and efficiency across all platforms and devices.</p>
                </div>
                <div class="feature-card animate-in delay-4">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure & Reliable</h3>
                    <p>Enterprise-grade security with robust error handling and data protection.</p>
                </div>
                <div class="feature-card animate-in delay-4">
                    <div class="feature-icon">🧠</div>
                    <h3>AI-Powered</h3>
                    <p>Enhanced with artificial intelligence for smarter automation and insights.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Analysis Section -->
    <section class="analysis" id="analysis">
        <div class="container">
            <div class="section-header">
                <h2>Research Analysis</h2>
                <p>Comprehensive synthesis from parallel AI research streams</p>
            </div>
            <div class="analysis-content">
${analysis || `## Executive Summary
This project represents a comprehensive solution designed through parallel AI research and synthesis.

## Key Research Findings

### Technical Architecture
- Modern, scalable framework recommended
- Microservices architecture for flexibility
- Cloud-native deployment strategy

### User Experience
- Intuitive, clean interface design
- Mobile-first responsive approach
- Accessibility compliance (WCAG 2.1)

### Market Positioning
- Competitive advantages identified
- Target audience clearly defined
- Growth strategy outlined

## Implementation Priorities
1. Core infrastructure setup
2. Essential feature development
3. User testing and iteration
4. Launch and monitoring
5. Continuous improvement`}
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats" id="stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>8+</h3>
                    <p>Research Branches Analyzed</p>
                </div>
                <div class="stat-item">
                    <h3>100%</h3>
                    <p>AI-Powered Generation</p>
                </div>
                <div class="stat-item">
                    <h3>∞</h3>
                    <p>Parallel Processing</p>
                </div>
                <div class="stat-item">
                    <h3>1</h3>
                    <p>Unified Blueprint</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" id="cta">
        <div class="cta-box">
            <h2>Ready to Build?</h2>
            <p>Use this analysis as your foundation for development. The research is complete, the blueprint is ready.</p>
            <a href="#" class="btn btn-primary">Download Blueprint →</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container footer-content">
            <p>Generated by G-Nexus Parallel AI Workflow • ${new Date().toLocaleString()}</p>
            <div class="footer-links">
                <a href="#">Documentation</a>
                <a href="#">API Reference</a>
                <a href="#">Support</a>
            </div>
        </div>
    </footer>

    <script>
        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.animate-in').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    </script>
</body>
</html>`;
}
