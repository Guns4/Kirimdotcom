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
