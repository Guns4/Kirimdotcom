import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courierCode, affiliateType, destinationUrl } = body;

    if (!courierCode || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user info
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get request headers for tracking
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';

    // Hash IP for privacy
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + 'salt')
      .digest('hex')
      .substring(0, 16);

    // Generate session ID from user agent + IP hash
    const sessionId = crypto
      .createHash('md5')
      .update(userAgent + ipHash + new Date().toDateString())
      .digest('hex');

    // Save click to database
    // Note: Using 'as any' until types are regenerated after running SQL schema
    const { error } = await (supabase as any).from('affiliate_clicks').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      courier_code: courierCode.toLowerCase(),
      affiliate_type: affiliateType || 'official',
      destination_url: destinationUrl,
      referrer: referer,
      user_agent: userAgent.substring(0, 500),
      ip_hash: ipHash,
    });

    if (error) {
      console.error('Affiliate click tracking error:', error);
      // Don't fail the request - tracking is optional
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Affiliate tracking error:', error);
    return NextResponse.json({ success: true }); // Silent fail
  }
}
