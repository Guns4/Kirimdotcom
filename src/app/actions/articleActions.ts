'use server';

import { createClient } from '@/utils/supabase/server';
import { generateArticleDB, generateMetaDescription } from '@/lib/ai/writer';
import { revalidatePath } from 'next/cache';

// Type definitions
interface Article {
  id: number;
  title: string;
  slug: string;
  content_md: string | null;
  meta_desc: string | null;
  keywords: string[] | null;
  status: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateDraftResult {
  success: boolean;
  data?: Article;
  error?: string;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-|-$/g, ''); // Trim - from start/end
}

/**
 * Create a new draft article using AI
 */
export async function createDraft(
  topic: string,
  keywords: string
): Promise<CreateDraftResult> {
  try {
    const supabase = await createClient();

    // Parse keywords
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // 1. Generate Content using AI
    const content = await generateArticleDB(topic, keywordArray);

    // 2. Extract title from content (first H1)
    const titleMatch = content.match(/^# (.*$)/m);
    const title = titleMatch
      ? titleMatch[1].replace(/[#*]/g, '').trim()
      : topic;

    // 3. Generate slug
    const baseSlug = generateSlug(title);
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;

    // 4. Generate meta description
    const metaDesc = await generateMetaDescription(content);

    // 5. Calculate read time (avg 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // 6. Insert to DB
    const { data, error } = await (supabase.from('articles') as any)
      .insert({
        title,
        slug,
        content_md: content,
        meta_desc: metaDesc,
        keywords: keywordArray,
        status: 'draft',
        read_time_minutes: readTime,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating draft:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/blog/generator');
    revalidatePath('/blog');

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in createDraft:', error);
    return { success: false, error: error.message || 'Failed to create draft' };
  }
}

/**
 * Publish an article (change status to published)
 */
export async function publishArticle(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await (supabase.from('articles') as any)
      .update({ status: 'published' })
      .eq('id', id);

    if (error) {
      console.error('Error publishing article:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/blog/generator');
    revalidatePath('/blog');

    return { success: true };
  } catch (error: any) {
    console.error('Error in publishArticle:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all articles (drafts and published)
 */
export async function getArticles(
  status?: 'draft' | 'published'
): Promise<Article[]> {
  try {
    const supabase = await createClient();

    let query = (supabase.from('articles') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getArticles:', error);
    return [];
  }
}

/**
 * Get single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase.from('articles') as any)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getArticleBySlug:', error);
    return null;
  }
}

/**
 * Delete an article
 */
export async function deleteArticle(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await (supabase.from('articles') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting article:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/blog/generator');

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteArticle:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update article content
 */
export async function updateArticle(
  id: number,
  updates: Partial<
    Pick<Article, 'title' | 'content_md' | 'meta_desc' | 'keywords' | 'status'>
  >
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await (supabase.from('articles') as any)
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating article:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/blog/generator');
    revalidatePath('/blog');

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateArticle:', error);
    return { success: false, error: error.message };
  }
}
