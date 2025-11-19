// Verify Gemini API quota after account activation
const API_KEY = 'AIzaSyAXwLp0cwVXlgf2Pk3E4DZcsAAmh_9WsDA';
const MODEL = 'gemini-3-pro-preview';

async function verifyQuotaUpgrade() {
    console.log('🔍 Checking your Gemini API quota status...\n');

    // Make multiple rapid requests to test rate limits
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
        requests.push(
            fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `Test request ${i + 1}` }]
                        }]
                    })
                }
            )
        );
    }

    try {
        const responses = await Promise.all(requests);
        const endTime = Date.now();
        const duration = endTime - startTime;

        let successCount = 0;
        let rateLimitCount = 0;

        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            if (response.ok) {
                successCount++;
                console.log(`✅ Request ${i + 1}: Success`);
            } else {
                const error = await response.json();
                if (error.error?.message?.includes('quota') || error.error?.message?.includes('rate')) {
                    rateLimitCount++;
                    console.log(`⚠️  Request ${i + 1}: Rate limited`);
                } else {
                    console.log(`❌ Request ${i + 1}: Error - ${error.error?.message}`);
                }
            }
        }

        console.log(`\n📊 Results:`);
        console.log(`   Successful: ${successCount}/5`);
        console.log(`   Rate Limited: ${rateLimitCount}/5`);
        console.log(`   Duration: ${duration}ms`);

        if (successCount === 5) {
            console.log('\n🎉 GREAT NEWS! Your quota has been upgraded!');
            console.log('   You can now make many more requests without hitting limits.');
        } else if (rateLimitCount > 0) {
            console.log('\n⏳ Your quota may still be upgrading...');
            console.log('   Wait 5-10 minutes and try again.');
            console.log('   Or you may still be on Tier 1 limits.');
        }

    } catch (error) {
        console.error('❌ Error testing quota:', error.message);
    }
}

verifyQuotaUpgrade();
