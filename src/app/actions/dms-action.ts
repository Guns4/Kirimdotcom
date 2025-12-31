'use server'

import { DMS } from '@/lib/dead-mans-switch';
import { revalidatePath } from 'next/cache';

export async function checkInAction() {
    try {
        const result = await DMS.checkIn();
        revalidatePath('/admin');
        return { success: true, timestamp: result.timestamp };
    } catch (error) {
        console.error('Heartbeat failed:', error);
        return { success: false, error: 'Failed to update heartbeat' };
    }
}
