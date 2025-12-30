import { NextResponse } from 'next/server';
import { processRenewalReminders } from '@/app/actions/renewalActions';

export async function GET(request: Request) {
  // Basic Auth for Cron (verify header from Vercel json)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await processRenewalReminders();
  return NextResponse.json(result);
}
