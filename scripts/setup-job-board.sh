#!/bin/bash

# Setup Job Board Module
echo "🚀 Setting up Job Board (Hiring)..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_jobs.sql
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Full-time', 'Part-time', 'Freelance'
    location TEXT DEFAULT 'Remote',
    salary_range TEXT,
    description TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    resume_url TEXT,
    cover_letter TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read jobs" ON jobs FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users manage own jobs" ON jobs FOR ALL USING (auth.uid() = user_id);
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/jobs.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const getJobs = async () => {
    const supabase = await createClient()
    // Premium jobs first
    const { data } = await supabase.from('jobs')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false })
    return data || []
}

export const postJob = async (data: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Mock payment check for premium would go here
        
        const { error } = await supabase.from('jobs').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        return { success: true }
    })
}
EOF

# 3. Create UI
echo "🎨 Creating Job Board UI..."
mkdir -p src/app/marketplace/jobs

cat << 'EOF' > src/app/marketplace/jobs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getJobs } from '@/app/actions/jobs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, DollarSign, Crown } from 'lucide-react'

export default function JobBoardPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getJobs().then(data => {
            setJobs(data)
            setLoading(false)
        })
    }, [])

    return (
        <div className="space-y-6 container-custom py-8">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold">Cari Tim Impianmu</h1>
                    <p className="opacity-90 mt-2">Platform lowongan kerja khusus Seller & UMKM.</p>
                </div>
                <Button variant="secondary" size="lg">Pasang Lowongan (Gratis)</Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <Card key={job.id} className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-200 transition-all ${job.is_premium ? 'border-l-4 border-l-yellow-400 bg-yellow-50/30' : ''}`}>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        {job.title}
                                        {job.is_premium && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none"><Crown className="w-3 h-3 mr-1" /> Featured</Badge>}
                                    </h3>
                                    <Badge variant="outline">{job.type}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary_range}</span>
                                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Button>Lamar</Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
EOF

echo "✅ Job Board Setup Complete!"
