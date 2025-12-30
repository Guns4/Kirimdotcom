'use server';

import { sendHeartbeat } from '@/lib/dead-mans-switch';

export async function sendHeartbeatAction() {
    await sendHeartbeat();
}
