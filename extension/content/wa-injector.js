// ============================================================================
// CekKirim Chrome Extension - WhatsApp Web Injector
// Injects sidebar for quick shipping cost checks
// ============================================================================

console.log('[CekKirim] WA Injector Loaded');

/**
 * Inject sidebar into WhatsApp Web
 */
function injectSidebar() {
    // Prevent double injection
    if (document.getElementById('cekkirim-sidebar-frame')) {
        console.log('[CekKirim] Sidebar already injected');
        return;
    }

    // 1. Find WhatsApp main container
    const waApp = document.getElementById('app');

    if (!waApp) {
        // WA not fully loaded yet, retry
        console.log('[CekKirim] WhatsApp app not ready, retrying...');
        setTimeout(injectSidebar, 1000);
        return;
    }

    // 2. Resize WhatsApp container to make space for sidebar
    waApp.style.width = 'calc(100% - 320px)';
    waApp.style.transition = 'width 0.3s ease';
    waApp.style.marginRight = '320px';

    // 3. Create iframe for sidebar
    const sidebar = document.createElement('iframe');
    sidebar.id = 'cekkirim-sidebar-frame';
    sidebar.src = chrome.runtime.getURL('sidebar/sidebar.html');

    // Styling
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '320px';
    sidebar.style.height = '100vh';
    sidebar.style.border = 'none';
    sidebar.style.zIndex = '9999';
    sidebar.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.12)';
    sidebar.style.background = '#f0f2f5';

    document.body.appendChild(sidebar);
    console.log('[CekKirim] Sidebar injected successfully');
}

/**
 * Create toggle button to show/hide sidebar
 */
function createToggleButton() {
    if (document.getElementById('cekkirim-toggle-btn')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cekkirim-toggle-btn';
    toggleBtn.innerHTML = '📦';
    toggleBtn.title = 'Toggle CekKirim Sidebar';

    // Styling
    toggleBtn.style.position = 'fixed';
    toggleBtn.style.bottom = '20px';
    toggleBtn.style.right = '340px';
    toggleBtn.style.width = '50px';
    toggleBtn.style.height = '50px';
    toggleBtn.style.borderRadius = '50%';
    toggleBtn.style.background = '#008069';
    toggleBtn.style.border = 'none';
    toggleBtn.style.color = 'white';
    toggleBtn.style.fontSize = '24px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toggleBtn.style.zIndex = '10000';
    toggleBtn.style.transition = 'all 0.3s ease';

    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.transform = 'scale(1.1)';
    });

    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.transform = 'scale(1)';
    });

    toggleBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('cekkirim-sidebar-frame');
        const waApp = document.getElementById('app');

        if (sidebar.style.display === 'none') {
            sidebar.style.display = 'block';
            waApp.style.width = 'calc(100% - 320px)';
            waApp.style.marginRight = '320px';
            toggleBtn.style.right = '340px';
        } else {
            sidebar.style.display = 'none';
            waApp.style.width = '100%';
            waApp.style.marginRight = '0';
            toggleBtn.style.right = '20px';
        }
    });

    document.body.appendChild(toggleBtn);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(injectSidebar, 2000);
        setTimeout(createToggleButton, 2500);
    });
} else {
    // DOM already loaded
    setTimeout(injectSidebar, 2000);
    setTimeout(createToggleButton, 2500);
}

// Listen for messages from sidebar
window.addEventListener('message', (event) => {
    if (event.data.type === 'CEKKIRIM_COPY_TO_CHAT') {
        console.log('[CekKirim] Copy request:', event.data.text);
        // Could auto-paste to WA chat input (advanced feature)
    }
});
