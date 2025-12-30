'use client';

import { useState } from 'react';
import { HeartPulse, CheckCircle } from 'lucide-react';
import { sendHeartbeatAction } from '@/app/actions/dms-action'; // We need a server action for client comp

export default function HeartbeatButton() {
    const [pulsing, setPulsing] = useState(false);
    const [done, setDone] = useState(false);

    const handlePulse = async () => {
        setPulsing(true);
        try {
            await sendHeartbeatAction();
            setDone(true);
            setTimeout(() => setDone(false), 3000);
        } catch (e) {
            alert('Failed to send heartbeat');
        } finally {
            setPulsing(false);
        }
    };

    return (
        <button
            onClick={handlePulse}
            disabled={pulsing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-md
            ${done
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                }
        `}
        >
            {done ? <CheckCircle className="w-5 h-5" /> : <HeartPulse className={`w-5 h-5 ${pulsing ? 'animate-ping' : ''}`} />}
            {done ? 'Responded' : "I'm Alive"}
        </button>
    );
}
