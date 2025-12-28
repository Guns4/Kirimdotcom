#!/bin/bash

# =============================================================================
# Setup AI Writer (Phase 99)
# Automated SEO Content Generator
# =============================================================================

echo "Setting up AI Writer..."
echo "================================================="
echo ""

# Create Drafts Directory
mkdir -p content/drafts

# 1. Draft Manager
echo "1. Creating Draft Manager: src/lib/draft-manager.ts"

cat <<EOF > src/lib/draft-manager.ts
'use server'

import fs from 'fs';
import path from 'path';

const DRAFTS_DIR = path.join(process.cwd(), 'content/drafts');
const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface DraftFile {
    filename: string;
    title: string;
    created: string;
}

export async function getDrafts(): Promise<DraftFile[]> {
    if (!fs.existsSync(DRAFTS_DIR)) return [];
    
    const files = fs.readdirSync(DRAFTS_DIR);
    return files.filter(f => f.endsWith('.mdx')).map(file => {
        const stats = fs.statSync(path.join(DRAFTS_DIR, file));
        return {
            filename: file,
            title: file.replace(/-/g, ' ').replace('.mdx', ''), // Simple title inference
            created: stats.birthtime.toISOString()
        };
    });
}

export async function publishDraft(filename: string) {
    const src = path.join(DRAFTS_DIR, filename);
    const dest = path.join(BLOG_DIR, filename);
    
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest); // Move file
        return { success: true };
    }
    return { success: false, error: 'File not found' };
}

export async function deleteDraft(filename: string) {
    const src = path.join(DRAFTS_DIR, filename);
    if (fs.existsSync(src)) {
        fs.unlinkSync(src);
        return { success: true };
    }
    return { success: false };
}
EOF
echo "   [✓] Draft Manager created."
echo ""

# 2. AI Action (The Brain)
echo "2. Creating AI Action: src/app/actions/aiWriterActions.ts"

cat <<EOF > src/app/actions/aiWriterActions.ts
'use server'

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

// Initialize OpenAI (or compatible API like Gemini via adapter if needed)
// For now, assuming standard OpenAI SDK usage
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
});

const DRAFTS_DIR = path.join(process.cwd(), 'content/drafts');

export async function generateArticle(keyword: string) {
    console.log('Generating article for:', keyword);
    
    try {
        const prompt = \`
        Bertindaklah sebagai SEO Content Writer profesional.
        Topik: "\${keyword}"
        
        Instruksi:
        1. Judul menarik (H1) yang mengandung keyword.
        2. Gunakan Bahasa Indonesia yang luwes, santai, dan mudah dipahami.
        3. Struktur artikel:
           - Intro yang relate dengan masalah pembaca.
           - H2 dan H3 yang terstruktur.
           - Listicle (daftar) minimal satu bagian.
           - Kesimpulan.
        4. Output format: MDX (Markdown).
        5. Frontmatter (YAML) di atas:
           ---
           title: [Judul]
           description: [Meta description 150 char]
           date: [YYYY-MM-DD]
           author: AI Assistant
           tags: [Tag1, Tag2]
           ---
           
        Tulis artikel lengkap minimal 800 kata.
        \`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini', // Cheap & Fast
        });

        const content = completion.choices[0].message.content || '';
        if (!content) throw new Error('No content generated');

        // Clean up markdown block if present
        const cleanContent = content.replace(/\\\`\\\`\\\`markdown/g, '').replace(/\\\`\\\`\\\`/g, '').trim();

        // Save to file
        const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filename = \`\${slug}.mdx\`;
        
        if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });
        
        fs.writeFileSync(path.join(DRAFTS_DIR, filename), cleanContent);
        
        revalidatePath('/dashboard/admin');
        return { success: true, filename };

    } catch (error: any) {
        console.error('AI Writer Error:', error);
        return { success: false, error: error.message };
    }
}
EOF
echo "   [✓] AI Action created."
echo ""

# 3. Components (Admin UI)
echo "3. Creating Admin Widgets..."

cat <<EOF > src/components/admin/AIWriterWidget.tsx
'use client';

import { useState } from 'react';
import { generateArticle } from '@/app/actions/aiWriterActions';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AIWriterWidget() {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!keyword) return;
        setLoading(true);
        try {
            await generateArticle(keyword);
            setKeyword('');
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                AI Content Generator
            </h3>
            <p className="text-indigo-100 text-sm mb-4">
                Buat artikel SEO otomatis dalam hitungan detik.
            </p>
            
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Masukkan keyword (misal: Cara Cek Resi JNE)"
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm placeholder-indigo-200 outline-none focus:bg-white/30 transition-all"
                    disabled={loading}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !keyword}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat'}
                </button>
            </div>
        </div>
    );
}
EOF

cat <<EOF > src/components/admin/DraftListWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { getDrafts, publishDraft, deleteDraft } from '@/lib/draft-manager';
import { FileText, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DraftListWidget() {
    // Note: Since 'getDrafts' is server action-ish, we usually fetch in parent. 
    // But for simplified widget, we will fetch on mount or just skip standard hydration for now.
    // Ideally this component receives 'initialDrafts' as prop.
    // For this script, we'll keep it client-side fetching via a wrapper or assume parent passes data.
    // Let's make it accept props for simplicity in integration.
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Review Queue (Drafts)
                </h3>
                <span className="text-xs text-gray-400">Auto-refresh on generate</span>
            </div>
            
            <p className="text-sm text-gray-500">
                To integrate this fully, update your Admin Page to fetch drafts using \`getDrafts()\` and pass them here.
            </p>
        </div>
    );
}
EOF
echo "   [✓] Widgets created."
echo ""

# Instructions
echo "Next Steps:"
echo "1. Add 'OPENAI_API_KEY' to .env"
echo "2. Import <AIWriterWidget /> in your Admin Dashboard."
echo "3. (Optional) Enhance DraftListWidget to list real files."
echo ""

echo "================================================="
echo "Setup Complete!"
