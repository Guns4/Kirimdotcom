// ============================================================================
// CekKirim Chrome Extension - Popup Script
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const resiInput = document.getElementById('resiInput');
    const trackBtn = document.getElementById('trackBtn');
    const openWebBtn = document.getElementById('openWebBtn');
    const clearBtn = document.getElementById('clearBtn');
    const lastSearchEl = document.getElementById('lastSearch');

    // Load saved data
    loadSavedData();

    /**
     * Load last searched resi from storage
     */
    function loadSavedData() {
        chrome.storage.local.get(['lastResi', 'searchHistory'], function (result) {
            if (result.lastResi) {
                lastSearchEl.textContent = result.lastResi;
                resiInput.value = result.lastResi;
            }
        });
    }

    /**
     * Track resi number
     */
    function trackResi() {
        const resi = resiInput.value.trim();

        if (!resi) {
            // Show subtle shake animation
            resiInput.style.animation = 'shake 0.3s';
            setTimeout(() => resiInput.style.animation = '', 300);
            return;
        }

        // Save to history
        saveToHistory(resi);

        // Open CekKirim in new tab
        const url = `https://cekkirim.com/cek-resi?q=${encodeURIComponent(resi)}`;
        chrome.tabs.create({ url: url });

        // Optional: Close popup after opening
        // window.close();
    }

    /**
     * Save resi to search history
     */
    function saveToHistory(resi) {
        chrome.storage.local.get(['searchHistory'], function (result) {
            let history = result.searchHistory || [];

            // Add to beginning, limit to 10 items
            history.unshift({
                resi: resi,
                timestamp: Date.now()
            });
            history = history.slice(0, 10);

            chrome.storage.local.set({
                lastResi: resi,
                searchHistory: history
            });
        });
    }

    /**
     * Clear input
     */
    function clearInput() {
        resiInput.value = '';
        resiInput.focus();
    }

    /**
     * Open dashboard
     */
    function openDashboard() {
        chrome.tabs.create({ url: 'https://cekkirim.com/dashboard' });
    }

    // Event Listeners
    trackBtn.addEventListener('click', trackResi);

    resiInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            trackResi();
        }
    });

    clearBtn.addEventListener('click', clearInput);
    openWebBtn.addEventListener('click', openDashboard);

    // Auto-focus input when popup opens
    resiInput.focus();
});

// Add shake animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
