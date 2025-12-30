import { getCourseBySlug } from '@/lib/academy-service';
import VideoPlayer from '@/components/academy/VideoPlayer';
import CourseProgress from '@/components/academy/CourseProgress';
import { notFound } from 'next/navigation';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CoursePage({ params }: Props) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) notFound();

    // Pick first uncompleted lesson or just first lesson for MVP
    const activeLesson = course.lessons.find(l => !l.isCompleted) || course.lessons[0];
    const completedCount = course.lessons.filter(l => l.isCompleted).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Player */}
                    <div className="lg:col-span-2">
                        <VideoPlayer videoId={activeLesson.videoUrl} title={activeLesson.title} />

                        <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h1 className="text-2xl font-bold mb-2">{activeLesson.title}</h1>
                            <p className="text-gray-600">{course.description}</p>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="font-bold mb-4">Progress Kursus</h2>
                            <CourseProgress completed={completedCount} total={course.lessons.length} />
                        </div>

                        {/* Playlist */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="font-bold">Daftar Materi</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {course.lessons.map((lesson, idx) => {
                                    const isActive = lesson.id === activeLesson.id;
                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex-shrink-0">
                                                {lesson.isCompleted ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : isActive ? (
                                                    <PlayCircle className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                        {idx + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {lesson.title}
                                                </p>
                                                <p className="text-xs text-gray-400">{lesson.duration}</p>
                                            </div>
                                            {!lesson.isCompleted && !isActive && idx > completedCount && (
                                                <Lock className="w-4 h-4 text-gray-300" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
