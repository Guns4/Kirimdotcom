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
        const prompt = `
        Bertindaklah sebagai SEO Content Writer profesional.
        Topik: "${keyword}"
        
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
        `;

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
        const filename = `${slug}.mdx`;

        if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

        fs.writeFileSync(path.join(DRAFTS_DIR, filename), cleanContent);

        revalidatePath('/dashboard/admin');
        return { success: true, filename };

    } catch (error: any) {
        console.error('AI Writer Error:', error);
        return { success: false, error: error.message };
    }
}
