import { auth } from './firebaseConfig.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

console.log('[Popup] Loaded');

// DOM Elements
const authSection = document.getElementById('authSection');
const loginForm = document.getElementById('loginForm');
const userProfile = document.getElementById('userProfile');
const userEmailSpan = document.getElementById('userEmail');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authError = document.getElementById('authError');
const mainContent = document.getElementById('mainContent');

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        showMainContent(user);
    } else {
        // No user is signed in
        showAuthForm();
    }
});

function showMainContent(user) {
    loginForm.style.display = 'none';
    userProfile.style.display = 'block';
    userEmailSpan.textContent = user.email;
    mainContent.style.display = 'block';
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
        if (tab?.url?.includes('facebook.com/ads/library')) {
            console.log('[Popup] On Facebook Ads Library page');
        } else {
            showStatus('ℹ️ Scraping only works on Facebook Ads Library. Import works anywhere!', 'warning');
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

        if (!tab?.url?.includes('facebook.com')) {
            showStatus('❌ Please open Facebook Ads Library', 'error');
            return;
        }

        showStatus('✅ Analysis started! Check the Facebook page...', 'success');

        // Send message to content script to start scraping and show visualizer
        chrome.tabs.sendMessage(tab.id, { action: 'startScraping' }, (response) => {
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

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (!data.campaigns || !Array.isArray(data.campaigns)) {
                showStatus('❌ Invalid data format. Expected campaigns array.', 'error');
                return;
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            showStatus(`✅ Loading ${data.campaigns.length} campaigns...`, 'success');

            // Send message to inject visualizer and load data
            chrome.tabs.sendMessage(tab.id, {
                action: 'loadData',
                data: data
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[Popup] Error:', chrome.runtime.lastError);
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
    e.target.value = '';
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