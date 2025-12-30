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
    toggleBtn.innerHTML = '🚚'; // Simple icon
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
    content: '+'; 
}
EOF

# 4. Dummy Icon
echo "4. Creating Icon..."
touch "$PROJECT_DIR/icon.png"

# 5. Create Backend Widget Page
echo "5. Creating Backend Widget Page: src/app/embed/widget/page.tsx"
mkdir -p src/app/embed/widget

cat <<EOF > src/app/embed/widget/page.tsx
import React from 'react';

export default function WidgetPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
         <h1 className="font-bold text-lg text-gray-800">CekKirim Quick Access</h1>
         <p className="text-xs text-gray-500">Cek Ongkir & Resi Instan</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
            {/* Simple Tab Switcher Placeholder */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button className="flex-1 py-1 px-3 text-sm font-medium bg-white shadow-sm rounded-md text-gray-900">Cek Ongkir</button>
                <button className="flex-1 py-1 px-3 text-sm font-medium text-gray-500 hover:text-gray-700">Cek Resi</button>
            </div>

            {/* Content Placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-400 text-sm p-4 text-center">
                Embed your existing CheckCostForm or TrackingForm here, simplified for 350px width.
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Cek Sekarang
            </button>
        </div>
      </div>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "WA Injector Setup Complete!"
echo "Folder: $PROJECT_DIR/"
echo ""
echo "Installation:"
echo "1. Chrome > Extensions > Developer Mode > Load Unpacked > Select '$PROJECT_DIR'"
echo "2. Open web.whatsapp.com"
echo "3. Look for the floating 🚚 button on the top right."
echo ""
echo "Backend Requirement:"
echo "Widget page created at 'http://localhost:3000/embed/widget'. Ensure your server is running."
