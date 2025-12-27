'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Get all forum categories
 */
export async function getForumCategories() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        return { data, error };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { data: null, error: 'Failed to fetch categories' };
    }
}

/**
 * Get threads by category
 */
export async function getThreadsByCategory(categorySlug?: string, limit: number = 20) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('forum_threads')
            .select('*, forum_categories(name, slug)')
            .eq('is_deleted', false)
            .order('last_activity_at', { ascending: false })
            .limit(limit);

        if (categorySlug) {
            const { data: category } = await supabase
                .from('forum_categories')
                .select('id')
                .eq('slug', categorySlug)
                .single();

            if (category) {
                query = query.eq('category_id', category.id);
            }
        }

        const { data, error } = await query;

        return { data, error };
    } catch (error) {
        console.error('Error fetching threads:', error);
        return { data: null, error: 'Failed to fetch threads' };
    }
}

/**
 * Get thread with comments
 */
export async function getThread(slug: string) {
    try {
        const supabase = await createClient();

        // Get thread
        const { data: thread, error: threadError } = await supabase
            .from('forum_threads')
            .select('*, forum_categories(name, slug)')
            .eq('slug', slug)
            .eq('is_deleted', false)
            .single();

        if (threadError || !thread) {
            return { thread: null, comments: null, error: 'Thread not found' };
        }

        // Increment views
        await supabase
            .from('forum_threads')
            .update({ views_count: thread.views_count + 1 })
            .eq('id', thread.id);

        // Get comments
        const { data: comments } = await supabase
            .from('forum_comments')
            .select('*')
            .eq('thread_id', thread.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        return { thread, comments: comments || [], error: null };
    } catch (error) {
        console.error('Error fetching thread:', error);
        return { thread: null, comments: null, error: 'Failed to fetch thread' };
    }
}

/**
 * Create new thread
 */
export async function createThread(
    categoryId: string,
    title: string,
    content: string
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'Not authenticated',
            };
        }

        const { data: threadId, error } = await supabase.rpc('create_forum_thread', {
            p_author_id: user.id,
            p_category_id: categoryId,
            p_title: title,
            p_content: content,
        });

        if (error) {
            console.error('Error creating thread:', error);
            return {
                success: false,
                error: 'Failed to create thread',
            };
        }

        // Get the created thread
        const { data: thread } = await supabase
            .from('forum_threads')
            .select('slug')
            .eq('id', threadId)
            .single();

        return {
            success: true,
            message: 'Thread created! +15 points',
            slug: thread?.slug,
        };
    } catch (error) {
        console.error('Error in createThread:', error);
        return {
            success: false,
            error: 'System error',
        };
    }
}

/**
 * Create comment
 */
export async function createComment(threadId: string, content: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'Not authenticated',
            };
        }

        const { error } = await supabase.rpc('create_forum_comment', {
            p_author_id: user.id,
            p_thread_id: threadId,
            p_content: content,
        });

        if (error) {
            console.error('Error creating comment:', error);
            return {
                success: false,
                error: 'Failed to create comment',
            };
        }

        return {
            success: true,
            message: 'Comment posted! +5 points',
        };
    } catch (error) {
        console.error('Error in createComment:', error);
        return {
            success: false,
            error: 'System error',
        };
    }
}

/**
 * Toggle like
 */
export async function toggleLike(targetType: 'thread' | 'comment', targetId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'Not authenticated',
            };
        }

        const { data: isLiked, error } = await supabase.rpc('toggle_forum_like', {
            p_user_id: user.id,
            p_target_type: targetType,
            p_target_id: targetId,
        });

        if (error) {
            console.error('Error toggling like:', error);
            return {
                success: false,
                error: 'Failed to toggle like',
            };
        }

        return {
            success: true,
            isLiked,
        };
    } catch (error) {
        console.error('Error in toggleLike:', error);
        return {
            success: false,
            error: 'System error',
        };
    }
}
