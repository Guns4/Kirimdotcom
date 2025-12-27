'use client'

import { motion } from 'framer-motion'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
import { useVoiceInput } from '@/hooks/useVoiceInput'

interface VoiceSearchButtonProps {
    onResult: (courier: string | null, resi: string | null) => void
    isCompact?: boolean
}

export function VoiceSearchButton({ onResult, isCompact = false }: VoiceSearchButtonProps) {
    const {
        isListening,
        startListening,
        stopListening,
        isSupported,
        transcript
    } = useVoiceInput((result) => {
        onResult(result.courier, result.resi)
        // Optionally stop after match?
        // stopListening() 
        // Better to let user manually stop or auto-stop on silence (handled by browser usually)
    })

    if (!isSupported) return null

    return (
        <div className="relative flex items-center">
            <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center justify-center transition-all ${isListening
                        ? 'text-red-500 hover:text-red-600 bg-red-100/10 rounded-full p-2'
                        : 'text-gray-400 hover:text-indigo-400 p-2'
                    }`}
                title={isListening ? "Listening..." : "Search by Voice"}
            >
                {isListening ? (
                    <MicOff className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                ) : (
                    <Mic className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                )}
            </button>

            {/* Visual Feedback / Wave Animation */}
            {isListening && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex items-center gap-1 h-4">
                    {[1, 2, 3, 4, 3, 2, 1].map((scale, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full"
                            style={{ height: '40%' }}
                            animate={{
                                height: [`40%`, `${scale * 20 + 20}%`, `40%`]
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                    {/* Transcript Hint */}
                    {transcript && (
                        <span className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-xs whitespace-nowrap z-50 pointer-events-none backdrop-blur-md border border-white/10">
                            "{transcript}"
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
