'use client';

import { useEffect, useState } from 'react';
import { getUserPoints } from '@/app/actions/pointsActions';
import { Coins } from 'lucide-react';
import Link from 'next/link';

export default function PointsDisplay() {
    const [points, setPoints] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPoints();
    }, []);

    const loadPoints = async () => {
        try {
            const { points: userPoints } = await getUserPoints();
            setPoints(userPoints);
        } catch (error) {
            console.error('Error loading points:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                <div className="w-12 h-4 bg-gray-300 rounded"></div>
            </div>
        );
    }

    return (
        <Link
            href="/dashboard/points"
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 rounded-lg transition-colors group"
            title="Your loyalty points"
        >
            <Coins className="w-5 h-5 text-yellow-600 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-yellow-900">{points.toLocaleString()}</span>
        </Link>
    );
}
