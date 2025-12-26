// Background Service Worker

// 1. Create Context Menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "cekkirim-check",
        title: "Cek Resi '%s' di CekKirim",
        contexts: ["selection"] // Only show when text is selected
    });
});

// 2. Handle Click Event
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "cekkirim-check" && info.selectionText) {
        // Clean up the text (remove non-alphanumeric if needed, or keep as is)
        const resi = info.selectionText.trim();

        // Open a new tab with CekKirim search
        // We can also use a content script to show a modal, but new tab is simpler/safer
        chrome.tabs.create({
            url: `https://www.cekkirim.com/?resi=${encodeURIComponent(resi)}&autoCheck=true`
        });
    }
});
