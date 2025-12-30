'use server';

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
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const stats = fs.statSync(path.join(DRAFTS_DIR, file));
      return {
        filename: file,
        title: file.replace(/-/g, ' ').replace('.mdx', ''), // Simple title inference
        created: stats.birthtime.toISOString(),
      };
    });
}

export async function publishDraft(filename: string) {
  const src = path.join(DRAFTS_DIR, filename);
  const dest = path.join(BLOG_DIR, filename);

  if (fs.existsSync(src)) {
    if (!fs.existsSync(BLOG_DIR)) {
      fs.mkdirSync(BLOG_DIR, { recursive: true });
    }
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
