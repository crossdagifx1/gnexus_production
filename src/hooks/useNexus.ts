/**
 * useNexus Hook
 * 
 * React hook for interacting with G-Nexus AI agents.
 * Provides a unified interface for all AI operations with loading states,
 * error handling, and streaming support.
 */

import { useState, useCallback, useRef } from 'react';
import {
    generateText,
    generateCode,
    generateMarketingContent,
    deepAnalysis,
    chatCompletion,
    streamText,
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
        setLoading(true);

        try {
            const response = await generateText(agent, prompt, params);
            setResult(response, agent);
            return response.success ? response.data || null : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Request failed',
            }));
            return null;
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
     * Stream chat response
     */
    const streamChat = useCallback(async (
        prompt: string,
        model: ModelKey = 'planner',
        onChunk?: (chunk: string) => void
    ): Promise<string | null> => {
        setLoading(true, true);
        setState(prev => ({ ...prev, output: '' }));

        try {
            let fullText = '';

            const handleChunk = (chunk: string) => {
                fullText += chunk;
                setState(prev => ({ ...prev, output: fullText }));
                onChunk?.(chunk);
            };

            const response = await streamText(model, prompt, handleChunk);

            setState(prev => ({
                ...prev,
                loading: false,
                streaming: false,
                output: response.success ? response.data || fullText : null,
                error: response.success ? null : response.error || 'Stream failed',
                lastModel: model,
            }));

            return response.success ? response.data || fullText : null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                streaming: false,
                error: error instanceof Error ? error.message : 'Stream failed',
            }));
            return null;
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
        // This is a bit of a hack to expose setMessages through the main hook if needed, 
        // but primarily we need it in useNexusChat.
        // For the main hook, we might distinct internal state vs external.
        // For now, let's just leave it empty here or managing a local state if useNexus was used for chat directly.
        // However, useNexus is mostly a wrapper. Let's look at useNexusChat.
    }, []);

    return {
        ...state,
        isReady: !state.loading,

        // Core
        askAgent,
        clearOutput,

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
        setMessages, // Logic placeholder

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
    const nexus = useNexus();

    const sendMessage = useCallback(async (content: string) => {
        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
            status: 'sent',
        };

        // Optimistic update
        setMessages(prev => [...prev, userMessage]);

        // Use standard chat for all messages
        const response = await nexus.chat([...messages, userMessage], activeModel);

        if (response) {
            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                model: activeModel,
                status: 'sent',
            };
            setMessages(prev => [...prev, assistantMessage]);
            return response;
        }

        return null;
    }, [messages, activeModel, nexus]);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        setMessages, // Exported for external sync
        activeModel,
        setActiveModel,
        sendMessage,
        clearMessages,
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
