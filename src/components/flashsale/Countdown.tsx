'use client';

import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface CountdownProps {
  ids: string;
  targetDate: string; // ISO string
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);

    const calculateTime = () => {
      const now = new Date();
      const diff = differenceInSeconds(target, now);

      if (diff <= 0) {
        return { h: 0, m: 0, s: 0 };
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      return { h, m, s };
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 text-white font-mono font-bold text-sm md:text-base">
      <div className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.h).padStart(2, '0')}</div>
      <span>:</span>
      <div className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.m).padStart(2, '0')}</div>
      <span>:</span>
      <div className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.s).padStart(2, '0')}</div>
    </div>
  );
}
