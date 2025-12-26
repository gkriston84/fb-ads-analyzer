// Background Service Worker
console.log('[FB Ads Analyzer] Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeAI') {
        handleAIAnalysis(request, sendResponse);
        return true; // Keep message channel open for async response
    }
});

// TODO: Replace with your actual Cloud Function URL after deployment
// Example: https://us-central1-fb-ads-analyzer.cloudfunctions.net/analyzeAds
const CLOUD_FUNCTION_URL = 'https://us-central1-fb-ads-analyzer.cloudfunctions.net/analyzeAds';

async function handleAIAnalysis(request, sendResponse) {
    try {
        console.log('[Background] Starting AI Analysis via Cloud Function...');
        const { systemPrompt, userContent } = request.payload;

        // Get Auth Token
        const storage = await chrome.storage.local.get('fbAdsIdToken');
        const token = storage.fbAdsIdToken;

        if (!token) {
            throw new Error('User not authenticated. Please open the extension popup to refresh login.');
        }

        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                systemPrompt,
                userContent
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        console.log('[Background] AI Analysis successful');
        sendResponse({ success: true, analysis: data.analysis });

    } catch (error) {
        console.error('[Background] AI Analysis failed:', error);
        sendResponse({ success: false, error: error.message });
    }
}
