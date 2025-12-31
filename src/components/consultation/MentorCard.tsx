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
