import { NextResponse } from 'next/server';
import {
  postToTwitter,
  postToFacebook,
  logSocialActivity,
} from '@/lib/social-publisher';

export async function POST(request: Request) {
  // 1. Verify Secret (Basic security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.AUTO_POST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse Payload
  const body = await request.json();
  const { title, url, excerpt } = body;

  if (!title || !url) {
    return NextResponse.json(
      { error: 'Missing title or url' },
      { status: 400 }
    );
  }

  console.log('[AutoPost] Triggered for:', title);

  // 3. Execute Posts (Parallel)
  const results = await Promise.all([
    postToTwitter(`New Article: ${title}\n\n${excerpt || ''}`, url),
    postToFacebook(`Check out our latest post: ${title}`, url),
  ]);

  // 4. Log
  await logSocialActivity(title, results);

  return NextResponse.json({
    success: true,
    results,
  });
}
