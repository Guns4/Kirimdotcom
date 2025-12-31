'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Send } from 'lucide-react';

export default function VoiceRecorder({ onTranscribed }: { onTranscribed: (text: string) => void }) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = uploadAudio;

            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (err) {
            alert('Izin mikrofon ditolak.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            setProcessing(true);
        }
    };

    const uploadAudio = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = []; // Reset

        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');

        try {
            // Call API (We assume logic is implemented in an API route for brevity)
            // Ideally calling a Server Action that uses `transcribeAudio`
            const res = await fetch('/api/support/voice-transcribe', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.text) {
                onTranscribed(data.text);
            }
        } catch (e) {
            alert('Gagal mengirim suara.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!recording ? (
                <button
                    onClick={startRecording}
                    disabled={processing}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                    {processing ? <Loader2 className="animate-spin" /> : <Mic />}
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                >
                    <Square fill="currentColor" />
                </button>
            )}

            {recording && <span className="text-sm text-red-500 font-medium">Recording...</span>}
        </div>
    );
}
