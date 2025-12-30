#!/bin/bash

# setup-mentor-market.sh
# Consultation Service Setup

echo ">>> Setting up Mentor Marketplace..."

# Components Created:
# 1. src/lib/consultation-service.ts (Mock Data)
# 2. supabase/migrations/20251231_create_consultations.sql
# 3. src/components/consultation/MentorCard.tsx
# 4. src/components/consultation/BookingCalendar.tsx
# 5. src/app/consultation/page.tsx (List)
# 6. src/app/consultation/[mentorId]/book/page.tsx (Booking)
# 7. src/app/consultation/room/[bookingId]/page.tsx (Chat)

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Consultation Market Live at: http://localhost:3000/consultation"
