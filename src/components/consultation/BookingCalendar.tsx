'use client';

import { useState } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';
import Link from 'next/link';

export default function BookingCalendar() {
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Mock Next 7 Days
    const days = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
    });

    const timeSlots = ['09:00', '10:00', '13:00', '15:00', '19:00'];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Pilih Jadwal Konsultasi
            </h3>

            {/* Date Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {days.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedDate(idx)}
                        className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center transition-all ${selectedDate === idx
                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <span className="text-xs font-medium">{day.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                        <span className="text-xl font-bold">{day.getDate()}</span>
                    </button>
                ))}
            </div>

            {/* Time Selector */}
            {selectedDate !== null && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Jam Tersedia
                    </h4>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${selectedTime === time
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Action */}
            <div className="border-t border-gray-100 pt-4">
                <Link
                    href={selectedTime ? `/consultation/room/BOOK-${Date.now()}` : '#'}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedTime
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {selectedTime ? (
                        <>Konfirmasi & Bayar <Check className="w-4 h-4" /></>
                    ) : 'Pilih Jadwal Dulu'}
                </Link>
            </div>
        </div>
    );
}
