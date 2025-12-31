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
