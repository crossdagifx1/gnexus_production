/**
 * G-Nexus Image Generator Tool
 * AI-powered image generation with multiple styles
 */

import type { AITool, ToolInput, ToolOutput } from '../ai-chat-types';

// Image styles
const IMAGE_STYLES = {
    realistic: { name: 'Realistic', description: 'Photorealistic images' },
    artistic: { name: 'Artistic', description: 'Artistic and creative style' },
    anime: { name: 'Anime', description: 'Japanese anime style' },
    '3d': { name: '3D Render', description: '3D rendered graphics' },
    watercolor: { name: 'Watercolor', description: 'Watercolor painting style' },
    sketch: { name: 'Sketch', description: 'Pencil sketch style' },
    digital: { name: 'Digital Art', description: 'Digital artwork style' },
    fantasy: { name: 'Fantasy', description: 'Fantasy and magical style' },
} as const;

type ImageStyle = keyof typeof IMAGE_STYLES;

// Aspect ratios
const ASPECT_RATIOS = {
    square: { width: 1024, height: 1024, label: '1:1 (Square)' },
    portrait: { width: 768, height: 1024, label: '3:4 (Portrait)' },
    landscape: { width: 1024, height: 768, label: '4:3 (Landscape)' },
    wide: { width: 1280, height: 720, label: '16:9 (Wide)' },
    ultrawide: { width: 1920, height: 1080, label: '16:9 (HD)' },
} as const;

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function detectStyle(prompt: string): ImageStyle {
    const styleKeywords: Record<ImageStyle, string[]> = {
        realistic: ['realistic', 'photo', 'photograph', 'real', 'lifelike', 'true to life'],
        artistic: ['artistic', 'art', 'painting', 'creative', 'expressive'],
        anime: ['anime', 'manga', 'japanese animation', 'cartoon'],
        '3d': ['3d', 'render', 'cgi', 'three dimensional', 'blender', 'maya'],
        watercolor: ['watercolor', 'water colour', 'aquarelle', 'paint'],
        sketch: ['sketch', 'drawing', 'pencil', 'outline', 'doodle'],
        digital: ['digital', 'digital art', 'vector', 'graphic'],
        fantasy: ['fantasy', 'magical', 'mystical', 'enchanted', 'mythical'],
    };

    const lowerPrompt = prompt.toLowerCase();

    for (const [style, keywords] of Object.entries(styleKeywords)) {
        if (keywords.some(kw => lowerPrompt.includes(kw))) {
            return style as ImageStyle;
        }
    }

    return 'realistic';
}

function detectAspectRatio(prompt: string): keyof typeof ASPECT_RATIOS {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('wide') || lowerPrompt.includes('landscape') || lowerPrompt.includes('panoramic')) {
        return 'wide';
    }
    if (lowerPrompt.includes('portrait') || lowerPrompt.includes('tall') || lowerPrompt.includes('vertical')) {
        return 'portrait';
    }
    if (lowerPrompt.includes('hd') || lowerPrompt.includes('ultrawide') || lowerPrompt.includes('cinematic')) {
        return 'ultrawide';
    }
    if (lowerPrompt.includes('landscape')) {
        return 'landscape';
    }

    return 'square';
}

function enhancePrompt(prompt: string, style: ImageStyle): string {
    const styleEnhancements: Record<ImageStyle, string> = {
        realistic: ', highly detailed, photorealistic, 8k resolution, professional photography, sharp focus',
        artistic: ', artistic, creative composition, expressive brushstrokes, gallery quality',
        anime: ', anime style, vibrant colors, clean lines, studio ghibli inspired, detailed',
        '3d': ', 3D render, octane render, ray tracing, volumetric lighting, high poly',
        watercolor: ', watercolor painting, soft edges, flowing colors, artistic, delicate',
        sketch: ', pencil sketch, detailed linework, artistic drawing, hand-drawn style',
        digital: ', digital art, vector style, clean lines, vibrant colors, modern design',
        fantasy: ', fantasy art, magical atmosphere, ethereal lighting, mystical elements',
    };

    return prompt + styleEnhancements[style];
}

export const imageGenerator: AITool = {
    id: 'image-generator',
    name: 'Image Generator',
    description: 'Generate stunning AI images from text descriptions with multiple artistic styles',
    category: 'creation',
    icon: '🎨',
    keywords: ['image', 'generate', 'create', 'picture', 'art', 'photo', 'visual', 'draw'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: true,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const prompt = typeof input.content === 'string' ? input.content : '';
        await delay(2000);

        // Detect style and aspect ratio
        const style = detectStyle(prompt);
        const aspectRatio = detectAspectRatio(prompt);
        const enhancedPrompt = enhancePrompt(prompt, style);

        // Generate image URL using Pollinations.ai (free, no API key needed)
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const { width, height } = ASPECT_RATIOS[aspectRatio];
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

        return {
            success: true,
            content: imageUrl,
            metadata: {
                prompt: prompt,
                enhancedPrompt: enhancedPrompt,
                style: style,
                styleName: IMAGE_STYLES[style].name,
                aspectRatio: ASPECT_RATIOS[aspectRatio].label,
                width: width,
                height: height,
                seed: seed,
                generatedAt: new Date().toISOString(),
            },
        };
    },
};

// Additional image variation generator
export const imageVariationGenerator: AITool = {
    id: 'image-variation',
    name: 'Image Variations',
    description: 'Generate variations of an existing image with different styles',
    category: 'creation',
    icon: '🖼️',
    keywords: ['variation', 'modify', 'transform', 'style', 'remix'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: false,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const prompt = typeof input.content === 'string' ? input.content : '';
        await delay(2000);

        // Generate multiple variations
        const variations: string[] = [];
        const styles: ImageStyle[] = ['realistic', 'artistic', 'anime', 'digital'];

        for (const style of styles) {
            const enhancedPrompt = enhancePrompt(prompt, style);
            const encodedPrompt = encodeURIComponent(enhancedPrompt);
            const seed = Math.floor(Math.random() * 1000000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true`;
            variations.push(imageUrl);
        }

        return {
            success: true,
            content: `## 🎨 Image Variations Generated

### Original Prompt
"${prompt}"

### Variations

| Style | Image |
|-------|-------|
| Realistic | ![Realistic](${variations[0]}) |
| Artistic | ![Artistic](${variations[1]}) |
| Anime | ![Anime](${variations[2]}) |
| Digital | ![Digital](${variations[3]}) |

### Download Links
- [Realistic Version](${variations[0]})
- [Artistic Version](${variations[1]})
- [Anime Version](${variations[2]})
- [Digital Version](${variations[3]})

*Click on any image to view full size. Right-click to save.*`,
            metadata: {
                variations: variations,
                styles: styles,
                originalPrompt: prompt,
            },
        };
    },
};

// Image style transfer tool
export const styleTransferTool: AITool = {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Apply different artistic styles to image descriptions',
    category: 'creation',
    icon: '🎭',
    keywords: ['style', 'transfer', 'apply', 'transform', 'artistic'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: false,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const prompt = typeof input.content === 'string' ? input.content : '';
        await delay(1500);

        // Generate styled prompts
        const styledPrompts: Record<string, string> = {};

        for (const [styleKey, styleInfo] of Object.entries(IMAGE_STYLES)) {
            styledPrompts[styleKey] = enhancePrompt(prompt, styleKey as ImageStyle);
        }

        return {
            success: true,
            content: `## 🎭 Style Transfer Prompts

### Original Prompt
"${prompt}"

### Styled Prompts

${Object.entries(styledPrompts).map(([style, styledPrompt]) => `
#### ${IMAGE_STYLES[style as ImageStyle].name}
*${IMAGE_STYLES[style as ImageStyle].description}*

\`\`\`
${styledPrompt}
\`\`\`
`).join('\n')}

### Usage Tips
1. Copy any styled prompt above
2. Use it with the Image Generator tool
3. Adjust the style keywords for fine-tuning
4. Combine multiple styles for unique results`,
            metadata: {
                originalPrompt: prompt,
                styledPrompts: styledPrompts,
                availableStyles: Object.keys(IMAGE_STYLES),
            },
        };
    },
};

export default imageGenerator;
