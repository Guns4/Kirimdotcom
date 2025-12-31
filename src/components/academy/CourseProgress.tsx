'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    duration_seconds: number;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface CourseProgressProps {
    modules: Module[];
    completedLessonIds: string[];
    onLessonClick: (lessonId: string) => void;
    currentLessonId?: string;
}

export default function CourseProgress({
    modules,
    completedLessonIds,
    onLessonClick,
    currentLessonId
}: CourseProgressProps) {
    const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    const completedCount = completedLessonIds.length;
    const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>

            {/* Overall progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600">
                        {completedCount} / {totalLessons} lessons
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Module list */}
            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module.id} className="border-b pb-4">
                        <h3 className="font-semibold mb-2">{module.title}</h3>
                        <div className="space-y-2">
                            {module.lessons.map((lesson) => {
                                const isCompleted = completedLessonIds.includes(lesson.id);
                                const isCurrent = currentLessonId === lesson.id;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => onLessonClick(lesson.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isCurrent
                                                ? 'bg-blue-50 border-2 border-blue-500'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                                        ) : (
                                            <Circle className="text-gray-400 flex-shrink-0" size={20} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isCurrent ? 'font-semibold' : ''}`}>
                                                {lesson.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDuration(lesson.duration_seconds)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
