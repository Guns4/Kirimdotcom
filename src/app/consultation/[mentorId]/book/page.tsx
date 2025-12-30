import { getMentorById } from '@/lib/consultation-service';
import BookingCalendar from '@/components/consultation/BookingCalendar';
import { notFound } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface Props {
    params: Promise<{
        mentorId: string;
    }>;
}

export default async function BookingPage({ params }: Props) {
    const { mentorId } = await params;
    const mentor = await getMentorById(mentorId);

    if (!mentor) notFound();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">Booking Konsultasi</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Mentor Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <img
                                src={mentor.avatarUrl}
                                alt={mentor.name}
                                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                            />
                            <h3 className="text-center font-bold text-lg">{mentor.name}</h3>
                            <p className="text-center text-sm text-gray-500 mb-4">{mentor.title}</p>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {mentor.topics.map(t => (
                                    <div key={t} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> {t}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 bg-blue-50 p-4 rounded-xl text-center">
                                <p className="text-xs text-blue-600 mb-1">Tarif Konsultasi</p>
                                <p className="font-bold text-blue-800 text-lg">Rp {mentor.hourlyRate.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Calendar */}
                    <div className="md:col-span-2">
                        <BookingCalendar />
                    </div>
                </div>
            </div>
        </div>
    );
}
