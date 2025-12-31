import Link from 'next/link';
import { getCourses } from '@/lib/academy-service';
import { Play, Clock, Users } from 'lucide-react';

export default async function AcademyPage() {
    const courses = await getCourses();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">CekKirim Academy</h1>
                    <p className="text-xl text-gray-600">
                        Master logistics, shipping, and e-commerce with expert-led courses
                    </p>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/academy/${course.slug}`}
                            className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play size={64} className="text-white opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    {course.price === 0
                                        ? 'FREE'
                                        : `Rp ${course.price.toLocaleString()}`
                                    }
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Users size={16} />
                                        <span>{course.instructor_name}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty state */}
                {courses.length === 0 && (
                    <div className="text-center py-20">
                        <Play size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">
                            No courses available yet
                        </h3>
                        <p className="text-gray-500">
                            Check back soon for new content!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
