import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isPremium: false });
    }

    // Check premium status
    const { data: isPremium } = await supabase.rpc('is_user_premium', {
      p_user_id: user.id,
    });

    return NextResponse.json({ isPremium: isPremium || false });
  } catch (error) {
    console.error('Error checking premium:', error);
    return NextResponse.json({ isPremium: false });
  }
}
