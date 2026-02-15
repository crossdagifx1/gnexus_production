/**
 * useNexus Hook
 * 
 * React hook for interacting with G-Nexus AI agents.
 * Provides a unified interface for all AI operations with loading states,
 * error handling, and streaming support.
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
    generateText,
    generateCode,
    generateMarketingContent,
    deepAnalysis,
    chatCompletion,
    streamText,
    generateTextStream,
    auditAgentOutputs,
    speechToText,
    textToSpeech,
    executeAgentPipeline,
    AI_MODELS,
    type ModelKey,
    type ChatMessage,
    type AgentTask,
    type AIResponse,
    type TextGenerationParams,
} from '@/lib/ai';

// =============================================================================
// TYPES
// =============================================================================

export interface UseNexusState {
    loading: boolean;
    streaming: boolean;
    output: string | null;
    error: string | null;
    lastModel: ModelKey | null;
    latency: number | null;
}

export interface UseNexusReturn extends UseNexusState {
    // Core Functions
    askAgent: (agent: ModelKey, prompt: string, params?: TextGenerationParams) => Promise<string | null>;
    clearOutput: () => void;

    // Specialized Functions
    askCoder: (prompt: string, language?: string) => Promise<string | null>;
    askMarketer: (product: string, contentType?: 'tweet' | 'blog' | 'ad' | 'email') => Promise<string | null>;
    askPlanner: (task: string, context?: string) => Promise<string | null>;
    askAnalyst: (content: string, analysisType?: 'security' | 'quality' | 'consistency' | 'general') => Promise<string | null>;

    // Voice Functions
    transcribeAudio: (audioBlob: Blob) => Promise<string | null>;
    synthesizeSpeech: (text: string) => Promise<string | null>;

    // Chat Functions
    chat: (messages: ChatMessage[], model?: ModelKey) => Promise<string | null>;
    streamChat: (prompt: string, model?: ModelKey, onChunk?: (chunk: string) => void) => Promise<string | null>;
    stopGeneration: () => void;
    setMessages: (messages: ChatMessage[]) => void;

    // Multi-Agent
    runPipeline: (tasks: AgentTask[], onProgress?: (task: AgentTask) => void) => Promise<AgentTask[]>;
    auditOutputs: (outputs: { agent: ModelKey; content: string }[]) => Promise<string | null>;

    // State
    isReady: boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useNexus(): UseNexusReturn {
    const [state, setState] = useState<UseNexusState>({
        loading: false,
        streaming: false,
        output: null,
        error: null,
        lastModel: null,
        latency: null,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    // Helper to update state
    const setLoading = useCallback((loading: boolean, streaming = false) => {
        setState(prev => ({ ...prev, loading, streaming, error: null }));
    }, []);

    const setResult = useCallback((response: AIResponse<string>, model: ModelKey) => {
        setState(prev => ({
            ...prev,
            loading: false,
            streaming: false,
            output: response.success ? response.data || null : null,
            error: response.success ? null : response.error || 'Unknown error',
            lastModel: model,
            latency: response.latency || null,
        }));
    }, []);

    const clearOutput = useCallback(() => {
        setState({
            loading: false,
            streaming: false,
            output: null,
            error: null,
            lastModel: null,
            latency: null,
        });
    }, []);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setState(prev => ({ ...prev, loading: false, streaming: false }));
            toast.info('Generation stopped');
        }
    }, []);

    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================

    /**
     * Ask any agent with a prompt
     */
    const askAgent = useCallback(async (
        agent: ModelKey,
        prompt: string,
        params?: TextGenerationParams
    ): Promise<string | null> => {
        // Abort previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);

        try {
            const response = await generateText(agent, prompt, {
                ...params,
                signal: abortControllerRef.current.signal
            });
            setResult(response, agent);
            return response.success ? response.data || null : null;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return null;
            }
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Request failed',
            }));
            return null;
        } finally {
            abortControllerRef.current = null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // SPECIALIZED AGENT FUNCTIONS
    // =============================================================================

    /**
     * Ask the IQuest Coder for code generation
     */
    const askCoder = useCallback(async (
        prompt: string,
        language: string = 'python'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await generateCode(prompt, language);
            setResult(response, 'coder');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Code generation failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Ask the Qwen Marketer for marketing content
     */
    const askMarketer = useCallback(async (
        product: string,
        contentType: 'tweet' | 'blog' | 'ad' | 'email' = 'tweet'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await generateMarketingContent(product, contentType);
            setResult(response, 'marketing');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Marketing generation failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Ask the Llama Planner for strategic planning
     */
    const askPlanner = useCallback(async (
        task: string,
        context?: string
    ): Promise<string | null> => {
        const prompt = context
            ? `Context: ${context}\n\nTask: ${task}\n\nProvide a detailed plan:`
            : `Task: ${task}\n\nProvide a detailed, step-by-step plan:`;

        return askAgent('planner', prompt, {
            max_new_tokens: 2048,
            temperature: 0.7,
        });
    }, [askAgent]);

    /**
     * Ask the DeepSeek Analyst for deep analysis
     */
    const askAnalyst = useCallback(async (
        content: string,
        analysisType: 'security' | 'quality' | 'consistency' | 'general' = 'general'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await deepAnalysis(content, analysisType);
            setResult(response, 'analyst');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Analysis failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // VOICE FUNCTIONS
    // =============================================================================

    /**
     * Transcribe audio to text
     */
    const transcribeAudio = useCallback(async (
        audioBlob: Blob
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await speechToText(audioBlob);
            setResult(response, 'stt');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Transcription failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Synthesize speech from text
     */
    const synthesizeSpeech = useCallback(async (
        text: string
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await textToSpeech(text);
            setResult(response, 'tts');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Speech synthesis failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // CHAT FUNCTIONS
    // =============================================================================

    /**
     * Chat with conversation history
     */
    const chat = useCallback(async (
        messages: ChatMessage[],
        model: ModelKey = 'planner'
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const formattedMessages = messages.map(m => ({
                role: m.role,
                content: m.content,
            }));

            const response = await chatCompletion(formattedMessages, model);
            setResult(response, model);
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Chat failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    /**
     * Stream chat response with true streaming support
     */
    const streamChat = useCallback(async (
        prompt: string,
        model: ModelKey = 'planner',
        onChunk?: (chunk: string) => void
    ): Promise<string | null> => {
        // Abort previous
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true, true);
        setState(prev => ({ ...prev, output: '' }));

        try {
            let fullText = '';

            const response = await generateTextStream(
                model,
                prompt,
                (chunk, full) => {
                    fullText = full;
                    setState(prev => ({ ...prev, output: full }));
                    onChunk?.(chunk);
                },
                {
                    signal: abortControllerRef.current.signal
                }
            );

            setState(prev => ({
                ...prev,
                loading: false,
                streaming: false,
                output: response.success ? response.data || fullText : null,
                error: response.success ? null : response.error || 'Stream failed',
                lastModel: model,
            }));

            return response.success ? response.data || fullText : null;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream aborted');
                return null;
            }
            setState(prev => ({
                ...prev,
                loading: false,
                streaming: false,
                error: error instanceof Error ? error.message : 'Stream failed',
            }));
            return null;
        } finally {
            if (abortControllerRef.current?.signal.aborted) {
                // Keep abort controller null if finished
                abortControllerRef.current = null;
            }
        }
    }, [setLoading]);

    // =============================================================================
    // MULTI-AGENT
    // =============================================================================

    /**
     * Run a pipeline of agent tasks
     */
    const runPipeline = useCallback(async (
        tasks: AgentTask[],
        onProgress?: (task: AgentTask) => void
    ): Promise<AgentTask[]> => {
        setLoading(true);

        try {
            const results = await executeAgentPipeline(tasks, onProgress);

            const lastTask = results[results.length - 1];
            if (lastTask) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    output: lastTask.result || null,
                    lastModel: lastTask.agent,
                    error: lastTask.status === 'failed' ? lastTask.result || 'Pipeline failed' : null,
                }));
            }

            return results;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Pipeline failed',
            }));
            return [];
        }
    }, [setLoading]);

    /**
     * Audit outputs from multiple agents
     */
    const auditOutputs = useCallback(async (
        outputs: { agent: ModelKey; content: string }[]
    ): Promise<string | null> => {
        setLoading(true);

        try {
            const response = await auditAgentOutputs(outputs);
            setResult(response, 'analyst');
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Audit failed',
            }));
            return null;
        }
    }, [setLoading, setResult]);

    // =============================================================================
    // RETURN
    // =============================================================================

    const setMessages = useCallback((messages: ChatMessage[]) => {
        // Placeholder
    }, []);

    return {
        ...state,
        isReady: !state.loading,

        // Core
        askAgent,
        clearOutput,
        stopGeneration,

        // Specialized
        askCoder,
        askMarketer,
        askPlanner,
        askAnalyst,

        // Voice
        transcribeAudio,
        synthesizeSpeech,

        // Chat
        chat,
        streamChat,
        setMessages,

        // Multi-Agent
        runPipeline,
        auditOutputs,
    };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook for chat conversations with message history
 */
export function useNexusChat(initialModel: ModelKey = 'planner') {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeModel, setActiveModel] = useState<ModelKey>(initialModel);
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const nexus = useNexus();

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setStreaming(false);
            setLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (content: string, attachments: File[] = []) => {
        try {
            // Abort any existing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);

            // Process attachments
            const processedImages: string[] = [];
            let processedTextContext = '';

            for (const file of attachments) {
                if (file.type.startsWith('image/')) {
                    // Convert image to base64
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                    processedImages.push(base64);
                } else if (
                    file.type.startsWith('text/') ||
                    file.name.endsWith('.ts') ||
                    file.name.endsWith('.js') ||
                    file.name.endsWith('.json') ||
                    file.name.endsWith('.md')
                ) {
                    // Read text content
                    const text = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsText(file);
                    });
                    processedTextContext += `\n\n--- File: ${file.name} ---\n${text}\n--- End File ---\n`;
                }
            }

            // Append context to content if exists
            const distinctContent = processedTextContext ? `${content}\n${processedTextContext}` : content;

            const userMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: 'user',
                content: distinctContent, // Original content
                timestamp: new Date(),
                status: 'sent',
            };

            // Optimistic update
            setMessages(prev => [...prev, userMessage]);

            const messageHistory = messages.map(m => ({
                role: m.role as any,
                content: m.content
            }));

            // For history, we just send the text content. 
            // Images are attached to the current Turn only in param.
            messageHistory.push({ role: 'user', content: distinctContent });

            setStreaming(true);
            let accumulatedContent = '';
            let accumulatedReasoning = '';

            // Auto-switch to Vision model if images are present and current model isn't capable
            // (Simple heuristic: if not vision, switch to generic vision or specific one)
            // For now, let's trust the 'activeModel' or maybe force 'vision' if images exist?
            const targetModel = (processedImages.length > 0 && activeModel !== 'vision' && activeModel !== 'agentic')
                ? 'vision'
                : activeModel;

            const response = await generateTextStream(
                targetModel,
                distinctContent,
                (chunk, full, reasoning) => {
                    accumulatedContent = full;
                    accumulatedReasoning = reasoning || '';

                    setMessages(prev => {
                        const last = prev[prev.length - 1];
                        if (last?.id === 'streaming-msg') {
                            return [...prev.slice(0, -1), {
                                id: 'streaming-msg',
                                role: 'assistant',
                                content: full,
                                reasoning: reasoning,
                                timestamp: last.timestamp,
                                model: targetModel,
                                status: 'sent'
                            }];
                        }
                        return [...prev, {
                            id: 'streaming-msg',
                            role: 'assistant',
                            content: full,
                            reasoning: reasoning,
                            timestamp: new Date(),
                            model: targetModel,
                            status: 'sent'
                        }];
                    });
                },
                {
                    messages: messageHistory,
                    temperature: 0.7,
                    max_new_tokens: 2048,
                    images: processedImages,
                    signal: abortControllerRef.current?.signal
                }
            );

            if (!response.success) {
                throw new Error(response.error);
            }

            // Final message update with real ID
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== 'streaming-msg');
                return [...filtered, {
                    id: `msg-${Date.now()}`,
                    role: 'assistant',
                    content: accumulatedContent,
                    reasoning: accumulatedReasoning,
                    timestamp: new Date(),
                    model: activeModel,
                    status: 'sent'
                }];
            });

            return accumulatedContent;

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('[useNexusChat] Generation stopped by user');
                return null;
            }
            console.error('[useNexusChat] Error:', err);
            setError(err.message);
            toast.error(err.message);
            return null;
        } finally {
            setLoading(false);
            setStreaming(false);
            abortControllerRef.current = null;
        }
    }, [messages, activeModel]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        setMessages,
        activeModel,
        setActiveModel,
        sendMessage,
        stopGeneration,
        clearMessages,
        loading,
        streaming,
        error,
        ...nexus,
    };
}

/**
 * Hook for agent selection and task dispatch
 */
export function useAgentDispatcher() {
    const [selectedAgent, setSelectedAgent] = useState<ModelKey | null>(null);
    const [taskHistory, setTaskHistory] = useState<AgentTask[]>([]);
    const nexus = useNexus();

    const dispatch = useCallback(async (prompt: string) => {
        if (!selectedAgent) {
            return null;
        }

        const task: AgentTask = {
            id: `task-${Date.now()}`,
            agent: selectedAgent,
            prompt,
            status: 'pending',
        };

        setTaskHistory(prev => [...prev, task]);

        // Route to appropriate function (now only text agents)
        const response = await nexus.askAgent(selectedAgent, prompt);

        const completedTask: AgentTask = {
            ...task,
            status: response ? 'completed' : 'failed',
            result: response || nexus.error || 'Task failed',
            endTime: new Date(),
        };

        setTaskHistory(prev =>
            prev.map(t => t.id === task.id ? completedTask : t)
        );

        return response;
    }, [selectedAgent, nexus]);

    const selectAgent = useCallback((agent: ModelKey) => {
        setSelectedAgent(agent);
    }, []);

    const clearHistory = useCallback(() => {
        setTaskHistory([]);
    }, []);

    return {
        selectedAgent,
        selectAgent,
        taskHistory,
        dispatch,
        clearHistory,
        agentInfo: selectedAgent ? AI_MODELS[selectedAgent] : null,
        ...nexus,
    };
}

export default useNexus;
