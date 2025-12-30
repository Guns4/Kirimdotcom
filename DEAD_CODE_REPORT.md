# Dead Code Candidates

This report lists potential dead code (commented out imports, variables, functions, etc.)

## src/app

### src\app\actions\ai-consultant.ts

- Line 8: `// import { SqlDatabase } from "langchain/sql_db";`
- Line 9: `// import { ChatOpenAI } from "@langchain/openai";`

### src\app\actions\dispute.ts

- Line 109: `// const { data: { user } } = await supabase.auth.getUser()`
- Line 110: `// if (user?.role !== 'admin') throw new Error('Unauthorized')`

### src\app\actions\gsheets.ts

- Line 41: `// const auth = new google.auth.OAuth2(...)`

### src\app\api\cron\monitor-vendor\route.ts

- Line 10: `// const mockBalances = [1000000, 400000, 30000];`
- Line 11: `// return mockBalances[Math.floor(Math.random() * mockBalances.length)];`

### src\app\api\v1\track\route.ts

- Line 36: `// const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)`
- Line 59: `// return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 })`

### src\app\api\webhooks\payment\route.ts

- Line 118: `// const isValid = verifyXenditSignature(body, signature, process.env.XENDIT_CALLBACK_TOKEN)`
- Line 121: `// const { external_id, status, paid_amount } = body`
- Line 123: `// if (status === 'PAID') {`
- Line 139: `// const isValid = verifyLemonSqueezySignature(body, signature, process.env.LS_SIGNING_SECRET)`
- Line 142: `// if (body.meta?.event_name === 'order_created') {`
- Line 143: `//   const orderId = body.data.id`

## src/components

### src\components\analytics\WebVitalsReporter.tsx

- Line 9: `// console.log(metric);`
- Line 11: `// const body = JSON.stringify(metric);`
- Line 12: `// const url = '/api/analytics/vitals';`
- Line 13: `// if (navigator.sendBeacon) {`

### src\components\gamification\UserBadge.tsx

- Line 45: `// if (tier === 'Gold') shineEffect = ''; // Reset complex effect for stability, use standard glow <-- Commenting this out since we added support!`

### src\components\layout\BottomNav.tsx

- Line 12: `// const isHidden = pathname.startsWith('/some-tool')`

### src\components\providers\QueryProvider.tsx

- Line 5: `// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister' // Removed to avoid missing peer dep or simplify`

### src\components\tools\MarketplaceCalculator.tsx

- Line 5: `// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'`

## src/lib

### src\lib\api-auth.ts

- Line 39: `// for external API calls that carry no session cookies.`

### src\lib\feature-flags.ts

- Line 43: `// const userRole = user.user_metadata?.role || 'user';`
- Line 44: `// if (!flag.allowed_roles.includes(userRole)) return false;`

### src\lib\fetchSiteSettings.ts

- Line 2: `// import type { SiteSettings } from '@/types/database.types'`

### src\lib\fuzzy-search.ts

- Line 8: `// const regionData = require('@/data/indonesia-regions');`

### src\lib\image-compression.ts

- Line 110: `// console.log(`[Image Compression] ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`)`

### src\lib\securityHeaders.ts

- Line 91: `// iframe sources (embedded content)`

### src\lib\social-publisher.ts

- Line 29: `// const client = new TwitterApi({ appKey: ..., appSecret: ... });`
- Line 30: `// const res = await client.v2.tweet(`${content} ${url}`);`
- Line 57: `// const res = await axios.post(`https://graph.facebook.com/me/feed`, { message: ..., link: ... });`

### src\lib\tracking-engine.ts

- Line 35: `// const now = new Date() // No longer needed for diff calculation if we use simple methods`


---
**Total potential dead code lines found: 34**
