import { checkSwitchStatus } from '@/lib/dead-mans-switch';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await checkSwitchStatus();
        return NextResponse.json({ success: true, message: 'DMS Checked' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'DMS Check Failed' }, { status: 500 });
    }
}
