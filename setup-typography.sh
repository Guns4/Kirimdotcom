#!/bin/bash

# =============================================================================
# Typography & Contrast Standardization
# =============================================================================

echo "Initializing Typography Upgrade..."
echo "================================================="

# Use Node.js for precise file manipulation
node -e "
const fs = require('fs');
const file = 'src/app/globals.css';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Ensure Font Import
    const fontImport = \"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');\";
    if (!content.includes('Plus+Jakarta+Sans')) {
        content = fontImport + '\n' + content;
        console.log('   [✓] Restored Plus Jakarta Sans import.');
        modified = true;
    }

    // 2. Tune Dark Mode Muted Foreground (Silver instead of Dark Gray)
    // Looking for: --muted-foreground: ...; inside .dark or globally if we want to be safe.
    // We specifically want to target the .dark block's muted-foreground.
    // Original might be: --muted-foreground: 215 20.2% 65.1%;
    // Target: --muted-foreground: 215 20% 85%; (Silver)
    
    // We'll use a regex that matches within the .dark block if possible, 
    // or just generally replace the specific dark value we set in the previous script.
    // Previous script set: --muted-foreground: 215 20.2% 65.1%;
    
    if (content.includes('215 20.2% 65.1%')) {
        content = content.replace('215 20.2% 65.1%', '215 20% 85%'); // Lighter!
        console.log('   [✓] Tuned Dark Mode muted text to Silver (High Contrast).');
        modified = true;
    }

    // 3. Inject Typography Rules
    // We check if h1 style is already defined to avoid duplication
    if (!content.includes('h1, h2, h3')) {
        const typoRules = \`
@layer base {
  /* Typography Standardization */
  
  html {
     font-family: 'Plus Jakarta Sans', sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight text-foreground;
  }

  h1 { @apply text-4xl md:text-5xl lg:text-6xl; }
  h2 { @apply text-3xl md:text-4xl; }
  h3 { @apply text-2xl md:text-3xl; }
  
  p {
    @apply leading-7 text-muted-foreground;
    /* In dark mode, this uses the new Silver color defined above */
  }

  small {
    @apply text-sm font-medium leading-none;
  }
}
\`;
        // Append to the end
        content += typoRules;
        console.log('   [✓] Injected Base Typography Rules.');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('   [✓] src/app/globals.css updated successfully.');
    } else {
        console.log('   [i] No changes needed or already applied.');
    }

} else {
    console.error('   [!] src/app/globals.css not found.');
}
"

# 4. Update Tailwind Config to use the font family variable if needed
# But standard 'sans' in tailwind often defaults to the system font unless overridden.
# We set it in CSS, but let's Ensure tailwind.config.ts knows about it too for 'font-sans'.

echo "2. Ensuring Tailwind knows about the font..."
node -e "
const fs = require('fs');
const file = 'tailwind.config.ts';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if fontFamily is extended
    // We add it if missing.
    if (!content.includes('Plus Jakarta Sans')) {
         // Simple replace to inject into extend: {
         const newFont = \`
            fontFamily: {
                sans: [\"Plus Jakarta Sans\", \"sans-serif\"],
            },\`;
         
         // Insert after 'extend: {'
         content = content.replace('extend: {', 'extend: {' + newFont);
         fs.writeFileSync(file, content);
         console.log('   [✓] tailwind.config.ts updated with font-sans.');
    }
}
"

echo ""
echo "================================================="
echo "Typography Setup Complete!"
echo "1. Font 'Plus Jakarta Sans' applied."
echo "2. Headings set to High Contrast (--foreground)."
echo "3. Paragraphs set to Readable Silver in Dark Mode (--muted-foreground)."
