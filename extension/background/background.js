// ============================================================================
// CekKirim Chrome Extension - Background Service Worker
// Context Menu Integration for Quick Tracking
// ============================================================================

// Initialize Context Menu on Extension Install/Update
chrome.runtime.onInstalled.addListener(() => {
    console.log('CekKirim Extension: Initializing context menu...');

    // Create context menu item
    chrome.contextMenus.create({
        id: "cekkirim-track",
        title: 'Cek Resi "%s" via CekKirim',
        contexts: ["selection"], // Only show when text is selected
    });

    console.log('CekKirim Extension: Context menu created successfully');
});

// Handle Context Menu Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "cekkirim-track" && info.selectionText) {

        // 1. Get selected text and sanitize
        let trackingNumber = info.selectionText.trim();

        // Remove common non-alphanumeric characters except dashes and underscores
        // Most tracking numbers are alphanumeric with possible dashes
        trackingNumber = trackingNumber.replace(/[^a-zA-Z0-9-_]/g, '');

        // Validate: tracking numbers are usually 8-30 characters
        if (trackingNumber.length < 5 || trackingNumber.length > 35) {
            console.warn('CekKirim: Invalid tracking number length:', trackingNumber);
            // Still proceed but user will get proper error on the site
        }

        // 2. Build tracking URL
        const trackingUrl = `https://cekkirim.com/cek-resi?q=${encodeURIComponent(trackingNumber)}`;

        // 3. Open in new tab
        chrome.tabs.create({
            url: trackingUrl,
            active: true // Focus the new tab
        });

        console.log('CekKirim: Opened tracking for:', trackingNumber);
    }
});

// Optional: Listen for extension icon clicks (if you have popup)
chrome.action.onClicked.addListener((tab) => {
    // Open main tracking page
    chrome.tabs.create({
        url: 'https://cekkirim.com/cek-resi'
    });
});

// Optional: Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'trackResi') {
        const trackingUrl = `https://cekkirim.com/cek-resi?q=${encodeURIComponent(request.resiNumber)}`;
        chrome.tabs.create({ url: trackingUrl });
        sendResponse({ success: true });
    }
    return true; // Keep channel open for async response
});
