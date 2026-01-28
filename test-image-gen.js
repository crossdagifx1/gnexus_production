// Test image generation
import { generateImage } from './src/lib/ai.ts';

async function testImageGen() {
    console.log('Testing image generation...');

    const result = await generateImage('a beautiful sunset over mountains', 'flux');

    console.log('Result:', result);

    if (result.success) {
        console.log('✅ Image URL:', result.data);
    } else {
        console.log('❌ Error:', result.error);
    }
}

testImageGen();
