#!/bin/bash

# =============================================================================
# Header & Footer Polish (Premium UI)
# =============================================================================

echo "Initializing UI Polish..."
echo "================================================="

# 1. Backup
echo "1. Backing up components..."
cp src/components/layout/Navbar.tsx src/components/layout/Navbar.tsx.bak 2>/dev/null
cp src/components/layout/Footer.tsx src/components/layout/Footer.tsx.bak 2>/dev/null

# 2. Patch Navbar and Footer via Node.js
echo "2. Applying Premium Styles..."

node -e "
const fs = require('fs');

// --- Navbar Patch ---
const navbarPath = 'src/components/layout/Navbar.tsx';
if (fs.existsSync(navbarPath)) {
    let content = fs.readFileSync(navbarPath, 'utf8');
    
    // Exact match for the multi-line class definition
    const oldBlock = \`className={\\\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \\\${
        isScrolled ? 'glass-navbar' : 'bg-transparent'
      }\\\`}\`;

    const newBlock = \`className={\\\`sticky top-0 z-50 w-full transition-all duration-300 border-b \\\${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-border' : 'bg-transparent border-transparent'
      }\\\`}\`;
    
    // Try reliable replacement
    if (content.includes(oldBlock)) {
        content = content.replace(oldBlock, newBlock);
        console.log('   [i] Navbar class block updated.');
    } else {
        console.warn('   [!] Could not match Navbar class block exactly. Attempting loose regex...');
        const looseRegex = /className=\{\\\`fixed[\s\S]*?bg-transparent'[\s\S]*?\}\\\`\}/;
        if (looseRegex.test(content)) {
             content = content.replace(looseRegex, newBlock);
             console.log('   [i] Navbar class updated via regex.');
        } else {
             console.error('   [!] Failed to update Navbar class.');
        }
    }

    // Update Link text colors
    content = content.replace(/text-gray-300 hover:text-white/g, 'text-muted-foreground hover:text-foreground');
    
    fs.writeFileSync(navbarPath, content);
    console.log('   [?] Navbar polished: Sticky + Blur + Theme Colors.');
} else {
    console.error('   [!] Navbar.tsx not found at ' + navbarPath);
}

// --- Footer Patch ---
const footerPath = 'src/components/layout/Footer.tsx';
if (fs.existsSync(footerPath)) {
    let content = fs.readFileSync(footerPath, 'utf8');

    // 1. Container Background
    if (content.includes('bg-slate-950')) content = content.replace('bg-slate-950', 'bg-muted/30');
    if (content.includes('border-white/10')) content = content.replace(/border-white\/10/g, 'border-border');

    // 2. Text Colors
    content = content.replace(/text-gray-400/g, 'text-muted-foreground');
    content = content.replace(/text-gray-500/g, 'text-muted-foreground');
    content = content.replace(/text-gray-600/g, 'text-muted-foreground');
    
    // Headings
    content = content.replace(/text-white/g, 'text-foreground');
    
    // Hover interactions
    content = content.replace(/hover:text-white/g, 'hover:text-primary'); // Changed to primary for better accent
    
    // Fix borders 
    content = content.replace(/border-white\/5/g, 'border-border/50');

    fs.writeFileSync(footerPath, content);
    console.log('   [?] Footer polished: Muted Theme + Border.');
} else {
    console.error('   [!] Footer.tsx not found at ' + footerPath);
}
"

echo ""
echo "================================================="
echo "Polish Complete!"
echo "1. Run 'npm run dev'."
echo "2. Check scrolling effect on Navbar (Glass)."
