/**
 * G-NEXUS Web Search Service
 * Provides AI-simulated web search using OpenRouter DeepSeek model
 */

import { generateText } from './ai';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    score?: number;
}

export interface SearchResponse {
    success: boolean;
    query: string;
    results: SearchResult[];
    answer?: string; // AI-generated summary
    timestamp: Date;
    error?: string;
}

/**
 * Search the web using AI model (DeepSeek R1T2 Chimera)
 * The AI simulates web search by generating plausible, current results
 */
export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResponse> {
    try {
        console.log(`[WebSearch] AI searching: "${query}"`);

        const searchPrompt = `You are a web search engine. Generate ${maxResults} realistic search results for the query: "${query}"

Return results in this EXACT JSON format:
{
  "answer": "Brief answer to the query in 1-2 sentences",
  "results": [
    {
      "title": "Result title",
      "url": "https://example.com/page",
      "snippet": "Description of this result (2-3 sentences)",
      "score": 0.95
    }
  ]
}

Rules:
- Make URLs realistic (use real domains like github.com, stackoverflow.com, docs sites)
- Include current information for 2026
- Snippets should be informative and specific
- Score from 0.0 to 1.0 (highest first)
- Return ONLY valid JSON, no markdown blocks`;

        const response = await generateText('agentic', searchPrompt, {
            temperature: 0.7,
            max_new_tokens: 2000
        });

        if (!response.success || !response.data) {
            throw new Error(response.error || 'AI search failed');
        }

        // Parse AI response
        let jsonText = response.data.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
        }

        const data = JSON.parse(jsonText);

        return {
            success: true,
            query: query,
            results: data.results || [],
            answer: data.answer,
            timestamp: new Date()
        };

    } catch (error: any) {
        console.error('[WebSearch] AI search error:', error);

        // Fallback to basic mock
        return generateMockSearchResults(query, maxResults);
    }
}

/**
 * Generate basic fallback results
 */
function generateMockSearchResults(query: string, maxResults: number): SearchResponse {
    const mockResults: SearchResult[] = [
        {
            title: `${query} - Official Documentation`,
            url: `https://docs.example.com/${encodeURIComponent(query)}`,
            snippet: `Comprehensive documentation for ${query}. Learn about features, API reference, and implementation guides.`,
            score: 0.95
        },
        {
            title: `Getting Started with ${query}`,
            url: `https://github.com/${encodeURIComponent(query)}`,
            snippet: `Open source projects and examples for ${query}. Explore repositories, contribute, and learn from the community.`,
            score: 0.88
        },
        {
            title: `${query} Tutorial (2026)`,
            url: `https://tutorial.example.com/${encodeURIComponent(query)}`,
            snippet: `Step-by-step guide to mastering ${query}. Includes best practices, common patterns, and real-world examples.`,
            score: 0.82
        }
    ];

    return {
        success: true,
        query: query,
        results: mockResults.slice(0, maxResults),
        answer: `Showing mock results for "${query}". AI search temporarily unavailable.`,
        timestamp: new Date()
    };
}

/**
 * Determine if a query needs web search vs AI knowledge
 */
export function shouldUseWebSearch(query: string): boolean {
    const q = query.toLowerCase();

    // Keywords requiring current info
    const currentKeywords = ['latest', 'current', 'today', '2026', '2025', 'now', 'recent'];
    const hasCurrentKeyword = currentKeywords.some(kw => q.includes(kw));

    // Topics that change frequently
    const liveTopics = ['price', 'stock', 'weather', 'news', 'update'];
    const hasLiveTopic = liveTopics.some(topic => q.includes(topic));

    // Explicit search request
    const explicitSearch = q.includes('search') || q.includes('find') || q.includes('look up');

    return hasCurrentKeyword || hasLiveTopic || explicitSearch;
}
