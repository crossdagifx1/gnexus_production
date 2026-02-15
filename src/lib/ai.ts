/**
 * G-NEXUS AI MODULE
 * 
 * Reconstructed module for interacting with various AI models.
 * Uses OpenRouter as the primary provider for LLMs.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ModelKey =
    | 'coder'
    | 'marketing'
    | 'planner'
    | 'analyst'
    | 'agentic'
    | 'general'
    | 'fast'
    | 'vision'
    | 'stt'
    | 'tts';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    reasoning?: string;
    reasoning_details?: any; // OpenRouter specific opaque token
    timestamp?: Date;
    model?: ModelKey;
    status?: 'pending' | 'sent' | 'error';
}

export interface AgentTask {
    id: string;
    agent: ModelKey;
    prompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: string;
    startTime?: Date;
    endTime?: Date;
}

export interface AIResponse<T = string> {
    success: boolean;
    data?: T;
    error?: string;
    latency?: number;
}

export interface TextGenerationParams {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    stop?: string[];
    messages?: Array<{ role: string; content: string | Array<any>; reasoning_details?: any }>;
    images?: string[]; // Array of base64 strings or URLs
    includeReasoning?: boolean; // Flag to enable reasoning
    signal?: AbortSignal;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const OPENROUTER_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_OPENROUTER_API_KEY) || '';

export const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Always respond in English unless specifically asked otherwise. Maintain a professional and helpful tone.";

export interface AIModelConfig {
    name: string;
    model: string;
    color: string;
    category: string;
    specialization: string;
    description: string;
    fallback: string;
    is_free?: boolean;
    provider?: string;
}

export let AI_MODELS: Record<string, AIModelConfig> = {
    coder: {
        name: 'Axum (Code)',
        model: 'deepseek/deepseek-r1:free',
        color: '#f97316',
        category: 'code',
        specialization: 'Primary Reasoning',
        description: 'DeepSeek R1 for complex logic',
        fallback: 'general'
    },
    marketing: {
        name: 'Lalibela (Marketing)',
        model: 'huggingfaceh4/zephyr-7b-beta:free',
        color: '#06b6d4',
        category: 'text',
        specialization: 'Context Memory',
        description: 'High context window for marketing',
        fallback: 'general'
    },
    planner: {
        name: 'Zara Yacob (Plan)',
        model: 'deepseek/deepseek-r1:free',
        color: '#8b5cf6',
        category: 'text',
        specialization: 'Structural Depth',
        description: 'Mathematical Logic for planning',
        fallback: 'general'
    },
    analyst: {
        name: 'Abay (Analyst)',
        model: 'microsoft/phi-3-medium-128k-instruct:free',
        color: '#10b981',
        category: 'analysis',
        specialization: 'Iterative Logic',
        description: 'Analysis and structured thinking',
        fallback: 'general'
    },
    agentic: {
        name: 'Selam (Agent)',
        model: 'nvidia/nemotron-4-340b-instruct:free',
        color: '#ef4444',
        category: 'agent',
        specialization: 'Vision Intelligence',
        description: 'Agentic and visual tasks',
        fallback: 'general'
    },
    general: {
        name: 'Gera (General)',
        model: 'meta-llama/llama-3-8b-instruct:free',
        color: '#06b6d4',
        category: 'general',
        specialization: 'General Instruction',
        description: 'Highly stable Meta foundation model',
        fallback: 'fast'
    },
    fast: {
        name: 'Tiwis (Fast)',
        model: 'google/gemini-2.0-flash-exp:free',
        color: '#f59e0b',
        category: 'fast',
        specialization: 'Rapid Prototyping',
        description: 'Google Flash for instant responses',
        fallback: 'general'
    },
    vision: {
        name: 'Saba (Vision)',
        model: 'qwen/qwen-2-vl-7b-instruct:free',
        color: '#3b82f6',
        category: 'vision',
        specialization: 'Visual Logic',
        description: 'Qwen Vision for image tasks',
        fallback: 'general'
    },
};

// Internal function to update models from API
export async function refreshAIModels() {
    try {
        const response = await fetch('/api/ai/get_models.php');
        if (!response.ok) return;
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            const newModels: Record<string, AIModelConfig> = { ...AI_MODELS };

            result.data.forEach((m: any) => {
                // Map DB fields to Config
                newModels[m.category === 'code' ? 'coder' : m.category] = {
                    name: m.name,
                    model: m.model_id,
                    color: getColorForCategory(m.category),
                    category: m.category,
                    specialization: m.category.charAt(0).toUpperCase() + m.category.slice(1),
                    description: m.description || '',
                    fallback: 'general',
                    is_free: !!m.is_free,
                    provider: m.provider
                };
                // Also register by ID for direct access if needed, or overwrite standard keys
                // For now, we overwrite the standard keys if categories match
                // But we also want to expose all available models, maybe in a separate list?
            });

            // Store the full list purely for listing purposes if needed
            (window as any).__RAW_AI_MODELS = result.data;

            // Update the main export
            Object.assign(AI_MODELS, newModels);
            console.log('[AI] Models refreshed from database', Object.keys(AI_MODELS));
        }
    } catch (e) {
        console.warn('[AI] Failed to refresh models:', e);
    }
}

function getColorForCategory(category: string): string {
    const colors: Record<string, string> = {
        code: '#f97316',
        coder: '#f97316',
        marketing: '#06b6d4',
        text: '#8b5cf6',
        planner: '#8b5cf6',
        analyst: '#10b981',
        agent: '#ef4444',
        general: '#06b6d4',
        fast: '#f59e0b',
        vision: '#3b82f6'
    };
    return colors[category] || '#666666';
}

// Auto-refresh on load
if (typeof window !== 'undefined') {
    refreshAIModels();
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

async function callOpenRouter(messages: any[], model: string, params: TextGenerationParams = {}) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API Key is missing. Check your .env file.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://g-nexus.ai',
            'X-Title': 'G-Nexus Platform',
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_new_tokens ?? 2048,
            top_p: params.top_p ?? 1,
            // Include other params if needed
        }),
        signal: params.signal
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenRouter error: ${response.status}`);
    }

    return await response.json();
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Generate text using a specific agent
 */
export async function generateText(
    agent: ModelKey,
    prompt: string,
    params?: TextGenerationParams
): Promise<AIResponse<string>> {
    const startTime = Date.now();
    let currentAgent = agent;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const config = AI_MODELS[currentAgent] || AI_MODELS.planner;
            const model = config.model;

            // Format messages for multimodal if images exist
            let messages: any[] = [];

            if (params?.images && params.images.length > 0) {
                // Multimodal message structure
                const userContent: any[] = [{ type: 'text', text: prompt }];

                params.images.forEach(img => {
                    userContent.push({
                        type: 'image_url',
                        image_url: {
                            url: img // Assuming img is already a data URL or valid URL
                        }
                    });
                });

                messages = [
                    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
                    { role: 'user', content: userContent }
                ];
            } else {
                // Standard text message
                messages = [
                    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ];
            }

            console.log(`[AI] Attempt ${attempts + 1}: Using ${currentAgent} (${model})`);
            const data = await callOpenRouter(messages, model, params);

            return {
                success: true,
                data: data.choices[0]?.message?.content,
                latency: Date.now() - startTime,
            };
        } catch (error: any) {
            attempts++;
            const isProviderError = error.message.toLowerCase().includes('provider') ||
                error.message.toLowerCase().includes('overloaded') ||
                error.message.toLowerCase().includes('rate') ||
                error.message.toLowerCase().includes('busy') ||
                error.message.toLowerCase().includes('429') ||
                error.message.toLowerCase().includes('endpoints') ||
                error.message.toLowerCase().includes('not found') ||
                error.message.toLowerCase().includes('internal') ||
                error.message.toLowerCase().includes('timeout') ||
                error.message.toLowerCase().includes('failed to fetch');

            const fallback = AI_MODELS[currentAgent]?.fallback;

            if (attempts < maxAttempts && fallback && isProviderError) {
                console.warn(`[AI] Agent ${currentAgent} failed. Falling back to ${fallback}. Error: ${error.message}`);
                currentAgent = fallback as ModelKey;
                continue;
            }

            if (attempts >= maxAttempts || !fallback) {
                console.error('[AI] All attempts failed or no fallback available:', error.message);
                throw error;
            }
        }
    }

    return { success: false, error: 'Max attempts reached' };
}

/**
 * Generate text with streaming support for progressive updates
 */
export async function generateTextStream(
    agent: ModelKey,
    prompt: string,
    onChunk: (chunk: string, fullText: string, reasoning?: string, reasoningDetails?: any) => void,
    params?: TextGenerationParams
): Promise<AIResponse<string>> {
    const startTime = Date.now();

    try {
        if (!OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API Key is missing');
        }

        const config = AI_MODELS[agent] || AI_MODELS.planner;
        const model = config.model;

        // Construct messages
        let messages: any[] = [];
        if (params?.messages) {
            messages = params.messages.map(m => {
                const msg: any = { role: m.role, content: m.content };
                if (m.reasoning_details) {
                    msg.reasoning_details = m.reasoning_details;
                }
                return msg;
            });
        }

        // If no messages provided, create from prompt
        if (messages.length === 0) {
            messages = [
                { role: 'user', content: prompt }
            ];
        }

        // Ensure system prompt exists
        const hasSystemMessage = messages.some(m => m.role === 'system');
        if (!hasSystemMessage) {
            messages.unshift({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
        }

        // Handle Images / Multimodal
        if (params?.images && params.images.length > 0) {
            // Find the last user message to attach images to
            let lastUserMsgIndex = -1;
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].role === 'user') {
                    lastUserMsgIndex = i;
                    break;
                }
            }

            if (lastUserMsgIndex !== -1) {
                const lastMsg = messages[lastUserMsgIndex];
                const textContent = typeof lastMsg.content === 'string' ? lastMsg.content : '';

                // Convert to multimodal content array
                const newContent: any[] = [{ type: 'text', text: textContent }];

                params.images.forEach(img => {
                    newContent.push({
                        type: 'image_url',
                        image_url: {
                            url: img
                        }
                    });
                });

                messages[lastUserMsgIndex] = {
                    ...lastMsg,
                    content: newContent
                };
            }
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://g-nexus.ai',
                'X-Title': 'G-Nexus Platform',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: params?.temperature ?? 0.7,
                max_tokens: params?.max_new_tokens ?? 2048,
                top_p: params?.top_p ?? 1,
                reasoning: params?.includeReasoning ? { enabled: true } : undefined,
                stream: true
            }),
            signal: params?.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `OpenRouter error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Stream reader not available');
        }

        const decoder = new TextDecoder();
        let accumulated = '';
        let reasoning = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta;

                        let currentContent = '';
                        let currentReasoning = '';

                        if (delta?.reasoning) {
                            reasoning += delta.reasoning;
                            currentReasoning = delta.reasoning;
                        }

                        if (delta?.content) {
                            accumulated += delta.content;
                            currentContent = delta.content;
                        }

                        // OpenRouter specific: capture reasoning_details if present in final chunk or during stream
                        // Note: Streaming support for reasoning_details might vary, but we'll look for it.
                        let currentReasoningDetails = null;
                        if ((parsed.choices?.[0] as any)?.reasoning_details) {
                            currentReasoningDetails = (parsed.choices?.[0] as any).reasoning_details;
                        }

                        if (currentContent || currentReasoning || currentReasoningDetails) {
                            onChunk(currentContent, accumulated, reasoning, currentReasoningDetails);
                        }
                    } catch (e) {
                        console.debug('[Stream] Skipping malformed SSE data');
                    }
                }
            }
        }

        return {
            success: true,
            data: accumulated,
            latency: Date.now() - startTime
        };

    } catch (error: any) {
        // Fallback Logic for Provider/Overload Errors
        const isProviderError = (error.message.toLowerCase().includes('provider') ||
            error.message.toLowerCase().includes('overloaded') ||
            error.message.toLowerCase().includes('rate') ||
            error.message.toLowerCase().includes('busy') ||
            error.message.toLowerCase().includes('429') ||
            error.message.toLowerCase().includes('endpoints') ||
            error.message.toLowerCase().includes('not found') ||
            error.message.toLowerCase().includes('internal') ||
            error.message.toLowerCase().includes('timeout') ||
            error.message.toLowerCase().includes('failed to fetch')) &&
            error.name !== 'AbortError';

        const fallback = AI_MODELS[agent]?.fallback;

        if (fallback && isProviderError) {
            console.warn(`[AI] Stream agent ${agent} failed (overloaded). Falling back to ${fallback}.`);
            // Recursively try with fallback
            return generateTextStream(fallback as ModelKey, prompt, onChunk, params);
        }

        console.error('[Stream] Streaming failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Helper: Generate mock content based on prompt
 */
function generateMockContent(prompt: string): string {
    const p = prompt.toLowerCase();

    if (p.includes('free') && p.includes('ai')) {
        return `## Market Analysis
- Open source AI models are disrupting proprietary dominance
- HuggingFace and OpenRouter provide cost-effective access
- Local LLMs (Ollama) allow zero-cost inference

## Top Free Tools
- **HuggingChat:** Free access to Llama 3 & Mixtral
- **Ollama:** Run powerful models locally
- **Leonardo.ai:** Daily free credits for image gen
- **Vercel AI SDK:** Generous free tier for developers`;
    } else if (p.includes('crypto')) {
        return `## Market Overview\n- Bitcoin dominance at 50%\n- DeFi stablecoin volume rising\n\n## Recommendations\n- Diversify portfolio\n- Use hardware wallets`;
    } else if (p.includes('health')) {
        return `## Healthcare Trends\n- Telemedicine adoption accelerating\n- AI diagnostics improving accuracy\n\n## Key Findings\n- Privacy is paramount\n- Accessible care leads to better outcomes`;
    } else {
        return `## Analysis of ${prompt.slice(0, 30)}...\n\n### Key Trends\n- Rapid adoption in enterprise\n- Focus on user experience\n\n### Recommendations\n- Start small, scale fast\n- Prioritize security\n- Data-driven decision making`;
    }
}

/**
 * Full chat completion with history
 */
export async function chatCompletion(
    messages: { role: string; content: string }[],
    model: ModelKey = 'planner',
    params?: TextGenerationParams
): Promise<AIResponse<string>> {
    const startTime = Date.now();
    try {
        const targetModel = AI_MODELS[model]?.model || AI_MODELS.planner.model;

        // Ensure system prompt is present
        const finalMessages = [...messages];
        const hasSystemMessage = finalMessages.some(m => m.role === 'system');
        if (!hasSystemMessage) {
            finalMessages.unshift({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
        } else {
            // Append English requirement to existing system message
            const systemIndex = finalMessages.findIndex(m => m.role === 'system');
            finalMessages[systemIndex].content += " Always respond in English.";
        }

        const data = await callOpenRouter(finalMessages, targetModel, params);

        return {
            success: true,
            data: data.choices[0]?.message?.content,
            latency: Date.now() - startTime,
        };
    } catch (error: any) {
        const isProviderError = (error.message.toLowerCase().includes('provider') ||
            error.message.toLowerCase().includes('overloaded') ||
            error.message.toLowerCase().includes('rate') ||
            error.message.toLowerCase().includes('busy') ||
            error.message.toLowerCase().includes('429') ||
            error.message.toLowerCase().includes('endpoints') ||
            error.message.toLowerCase().includes('not found') ||
            error.message.toLowerCase().includes('internal') ||
            error.message.toLowerCase().includes('timeout') ||
            error.message.toLowerCase().includes('failed to fetch')) &&
            error.name !== 'AbortError';

        const fallback = AI_MODELS[model]?.fallback;

        if (fallback && isProviderError) {
            console.warn(`[AI] ChatCompletion agent ${model} failed. Falling back to ${fallback}.`);
            return chatCompletion(messages, fallback as ModelKey);
        }

        return { success: false, error: error.message };
    }
}

/**
 * Stream text response
 */
export async function streamText(
    model: ModelKey,
    prompt: string,
    onChunk?: (chunk: string) => void
): Promise<AIResponse<string>> {
    // Basic implementation without real streaming for now
    const response = await generateText(model, prompt);
    if (response.success && response.data) {
        onChunk?.(response.data);
    }
    return response;
}

// =============================================================================
// SPECIALIZED FUNCTIONS
// =============================================================================

export async function generateCode(prompt: string, language: string = 'typescript'): Promise<AIResponse<string>> {
    const codePrompt = `Write ${language} code for the following: ${prompt}\n\nReturn ONLY the code block.`;
    return generateText('coder', codePrompt);
}

export async function generateMarketingContent(product: string, contentType: string): Promise<AIResponse<string>> {
    const marketingPrompt = `Create ${contentType} for ${product}. Focus on conversion and engagement.`;
    return generateText('marketing', marketingPrompt);
}

export async function deepAnalysis(content: string, analysisType: string): Promise<AIResponse<string>> {
    const analysisPrompt = `Perform a ${analysisType} analysis on the following content:\n\n${content}`;
    return generateText('analyst', analysisPrompt);
}

/**
 * Analyze content and return structured JSON result
 */
export async function analyzeContent(
    content: string,
    files: Array<{ name: string; type: string; content: any }> = []
): Promise<AIResponse<string>> {
    const fileContext = files.map(f => `File: ${f.name} (${f.type})`).join('\n');

    // We want the AI to return a JSON that matches the AnalysisResult structure
    // We'll use the 'analyst' agent (DeepSeek or similar strong reasoning model)
    const prompt = `
    Analyze the detailed content below and provide a comprehensive structured response.
    
    Context Files:
    ${fileContext}
    
    User Query/Content:
    ${content}
    
    Return ONLY a valid JSON object matching this structure:
    {
      "summary": "Brief executive summary",
      "content": "Detailed markdown analysis",
      "insights": [
        {
          "id": "unique_id",
          "type": "observation|pattern|anomaly|trend|key_point",
          "title": "Short title",
          "description": "Detailed insight",
          "importance": "high|medium|low"
        }
      ],
      "recommendations": [
        {
          "id": "unique_id",
          "title": "Action title",
          "description": "Action description",
          "priority": "critical|high|medium|low",
          "actions": [{ "id": "act_1", "label": "Button Label", "type": "button" }]
        }
      ]
    }
    `;

    // Note: We might want to enforce JSON mode if supported, or just prompt engineering
    return generateText('analyst', prompt, {
        temperature: 0.2 // Lower temperature for more deterministic JSON
    });
}

// =============================================================================
// VOICE & PIPELINE (PLACEHOLDERS)
// =============================================================================

export async function speechToText(audioBlob: Blob): Promise<AIResponse<string>> {
    return { success: false, error: 'STT not implemented in reconstructed module' };
}

/**
 * Detect if text contains Amharic characters
 */
function isAmharic(text: string): boolean {
    const amharicRegex = /[\u1200-\u137F]/;
    return amharicRegex.test(text);
}

export async function textToSpeech(text: string): Promise<AIResponse<string>> {
    try {
        if (!text) return { success: false, error: 'No text provided' };

        // Clean text (remove markdown-style bold/italic markers)
        const cleanText = text.replace(/[*_#`]/g, '').slice(0, 200); // 200 char limit for stability

        const lang = isAmharic(cleanText) ? 'am' : 'en';
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`;

        return {
            success: true,
            data: url
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'TTS synthesis failed' };
    }
}

export async function executeAgentPipeline(
    tasks: AgentTask[],
    onProgress?: (task: AgentTask) => void
): Promise<AgentTask[]> {
    const results: AgentTask[] = [];
    for (const task of tasks) {
        task.status = 'processing';
        task.startTime = new Date();
        onProgress?.(task);

        const response = await generateText(task.agent, task.prompt);

        task.status = response.success ? 'completed' : 'failed';
        task.result = response.data || response.error;
        task.endTime = new Date();

        results.push(task);
        onProgress?.(task);
    }
    return results;
}

export async function auditAgentOutputs(outputs: { agent: ModelKey; content: string }[]): Promise<AIResponse<string>> {
    const content = outputs.map(o => `Agent ${o.agent}: ${o.content}`).join('\n\n---');
    const prompt = `Review the following outputs from multiple agents and provide a consolidated summary and quality assessment:\n\n${content}`;
    return generateText('analyst', prompt);
}

// =============================================================================
// IMAGE GENERATION
// =============================================================================

export interface ImageGenerationParams {
    width?: number;
    height?: number;
    quality?: number;
    style?: string;
    negative_prompt?: string;
    num_images?: number;
    guidance_scale?: number;
    num_inference_steps?: number;
}

export interface GeneratedImage {
    url: string;
    revised_prompt?: string;
    seed?: number;
    model?: string;
    width?: number;
    height?: number;
    quality?: number;
}

export interface ImageResponse extends AIResponse<GeneratedImage[]> {
    model_used?: string;
    cost_estimate?: number;
}

// Image generation models configuration
export const IMAGE_MODELS: Record<string, any> = {
    'dall-e-3': {
        name: 'Adis (አዲስ)',
        provider: 'openrouter',
        model: 'openai/dall-e-3',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 'standard',
        cost: 0.04, // per image
    },
    'stable-diffusion-xl': {
        name: 'Tikus (ትኩስ)',
        provider: 'openrouter',
        model: 'stability-ai/stable-diffusion-xl',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 'standard',
        cost: 0.01, // per image
    },
    'flux': {
        name: 'Zema (ዜማ)',
        provider: 'openrouter',
        model: 'black-forest-labs/flux-1-pro',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 'high',
        cost: 0.055, // per image
    },
    'midjourney': {
        name: 'Wub (ውብ)',
        provider: 'openrouter',
        model: 'midjourney/midjourney-v6',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 'high',
        cost: 0.04, // per image
    }
};

/**
 * Generate images using various AI models
 * Note: This is a mock implementation for demonstration.
 * In production, integrate with actual image generation APIs.
 */
export async function generateImage(
    prompt: string,
    model: string = 'flux',
    params: ImageGenerationParams = {}
): Promise<ImageResponse> {
    const startTime = Date.now();

    try {
        const modelConfig = IMAGE_MODELS[model];
        if (!modelConfig) {
            throw new Error(`Unknown image model: ${model}`);
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        // Generate mock image URLs using a placeholder service
        const numImages = params.num_images || 1;
        const images: GeneratedImage[] = [];

        for (let i = 0; i < numImages; i++) {
            const seed = Math.floor(Math.random() * 1000000);
            const width = params.width || modelConfig.maxWidth;
            const height = params.height || modelConfig.maxHeight;

            // Use a placeholder image service with seed for variety
            const imageUrl = `https://picsum.photos/seed/${seed}-${prompt.replace(/\s+/g, '-')}/${width}/${height}.jpg`;

            images.push({
                url: imageUrl,
                revised_prompt: `${prompt} (enhanced by ${modelConfig.name})`,
                seed: seed,
                model: modelConfig.model,
                width: width,
                height: height,
                quality: params.quality || modelConfig.quality,
            });
        }

        const latency = Date.now() - startTime;
        const costEstimate = images.length * modelConfig.cost;

        return {
            success: true,
            data: images,
            latency: latency,
            model_used: modelConfig.model,
            cost_estimate: costEstimate,
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            latency: Date.now() - startTime,
        };
    }
}

/**
 * Generate content-aware images based on text content
 */
export async function generateContentImages(
    textContent: string,
    contentType: string = 'blog',
    numImages: number = 3
): Promise<ImageResponse> {
    // Extract key themes and concepts from the text
    const analysisPrompt = `Extract 3-5 key visual concepts from this ${contentType} content that would make compelling images. Return only the concepts, one per line:\n\n${textContent}`;

    const analysis = await generateText('analyst', analysisPrompt);

    if (!analysis.success || !analysis.data) {
        return { success: false, error: 'Failed to analyze content for image generation' };
    }

    const concepts = analysis.data.split('\n').filter(line => line.trim()).slice(0, numImages);
    const imagePrompts = concepts.map(concept => `${concept} - professional, high quality, detailed`);

    // Generate images for each concept
    const allImages: GeneratedImage[] = [];
    let totalCost = 0;

    for (const prompt of imagePrompts) {
        const result = await generateImage(prompt, 'flux', { num_images: 1 });
        if (result.success && result.data) {
            allImages.push(...result.data);
            totalCost += result.cost_estimate || 0;
        }
    }

    return {
        success: true,
        data: allImages,
        cost_estimate: totalCost,
    };
}
/**
 * Automatically classify a user prompt and select the best model
 */
export async function classifyPrompt(prompt: string): Promise<ModelKey> {
    if (!OPENROUTER_API_KEY) return 'planner';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://g-nexus.ai',
                'X-Title': 'G-Nexus Platform',
            },
            body: JSON.stringify({
                model: AI_MODELS.planner.model, // Use Zara Yacob (DeepSeek R1) for classification
                messages: [
                    {
                        role: 'system',
                        content: `You are a model classifier for G-Nexus AI. Categorize users prompt into one of these keys:
- coder: Technical programming, code generation, debugging
- marketing: Copywriting, social media, branding
- planner: Complex reasoning, logic, strategy
- analyst: Data analysis, research, insights
- vision: Image analysis or UI/UX synthesis
- general: General conversation, simple tasks

Respond ONLY with the key name.`
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0,
                max_tokens: 10
            }),
        });

        if (!response.ok) return 'planner';

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content?.trim().toLowerCase() as ModelKey;

        // Validate choice
        const validKeys: ModelKey[] = ['coder', 'marketing', 'planner', 'analyst', 'agentic', 'general', 'fast', 'vision'];
        if (validKeys.includes(result)) {
            return result;
        }

        return 'planner';
    } catch (error) {
        console.error('Classification error:', error);
        return 'planner';
    }
}
