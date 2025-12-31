#!/bin/bash

# audit-input-validation.sh
# -------------------------
# Sets up Zod Validation & DOMPurify Sanitization
# Provides validation audit utility

echo "🕵️  Setting up Input Validation System..."

# 1. Install Dependencies
echo "📦 Installing Zod & IAMDOMPurify..."
npm install zod isomorphic-dompurify

# 2. Create Validation Utility
mkdir -p src/lib/validation

cat > src/lib/validation/sanitizer.ts << 'EOF'
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Sanitizes a string by removing dangerous HTML tags.
 * Use this for any User Generated Content (UGC) before display or storage.
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'], // Allow basic formatting
    ALLOWED_ATTR: ['href']
  });
}

/**
 * Common Zod Schemas for API Input
 */
export const CommonSchemas = {
  // Email Validation
  email: z.string().email(),
  
  // Phone (start with 62 or 08)
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Invalid Format'),
  
  // Positive Amount (Money)
  amount: z.number().positive(),

  // Safe String (Sanitized transform)
  safeString: z.string().transform(str => sanitizeInput(str)),
  
  // UUID
  uuid: z.string().uuid()
};

/**
 * Example Usage in API Route:
 * 
 * const body = await req.json();
 * const result = z.object({
 *   email: CommonSchemas.email,
 *   amount: CommonSchemas.amount,
 *   bio: CommonSchemas.safeString
 * }).safeParse(body);
 * 
 * if (!result.success) return NextResponse.json(result.error, { status: 400 });
 */
EOF

# 3. Create Audit Script (Node.js)
# Scans API routes for missing Zod usage (heuristic)
cat > src/scripts/audit-validation.js << 'EOF'
const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDir(filePath);
    } else if (file === 'route.ts') {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for POST/PUT without Zod
      if ((content.includes('POST') || content.includes('PUT')) && !content.includes('zod')) {
         console.warn(`[WARNING] No Zod validation detected in: ${filePath}`);
      }
    }
  });
}

console.log('🔍 Scanning API Routes for Validation...');
if (fs.existsSync('src/app/api')) {
  scanDir('src/app/api');
} else {
  console.log('src/app/api not found.');
}
EOF

echo "✅ Validation System Setup Complete!"
echo "👉 Use 'node src/scripts/audit-validation.js' to find unvalidated routes."
