import React, { useState } from 'react';

interface Props {
    onSelect: (date: Date) => void;
}

export default function BookingCalendar({ onSelect }: Props) {
    // Simple Mock Date Picker
    const [selectedDate, setSelectedDate] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
        if (e.target.value) {
            onSelect(new Date(e.target.value));
        }
    };

    return (
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <label className="block text-sm font-medium mb-2">Select Date & Time</label>
            <input
                type="datetime-local"
                className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-zinc-500 mt-2">
                *Available slots are shown in your local timezone.
            </p>
        </div>
    );
}
