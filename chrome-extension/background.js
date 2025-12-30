// 1. Create Context Menu on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cekkirim-track",
    title: "Lacak \"%s\" di CekKirim",
    contexts: ["selection"]
  });
});

// 2. Handle Click Events
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cekkirim-track" && info.selectionText) {
    // Sanitize and encode the selection
    const resi = encodeURIComponent(info.selectionText.trim());

    // Open Tracking Page
    const targetUrl = `https://cekkirim.com/cek-resi?resi=${resi}&auto=true`;

    chrome.tabs.create({
      url: targetUrl
    });
  }
});
