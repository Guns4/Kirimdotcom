'use server';

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

/**
 * Admin Cache Invalidation Actions
 * Call these after admin updates data
 */

/**
 * Revalidate site settings after admin update
 */
export async function revalidateSettings() {
  revalidateTag(CACHE_TAGS.SITE_SETTINGS);
  revalidateTag(CACHE_TAGS.COURIER_MARKUP);
  return { success: true, message: 'Settings cache cleared' };
}

/**
 * Revalidate FAQ after admin update
 */
export async function revalidateFAQ() {
  revalidateTag(CACHE_TAGS.FAQ);
  return { success: true, message: 'FAQ cache cleared' };
}

/**
 * Revalidate categories after admin update
 */
export async function revalidateCategories() {
  revalidateTag(CACHE_TAGS.CATEGORIES);
  return { success: true, message: 'Categories cache cleared' };
}

/**
 * Revalidate blog posts after admin update
 */
export async function revalidateBlog() {
  revalidateTag(CACHE_TAGS.BLOG);
  return { success: true, message: 'Blog cache cleared' };
}

/**
 * Revalidate courier markup after admin update
 */
export async function revalidateCourierMarkup() {
  revalidateTag(CACHE_TAGS.COURIER_MARKUP);
  return { success: true, message: 'Courier markup cache cleared' };
}

/**
 * Revalidate locations after admin update
 */
export async function revalidateLocations() {
  revalidateTag(CACHE_TAGS.PROVINCES);
  revalidateTag(CACHE_TAGS.CITIES);
  revalidateTag(CACHE_TAGS.DISTRICTS);
  return { success: true, message: 'Location cache cleared' };
}

/**
 * Revalidate all caches (nuclear option)
 */
export async function revalidateAll() {
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag(tag);
  });
  return { success: true, message: 'All caches cleared' };
}

/**
 * Revalidate by custom tag
 */
export async function revalidateByTag(tag: string) {
  revalidateTag(tag);
  return { success: true, message: `Cache for "${tag}" cleared` };
}
