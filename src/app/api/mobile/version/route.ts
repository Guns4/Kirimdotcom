import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.0.5',
    bundleUrl: 'https://cdn.cekkirim.com/updates/v1.0.5.zip',
    critical: true,
    changelog: 'Fixing checkout bug and typo in dashboard.'
  });
}
