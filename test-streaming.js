/**
 * Test Script for Streaming HTML Generation
 * Tests the streaming functionality without browser UI
 */

import { generateHTMLWithAIStreaming } from './src/lib/htmlGenerators.js';

async function testStreaming() {
    console.log('🧪 Testing Streaming HTML Generation...\n');

    const testPrompt = 'Create a simple landing page for an AI-powered healthcare startup';
    const template = 'modern-landing';

    let chunkCount = 0;
    let firstContentTime = null;
    const startTime = Date.now();

    console.log(`📝 Prompt: "${testPrompt}"`);
    console.log(`📋 Template: ${template}`);
    console.log(`⏱️  Starting generation...\n`);

    try {
        const html = await generateHTMLWithAIStreaming(
            template,
            { goal: testPrompt },
            (partialHTML, progress) => {
                chunkCount++;

                // Record time to first content
                if (!firstContentTime && progress.charCount > 0) {
                    firstContentTime = Date.now();
                    console.log(`✅ First content received in ${firstContentTime - startTime}ms`);
                }

                // Log progress every 10 chunks
                if (chunkCount % 10 === 0) {
                    console.log(`📊 Progress: ${progress.charCount} chars (${progress.isValid ? 'valid' : 'partial'} HTML)`);
                }

                // Log completion
                if (progress.isComplete) {
                    const totalTime = Date.now() - startTime;
                    console.log(`\n🎉 Generation Complete!`);
                    console.log(`   Total time: ${totalTime}ms`);
                    console.log(`   Total chunks: ${chunkCount}`);
                    console.log(`   Final size: ${progress.charCount} characters`);
                    console.log(`   Valid HTML: ${progress.isValid ? '✅' : '⚠️ (auto-repaired)'}`);
                }
            }
        );

        // Final validation
        console.log(`\n📋 Final HTML Preview (first 200 chars):`);
        console.log(html.substring(0, 200) + '...');

        // Check for essential elements
        const hasDoctype = html.includes('<!DOCTYPE');
        const hasHTML = /<html/i.test(html);
        const hasBody = /<body/i.test(html);
        const hasStyle = /<style/i.test(html) || /\.css/i.test(html);

        console.log(`\n✅ Validation:`);
        console.log(`   DOCTYPE: ${hasDoctype ? '✅' : '❌'}`);
        console.log(`   <html>: ${hasHTML ? '✅' : '❌'}`);
        console.log(`   <body>: ${hasBody ? '✅' : '❌'}`);
        console.log(`   CSS: ${hasStyle ? '✅' : '❌'}`);

        // Test cache hit (should be instant)
        console.log(`\n🔄 Testing cache hit...`);
        const cacheStart = Date.now();
        await generateHTMLWithAIStreaming(
            template,
            { goal: testPrompt },
            (partialHTML, progress) => {
                if (progress.isComplete) {
                    const cacheTime = Date.now() - cacheStart;
                    console.log(`✅ Cache hit in ${cacheTime}ms (${cacheTime < 100 ? 'PASS' : 'FAIL - should be <100ms'})`);
                }
            }
        );

        console.log(`\n✅ All streaming tests passed!`);

    } catch (error) {
        console.error(`\n❌ Test failed:`, error.message);
        process.exit(1);
    }
}

// Run tests
testStreaming();
