#!/bin/bash

# setup-mentor-market.sh
# Consultation Service Setup

echo ">>> Setting up Mentor Marketplace..."

# Create Directories
mkdir -p src/lib
mkdir -p supabase/migrations
mkdir -p src/components/consultation
mkdir -p src/app/consultation/[mentorId]/book
mkdir -p src/app/consultation/room/[bookingId]

# 1. Mock Data Service
cat > src/lib/consultation-service.ts << 'EOF'
export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  rate: number; // per hour
  rating: number;
  avatar: string;
  bio: string;
}

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Budi Santoso',
    expertise: ['Logistics Strategy', 'Supply Chain', 'Import/Export'],
    rate: 500000,
    rating: 4.8,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    bio: 'Expert in logistics with 15 years experience managing heavy cargo fleets.'
  },
  {
    id: 'm2',
    name: 'Siti Aminah',
    expertise: ['Digital Marketing', 'E-commerce Growth', 'Branding'],
    rate: 350000,
    rating: 4.9,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    bio: 'Helping detailed oriented businesses grow their online presence.'
  },
  {
    id: 'm3',
    name: 'Andi Pratama',
    expertise: ['Warehouse Management', 'Inventory Control'],
    rate: 400000,
    rating: 4.7,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
    bio: 'Warehouse optimization specialist reducing sortation times by 40%.'
  }
];

export async function getMentorById(id: string): Promise<Mentor | undefined> {
  return MOCK_MENTORS.find(m => m.id === id);
}
EOF

# 2. Database Migration
# Note: In a real app we'd apply this to Supabase.
cat > supabase/migrations/20251231_create_consultations.sql << 'EOF'
-- Mentors Table (Extension of Profile or Separate)
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    expertise TEXT[], -- Array of strings
    rate DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES mentors(id),
    client_id UUID REFERENCES auth.users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
    payment_status TEXT DEFAULT 'UNPAID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages for Consultation Room
CREATE TABLE IF NOT EXISTS consultation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES consultation_bookings(id),
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_system_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Simplified)
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

-- Only participants can view bookings
CREATE POLICY "View own bookings" ON consultation_bookings
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id));
EOF

# 3. Mentor Card Component
cat > src/components/consultation/MentorCard.tsx << 'EOF'
import React from 'react';
import Link from 'next/link';
import { Mentor } from '@/lib/consultation-service';
import Image from 'next/image';

export default function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
      <div className="w-24 h-24 relative mb-4">
        <Image 
            src={mentor.avatar} 
            alt={mentor.name} 
            fill
            className="rounded-full object-cover"
        />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{mentor.name}</h3>
      <p className="text-sm text-zinc-500 mb-2">{mentor.expertise.join(', ')}</p>
      <div className="flex items-center gap-1 mb-4 text-amber-500">
        <span>★</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{mentor.rating}</span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
        {mentor.bio}
      </p>
      <div className="mt-auto w-full">
        <p className="text-zinc-900 dark:text-zinc-100 font-bold mb-3">
          Rp {mentor.rate.toLocaleString('id-ID')} / jam
        </p>
        <Link 
            href={`/consultation/${mentor.id}/book`}
            className="block w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
EOF

# 4. Booking Calendar Component (Mock)
cat > src/components/consultation/BookingCalendar.tsx << 'EOF'
import React, { useState } from 'react';

interface Props {
  onSelect: (date: Date) => void;
}

export default function BookingCalendar({ onSelect }: Props) {
  // Simple Mock Date Picker
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    if (e.target.value) {
      onSelect(new Date(e.target.value));
    }
  };

  return (
    <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
      <label className="block text-sm font-medium mb-2">Select Date & Time</label>
      <input 
        type="datetime-local" 
        className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        onChange={handleChange}
        min={new Date().toISOString().split('T')[0]}
      />
      <p className="text-xs text-zinc-500 mt-2">
        *Available slots are shown in your local timezone.
      </p>
    </div>
  );
}
EOF

# 5. Consultation Listing Page
cat > src/app/consultation/page.tsx << 'EOF'
import React from 'react';
import { MOCK_MENTORS } from '@/lib/consultation-service';
import MentorCard from '@/components/consultation/MentorCard';

export const metadata = {
  title: 'Consultation Market | CekKirim.com',
  description: 'Find expert mentors for your logistics business.',
};

export default function ConsultationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Expert Consultation</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Connect with industry leaders to accelerate your business growth. 
          Get advice on logistics, supply chain, and digital marketing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_MENTORS.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
}
EOF

# 6. Booking Page
cat > src/app/consultation/[mentorId]/book/page.tsx << 'EOF'
'use client';

import React, { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { MOCK_MENTORS } from '@/lib/consultation-service';
import BookingCalendar from '@/components/consultation/BookingCalendar';
import Link from 'next/link';

export default function BookingPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const resolvedParams = use(params);
  const mentor = MOCK_MENTORS.find(m => m.id === resolvedParams.mentorId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (!mentor) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/consultation" className="text-sm text-blue-500 hover:underline mb-4 block">
        &larr; Back to Mentors
      </Link>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Book a Session with {mentor.name}</h1>
        <p className="text-zinc-500 mb-6">{mentor.expertise.join(' • ')}</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Session Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span>Rate</span>
                <span className="font-medium">Rp {mentor.rate.toLocaleString()}/hr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span>Duration</span>
                <span className="font-medium">60 Minutes</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Total</span>
                <span className="font-bold text-lg">Rp {mentor.rate.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Select Schedule</h3>
            <BookingCalendar onSelect={setSelectedDate} />
            
            <button 
                disabled={!selectedDate}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => alert(`Booking functionality mocked.\nMentor: ${mentor.name}\nDate: ${selectedDate?.toLocaleString()}`)}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# 7. Consultation Room (Mock)
cat > src/app/consultation/room/[bookingId]/page.tsx << 'EOF'
import React from 'react';

export default function RoomPage({ params }: { params: { bookingId: string } }) {
  // This would be a real-time chat/video room using Supabase Realtime or WebRTC
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-50 dark:bg-black">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
        <div>
           <h2 className="font-bold">Consultation Session</h2>
           <p className="text-xs text-zinc-500">ID: {params.bookingId}</p>
        </div>
        <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
            End Session
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center text-zinc-400">
        <div className="text-center">
            <p className="text-2xl mb-2">💬</p>
            <p>Secure Consultation Room</p>
            <p className="text-sm">Video & Chat features initialized...</p>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Send</button>
        </div>
      </div>
    </div>
  );
}
EOF

echo ">>> Components Created."
echo ">>> Run 'npm run typecheck' to verify type safety."
