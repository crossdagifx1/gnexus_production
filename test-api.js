
const OPENROUTER_API_KEY = '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';

async function testModel(modelId) {
    console.log(`\n🧪 Testing model: ${modelId}`);
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'X-Title': 'G-Nexus Test',
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 50,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`✅ Success content: "${data.choices[0]?.message?.content || ''}"`);
            console.log(`Full Response: ${JSON.stringify(data, null, 2)}`);
        } else {
            console.log(`❌ Error (${response.status}): ${data.error?.message || JSON.stringify(data)}`);
        }
    } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
    }
}

async function runTests() {
    await testModel('deepseek/deepseek-r1-0528:free');
    await testModel('google/gemini-2.0-flash-exp:free'); // Test another free model to verify API key
}

runTests();
