/**
 * Dynamic Node Registry
 * Allows AI to spawn specialized node types based on task requirements
 */

export interface DynamicNodeCapability {
    id: string;
    name: string;
    description: string;
    keywords: string[];
    category: 'computation' | 'data' | 'analysis' | 'integration';
}

/**
 * Registry of available dynamic node types
 */
export const DYNAMIC_NODE_TYPES: DynamicNodeCapability[] = [
    {
        id: 'calculator',
        name: 'Calculator',
        description: 'Performs mathematical calculations, statistics, and data processing',
        keywords: ['calculate', 'math', 'compute', 'sum', 'average', 'percentage', 'convert', 'statistics'],
        category: 'computation'
    },
    {
        id: 'api-caller',
        name: 'API Caller',
        description: 'Fetches data from external APIs',
        keywords: ['api', 'fetch', 'request', 'get data', 'call', 'endpoint'],
        category: 'integration'
    },
    {
        id: 'code-analyzer',
        name: 'Code Analyzer',
        description: 'Analyzes code structure, patterns, and quality',
        keywords: ['code', 'analyze', 'inspect', 'review', 'lint', 'refactor', 'complexity'],
        category: 'analysis'
    }
];

/**
 * Determine if a topic requires a specialized node type
 */
export function detectNodeType(topic: string): string | null {
    const topicLower = topic.toLowerCase();

    for (const nodeType of DYNAMIC_NODE_TYPES) {
        const hasKeyword = nodeType.keywords.some(kw => topicLower.includes(kw));
        if (hasKeyword) {
            console.log(`[NodeRegistry] Detected ${nodeType.id} for topic: "${topic}"`);
            return nodeType.id;
        }
    }

    return null; // Use default research node
}

/**
 * Get node capability by ID
 */
export function getNodeCapability(id: string): DynamicNodeCapability | undefined {
    return DYNAMIC_NODE_TYPES.find(n => n.id === id);
}

/**
 * Get all capabilities by category
 */
export function getNodesByCategory(category: string): DynamicNodeCapability[] {
    return DYNAMIC_NODE_TYPES.filter(n => n.category === category);
}
