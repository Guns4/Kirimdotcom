'use server';

import { toggleLockdown } from '@/lib/lockdown';
import { revalidatePath } from 'next/cache';

export async function toggleLockdownAction(status: boolean) {
    await toggleLockdown(status);
    revalidatePath('/');
}
