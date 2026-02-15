/**
 * G-Nexus Advanced AI Tools
 * Collection of advanced AI-powered tools for various tasks
 */

import type { AITool, ToolInput, ToolOutput } from '../ai-chat-types';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// DOCUMENT SUMMARIZER TOOL
// =============================================================================

export const documentSummarizer: AITool = {
    id: 'document-summarizer',
    name: 'Document Summarizer',
    description: 'Intelligently summarize documents, articles, and long texts with key insights extraction',
    category: 'analysis',
    icon: '📄',
    keywords: ['summarize', 'summary', 'tldr', 'document', 'article', 'text', 'condense'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: true,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const content = typeof input.content === 'string' ? input.content : '';
        await delay(1500);

        // Analyze content
        const wordCount = content.split(/\s+/).length;
        const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim()).length;

        // Extract key points (simulated)
        const keyPoints = extractKeyPoints(content);
        const topics = extractTopics(content);
        const sentiment = analyzeSentiment(content);

        // Generate summary
        const summaryLength = wordCount > 1000 ? 'detailed' : wordCount > 500 ? 'medium' : 'brief';
        const compressionRatio = summaryLength === 'detailed' ? 0.3 : summaryLength === 'medium' ? 0.2 : 0.1;

        return {
            success: true,
            content: `## 📄 Document Summary

### Overview
- **Word Count**: ${wordCount.toLocaleString()}
- **Sentences**: ${sentences}
- **Paragraphs**: ${paragraphs}
- **Reading Time**: ~${Math.ceil(wordCount / 200)} minutes
- **Summary Type**: ${summaryLength.charAt(0).toUpperCase() + summaryLength.slice(1)}

---

### 📝 Executive Summary

${generateSummary(content, compressionRatio)}

---

### 🔑 Key Points

${keyPoints.map((point, i) => `${i + 1}. **${point.title}**: ${point.content}`).join('\n\n')}

---

### 📊 Topics Identified

${topics.map(topic => `- ${topic}`).join('\n')}

---

### 💭 Sentiment Analysis

- **Overall Tone**: ${sentiment.tone}
- **Confidence**: ${sentiment.confidence}%
- **Subjectivity**: ${sentiment.subjectivity}

---

### 📈 Content Metrics

| Metric | Value |
|--------|-------|
| Complexity | ${sentiment.complexity} |
| Formality | ${sentiment.formality} |
| Readability | ${sentiment.readability}/100 |

---

*Want a different summary length? Ask for "brief", "medium", or "detailed" summary.*`,
            metadata: {
                wordCount,
                sentences,
                paragraphs,
                keyPoints,
                topics,
                sentiment,
                summaryLength,
            },
        };
    },
};

function extractKeyPoints(content: string): Array<{ title: string; content: string }> {
    // Simulated key point extraction
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const points: Array<{ title: string; content: string }> = [];

    // Take up to 5 key sentences
    const keySentences = sentences.slice(0, 5);

    keySentences.forEach((sentence, index) => {
        const words = sentence.trim().split(/\s+/).slice(0, 3).join(' ');
        points.push({
            title: `Point ${index + 1}`,
            content: sentence.trim() + '.',
        });
    });

    return points.length > 0 ? points : [
        { title: 'Main Topic', content: 'The document discusses the primary subject matter in detail.' },
        { title: 'Key Insight', content: 'Important information is presented throughout the content.' },
    ];
}

function extractTopics(content: string): string[] {
    // Simulated topic extraction
    const commonTopics = [
        'Technology', 'Business', 'Science', 'Health', 'Education',
        'Finance', 'Marketing', 'Development', 'Research', 'Innovation',
    ];

    // Simple keyword matching
    const topics: string[] = [];
    const lowerContent = content.toLowerCase();

    commonTopics.forEach(topic => {
        if (lowerContent.includes(topic.toLowerCase())) {
            topics.push(topic);
        }
    });

    return topics.length > 0 ? topics.slice(0, 5) : ['General Content'];
}

function analyzeSentiment(content: string): {
    tone: string;
    confidence: number;
    subjectivity: string;
    complexity: string;
    formality: string;
    readability: number;
} {
    // Simulated sentiment analysis
    const lowerContent = content.toLowerCase();

    let tone = 'Neutral';
    if (lowerContent.includes('great') || lowerContent.includes('excellent') || lowerContent.includes('amazing')) {
        tone = 'Positive';
    } else if (lowerContent.includes('bad') || lowerContent.includes('poor') || lowerContent.includes('terrible')) {
        tone = 'Negative';
    }

    const wordCount = content.split(/\s+/).length;
    const avgWordLength = content.replace(/\s/g, '').length / wordCount;

    return {
        tone,
        confidence: Math.floor(75 + Math.random() * 20),
        subjectivity: avgWordLength > 6 ? 'High' : avgWordLength > 4.5 ? 'Medium' : 'Low',
        complexity: avgWordLength > 6 ? 'Advanced' : avgWordLength > 4.5 ? 'Intermediate' : 'Basic',
        formality: content.includes('!') ? 'Casual' : 'Formal',
        readability: Math.floor(60 + Math.random() * 30),
    };
}

function generateSummary(content: string, ratio: number): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const targetLength = Math.max(2, Math.floor(sentences.length * ratio));

    // Take first and some middle sentences for summary
    const summarySentences = [
        sentences[0],
        ...sentences.slice(1, targetLength - 1),
        sentences[sentences.length - 1],
    ].filter(Boolean);

    return summarySentences.map(s => s.trim() + '.').join(' ');
}

// =============================================================================
// DATA ANALYZER TOOL
// =============================================================================

export const dataAnalyzer: AITool = {
    id: 'data-analyzer',
    name: 'Data Analyzer',
    description: 'Analyze data sets, identify patterns, and generate statistical insights',
    category: 'analysis',
    icon: '📊',
    keywords: ['data', 'analyze', 'statistics', 'metrics', 'patterns', 'insights', 'numbers'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: true,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const content = typeof input.content === 'string' ? input.content : '';
        await delay(1800);

        // Parse numbers from content
        const numbers = content.match(/-?\d+\.?\d*/g)?.map(Number) || [];

        // Calculate statistics
        const stats = calculateStatistics(numbers);
        const patterns = identifyPatterns(numbers);
        const outliers = findOutliers(numbers);
        const distribution = analyzeDistribution(numbers);

        return {
            success: true,
            content: `## 📊 Data Analysis Report

### Dataset Overview
- **Values Found**: ${numbers.length}
- **Data Type**: Numeric
- **Analysis Date**: ${new Date().toLocaleDateString()}

---

### 📈 Statistical Summary

| Metric | Value |
|--------|-------|
| **Mean** | ${stats.mean.toFixed(2)} |
| **Median** | ${stats.median.toFixed(2)} |
| **Mode** | ${stats.mode} |
| **Standard Deviation** | ${stats.stdDev.toFixed(2)} |
| **Variance** | ${stats.variance.toFixed(2)} |
| **Range** | ${stats.range.toFixed(2)} |
| **Min** | ${stats.min.toFixed(2)} |
| **Max** | ${stats.max.toFixed(2)} |
| **Sum** | ${stats.sum.toFixed(2)} |

---

### 📉 Distribution Analysis

- **Skewness**: ${distribution.skewness.toFixed(3)} (${distribution.skewInterpretation})
- **Kurtosis**: ${distribution.kurtosis.toFixed(3)} (${distribution.kurtosisInterpretation})
- **Distribution Type**: ${distribution.type}

---

### 🔍 Patterns Identified

${patterns.map(p => `- **${p.type}**: ${p.description}`).join('\n')}

---

### ⚠️ Outliers Detected

${outliers.length > 0
                    ? outliers.map(o => `- Value: ${o.value.toFixed(2)} (Z-score: ${o.zScore.toFixed(2)})`).join('\n')
                    : 'No significant outliers detected.'}

---

### 💡 Insights & Recommendations

1. **Data Quality**: ${numbers.length > 30 ? 'Good sample size for reliable analysis' : 'Consider collecting more data for better accuracy'}
2. **Variability**: ${stats.stdDev / stats.mean < 0.1 ? 'Low variability - data is consistent' : 'High variability - data is spread out'}
3. **Normality**: ${distribution.type === 'Normal' ? 'Data follows normal distribution' : 'Data may not be normally distributed'}

---

### 📊 Visualization Suggestions

- **Histogram**: To visualize distribution
- **Box Plot**: To identify outliers
- **Line Chart**: To show trends over time
- **Scatter Plot**: To identify correlations`,
            metadata: {
                valueCount: numbers.length,
                statistics: stats,
                distribution,
                patterns,
                outliers: outliers.length,
            },
        };
    },
};

function calculateStatistics(numbers: number[]): {
    mean: number;
    median: number;
    mode: number;
    stdDev: number;
    variance: number;
    range: number;
    min: number;
    max: number;
    sum: number;
} {
    if (numbers.length === 0) {
        return { mean: 0, median: 0, mode: 0, stdDev: 0, variance: 0, range: 0, min: 0, max: 0, sum: 0 };
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;

    // Median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Mode
    const frequency: Record<number, number> = {};
    numbers.forEach(n => frequency[n] = (frequency[n] || 0) + 1);
    const mode = Number(Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 0);

    // Variance and StdDev
    const variance = numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    return {
        mean,
        median,
        mode,
        stdDev,
        variance,
        range: sorted[sorted.length - 1] - sorted[0],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        sum,
    };
}

function identifyPatterns(numbers: number[]): Array<{ type: string; description: string }> {
    const patterns: Array<{ type: string; description: string }> = [];

    if (numbers.length < 3) {
        return [{ type: 'Insufficient Data', description: 'Need at least 3 data points for pattern analysis' }];
    }

    // Trend detection
    const firstHalf = numbers.slice(0, Math.floor(numbers.length / 2));
    const secondHalf = numbers.slice(Math.floor(numbers.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.1) {
        patterns.push({ type: 'Upward Trend', description: 'Data shows an increasing trend' });
    } else if (secondAvg < firstAvg * 0.9) {
        patterns.push({ type: 'Downward Trend', description: 'Data shows a decreasing trend' });
    } else {
        patterns.push({ type: 'Stable Trend', description: 'Data remains relatively stable' });
    }

    // Volatility
    const changes = numbers.slice(1).map((n, i) => Math.abs(n - numbers[i]));
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    if (avgChange > (firstAvg + secondAvg) / 2 * 0.2) {
        patterns.push({ type: 'High Volatility', description: 'Significant fluctuations between data points' });
    }

    return patterns;
}

function findOutliers(numbers: number[]): Array<{ value: number; zScore: number }> {
    if (numbers.length < 3) return [];

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const stdDev = Math.sqrt(numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / numbers.length);

    if (stdDev === 0) return [];

    return numbers
        .map(n => ({ value: n, zScore: Math.abs((n - mean) / stdDev) }))
        .filter(o => o.zScore > 2);
}

function analyzeDistribution(numbers: number[]): {
    skewness: number;
    kurtosis: number;
    skewInterpretation: string;
    kurtosisInterpretation: string;
    type: string;
} {
    if (numbers.length < 4) {
        return {
            skewness: 0,
            kurtosis: 0,
            skewInterpretation: 'Insufficient data',
            kurtosisInterpretation: 'Insufficient data',
            type: 'Unknown',
        };
    }

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
        return {
            skewness: 0,
            kurtosis: 0,
            skewInterpretation: 'No variation',
            kurtosisInterpretation: 'No variation',
            type: 'Constant',
        };
    }

    // Calculate skewness
    const skewness = numbers.reduce((acc, n) => acc + Math.pow((n - mean) / stdDev, 3), 0) / numbers.length;

    // Calculate kurtosis
    const kurtosis = numbers.reduce((acc, n) => acc + Math.pow((n - mean) / stdDev, 4), 0) / numbers.length - 3;

    return {
        skewness,
        kurtosis,
        skewInterpretation: skewness > 0.5 ? 'Right-skewed' : skewness < -0.5 ? 'Left-skewed' : 'Symmetric',
        kurtosisInterpretation: kurtosis > 1 ? 'Heavy-tailed (Leptokurtic)' : kurtosis < -1 ? 'Light-tailed (Platykurtic)' : 'Normal-like (Mesokurtic)',
        type: Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 1 ? 'Normal' : 'Non-normal',
    };
}

// =============================================================================
// TRANSLATOR TOOL
// =============================================================================

export const translator: AITool = {
    id: 'translator',
    name: 'Translator',
    description: 'Translate text between multiple languages with context awareness',
    category: 'communication',
    icon: '🌍',
    keywords: ['translate', 'translation', 'language', 'convert', 'spanish', 'french', 'german', 'chinese', 'japanese'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: true,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const content = typeof input.content === 'string' ? input.content : '';
        await delay(1200);

        // Detect source and target languages
        const { sourceLang, targetLang, text } = parseTranslationRequest(content);

        // Generate translations (simulated)
        const translations = generateTranslations(text, sourceLang, targetLang);

        return {
            success: true,
            content: `## 🌍 Translation Results

### Detected Languages
- **Source**: ${sourceLang}
- **Target**: ${targetLang}

---

### Original Text
> "${text}"

---

### Translation

**${targetLang}**:
> "${translations.primary}"

---

### Alternative Translations

${translations.alternatives.map((alt, i) => `${i + 1}. "${alt}"`).join('\n\n')}

---

### 📚 Language Notes

- **Formality**: ${translations.formality}
- **Context**: ${translations.context}
- **Confidence**: ${translations.confidence}%

---

### 💡 Usage Tips

1. Context matters - the same word can have different translations
2. Consider the audience (formal vs informal)
3. Idioms may not translate literally
4. Regional variations exist within languages

---

*Need a different language? Specify the target language in your request.*`,
            metadata: {
                sourceLang,
                targetLang,
                originalText: text,
                translations,
            },
        };
    },
};

function parseTranslationRequest(content: string): {
    sourceLang: string;
    targetLang: string;
    text: string;
} {
    const languagePatterns: Record<string, RegExp> = {
        'Spanish': /(?:to\s+)?spanish|español/i,
        'French': /(?:to\s+)?french|français/i,
        'German': /(?:to\s+)?german|deutsch/i,
        'Chinese': /(?:to\s+)?chinese|中文/i,
        'Japanese': /(?:to\s+)?japanese|日本語/i,
        'Korean': /(?:to\s+)?korean|한국어/i,
        'Portuguese': /(?:to\s+)?portuguese|português/i,
        'Italian': /(?:to\s+)?italian|italiano/i,
        'Russian': /(?:to\s+)?russian|русский/i,
        'Arabic': /(?:to\s+)?arabic|العربية/i,
    };

    let targetLang = 'Spanish'; // Default
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(content)) {
            targetLang = lang;
            break;
        }
    }

    // Extract text to translate (remove language indicators)
    let text = content
        .replace(/translate\s+(to\s+)?\w+:?\s*/i, '')
        .replace(/to\s+(spanish|french|german|chinese|japanese|korean|portuguese|italian|russian|arabic):?\s*/i, '')
        .trim();

    return {
        sourceLang: 'English',
        targetLang,
        text: text || content,
    };
}

function generateTranslations(text: string, sourceLang: string, targetLang: string): {
    primary: string;
    alternatives: string[];
    formality: string;
    context: string;
    confidence: number;
} {
    // Simulated translation - in production, this would call a translation API
    const translations: Record<string, string> = {
        'Spanish': `[Traducción al español: ${text}]`,
        'French': `[Traduction en français: ${text}]`,
        'German': `[Deutsche Übersetzung: ${text}]`,
        'Chinese': `[中文翻译: ${text}]`,
        'Japanese': `[日本語訳: ${text}]`,
        'Korean': `[한국어 번역: ${text}]`,
        'Portuguese': `[Tradução em português: ${text}]`,
        'Italian': `[Traduzione in italiano: ${text}]`,
        'Russian': `[Русский перевод: ${text}]`,
        'Arabic': `[الترجمة العربية: ${text}]`,
    };

    const primary = translations[targetLang] || `[Translation: ${text}]`;

    return {
        primary,
        alternatives: [
            `${primary} (formal)`,
            `${primary} (informal)`,
        ],
        formality: 'Neutral',
        context: 'General',
        confidence: 85 + Math.floor(Math.random() * 10),
    };
}

// =============================================================================
// CHART GENERATOR TOOL
// =============================================================================

export const chartGenerator: AITool = {
    id: 'chart-generator',
    name: 'Chart Generator',
    description: 'Create beautiful charts and visualizations from data',
    category: 'creation',
    icon: '📈',
    keywords: ['chart', 'graph', 'plot', 'visualize', 'visualization', 'data', 'diagram'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: false,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const content = typeof input.content === 'string' ? input.content : '';
        await delay(1500);

        // Parse data and detect chart type
        const data = parseChartData(content);
        const chartType = detectChartType(content);
        const chartConfig = generateChartConfig(data, chartType);

        return {
            success: true,
            content: `## 📈 Chart Generated

### Chart Type: ${chartType.name}

${chartType.description}

---

### 📊 Data Configuration

\`\`\`json
${JSON.stringify(chartConfig, null, 2)}
\`\`\`

---

### 🎨 Visualization Preview

\`\`\`
${generateASCIIChart(data, chartType.type)}
\`\`\`

---

### 📋 Chart Data

| Label | Value |
|-------|-------|
${data.labels.map((label, i) => `| ${label} | ${data.values[i]} |`).join('\n')}

---

### 💡 Customization Options

1. **Colors**: Customize the color palette
2. **Labels**: Add axis labels and title
3. **Legend**: Show/hide legend
4. **Animation**: Enable/disable animations
5. **Export**: Save as PNG, SVG, or PDF

---

### 🔧 Integration Code

\`\`\`javascript
// Using Chart.js
const chart = new Chart(ctx, {
    type: '${chartType.type}',
    data: {
        labels: ${JSON.stringify(data.labels)},
        datasets: [{
            label: 'Dataset',
            data: ${JSON.stringify(data.values)},
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    }
});
\`\`\`

---

*Want a different chart type? Specify: bar, line, pie, doughnut, radar, or area*`,
            metadata: {
                chartType: chartType.type,
                dataPoints: data.labels.length,
                chartConfig,
            },
        };
    },
};

function parseChartData(content: string): { labels: string[]; values: number[] } {
    // Extract numbers
    const numbers = content.match(/-?\d+\.?\d*/g)?.map(Number) || [10, 20, 30, 40, 50];

    // Generate labels if not present
    const labels = numbers.map((_, i) => `Item ${i + 1}`);

    return { labels, values: numbers.slice(0, 10) }; // Limit to 10 items
}

function detectChartType(content: string): { type: string; name: string; description: string } {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('pie') || lowerContent.includes('donut') || lowerContent.includes('doughnut')) {
        return { type: 'pie', name: 'Pie Chart', description: 'Best for showing proportions and percentages' };
    }
    if (lowerContent.includes('line') || lowerContent.includes('trend')) {
        return { type: 'line', name: 'Line Chart', description: 'Best for showing trends over time' };
    }
    if (lowerContent.includes('bar') || lowerContent.includes('column')) {
        return { type: 'bar', name: 'Bar Chart', description: 'Best for comparing quantities across categories' };
    }
    if (lowerContent.includes('radar') || lowerContent.includes('spider')) {
        return { type: 'radar', name: 'Radar Chart', description: 'Best for comparing multiple variables' };
    }
    if (lowerContent.includes('area')) {
        return { type: 'area', name: 'Area Chart', description: 'Best for showing cumulative data over time' };
    }

    // Default to bar chart
    return { type: 'bar', name: 'Bar Chart', description: 'Best for comparing quantities across categories' };
}

function generateChartConfig(data: { labels: string[]; values: number[] }, chartType: { type: string }): object {
    return {
        type: chartType.type,
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Generated Chart' },
            },
        },
    };
}

function generateASCIIChart(data: { labels: string[]; values: number[] }, type: string): string {
    const maxValue = Math.max(...data.values);
    const scale = 10 / maxValue;

    if (type === 'pie') {
        return `
    ╭───────╮
   ╱   25%   ╲
  │   Item 1   │
  │    🟢      │
   ╲   75%    ╱
    ╰───────╯
    (Others)
        `;
    }

    // Bar chart ASCII
    let chart = '\n';
    data.values.slice(0, 5).forEach((value, i) => {
        const bars = '█'.repeat(Math.round(value * scale));
        chart += `${data.labels[i].padEnd(8)} │${bars} ${value}\n`;
    });
    chart += '         └' + '─'.repeat(15) + '\n';

    return chart;
}

// =============================================================================
// MIND MAP CREATOR TOOL
// =============================================================================

export const mindMapCreator: AITool = {
    id: 'mind-map-creator',
    name: 'Mind Map Creator',
    description: 'Generate visual mind maps from topics and concepts',
    category: 'creation',
    icon: '🧠',
    keywords: ['mindmap', 'mind map', 'brainstorm', 'concept', 'idea', 'diagram', 'structure'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: false,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const content = typeof input.content === 'string' ? input.content : '';
        await delay(1500);

        // Generate mind map structure
        const mindMap = generateMindMap(content);

        return {
            success: true,
            content: `## 🧠 Mind Map Generated

### Central Topic: "${mindMap.central}"

---

### 📊 Mind Map Structure

\`\`\`
                    ┌─────────────┐
                    │  ${mindMap.central.padEnd(11)}  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────┴────┐        ┌────┴────┐        ┌────┴────┐
   │ ${mindMap.branches[0]?.name.padEnd(7) || 'Branch 1'} │        │ ${mindMap.branches[1]?.name.padEnd(7) || 'Branch 2'} │        │ ${mindMap.branches[2]?.name.padEnd(7) || 'Branch 3'} │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
   ┌────┴────┐        ┌────┴────┐        ┌────┴────┐
   │ Sub 1   │        │ Sub 1   │        │ Sub 1   │
   └─────────┘        └─────────┘        └─────────┘
\`\`\`

---

### 🌿 Branches & Sub-topics

${mindMap.branches.map((branch, i) => `
#### ${i + 1}. ${branch.name}
${branch.subtopics.map((sub, j) => `   ${j + 1}. ${sub}`).join('\n')}
`).join('\n')}

---

### 📝 Mermaid Diagram Code

\`\`\`mermaid
mindmap
  root(${mindMap.central})
${mindMap.branches.map(branch => `    ${branch.name}
${branch.subtopics.map(sub => `      ${sub}`).join('\n')}`).join('\n')}
\`\`\`

---

### 💡 Usage Tips

1. Click on nodes to expand/collapse
2. Drag nodes to rearrange
3. Double-click to edit
4. Export as PNG or PDF
5. Share with team members

---

*Want to add more branches or modify the structure? Just ask!*`,
            metadata: {
                central: mindMap.central,
                branchCount: mindMap.branches.length,
                totalNodes: mindMap.branches.reduce((acc, b) => acc + b.subtopics.length + 1, 1),
            },
        };
    },
};

function generateMindMap(content: string): {
    central: string;
    branches: Array<{ name: string; subtopics: string[] }>;
} {
    // Extract main topic
    const words = content.split(/\s+/).filter(w => w.length > 3);
    const central = words.slice(0, 3).join(' ') || 'Main Topic';

    // Generate branches based on content
    const branchNames = ['Concepts', 'Ideas', 'Details', 'Examples', 'Related'];
    const branches = branchNames.slice(0, 3 + Math.floor(Math.random() * 3)).map(name => ({
        name,
        subtopics: [
            `Subtopic A for ${name}`,
            `Subtopic B for ${name}`,
            `Subtopic C for ${name}`,
        ],
    }));

    return { central, branches };
}

// =============================================================================
// EXPORT ALL TOOLS
// =============================================================================

export const advancedTools = [
    documentSummarizer,
    dataAnalyzer,
    translator,
    chartGenerator,
    mindMapCreator,
];

export default advancedTools;
