import { auth, db } from './firebaseConfig.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
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

// Icons definition
const ICONS = {
    visibility: '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
    visibilityOff: '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>',
    success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
    error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
    warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
    link: '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
    refresh: '<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>'
};

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

    // Show/Hide Password
    document.getElementById('togglePasswordBtn')?.addEventListener('click', (e) => {
        const input = document.getElementById('passwordInput');
        const btn = e.currentTarget;
        const svg = btn.querySelector('svg');

        if (input.type === 'password') {
            input.type = 'text';
            svg.innerHTML = ICONS.visibilityOff;
        } else {
            input.type = 'password';
            svg.innerHTML = ICONS.visibility;
        }
    });

    // Password Reset Flow
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const sendResetBtn = document.getElementById('sendResetBtn');
    const resetEmailInput = document.getElementById('resetEmailInput');
    const resetError = document.getElementById('resetError');
    const resetSuccess = document.getElementById('resetSuccess');

    forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        resetPasswordForm.style.display = 'block';
        resetError.textContent = '';
        resetSuccess.style.display = 'none';
        // Pre-fill email if user typed it in login
        if (emailInput.value) resetEmailInput.value = emailInput.value;
    });

    backToLoginBtn?.addEventListener('click', () => {
        resetPasswordForm.style.display = 'none';
        loginForm.style.display = 'block';
        authError.textContent = '';
    });

    sendResetBtn?.addEventListener('click', async () => {
        const email = resetEmailInput.value;
        if (!email) {
            resetError.textContent = 'Please enter your email.';
            return;
        }

        try {
            sendResetBtn.disabled = true;
            sendResetBtn.textContent = 'Sending...';
            resetError.textContent = '';

            await sendPasswordResetEmail(auth, email);

            showStatus('Reset link sent! Check your email.', 'success', resetSuccess);

        } catch (error) {
            console.error('Reset password error:', error);
            resetError.textContent = error.message;
        } finally {
            sendResetBtn.disabled = false;
            sendResetBtn.textContent = 'Send Reset Link';
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
                // Remove primary class? Maybe keep it.
                startBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${ICONS.link}</svg> <span>Go to Ads Library</span>`;
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

                reopenBtn.style.display = 'flex';
                description.textContent = 'Last analysis available! Reopen or start fresh.';

                // Make Start Analysis button secondary style when reopen is available
                startBtn.classList.remove('btn-primary');
                startBtn.classList.add('btn-secondary');
                startBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${ICONS.refresh}</svg> <span>Start New Analysis</span>`;
            }
        });
    } catch (error) {
        console.error('[Popup] Error checking for existing analysis:', error);
    }
}

async function reopenAnalysis() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        showStatus('Reopening analysis...', 'success');

        chrome.tabs.sendMessage(tab.id, { action: 'reopenOverlay' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Popup] Error:', chrome.runtime.lastError);
                showStatus('Error: Could not reopen', 'error');
                return;
            }
            console.log('[Popup] Overlay reopened:', response);

            setTimeout(() => {
                window.close();
            }, 500);
        });

    } catch (error) {
        console.error('[Popup] Error reopening analysis:', error);
        showStatus('Error: ' + error.message, 'error');
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
            showStatus('Please login first', 'error');
            return;
        }

        showStatus('Checking plan limits...', 'warning');

        const result = await checkAndIncrementUsage(user.uid);

        if (!result.allowed) {
            showStatus(result.message, 'error');
            return;
        }

        showStatus('Analysis started! Check the Facebook page...', 'success');

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
                showStatus('Error: Refresh the Facebook page and try again', 'error');
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
        showStatus('Error: ' + error.message, 'error');
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
                showStatus('Invalid file format (missing campaigns)', 'error');
                return;
            }

            if (!json.campaigns) {
                showStatus('Invalid file format (missing campaigns)', 'error');
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
                    showStatus('Error: Refresh the page and try again', 'error');
                    return;
                }
                console.log('[Popup] Data loaded:', response);

                // Close popup after a delay
                setTimeout(() => {
                    window.close();
                }, 1500);
            });

        } catch (err) {
            showStatus('Failed to parse JSON: ' + err.message, 'error');
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

function showStatus(text, type, element) {
    const status = element || document.getElementById('status');
    // Select Icon based on type
    let iconPath = '';
    if (type === 'success') iconPath = ICONS.success;
    else if (type === 'error') iconPath = ICONS.error;
    else if (type === 'warning') iconPath = ICONS.warning;

    status.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${iconPath}</svg> <span>${text}</span>`;
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