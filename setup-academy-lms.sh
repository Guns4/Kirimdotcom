#!/bin/bash

# setup-academy-lms.sh
# Knowledge Monetization Infrastructure

echo ">>> Setting up Academy LMS..."

# Components Created:
# 1. src/lib/academy-service.ts (Mock Data / Logic)
# 2. src/components/academy/VideoPlayer.tsx
# 3. src/components/academy/CourseProgress.tsx
# 4. src/app/academy/page.tsx (Catalog)
# 5. src/app/academy/[slug]/page.tsx (Course Player)
# 6. supabase/migrations/20251231_create_lms.sql (Schema)

if [ -f "supabase/migrations/20251231_create_lms.sql" ]; then
    echo ">>> DB Migration File Ready: supabase/migrations/20251231_create_lms.sql"
    echo "Tip: Run this SQL in your Supabase dashboard to create the tables."
fi

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Visit: http://localhost:3000/academy"
