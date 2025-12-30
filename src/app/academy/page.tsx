import { getAllCourses } from '@/lib/academy-service';
import { Clock, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'CekKirim Academy - Belajar Bisnis Online',
    description: 'Pusat edukasi bisnis online dan strategi logistik untuk UMKM.',
};

export default async function AcademyPage() {
    const courses = await getAllCourses();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">CekKirim Academy 🎓</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tingkatkan omzet bisnis onlinemu dengan strategi logistik dan marketing yang terbukti.
                    </p>
                </div>
            </div>

            {/* Course List */}
            <div className="max-w-6xl mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <Link href={`/academy/${course.slug}`} key={course.id} className="group">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {course.totalDuration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {course.studentCount} Siswa
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" /> {course.lessons.length} Materi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
