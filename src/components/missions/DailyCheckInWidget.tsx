'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Calendar, Flame, Gift, X } from 'lucide-react';

export default function DailyCheckInWidget() {
  const [status, setStatus] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await (supabase as any).rpc('get_checkin_status', {
        p_user_id: user.id,
      });

      setStatus(data);

      // Auto-show if can check in
      if (data?.can_checkin && !data?.checked_in_today) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error loading check-in status:', error);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await (supabase as any).rpc('process_daily_checkin', {
        p_user_id: user.id,
      });

      setResult(data);

      if (data?.success) {
        // Reload status
        await loadStatus();
      }
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status?.can_checkin || status?.checked_in_today) {
    return null; // Don't show if already checked in
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 z-50 animate-bounce"
      >
        <Gift className="w-5 h-5" />
        <span className="font-bold">Absen Harian!</span>
      </button>
    );
  }

  const rewardSchedule = [
    { day: 1, points: 10 },
    { day: 2, points: 20 },
    { day: 3, points: 30 },
    { day: 4, points: 40 },
    { day: 5, points: 50 },
    { day: 6, points: 60 },
    { day: 7, points: 100 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {!result ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Absen Harian 📅
              </h2>
              <p className="text-gray-600">
                Absen setiap hari untuk dapatkan poin!
              </p>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-6 h-6 text-orange-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Streak Saat Ini</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {status?.current_streak || 0} Hari
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Schedule */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Jadwal Hadiah:</h3>
              <div className="grid grid-cols-7 gap-2">
                {rewardSchedule.map((reward) => {
                  const isNext =
                    status?.current_streak + 1 === reward.day ||
                    (status?.current_streak === 0 && reward.day === 1);
                  const isPassed = reward.day <= (status?.current_streak || 0);

                  return (
                    <div
                      key={reward.day}
                      className={`text-center p-2 rounded-lg ${
                        isNext
                          ? 'bg-orange-500 text-white ring-2 ring-orange-600'
                          : isPassed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <p className="text-xs font-semibold">D{reward.day}</p>
                      <p className="text-xs">{reward.points}pt</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Check-in Button */}
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Loading...'
                : `Absen Sekarang! (+${status?.next_reward} Poin)`}
            </button>

            {/* Info */}
            <p className="text-xs text-gray-500 text-center mt-4">
              ⚠️ Jika lupa absen 1 hari, streak akan reset ke Hari 1
            </p>
          </>
        ) : (
          <>
            {/* Success Result */}
            <div className="text-center py-8">
              {result.success ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {result.is_bonus_day ? '🎉 BONUS!' : '✅ Berhasil!'}
                  </h2>
                  <p className="text-xl text-gray-700 mb-4">{result.message}</p>
                  <div className="bg-gray-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-orange-600">
                      Hari {result.streak_day}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setResult(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                  >
                    OK
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Oops!
                  </h2>
                  <p className="text-gray-700 mb-6">{result.message}</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setResult(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
