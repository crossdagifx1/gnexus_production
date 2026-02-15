// Test image generation
import { generateImage } from './src/lib/ai.ts';

// Set environment variable for Node.js testing
process.env.VITE_OPENROUTER_API_KEY = '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';

async function testImageGen() {
    console.log('Testing image generation...');
    console.log('Using API Key:', process.env.VITE_OPENROUTER_API_KEY ? '✅ Available' : '❌ Missing');

    try {
        const result = await generateImage('a beautiful sunset over mountains', 'flux');

        console.log('Result:', result);

        if (result.success && result.data) {
            console.log('✅ Image generation successful!');
            console.log('📸 Generated', result.data.length, 'image(s)');
            console.log('🔗 First image URL:', result.data[0]?.url);
            console.log('💰 Cost estimate:', result.cost_estimate);
            console.log('⏱️ Latency:', result.latency, 'ms');
            console.log('🤖 Model used:', result.model_used);
        } else {
            console.log('❌ Error:', result.error);
        }
    } catch (error) {
        console.error('💥 Unexpected error:', error.message);
    }
}

testImageGen();
