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
    | 'stt'
    | 'tts';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
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
}

// =============================================================================
// CONSTANTS
// =============================================================================

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export const AI_MODELS: Record<string, any> = {
    coder: {
        name: 'G-CORE Coder',
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        color: '#f97316',
        category: 'code',
    },
    marketing: {
        name: 'G-CORE Marketer',
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        color: '#06b6d4',
        category: 'text',
    },
    planner: {
        name: 'G-CORE Planner',
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        color: '#06b6d4',
        category: 'text',
    },
    analyst: {
        name: 'G-CORE Analyst',
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        color: '#8b5cf6',
        category: 'analysis',
    },
    agentic: {
        name: 'G-CORE Agent',
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        color: '#ef4444',
        category: 'agent',
    },
};

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
        }),
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
    try {
        const model = AI_MODELS[agent]?.model || AI_MODELS.planner.model;
        const data = await callOpenRouter([{ role: 'user', content: prompt }], model, params);

        return {
            success: true,
            data: data.choices[0]?.message?.content,
            latency: Date.now() - startTime,
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Full chat completion with history
 */
export async function chatCompletion(
    messages: { role: string; content: string }[],
    model: ModelKey = 'planner'
): Promise<AIResponse<string>> {
    const startTime = Date.now();
    try {
        const targetModel = AI_MODELS[model]?.model || AI_MODELS.planner.model;
        const data = await callOpenRouter(messages, targetModel);

        return {
            success: true,
            data: data.choices[0]?.message?.content,
            latency: Date.now() - startTime,
        };
    } catch (error: any) {
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
    // Basic implementation without real streaming for now to ensure stability
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

// =============================================================================
// VOICE & PIPELINE (PLACEHOLDERS)
// =============================================================================

export async function speechToText(audioBlob: Blob): Promise<AIResponse<string>> {
    return { success: false, error: 'STT not implemented in reconstructed module' };
}

export async function textToSpeech(text: string): Promise<AIResponse<string>> {
    return { success: false, error: 'TTS not implemented in reconstructed module' };
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
