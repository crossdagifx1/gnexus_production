/**
 * G-NEXUS ProactiveAssistant
 * 
 * Intelligent system that monitors workflow state and proactively suggests next actions.
 * Learns from patterns and anticipates user needs.
 */

import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export type SuggestionType =
    | 'export-results'
    | 'add-node'
    | 'download-code'
    | 'save-template'
    | 'optimize-workflow'
    | 'continue-workflow';

export interface Suggestion {
    id: string;
    type: SuggestionType;
    title: string;
    message: string;
    confidence: number; // 0-1
    priority: 'low' | 'medium' | 'high';
    action: () => Promise<void> | void;
    autoExecute?: boolean;
    icon?: string;
}

export interface WorkflowState {
    goal: string;
    hasInput: boolean;
    researchComplete: boolean;
    collaboratorComplete: boolean;
    previewGenerated: boolean;
    codeGenerated: boolean;
    exported: boolean;
    nodeCount: number;
    completedNodes: number;
    blueprint?: string;
}

export interface SuggestionRule {
    id: string;
    condition: (state: WorkflowState) => boolean;
    createSuggestion: (state: WorkflowState) => Suggestion;
    cooldown?: number; // ms before suggesting again
    maxOccurrences?: number; // max times to suggest per session
}

// ============================================================================
// SUGGESTION RULES
// ============================================================================

class SuggestionEngine {
    private rules: SuggestionRule[] = [];
    private suggestionHistory: Map<string, { count: number; lastSuggested: number }> = new Map();
    private activeSuggestions: Set<string> = new Set();

    constructor() {
        this.initializeRules();
    }

    private initializeRules() {
        // Rule 1: Export results after preview is generated
        this.rules.push({
            id: 'export-after-preview',
            condition: (state) => state.previewGenerated && !state.exported,
            createSuggestion: (state) => ({
                id: 'export-results',
                type: 'export-results',
                title: 'Export Results',
                message: 'Your workflow is complete! Export to PDF or Markdown?',
                confidence: 0.88,
                priority: 'medium',
                icon: '📄',
                action: () => {
                    // Will be bound externally
                }
            }),
            cooldown: 30000, // 30s
            maxOccurrences: 2
        });

        // Rule 2: Download code after generation
        this.rules.push({
            id: 'download-code',
            condition: (state) => state.codeGenerated && !state.exported,
            createSuggestion: (state) => ({
                id: 'download-code',
                type: 'download-code',
                title: 'Download Code',
                message: 'Code files ready! Download as ZIP or copy individual files?',
                confidence: 0.92,
                priority: 'high',
                icon: '📦',
                action: () => {
                    // Will be bound externally
                }
            }),
            cooldown: 20000,
            maxOccurrences: 1
        });

        // Rule 3: Save workflow as template after completion
        this.rules.push({
            id: 'save-template',
            condition: (state) => {
                const complete = state.completedNodes >= 3 && state.previewGenerated;
                return complete;
            },
            createSuggestion: (state) => ({
                id: 'save-template',
                type: 'save-template',
                title: 'Save as Template',
                message: 'Great workflow! Save it as a template for future use?',
                confidence: 0.75,
                priority: 'low',
                icon: '💾',
                action: () => {
                    // Will be bound externally
                }
            }),
            cooldown: 60000,
            maxOccurrences: 1
        });

        // Rule 4: Continue workflow if stuck at collaborator
        this.rules.push({
            id: 'continue-workflow',
            condition: (state) => {
                return state.collaboratorComplete && !state.previewGenerated;
            },
            createSuggestion: (state) => ({
                id: 'continue-workflow',
                type: 'continue-workflow',
                title: 'Generate Preview',
                message: 'Blueprint created! Generate HTML preview now?',
                confidence: 0.95,
                priority: 'high',
                icon: '🎨',
                autoExecute: false, // User preference controlled
                action: () => {
                    // Continue workflow
                }
            }),
            cooldown: 15000,
            maxOccurrences: 1
        });
    }

    /**
     * Analyze workflow state and generate applicable suggestions
     */
    analyze(state: WorkflowState): Suggestion[] {
        const suggestions: Suggestion[] = [];
        const now = Date.now();

        for (const rule of this.rules) {
            // Check if rule condition is met
            if (!rule.condition(state)) {
                continue;
            }

            // Check history for cooldown and max occurrences
            const history = this.suggestionHistory.get(rule.id) || { count: 0, lastSuggested: 0 };

            if (rule.cooldown && (now - history.lastSuggested) < rule.cooldown) {
                continue; // Still in cooldown
            }

            if (rule.maxOccurrences && history.count >= rule.maxOccurrences) {
                continue; // Already suggested max times
            }

            // Check if already active
            if (this.activeSuggestions.has(rule.id)) {
                continue;
            }

            // Create suggestion
            const suggestion = rule.createSuggestion(state);
            suggestions.push(suggestion);

            // Update history
            this.suggestionHistory.set(rule.id, {
                count: history.count + 1,
                lastSuggested: now
            });

            this.activeSuggestions.add(rule.id);
        }

        // Sort by priority and confidence
        return suggestions.sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const scoreA = priorityWeight[a.priority] * a.confidence;
            const scoreB = priorityWeight[b.priority] * b.confidence;
            return scoreB - scoreA;
        });
    }

    /**
     * Mark a suggestion as resolved
     */
    resolve(suggestionId: string) {
        this.activeSuggestions.delete(suggestionId);
    }

    /**
     * Reset history (new session)
     */
    reset() {
        this.suggestionHistory.clear();
        this.activeSuggestions.clear();
    }
}

// ============================================================================
// PROACTIVE ASSISTANT
// ============================================================================

export class ProactiveAssistant {
    private engine: SuggestionEngine;
    private lastState: WorkflowState | null = null;
    private suggestionCallbacks: Map<SuggestionType, () => Promise<void> | void> = new Map();

    constructor() {
        this.engine = new SuggestionEngine();
    }

    /**
     * Register callback for a suggestion type
     */
    registerAction(type: SuggestionType, callback: () => Promise<void> | void) {
        this.suggestionCallbacks.set(type, callback);
    }

    /**
     * Monitor workflow state and show suggestions
     */
    async monitor(state: WorkflowState) {
        // Detect state changes
        const hasChanged = this.hasStateChanged(state);
        if (!hasChanged) {
            return;
        }

        this.lastState = { ...state };

        // Analyze and get suggestions
        const suggestions = this.engine.analyze(state);

        if (suggestions.length === 0) {
            return;
        }

        // Show top suggestion (avoid overwhelming user)
        const topSuggestion = suggestions[0];
        this.showSuggestion(topSuggestion);

        // Auto-execute if allowed
        if (topSuggestion.autoExecute) {
            await this.executeSuggestion(topSuggestion);
        }
    }

    /**
     * Show suggestion as toast notification
     */
    private showSuggestion(suggestion: Suggestion) {
        const icon = suggestion.icon || '💡';

        toast.info(`${icon} ${suggestion.message}`, {
            duration: 8000,
            action: {
                label: suggestion.title,
                onClick: async () => {
                    await this.executeSuggestion(suggestion);
                }
            }
        });

        console.log(`[ProactiveAssistant] Suggested: ${suggestion.type} (confidence: ${suggestion.confidence})`);
    }

    /**
     * Execute a suggestion's action
     */
    private async executeSuggestion(suggestion: Suggestion) {
        try {
            // First try registered callback
            const callback = this.suggestionCallbacks.get(suggestion.type);
            if (callback) {
                await callback();
            } else if (suggestion.action) {
                await suggestion.action();
            }

            // Mark as resolved
            this.engine.resolve(suggestion.id);

            toast.success(`✅ ${suggestion.title} completed!`);
        } catch (error: any) {
            console.error('[ProactiveAssistant] Action failed:', error);
            toast.error(`Failed to ${suggestion.title.toLowerCase()}: ${error.message}`);
        }
    }

    /**
     * Check if state has meaningfully changed
     */
    private hasStateChanged(state: WorkflowState): boolean {
        if (!this.lastState) {
            return true;
        }

        // Compare key properties
        const keys: (keyof WorkflowState)[] = [
            'researchComplete',
            'collaboratorComplete',
            'previewGenerated',
            'codeGenerated',
            'exported',
            'completedNodes'
        ];

        return keys.some(key => this.lastState![key] !== state[key]);
    }

    /**
     * Reset for new session
     */
    reset() {
        this.engine.reset();
        this.lastState = null;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const proactiveAssistant = new ProactiveAssistant();
