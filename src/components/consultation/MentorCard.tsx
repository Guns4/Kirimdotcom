import { Mentor } from '@/lib/consultation-service';
import { Star, Briefcase, Tag } from 'lucide-react';
import Link from 'next/link';

interface Props {
    mentor: Mentor;
}

export default function MentorCard({ mentor }: Props) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <img
                        src={mentor.avatarUrl}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                    />
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{mentor.name}</h3>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {mentor.title} at {mentor.company}
                        </p>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-bold">{mentor.rating}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {mentor.topics.map(topic => (
                    <span key={topic} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {topic}
                    </span>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-500">Mulai dari</span>
                    <p className="font-bold text-blue-600">Rp {mentor.hourlyRate.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/jam</span></p>
                </div>
                <Link
                    href={`/consultation/${mentor.id}/book`}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${mentor.isAvailable
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {mentor.isAvailable ? 'Book Now' : 'Full Booked'}
                </Link>
            </div>
        </div>
    );
}
