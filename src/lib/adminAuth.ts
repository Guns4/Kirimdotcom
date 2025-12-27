'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Check if current user is admin
 */
export async function checkIsAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/admin');
    }

    // Check admin role from profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect('/?error=unauthorized');
    }

    return user;
}

/**
 * Get admin user or redirect
 */
export async function requireAdmin() {
    return await checkIsAdmin();
}
