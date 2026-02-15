/**
 * G-Nexus AI Chat - Advanced Types and Interfaces
 */

import { type ModelKey } from './ai';

// Tool Categories
export type ToolCategory =
    | 'analysis'      // Video, Image, Document analysis
    | 'creation'      // Business ideas, Presentations
    | 'development'   // Code interpreter
    | 'search'        // Web, Knowledge base
    | 'communication' // Voice, Translation
    | 'productivity'  // Calendar, Spreadsheets
    | 'utility';      // General utilities

// Tool Definitions
export interface AITool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    icon: string;
    keywords: string[];
    requiresInput: boolean;
    inputType?: 'file' | 'text' | 'audio' | 'video' | 'url' | 'none';
    streamingSupported: boolean;
    execute: (input: ToolInput) => Promise<ToolOutput>;
}

export interface ToolInput {
    type: 'text' | 'markdown' | 'code' | 'image' | 'video' | 'audio' | 'pdf' | 'spreadsheet' | 'document' | 'url' | 'json' | 'csv';
    content: string | File | Blob;
    metadata?: Record<string, any>;
}

export interface ToolOutput {
    success: boolean;
    content: string;
    metadata?: Record<string, any>;
    error?: string;
}

// Message with tool calls
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    tools?: ToolCall[];
    metadata?: MessageMetadata;
}

export interface ToolCall {
    toolId: string;
    name: string;
    arguments: Record<string, any>;
    result?: ToolOutput;
    status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface MessageMetadata {
    modelUsed?: ModelKey;
    tokensUsed?: number;
    responseTime?: number;
    confidence?: number;
    suggestedTools?: string[];
}

// Model Selection
export interface ModelSuggestion {
    model: ModelKey;
    confidence: number;
    reason: string;
}

// Conversation Context
export interface ConversationContext {
    id: string;
    messages: ChatMessage[];
    toolsUsed: string[];
    userPreferences: UserPreferences;
    currentTask?: string;
    summary?: string;
}

export interface UserPreferences {
    preferredModel?: ModelKey;
    favoriteTools?: string[];
    language?: string;
    tone?: 'professional' | 'casual' | 'technical';
}

// Auto-selection triggers
export interface AutoSelectTrigger {
    pattern: RegExp;
    tools: string[];
    model: ModelKey;
    priority: number;
}

// Tool Panel State
export interface ToolPanelState {
    isOpen: boolean;
    activeCategory: ToolCategory | null;
    suggestedTools: string[];
    recentTools: string[];
}

// Error Handling
export interface RetryConfig {
    maxRetries: number;
    delayMs: number;
    backoffMultiplier: number;
}

export interface ErrorDetails {
    code: string;
    message: string;
    recoverable: boolean;
    suggestedAction?: string;
}

// Streaming Response
export interface StreamChunk {
    content: string;
    done: boolean;
    toolCalls?: ToolCall[];
}
