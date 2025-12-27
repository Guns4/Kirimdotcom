#!/bin/bash

# Setup Mobile Share Target Module
echo "🚀 Setting up Mobile Share Target..."

# 1. Create Share Target Handler Page
echo "📱 Creating Handler Page..."
mkdir -p src/app/share-target
cat << 'EOF' > src/app/share-target/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// This page handles incoming shares from Android Intent
export default function ShareTargetPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState('Processing shared data...')

    useEffect(() => {
        const title = searchParams.get('title')
        const text = searchParams.get('text')
        const url = searchParams.get('url')

        // Heuristic: If text looks like a receipt number, go to tracking
        // If it looks like a lot of text, maybe go to parse receipt tool
        
        // Simple logic for MVP:
        const payload = text || title || url
        
        if (payload) {
            // Regex for receipt (Alphanumeric 8-20 chars)
            const receiptRegex = /\b[A-Z0-9]{8,20}\b/g
            const matches = payload.match(receiptRegex)

            if (matches && matches.length > 0) {
                // Determine it's a tracking request
                const resi = matches[0]
                setStatus(`Found receipt: ${resi}. Redirecting...`)
                setTimeout(() => router.push(`/bulk-tracking?resi=${resi}`), 1000)
            } else {
                // Default handling
                setStatus('No clear receipt found. Opening dashboard...')
                setTimeout(() => router.push('/dashboard'), 1500)
            }
        } else {
            router.push('/')
        }
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        Analyzing Share...
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    {status}
                </CardContent>
            </Card>
        </div>
    )
}
EOF

# 2. Update Manifest (Node Script for precision)
echo "⚙️  Updating manifest.json..."
# Requires 'jq' or similar usually, but we will use a temporary node script
cat << 'NODESCRIPT' > update-manifest.js
const fs = require('fs');
const manifestPath = 'public/manifest.json';
const manifestTsPath = 'src/app/manifest.ts';

// We try to find where manifest is defined. 
// If src/app/manifest.ts exists, we can't easily edit it via script reliably without complex parsing.
// If public/manifest.json exists, we edit that.

if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    manifest.share_target = {
        action: "/share-target",
        method: "GET",
        enctype: "application/x-www-form-urlencoded",
        params: {
            title: "title",
            text: "text",
            url: "url"
        }
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('Updated public/manifest.json');
} else {
    console.log('WARNING: public/manifest.json not found. If you use src/app/manifest.ts, please update it manually.');
    console.log('Add this object to your manifest:');
    console.log(`
      share_target: {
        action: "/share-target",
        method: "GET",
        enctype: "application/x-www-form-urlencoded",
        params: {
          title: "title",
          text: "text",
          url: "url"
        }
      }
    `);
}
NODESCRIPT

node update-manifest.js
rm update-manifest.js

echo "✅ Mobile Share Target Setup Complete!"
