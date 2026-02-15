/**
 * G-NEXUS HTML Validation & Auto-Repair System
 * 
 * Ensures AI-generated HTML is valid and complete.
 * Automatically repairs common issues like truncated output and missing tags.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationError {
    type: 'missing_doctype' | 'unclosed_tag' | 'missing_html' | 'missing_head' | 'missing_body' | 'broken_structure' | 'invalid_script';
    message: string;
    severity: 'error' | 'warning';
    line?: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    repaired?: string;
    stats: {
        totalChecks: number;
        errorsFound: number;
        warningsFound: number;
        repairsApplied: number;
    };
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates HTML structure and returns detailed results
 */
export function validateHTML(html: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let repaired: string | undefined;

    // Check 1: DOCTYPE present
    if (!html.trim().toLowerCase().startsWith('<!doctype html>')) {
        errors.push({
            type: 'missing_doctype',
            message: 'Missing DOCTYPE declaration',
            severity: 'error'
        });
    }

    // Check 2: Essential HTML elements
    const hasHtmlTag = /<html[^>]*>/i.test(html);
    const hasClosingHtml = /<\/html>/i.test(html);
    const hasHeadTag = /<head[^>]*>/i.test(html);
    const hasBodyTag = /<body[^>]*>/i.test(html);
    const hasClosingBody = /<\/body>/i.test(html);

    if (!hasHtmlTag) {
        errors.push({
            type: 'missing_html',
            message: 'Missing <html> opening tag',
            severity: 'error'
        });
    }

    if (!hasClosingHtml) {
        errors.push({
            type: 'unclosed_tag',
            message: 'Missing </html> closing tag',
            severity: 'error'
        });
    }

    if (!hasHeadTag) {
        warnings.push({
            type: 'missing_head',
            message: 'Missing <head> section',
            severity: 'warning'
        });
    }

    if (!hasBodyTag) {
        errors.push({
            type: 'missing_body',
            message: 'Missing <body> opening tag',
            severity: 'error'
        });
    }

    if (!hasClosingBody) {
        errors.push({
            type: 'unclosed_tag',
            message: 'Missing </body> closing tag',
            severity: 'error'
        });
    }

    // Check 3: Common unclosed tags
    const commonTags = ['div', 'section', 'header', 'footer', 'nav', 'main', 'article', 'aside', 'form'];
    for (const tag of commonTags) {
        const openCount = (html.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
        const closeCount = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;

        if (openCount > closeCount) {
            warnings.push({
                type: 'unclosed_tag',
                message: `Unclosed <${tag}> tags detected (${openCount} open, ${closeCount} closed)`,
                severity: 'warning'
            });
        }
    }

    // Check 4: Script tag errors (basic check)
    const scriptBlocks = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    for (const block of scriptBlocks) {
        const content = block.replace(/<script[^>]*>|<\/script>/gi, '');

        // Check for obvious syntax errors
        if (content.includes('function') && !content.includes('{')) {
            warnings.push({
                type: 'invalid_script',
                message: 'Potentially incomplete JavaScript function',
                severity: 'warning'
            });
        }
    }

    // Check 5: Style tag completeness
    const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
    if (styleBlocks.length === 0) {
        warnings.push({
            type: 'broken_structure',
            message: 'No CSS found - page may not be styled',
            severity: 'warning'
        });
    }

    // If errors found, attempt repair
    if (errors.length > 0) {
        repaired = repairHTML(html);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        repaired,
        stats: {
            totalChecks: 5,
            errorsFound: errors.length,
            warningsFound: warnings.length,
            repairsApplied: repaired ? errors.length : 0
        }
    };
}

// =============================================================================
// AUTO-REPAIR FUNCTIONS
// =============================================================================

/**
 * Automatically repairs common HTML issues
 */
export function repairHTML(html: string): string {
    let repaired = html.trim();

    // Repair 1: Add DOCTYPE if missing
    if (!repaired.toLowerCase().startsWith('<!doctype html>')) {
        repaired = '<!DOCTYPE html>\n' + repaired;
    }

    // Repair 2: Wrap in <html> if missing
    if (!/<html[^>]*>/i.test(repaired)) {
        repaired = '<html lang="en">\n' + repaired;
    }

    // Ensure closing </html>
    if (!/<\/html>/i.test(repaired)) {
        repaired = repaired + '\n</html>';
    }

    // Repair 3: Add <head> if missing
    if (!/<head[^>]*>/i.test(repaired)) {
        const htmlMatch = repaired.match(/<html[^>]*>/i);
        if (htmlMatch) {
            const insertPos = htmlMatch.index! + htmlMatch[0].length;
            repaired = repaired.slice(0, insertPos) + '\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Page</title>\n</head>' + repaired.slice(insertPos);
        }
    }

    // Repair 4: Add <body> wrapper if missing
    if (!/<body[^>]*>/i.test(repaired)) {
        const headCloseMatch = repaired.match(/<\/head>/i);
        if (headCloseMatch) {
            const insertPos = headCloseMatch.index! + headCloseMatch[0].length;
            repaired = repaired.slice(0, insertPos) + '\n<body>' + repaired.slice(insertPos);
        }
    }

    // Repair 5: Close </body> before </html>
    if (!/<\/body>/i.test(repaired)) {
        const htmlCloseMatch = repaired.match(/<\/html>/i);
        if (htmlCloseMatch) {
            repaired = repaired.slice(0, htmlCloseMatch.index!) + '\n</body>\n' + repaired.slice(htmlCloseMatch.index!);
        }
    }

    // Repair 6: Fix common unclosed tags (best effort)
    const commonTags = ['div', 'section', 'header', 'footer', 'nav', 'main'];
    for (const tag of commonTags) {
        const openCount = (repaired.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
        const closeCount = (repaired.match(new RegExp(`</${tag}>`, 'gi')) || []).length;

        if (openCount > closeCount) {
            const diff = openCount - closeCount;
            const bodyClosePos = repaired.lastIndexOf('</body>');
            if (bodyClosePos !== -1) {
                const closingTags = Array(diff).fill(`</${tag}>`).join('\n');
                repaired = repaired.slice(0, bodyClosePos) + '\n' + closingTags + '\n' + repaired.slice(bodyClosePos);
            }
        }
    }

    return repaired;
}

/**
 * Quick check if HTML appears complete
 */
export function isHTMLComplete(html: string): boolean {
    const trimmed = html.trim();
    return (
        trimmed.toLowerCase().includes('<!doctype html>') &&
        /<html[^>]*>/i.test(trimmed) &&
        /<\/html>/i.test(trimmed) &&
        /<body[^>]*>/i.test(trimmed) &&
        /<\/body>/i.test(trimmed)
    );
}

/**
 * Extract validation summary for logging
 */
export function getValidationSummary(result: ValidationResult): string {
    const { stats, errors, warnings } = result;

    if (result.isValid) {
        return `✓ HTML is valid (${warnings.length} warnings)`;
    }

    return `✗ HTML validation failed: ${errors.length} errors, ${warnings.length} warnings${result.repaired ? ' (auto-repaired)' : ''}`;
}

// =============================================================================
// EXPORT DEFAULT VALIDATOR
// =============================================================================

export default {
    validate: validateHTML,
    repair: repairHTML,
    isComplete: isHTMLComplete,
    getSummary: getValidationSummary
};
