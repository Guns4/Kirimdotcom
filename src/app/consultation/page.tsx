import { getAllMentors } from '@/lib/consultation-service';
import MentorCard from '@/components/consultation/MentorCard';

export const metadata = {
    title: 'Consultation - Cari Mentor Bisnis',
    description: 'Konsultasi privat dengan ahli logistik dan bisnis online.',
};

export default async function ConsultationPage() {
    const mentors = await getAllMentors();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-blue-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Cari Mentor, Scale Up Bisnismu</h1>
                    <p className="text-blue-200 max-w-2xl mx-auto text-lg">
                        Belajar langsung dari praktisi yang sudah terbukti sukses. Hemat waktu, hindari kesalahan fatal.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map(mentor => (
                        <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                </div>
            </div>
        </div>
    );
}
