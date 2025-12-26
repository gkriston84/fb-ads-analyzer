import { auth, db } from './firebaseConfig.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

console.log('[Popup] Loaded');

// DOM Elements
const authSection = document.getElementById('authSection');
const loginForm = document.getElementById('loginForm');
const userProfile = document.getElementById('userProfile');
const userEmailSpan = document.getElementById('userEmail');
const userTierSpan = document.getElementById('userTier');
const userUsageSpan = document.getElementById('userUsage');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authError = document.getElementById('authError');
const mainContent = document.getElementById('mainContent');

// Auth State Listener
// Auth State Listener
import { onIdTokenChanged } from 'firebase/auth';

onIdTokenChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        const token = await user.getIdToken();
        await chrome.storage.local.set({ fbAdsIdToken: token });
        console.log('[Popup] ID Token saved');
        showMainContent(user);
    } else {
        // No user is signed in
        await chrome.storage.local.remove('fbAdsIdToken');
        showAuthForm();
    }
});

function showMainContent(user) {
    loginForm.style.display = 'none';
    userProfile.style.display = 'block';
    userEmailSpan.textContent = user.email;
    mainContent.style.display = 'block';

    // Load User Profile & Stats
    loadUserProfile(user.uid);
}

async function loadUserProfile(uid) {
    try {
        const { profile } = await getUserProfile(uid);
        updateUIStats(profile);
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateUIStats(profile) {
    if (!userTierSpan || !userUsageSpan) return;

    const tierName = profile.tier === 'pro' ? 'Pro' : 'Starter';
    const limit = profile.tier === 'pro' ? 'Unlimited' : '10';

    userTierSpan.textContent = tierName;
    userUsageSpan.textContent = `${profile.runsCount} / ${limit}`;

    if (profile.tier === 'starter' && profile.runsCount >= 10) {
        userUsageSpan.style.color = '#ef4444'; // Red
    } else {
        userUsageSpan.style.color = '#6b7280';
    }
}

// Check limits and increment usage
async function checkAndIncrementUsage(uid) {
    const { ref, profile } = await getUserProfile(uid);
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    let newCount = profile.runsCount;
    let newMonth = profile.lastRunMonth;

    // Reset if new month
    if (profile.lastRunMonth !== currentMonth) {
        newCount = 0;
        newMonth = currentMonth;
        // Optionally update immediately or just use these values for the check
    }

    // Check Limit
    if (profile.tier === 'starter' && newCount >= 10) {
        return { allowed: false, message: 'Monthly limit reached (10 runs). Upgrade to Pro for unlimited access.' };
    }

    // Increment
    await updateDoc(ref, {
        runsCount: newCount + 1,
        lastRunMonth: newMonth
    });

    // Return updated allowed status and tier
    return { allowed: true, tier: profile.tier };
}

async function getUserProfile(uid) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return { ref: userRef, profile: userSnap.data() };
    } else {
        // Create default profile
        const defaultProfile = {
            email: auth.currentUser.email,
            tier: 'starter',
            runsCount: 0,
            lastRunMonth: new Date().toISOString().slice(0, 7),
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, defaultProfile);
        return { ref: userRef, profile: defaultProfile };
    }
}

function showAuthForm() {
    loginForm.style.display = 'block';
    userProfile.style.display = 'none';
    mainContent.style.display = 'none';
    emailInput.value = '';
    passwordInput.value = '';
    authError.textContent = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupAuthListeners();
});

function setupAuthListeners() {
    document.getElementById('loginBtn')?.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            authError.textContent = error.message;
        }
    });

    document.getElementById('signupBtn')?.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            authError.textContent = error.message;
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

function setupEventListeners() {
    document.getElementById('startBtn')?.addEventListener('click', startAnalysis);
    document.getElementById('reopenBtn')?.addEventListener('click', reopenAnalysis);
    document.getElementById('importBtn')?.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput')?.addEventListener('change', importData);
}

// ... Reused functions from original popup.js ...
// Copying original logic here but adapting to not run immediately on load since we wrap in DOMContentLoaded

async function checkIfOnFacebook() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const startBtn = document.getElementById('startBtn');

        if (tab?.url?.includes('facebook.com/ads/library')) {
            console.log('[Popup] On Facebook Ads Library page');
        } else {
            console.log('[Popup] Not on Ads Library');
            if (startBtn) {
                startBtn.textContent = '🔗 Go to Ads Library';
                // Remove primary class to indicate navigation? User didn't request style change, but text change.
                // Keeping btn-primary is fine as it's the primary action.
            }
        }
    } catch (error) {
        console.error('[Popup] Error checking tab:', error);
    }
}

async function checkForExistingAnalysis() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Check if overlay already exists with data
        chrome.tabs.sendMessage(tab.id, { action: 'checkExisting' }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('[Popup] No existing analysis found');
                return;
            }

            if (response && response.hasOverlay) {
                console.log('[Popup] Found existing analysis');
                const reopenBtn = document.getElementById('reopenBtn');
                const description = document.getElementById('description');
                const startBtn = document.getElementById('startBtn');

                reopenBtn.style.display = 'block';
                description.textContent = 'Last analysis available! Reopen or start fresh.';

                // Make Start Analysis button secondary style when reopen is available
                startBtn.classList.remove('btn-primary');
                startBtn.classList.add('btn-secondary');
                startBtn.innerHTML = '🔄 Start New Analysis';
            }
        });
    } catch (error) {
        console.error('[Popup] Error checking for existing analysis:', error);
    }
}

async function reopenAnalysis() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        showStatus('✅ Reopening analysis...', 'success');

        chrome.tabs.sendMessage(tab.id, { action: 'reopenOverlay' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Popup] Error:', chrome.runtime.lastError);
                showStatus('❌ Error: Could not reopen', 'error');
                return;
            }
            console.log('[Popup] Overlay reopened:', response);

            setTimeout(() => {
                window.close();
            }, 500);
        });

    } catch (error) {
        console.error('[Popup] Error reopening analysis:', error);
        showStatus('❌ Error: ' + error.message, 'error');
    }
}

async function startAnalysis() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab?.url?.includes('facebook.com/ads/library')) {
            // Not on Ads Library, redirect
            chrome.tabs.create({ url: 'https://www.facebook.com/ads/library' });
            window.close();
            return;
        }

        // Check usage limits
        const user = auth.currentUser;
        if (!user) {
            showStatus('❌ Please login first', 'error');
            return;
        }

        showStatus('⏳ Checking plan limits...', 'warning');

        const result = await checkAndIncrementUsage(user.uid);

        if (!result.allowed) {
            showStatus('❌ ' + result.message, 'error');
            return;
        }

        showStatus('✅ Analysis started! Check the Facebook page...', 'success');

        // Fetch AI settings but ONLY pass if Pro
        let aiConfig = await fetchAIConfig();

        if (result.tier !== 'pro') {
            console.log('[Popup] User is STARTER tier. AI features disabled.');
            // Disable AI config for the visualizer
            aiConfig = null;
        }

        // Send message to content script to start scraping and show visualizer
        chrome.tabs.sendMessage(tab.id, {
            action: 'startScraping',
            aiConfig: aiConfig
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Popup] Error:', chrome.runtime.lastError);
                showStatus('❌ Error: Refresh the Facebook page and try again', 'error');
                return;
            }
            console.log('[Popup] Scraping started:', response);

            // Close popup after a delay
            setTimeout(() => {
                window.close();
            }, 1500);
        });

    } catch (error) {
        console.error('[Popup] Error starting analysis:', error);
        showStatus('❌ Error: ' + error.message, 'error');
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            // Validate structure
            if (!json.campaigns) {
                showStatus('❌ Invalid file format (missing campaigns)', 'error');
                return;
            }

            if (!json.campaigns) {
                showStatus('❌ Invalid file format (missing campaigns)', 'error');
                return;
            }

            const aiConfig = await fetchAIConfig();
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Check if we are on a valid page (technically import can work anywhere if we inject, 
            // but effectively we usually just want it on FB or any page where we inject the visualizer)
            // For now, let's assume we allow it anywhere or strict to FB.
            // User said "works from the modal" implying they are on the page.

            if (!tab) return;

            // Ensure visualizer is injected first?
            // Sending message 'importData' to content script
            // Sending message 'importData' to content script
            chrome.tabs.sendMessage(tab.id, {
                action: 'importData',
                data: json,
                aiConfig: aiConfig
            }, (response) => {
                if (chrome.runtime.lastError) {
                    showStatus('❌ Error: Refresh the page and try again', 'error');
                    return;
                }
                console.log('[Popup] Data loaded:', response);

                // Close popup after a delay
                setTimeout(() => {
                    window.close();
                }, 1500);
            });

        } catch (err) {
            showStatus('❌ Failed to parse JSON: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

async function fetchAIConfig() {
    let aiConfig = null;
    try {
        console.log('[Popup] Fetching AI settings. Auth User:', auth.currentUser ? auth.currentUser.uid : 'null');
        const { db } = await import('./firebaseConfig.js');
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, "settings", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            aiConfig = docSnap.data();
            // Remove API key from client-side config, we use backend now
            if (aiConfig) delete aiConfig.apiKey;
        } else {
            console.warn('[Popup] ⚠️ No AI settings found.');
        }
    } catch (err) {
        console.error('[Popup] ❌ Error fetching AI settings:', err);
    }
    return aiConfig;
}

function showStatus(text, type) {
    const status = document.getElementById('status');
    status.textContent = text;
    status.className = 'status show ' + type;
}

// Call init functions only when logged in
function initApp() {
    checkIfOnFacebook();
    checkForExistingAnalysis();
}

// Hook initApp into showMainContent
const originalShowMainContent = showMainContent;
showMainContent = function (user) {
    originalShowMainContent(user);
    initApp();
};