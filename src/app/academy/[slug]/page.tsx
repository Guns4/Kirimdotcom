'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VideoPlayer from '@/components/academy/VideoPlayer';
import CourseProgress from '@/components/academy/CourseProgress';
import {
    getCourseBySlug,
    getCourseModules,
    getModuleLessons,
    updateProgress
} from '@/lib/academy-service';

export default function CoursePlayerPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourse();
    }, [slug]);

    const loadCourse = async () => {
        try {
            const courseData = await getCourseBySlug(slug);
            if (!courseData) return;

            setCourse(courseData);
            const modulesData = await getCourseModules(courseData.id);

            const modulesWithLessons = await Promise.all(
                modulesData.map(async (module) => ({
                    ...module,
                    lessons: await getModuleLessons(module.id)
                }))
            );

            setModules(modulesWithLessons);

            // Set first lesson as current
            if (modulesWithLessons[0]?.lessons[0]) {
                setCurrentLesson(modulesWithLessons[0].lessons[0]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading course:', error);
            setLoading(false);
        }
    };

    const handleLessonClick = (lessonId: string) => {
        const lesson = modules
            .flatMap(m => m.lessons)
            .find(l => l.id === lessonId);

        if (lesson) {
            setCurrentLesson(lesson);
        }
    };

    const handleVideoComplete = async () => {
        if (!currentLesson) return;

        // Mark as completed
        setCompletedLessons(prev => [...new Set([...prev, currentLesson.id])]);

        // Update in database (mock - would need user auth)
        // await updateProgress(userId, currentLesson.id, true, 0);

        // Auto-play next lesson
        const allLessons = modules.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < allLessons.length - 1) {
            setCurrentLesson(allLessons[currentIndex + 1]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading course...</div>
            </div>
        );
    }

    if (!course || !currentLesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Course not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main video area */}
                    <div className="lg:col-span-2">
                        <VideoPlayer
                            videoUrl={currentLesson.video_url}
                            onComplete={handleVideoComplete}
                        />

                        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
                            <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                            <p className="text-gray-600">{course.title}</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <CourseProgress
                            modules={modules}
                            completedLessonIds={completedLessons}
                            onLessonClick={handleLessonClick}
                            currentLessonId={currentLesson.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
