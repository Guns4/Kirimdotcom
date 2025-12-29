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
    
    // 1. Update <nav> definition
    // We look for the standard class definition we saw in the file content
    const oldNavClass = /className=\{\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \$\{isScrolled\s*\?\s*'glass-navbar'\s*:\s*'bg-transparent'\s*\}\`\}/;
    
    // New class logic: Sticky + Explicit Colors
    // Sticky needs top-0 to work.
    const newNavClass = 'className={\`sticky top-0 z-50 w-full transition-all duration-300 border-b \${isScrolled ? \"bg-background/80 backdrop-blur-md border-border\" : \"bg-transparent border-transparent\"}\`}';
    
    content = content.replace(oldNavClass, newNavClass);

    // 2. Update Link text colors (Gray-300 -> Muted Foreground) to fit Light Mode too
    // Current: text-gray-300 hover:text-white
    // New: text-muted-foreground hover:text-foreground
    content = content.replace(/text-gray-300 hover:text-white/g, 'text-muted-foreground hover:text-foreground');
    
    fs.writeFileSync(navbarPath, content);
    console.log('   [✓] Navbar polished: Sticky + Blur + Theme Colors.');
} else {
    console.error('   [!] Navbar.tsx not found at ' + navbarPath);
}

// --- Footer Patch ---
const footerPath = 'src/components/layout/Footer.tsx';
if (fs.existsSync(footerPath)) {
    let content = fs.readFileSync(footerPath, 'utf8');

    // 1. Container Background
    // Old: bg-slate-950 border-t border-white/10
    // New: bg-muted/30 border-t border-border
    if (content.includes('bg-slate-950')) {
        content = content.replace('bg-slate-950', 'bg-muted/30');
    }
    if (content.includes('border-white/10')) {
        content = content.replace(/border-white\/10/g, 'border-border');
    }

    // 2. Text Colors
    // General text: text-gray-400 -> text-muted-foreground
    content = content.replace(/text-gray-400/g, 'text-muted-foreground');
    content = content.replace(/text-gray-500/g, 'text-muted-foreground');
    content = content.replace(/text-gray-600/g, 'text-muted-foreground'); // Copyright text

    // Headings: text-white -> text-foreground
    content = content.replace(/text-white/g, 'text-foreground');

    // Hover interactions: hover:text-white -> hover:text-primary (or foreground)
    content = content.replace(/hover:text-white/g, 'hover:text-foreground');
    
    // Fix Brand Gradient (Optional: Keep it or adapt)
    // currently: from-indigo-400 to-purple-400. This might fail contrast in Light mode.
    // Let's change it to 'from-primary to-blue-600' or similar
    // Or just leaving it as is if it looks okay.
    
    fs.writeFileSync(footerPath, content);
    console.log('   [✓] Footer polished: Muted Theme + Border.');
} else {
    console.error('   [!] Footer.tsx not found at ' + footerPath);
}
"

echo ""
echo "================================================="
echo "Polish Complete!"
echo "1. Run 'npm run dev'."
echo "2. Check scrolling effect on Navbar (Glass)."
echo "3. Check Footer contrast (Light/Dark mode)."
