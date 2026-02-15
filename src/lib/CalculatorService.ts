/**
 * Calculator Service
 * Handles mathematical expressions, statistics, and conversions
 */

export interface CalculationResult {
    success: boolean;
    result?: number | string;
    formatted?: string;
    error?: string;
    steps?: string[];
}

/**
 * Evaluate a mathematical expression
 */
export async function calculate(expression: string): Promise<CalculationResult> {
    try {
        console.log(`[Calculator] Evaluating: "${expression}"`);

        // Clean the expression
        const cleaned = expression
            .toLowerCase()
            .replace(/what's|what is|calculate|compute/gi, '')
            .trim();

        // Special handlers
        if (cleaned.includes('percentage') || cleaned.includes('%')) {
            return handlePercentage(cleaned);
        }

        if (cleaned.includes('average') || cleaned.includes('mean')) {
            return handleAverage(cleaned);
        }

        if (cleaned.includes('tip')) {
            return handleTip(cleaned);
        }

        // Use AI for complex calculations
        const { generateText } = await import('./ai');

        const calcPrompt = `Solve this mathematical problem and return ONLY the final numeric answer with appropriate units:

"${expression}"

Return format: just the number and unit (e.g., "42" or "$150.50" or "75%")`;

        const aiResult = await generateText('agentic', calcPrompt, {
            temperature: 0.1,
            max_new_tokens: 100
        });

        if (aiResult.success && aiResult.data) {
            const answer = aiResult.data.trim();

            return {
                success: true,
                result: answer,
                formatted: answer,
                steps: [`Calculation: ${expression}`, `Result: ${answer}`]
            };
        }

        throw new Error('AI calculation failed');

    } catch (error: any) {
        console.error('[Calculator] Error:', error);
        return {
            success: false,
            error: error.message || 'Calculation failed'
        };
    }
}

/**
 * Handle percentage calculations
 */
function handlePercentage(expr: string): CalculationResult {
    // Extract numbers: "15% of 500" or "15 percent of 500"
    const match = expr.match(/(\d+\.?\d*)\s*(?:%|percent)\s*(?:of|on)?\s*(\d+\.?\d*)/);

    if (match) {
        const percent = parseFloat(match[1]);
        const value = parseFloat(match[2]);
        const result = (percent / 100) * value;

        return {
            success: true,
            result: result,
            formatted: `$${result.toFixed(2)}`,
            steps: [
                `${percent}% of $${value}`,
                `= (${percent} / 100) × ${value}`,
                `= $${result.toFixed(2)}`
            ]
        };
    }

    return { success: false, error: 'Could not parse percentage' };
}

/**
 * Handle average calculations
 */
function handleAverage(expr: string): CalculationResult {
    const numbers = expr.match(/\d+\.?\d*/g);

    if (numbers && numbers.length > 0) {
        const values = numbers.map(n => parseFloat(n));
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;

        return {
            success: true,
            result: avg,
            formatted: avg.toFixed(2),
            steps: [
                `Values: ${values.join(', ')}`,
                `Sum: ${sum}`,
                `Count: ${values.length}`,
                `Average: ${avg.toFixed(2)}`
            ]
        };
    }

    return { success: false, error: 'Could not find numbers' };
}

/**
 * Handle tip calculations
 */
function handleTip(expr: string): CalculationResult {
    // "15% tip on $85.50"
    const match = expr.match(/(\d+\.?\d*)\s*(?:%|percent)?\s*(?:tip)?\s*(?:on|of)?\s*\$?(\d+\.?\d*)/);

    if (match) {
        const tipPercent = parseFloat(match[1]);
        const billAmount = parseFloat(match[2]);
        const tipAmount = (tipPercent / 100) * billAmount;
        const total = billAmount + tipAmount;

        return {
            success: true,
            result: tipAmount,
            formatted: `Tip: $${tipAmount.toFixed(2)} (Total: $${total.toFixed(2)})`,
            steps: [
                `Bill: $${billAmount.toFixed(2)}`,
                `Tip: ${tipPercent}%`,
                `Tip Amount: $${tipAmount.toFixed(2)}`,
                `Total: $${total.toFixed(2)}`
            ]
        };
    }

    return { success: false, error: 'Could not parse tip calculation' };
}
