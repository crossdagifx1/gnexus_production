/**
 * G-NEXUS Request Caching System
 * 
 * Caches AI-generated HTML to provide instant responses for similar prompts.
 * Implements TTL-based expiration and hit/miss tracking.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CacheEntry {
    html: string;
    templateId: string;
    prompt: string;
    timestamp: number;
    metadata: {
        industry?: string;
        analysis?: string;
        validationPassed?: boolean;
    };
}

export interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    oldestEntry?: number;
    newestEntry?: number;
}

// =============================================================================
// CACHE IMPLEMENTATION
// =============================================================================

export class GenerationCache {
    private cache = new Map<string, CacheEntry>();
    private hits = 0;
    private misses = 0;
    private readonly TTL: number;
    private readonly MAX_SIZE: number;

    constructor(ttlMs: number = 3600000, maxSize: number = 100) {
        this.TTL = ttlMs; // Default 1 hour
        this.MAX_SIZE = maxSize;
    }

    /**
     * Get cached HTML if available and not expired
     */
    get(key: string): string | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        // Check if expired
        const age = Date.now() - entry.timestamp;
        if (age > this.TTL) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        console.log(`[Cache] HIT - Key: ${key.slice(0, 20)}... (age: ${Math.round(age / 1000)}s)`);
        return entry.html;
    }

    /**
     * Store HTML in cache
     */
    set(key: string, entry: CacheEntry): void {
        // Enforce max size - remove oldest entries
        if (this.cache.size >= this.MAX_SIZE) {
            this.evictOldest();
        }

        entry.timestamp = Date.now();
        this.cache.set(key, entry);
        console.log(`[Cache] SET - Key: ${key.slice(0, 20)}... (size: ${this.cache.size})`);
    }

    /**
     * Remove oldest cache entry (LRU-style eviction)
     */
    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            console.log(`[Cache] EVICTED - Oldest entry removed (size now: ${this.cache.size})`);
        }
    }

    /**
     * Clear all cached entries
     */
    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
        console.log(`[Cache] CLEARED - Removed ${size} entries`);
    }

    /**
     * Remove expired entries
     */
    cleanup(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.TTL) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`[Cache] CLEANUP - Removed ${removed} expired entries`);
        }

        return removed;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? this.hits / total : 0;

        let oldestEntry: number | undefined;
        let newestEntry: number | undefined;

        if (this.cache.size > 0) {
            const timestamps = Array.from(this.cache.values()).map(e => e.timestamp);
            oldestEntry = Math.min(...timestamps);
            newestEntry = Math.max(...timestamps);
        }

        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate,
            oldestEntry,
            newestEntry
        };
    }

    /**
     * Check if a key exists in cache (without updating hit/miss)
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        const age = Date.now() - entry.timestamp;
        return age <= this.TTL;
    }

    /**
     * Get entry metadata without retrieving full HTML
     */
    getMetadata(key: string): CacheEntry['metadata'] | null {
        const entry = this.cache.get(key);
        return entry?.metadata || null;
    }
}

// =============================================================================
// CACHE KEY GENERATION
// =============================================================================

/**
 * Generate cache key from template ID and prompt
 */
export function generateCacheKey(templateId: string, prompt: string, industry?: string): string {
    const normalizedPrompt = prompt.toLowerCase().trim();
    const hash = simpleHash(normalizedPrompt);
    const industryPart = industry ? `:${industry}` : '';
    return `${templateId}${industryPart}:${hash}`;
}

/**
 * Simple hash function for strings
 */
function simpleHash(str: string): string {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to base36 for compact representation
    return Math.abs(hash).toString(36);
}

/**
 * Generate semantic cache key (for future enhancement with embeddings)
 */
export function generateSemanticCacheKey(
    templateId: string,
    prompt: string,
    industry?: string,
    embedding?: number[]
): string {
    // For now, use standard hash
    // In future, could use embedding similarity for cache hits
    return generateCacheKey(templateId, prompt, industry);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

// Global cache instance with 1-hour TTL and max 100 entries
export const generationCache = new GenerationCache(3600000, 100);

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        generationCache.cleanup();
    }, 300000); // 5 minutes
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format cache stats for display
 */
export function formatCacheStats(stats: CacheStats): string {
    const hitRatePercent = (stats.hitRate * 100).toFixed(1);
    const totalRequests = stats.hits + stats.misses;

    return `Cache: ${stats.size} entries | ${stats.hits}/${totalRequests} hits (${hitRatePercent}%)`;
}

/**
 * Get cache age in human-readable format
 */
export function getCacheAge(timestamp: number): string {
    const ageMs = Date.now() - timestamp;
    const ageSeconds = Math.floor(ageMs / 1000);

    if (ageSeconds < 60) return `${ageSeconds}s ago`;

    const ageMinutes = Math.floor(ageSeconds / 60);
    if (ageMinutes < 60) return `${ageMinutes}m ago`;

    const ageHours = Math.floor(ageMinutes / 60);
    return `${ageHours}h ago`;
}

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default {
    cache: generationCache,
    generateKey: generateCacheKey,
    formatStats: formatCacheStats,
    getCacheAge
};
