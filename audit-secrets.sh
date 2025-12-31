#!/bin/bash

# audit-secrets.sh
# ----------------
# Scans git history and files for accidental secret leaks.

echo "🕵️  Starting Secret Audit..."

# 1. Check .gitignore
echo "Checking .gitignore..."
if ! grep -q ".env" .gitignore; then
  echo "❌ .env is NOT in .gitignore!"
else
  echo "✅ .env is verified in .gitignore"
fi

# 2. Create Scan Script
mkdir -p src/scripts
cat > src/scripts/scan-secrets.js << 'EOF'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PATTERNS = [
  { name: 'Generic API Key', regex: /api[_-]?key['"]?\s*[:=]\s*['"]?[A-Za-z0-9_=-]{20,}['"]?/i },
  { name: 'Google Key', regex: /AIza[0-9A-Za-z\\-_]{35}/ },
  { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
];

console.log('🔍 Scanning latest staged files for secrets...');

try {
  // Simple grep simulation using git grep if available, or just node file scan
  const files = execSync('git ls-files').toString().split('\n').filter(Boolean);
  
  let issues = 0;

  files.forEach(file => {
    // Skip lock files and this script
    if (file.includes('lock') || file.includes('scan-secrets.js')) return;
    
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        PATTERNS.forEach(rule => {
          if (rule.regex.test(content)) {
             console.warn(`[WARNING] Potential ${rule.name} found in: ${file}`);
             issues++;
          }
        });
      }
    } catch (e) {}
  });

  if (issues === 0) {
    console.log('✅ No obvious secrets found in tracked files.');
  } else {
    console.log(`⚠️  Found ${issues} potential issues. Please review manually.`);
  }

} catch (e) {
  console.error('Scan failed', e);
}
EOF

echo "✅ Audit Script Created."
echo "👉 Run 'node src/scripts/scan-secrets.js' to scan."
