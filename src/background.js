// Background Service Worker
console.log('[FB Ads Analyzer] Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeAI') {
        handleAIAnalysis(request, sendResponse);
        return true; // Keep message channel open for async response
    }
});

async function handleAIAnalysis(request, sendResponse) {
    try {
        console.log('[Background] Starting AI Analysis...');
        const { apiKey, systemPrompt, userContent } = request.payload;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const analysis = data.choices[0].message.content;
        console.log('[Background] AI Analysis successful');
        sendResponse({ success: true, analysis: analysis });

    } catch (error) {
        console.error('[Background] AI Analysis failed:', error);
        sendResponse({ success: false, error: error.message });
    }
}
