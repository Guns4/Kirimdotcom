#!/bin/bash

# =============================================================================
# Dark Mode Asset Adaptation (Invert Black Assets)
# =============================================================================

echo "Initializing Asset Adaptation..."
echo "================================================="

# 1. Inject Utility Class
echo "1. Adding .invert-on-dark to globals.css..."

cat <<EOF >> src/app/globals.css

/* DARK MODE ASSET ADAPTATION */
@layer utilities {
  .invert-on-dark {
    /* Default: No filter */
    filter: none;
    transition: filter 0.3s ease;
  }
  
  .dark .invert-on-dark {
    /* Dark Mode: Invert colors (Black -> White) and boost brightness */
    filter: invert(1) brightness(200%);
  }

  /* Version specific for strictly white logos needing black in light mode, etc */
  .invert-on-light {
    filter: invert(1);
  }
  .dark .invert-on-light {
    filter: none;
  }
}
EOF

# 2. Scanner Script
echo "2. Scanning for potential candidates (Logos/Icons)..."

node -e "
const fs = require('fs');
const path = require('path');

function scanDir(dir, found = []) {
    if (!fs.existsSync(dir)) return found;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, found);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Regex to find Image or img tags that look like logos
            // Criteria: src contains 'logo', 'icon', 'kurir', 'expedition' AND class doesn't have invert-on-dark
            // This is loose matching for report purposes.
            
            const hasPossibleLogo = /<Image|<img/i.test(content) && 
                                   (/src=.*(logo|icon|cour|kurir|jne|jnt|sicepat)/i.test(content));
                                   
            if (hasPossibleLogo && !content.includes('invert-on-dark')) {
                found.push(fullPath);
            }
        }
    });
    return found;
}

const candidates = scanDir('src');

if (candidates.length > 0) {
    console.log('\\n[!] Potential assets needing adaptation found in:');
    candidates.forEach(f => console.log('   - ' + f));
    console.log('\\n>>> ACTION: Add className=\"invert-on-dark\" to these images if they are black logos.');
} else {
    console.log('   [i] No obvious un-adapted logos found (or strict naming not used).');
}
"

echo ""
echo "================================================="
echo "Asset Utility Ready!"
echo "1. Use class 'invert-on-dark' on your black logos."
echo "2. They will automatically turn white in Dark Mode."
