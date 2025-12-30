'use client';

interface Props {
    completed: number;
    total: number;
}

export default function CourseProgress({ completed, total }: Props) {
    const percentage = Math.round((completed / total) * 100) || 0;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>Progress Belajar</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
                {completed} dari {total} materi selesai
            </p>
        </div>
    );
}
