// Flag to prevent double injection
if (!document.getElementById('cekkirim-sidebar-root')) {
    initInjector();
}

function initInjector() {
    console.log('CekKirim Injector Started');

    // 1. Create Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cekkirim-toggle';
    toggleBtn.innerHTML = '📦'; // Package icon
    toggleBtn.title = 'Open CekKirim';

    // 2. Create Iframe Container (Sidebar)
    const sidebar = document.createElement('div');
    sidebar.id = 'cekkirim-sidebar';
    sidebar.classList.add('hidden'); // Default hidden

    // 3. Create Iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://cekkirim.com/embed/widget'; // Use local for dev: http://localhost:3000/embed/widget
    iframe.title = 'CekKirim Widget';

    sidebar.appendChild(iframe);

    // 4. Append to Body
    document.body.appendChild(toggleBtn);
    document.body.appendChild(sidebar);

    // 5. Toggle Logic
    let isOpen = false;
    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            sidebar.classList.remove('hidden');
            toggleBtn.classList.add('active');
            toggleBtn.innerHTML = '✕';
        } else {
            sidebar.classList.add('hidden');
            toggleBtn.classList.remove('active');
            toggleBtn.innerHTML = '📦';
        }
    });

    // 6. Handle Messages from Widget
    window.addEventListener('message', (event) => {
        // if (event.origin !== "https://cekkirim.com") return;
        // Verify origin in production

        if (event.data.type === 'COPY_TEXT') {
            // Copy text to clipboard (useful for copying ongkir/resi to chat)
            navigator.clipboard.writeText(event.data.text);

            // Optional: Try to insert into WA input if focused
            // const activeElement = document.activeElement;
            // if (activeElement && activeElement.isContentEditable) {
            //     document.execCommand('insertText', false, event.data.text);
            // }
        }
    });
}
