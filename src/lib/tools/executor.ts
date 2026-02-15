/**
 * G-Nexus Tool Execution Pipeline
 * Advanced tool execution with streaming, caching, and validation
 */

import { getDatabase, type DBOperation } from '../storage/indexeddb';
import * as ToolStorage from '../storage/toolStorage';
import type { AITool, ToolInput, ToolOutput } from '../ai-chat-types';

// =============================================================================
// TYPES
// =============================================================================

export interface ToolExecutionContext {
    sessionId: string;
    messageId?: string;
    userId: string;
    timestamp: number;
    model?: string;
    previousMessages?: ToolMessageContext[];
}

export interface ToolMessageContext {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ToolExecutionResult {
    toolId: string;
    input: ToolInput;
    output: ToolOutput;
    executionTime: number;
    cached: boolean;
    timestamp: number;
}

export interface ToolHistoryEntry {
    id: string;
    tool_id: string;
    session_id: string;
    input: ToolInput;
    output: ToolOutput;
    execution_time: number;
    cached: boolean;
    created_at: number;
    metadata?: Record<string, unknown>;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export interface PreparedInput {
    content: string;
    context: ToolExecutionContext;
    metadata: Record<string, unknown>;
}

export interface ToolCacheEntry {
    id: string;
    tool_id: string;
    input_hash: string;
    output: ToolOutput;
    created_at: number;
    expires_at: number;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function hashInput(input: ToolInput): string {
    const content = typeof input.content === 'string'
        ? input.content
        : JSON.stringify(input.content);
    return btoa(content).slice(0, 32);
}

function getLocalUserId(): string {
    let userId = localStorage.getItem('gnexus_local_user_id');
    if (!userId) {
        userId = 'local_' + generateId();
        localStorage.setItem('gnexus_local_user_id', userId);
    }
    return userId;
}

// =============================================================================
// TOOL EXECUTOR CLASS
// =============================================================================

export class ToolExecutor {
    private tools: Map<string, AITool> = new Map();
    private cacheEnabled: boolean = true;
    private cacheTTL: number = 1000 * 60 * 60; // 1 hour
    private maxHistoryEntries: number = 1000;

    constructor(tools: AITool[] = []) {
        tools.forEach(tool => this.registerTool(tool));
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

    getTool(toolId: string): AITool | undefined {
        return this.tools.get(toolId);
    }

    getAllTools(): AITool[] {
        return Array.from(this.tools.values());
    }

    getToolsByCategory(): Record<string, AITool[]> {
        const categories: Record<string, AITool[]> = {};
        this.tools.forEach(tool => {
            if (!categories[tool.category]) {
                categories[tool.category] = [];
            }
            categories[tool.category].push(tool);
        });
        return categories;
    }

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    async validate(toolId: string, input: ToolInput): Promise<ValidationResult> {
        const tool = this.tools.get(toolId);
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!tool) {
            errors.push(`Tool "${toolId}" not found`);
            return { valid: false, errors, warnings };
        }

        // Check if input is required
        if (tool.requiresInput && !input.content) {
            errors.push('Input content is required for this tool');
        }

        // Check input type
        if (tool.inputType && input.content) {
            const validTypes: Record<string, (content: unknown) => boolean> = {
                text: (c) => typeof c === 'string',
                file: (c) => typeof c === 'object' && 'file' in (c as object),
                video: (c) => typeof c === 'object' && 'video' in (c as object),
                image: (c) => typeof c === 'object' && 'image' in (c as object),
            };

            if (validTypes[tool.inputType] && !validTypes[tool.inputType](input.content)) {
                warnings.push(`Input type "${tool.inputType}" expected but different type provided`);
            }
        }

        // Check content length
        if (typeof input.content === 'string' && input.content.length > 100000) {
            warnings.push('Input content is very large, processing may take longer');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    // -------------------------------------------------------------------------
    // PREPARATION
    // -------------------------------------------------------------------------

    async prepare(toolId: string, input: ToolInput, context: ToolExecutionContext): Promise<PreparedInput> {
        const tool = this.tools.get(toolId);
        if (!tool) {
            throw new Error(`Tool "${toolId}" not found`);
        }

        // Build metadata
        const metadata: Record<string, unknown> = {
            toolName: tool.name,
            toolCategory: tool.category,
            sessionId: context.sessionId,
            timestamp: Date.now(),
        };

        // Add context from previous messages
        if (context.previousMessages && context.previousMessages.length > 0) {
            metadata.conversationContext = context.previousMessages
                .slice(-5) // Last 5 messages
                .map(m => m.content)
                .join('\n');
        }

        return {
            content: typeof input.content === 'string' ? input.content : JSON.stringify(input.content),
            context,
            metadata,
        };
    }


    // -------------------------------------------------------------------------
    // CACHING
    // -------------------------------------------------------------------------

    private async getCachedResult(toolId: string, inputHash: string): Promise<ToolOutput | null> {
        if (!this.cacheEnabled) return null;
        return ToolStorage.getCachedResult(toolId, inputHash);
    }

    private async setCachedResult(toolId: string, inputHash: string, output: ToolOutput): Promise<void> {
        if (!this.cacheEnabled) return;

        const entry = {
            id: generateId(),
            tool_id: toolId,
            input_hash: inputHash,
            output,
            created_at: Date.now(),
            expires_at: Date.now() + this.cacheTTL,
        };

        await ToolStorage.setCachedResult(entry);
    }

    // -------------------------------------------------------------------------
    // EXECUTION
    // -------------------------------------------------------------------------

    async execute(
        toolId: string,
        input: ToolInput,
        context: ToolExecutionContext
    ): Promise<ToolExecutionResult> {
        const startTime = Date.now();
        const tool = this.tools.get(toolId);

        if (!tool) {
            throw new Error(`Tool "${toolId}" not found`);
        }

        // Validate
        const validation = await this.validate(toolId, input);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Check cache
        const inputHash = hashInput(input);
        const cachedResult = await this.getCachedResult(toolId, inputHash);

        if (cachedResult) {
            // Record in history
            await this.recordHistory(toolId, input, cachedResult, 0, true, context);

            return {
                toolId,
                input,
                output: cachedResult,
                executionTime: 0,
                cached: true,
                timestamp: Date.now(),
            };
        }

        // Prepare input
        const preparedInput = await this.prepare(toolId, input, context);

        // Execute tool
        const output = await tool.execute({
            type: input.type,
            content: preparedInput.content,
            metadata: {
                ...preparedInput.metadata,
                context: preparedInput.context
            },
        });

        const executionTime = Date.now() - startTime;

        // Cache result
        await this.setCachedResult(toolId, inputHash, output);

        // Record in history
        await this.recordHistory(toolId, input, output, executionTime, false, context);

        return {
            toolId,
            input,
            output,
            executionTime,
            cached: false,
            timestamp: Date.now(),
        };
    }

    // Streaming execution
    async *executeStream(
        toolId: string,
        input: ToolInput,
        context: ToolExecutionContext
    ): AsyncGenerator<ToolOutput, ToolExecutionResult, unknown> {
        const startTime = Date.now();
        const tool = this.tools.get(toolId);

        if (!tool) {
            throw new Error(`Tool "${toolId}" not found`);
        }

        // Validate
        const validation = await this.validate(toolId, input);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Check if tool supports streaming
        if (!tool.streamingSupported) {
            // Fall back to regular execution
            const result = await this.execute(toolId, input, context);
            yield result.output;
            return result;
        }

        // Prepare input
        const preparedInput = await this.prepare(toolId, input, context);

        // Execute with streaming simulation
        let finalOutput: ToolOutput = {
            success: true,
            content: '',
        };

        // For now, simulate streaming by yielding chunks
        // In a real implementation, this would connect to the AI API
        const fullContent = preparedInput.content;
        const chunks = this.simulateStreaming(fullContent);

        for (const chunk of chunks) {
            finalOutput.content += chunk;
            yield {
                success: true,
                content: chunk,
                metadata: { streaming: true },
            };
        }

        const executionTime = Date.now() - startTime;

        // Record in history
        await this.recordHistory(toolId, input, finalOutput, executionTime, false, context);

        return {
            toolId,
            input,
            output: finalOutput,
            executionTime,
            cached: false,
            timestamp: Date.now(),
        };
    }

    private simulateStreaming(content: string): string[] {
        // Simulate streaming by breaking content into chunks
        const words = content.split(' ');
        const chunks: string[] = [];
        let currentChunk = '';

        for (const word of words) {
            currentChunk += (currentChunk ? ' ' : '') + word;
            if (currentChunk.length > 20) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk);
        }

        return chunks.length > 0 ? chunks : [content];
    }

    // -------------------------------------------------------------------------
    // HISTORY
    // -------------------------------------------------------------------------

    private async recordHistory(
        toolId: string,
        input: ToolInput,
        output: ToolOutput,
        executionTime: number,
        cached: boolean,
        context: ToolExecutionContext
    ): Promise<void> {
        const entry: ToolHistoryEntry = {
            id: generateId(),
            tool_id: toolId,
            session_id: context.sessionId,
            input,
            output,
            execution_time: executionTime,
            cached,
            created_at: Date.now(),
        };

        await ToolStorage.recordHistory(entry);
    }

    private async cleanupHistory(): Promise<void> {
        // Handled by storage provider if necessary
    }

    async getHistory(sessionId?: string, limit: number = 50): Promise<ToolHistoryEntry[]> {
        return ToolStorage.getHistory(sessionId, limit);
    }

    async clearHistory(): Promise<void> {
        await ToolStorage.clearHistory();
    }

    // -------------------------------------------------------------------------
    // CACHE MANAGEMENT
    // -------------------------------------------------------------------------

    async clearCache(): Promise<void> {
        return ToolStorage.clearCache();
    }

    setCacheEnabled(enabled: boolean): void {
        this.cacheEnabled = enabled;
    }

    setCacheTTL(ttlMs: number): void {
        this.cacheTTL = ttlMs;
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let executorInstance: ToolExecutor | null = null;

export function getToolExecutor(): ToolExecutor {
    if (!executorInstance) {
        executorInstance = new ToolExecutor();
    }
    return executorInstance;
}

export function initializeToolExecutor(tools: AITool[]): ToolExecutor {
    executorInstance = new ToolExecutor(tools);
    return executorInstance;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export async function executeTool(
    toolId: string,
    input: ToolInput,
    context?: Partial<ToolExecutionContext>
): Promise<ToolExecutionResult> {
    const executor = getToolExecutor();
    const fullContext: ToolExecutionContext = {
        sessionId: context?.sessionId || 'default',
        messageId: context?.messageId,
        userId: context?.userId || getLocalUserId(),
        timestamp: Date.now(),
        model: context?.model,
        previousMessages: context?.previousMessages || [],
    };

    return executor.execute(toolId, input, fullContext);
}

export async function* executeToolStream(
    toolId: string,
    input: ToolInput,
    context?: Partial<ToolExecutionContext>
): AsyncGenerator<ToolOutput, ToolExecutionResult, unknown> {
    const executor = getToolExecutor();
    const fullContext: ToolExecutionContext = {
        sessionId: context?.sessionId || 'default',
        messageId: context?.messageId,
        userId: context?.userId || getLocalUserId(),
        timestamp: Date.now(),
        model: context?.model,
        previousMessages: context?.previousMessages || [],
    };

    yield* executor.executeStream(toolId, input, fullContext);
}
