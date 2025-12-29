#!/bin/bash

# =============================================================================
# WhatsApp Web Injector (Seller Productivity Tool)
# =============================================================================

echo "Initializing WA Injector Project..."
echo "================================================="

PROJECT_DIR="wa-injector"
mkdir -p "$PROJECT_DIR"

# 1. Manifest V3
echo "1. Creating manifest.json..."
cat <<EOF > "$PROJECT_DIR/manifest.json"
{
  "manifest_version": 3,
  "name": "CekKirim for WhatsApp Web",
  "version": "1.0.0",
  "description": "Widget Cek Ongkir & Resi langsung di samping chat WhatsApp.",
  "icons": {
    "128": "icon.png"
  },
  "content_scripts": [
    {
      "matches": ["*://web.whatsapp.com/*"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "permissions": []
}
EOF

# 2. Content Script (Injection Logic)
echo "2. Creating content.js..."
cat <<EOF > "$PROJECT_DIR/content.js"
// Flag to prevent double injection
if (!document.getElementById('cekkirim-sidebar-root')) {
    initInjector();
}

function initInjector() {
    console.log('CekKirim Injector Started');

    // 1. Create Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cekkirim-toggle';
    toggleBtn.innerHTML = '📦'; // Simple icon, replace with SVG if needed
    toggleBtn.title = 'Open CekKirim';
    
    // 2. Create Iframe Container (Sidebar)
    const sidebar = document.createElement('div');
    sidebar.id = 'cekkirim-sidebar';
    sidebar.classList.add('hidden'); // Default hidden

    // 3. Create Iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://cekkirim.com/embed/widget'; // Ensure this route exists in your Next.js app
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
            // Optional: Adjust WA main container width if needed
            // document.getElementById('app').style.width = 'calc(100% - 350px)';
        } else {
            sidebar.classList.add('hidden');
            toggleBtn.classList.remove('active');
            // document.getElementById('app').style.width = '100%';
        }
    });
}
EOF

# 3. CSS Styles
echo "3. Creating styles.css..."
cat <<EOF > "$PROJECT_DIR/styles.css"
/* Toggle Button (Floating) */
#cekkirim-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 99999;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    font-size: 24px;
    cursor: pointer;
    transition: transform 0.2s, right 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

#cekkirim-toggle:hover {
    transform: scale(1.1);
}

/* Sidebar Container */
#cekkirim-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 350px; /* Mobile width usually fits well */
    height: 100vh;
    background: white;
    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
    z-index: 99998;
    transition: transform 0.3s ease-in-out;
}

#cekkirim-sidebar.hidden {
    transform: translateX(100%);
}

/* Iframe Styling */
#cekkirim-sidebar iframe {
    width: 100%;
    height: 100%;
    border: none;
}

/* Push toggle button when sidebar is open */
#cekkirim-toggle.active {
    right: 370px; /* 350px width + 20px margin */
    background: #ef4444; /* Change to close button color */
    transform: rotate(45deg); /* Turn icon into X */
}
#cekkirim-toggle.active::before {
    content: '+'; /* Trick to show X if using text/icon logic */
}
EOF

# 4. Dummy Icon
echo "4. Creating Icon..."
touch "$PROJECT_DIR/icon.png"

echo ""
echo "================================================="
echo "WA Injector Setup Complete!"
echo "Folder: $PROJECT_DIR/"
echo ""
echo "Installation:"
echo "1. Chrome > Extensions > Developer Mode > Load Unpacked > Select '$PROJECT_DIR'"
echo "2. Open web.whatsapp.com"
echo "3. Look for the floating 📦 button on the top right."
echo ""
echo "Backend Requirement:"
echo "Make sure you create a simplified page at 'https://cekkirim.com/embed/widget' designed to fit in 350px width."
