'use client'

import 'regenerator-runtime/runtime'
import { useEffect, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { Mic, MicOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function VoiceCommander() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    
    // Commands Configuration
    const commands = [
        {
            command: 'buka *',
            callback: (page: string) => {
                if (page.includes('beranda') || page.includes('home')) router.push('/')
                if (page.includes('cek resi')) router.push('/bulk-tracking')
                if (page.includes('dashboard')) router.push('/dashboard')
            }
        },
        {
            command: 'lacak *',
            callback: (resi: string) => {
                // Remove spaces from resi spoken
                const cleanResi = resi.replace(/\s/g, '')
                router.push(`/bulk-tracking?resi=${cleanResi}`)
            }
        },
        {
            command: 'tutup',
            callback: () => setIsOpen(false)
        }
    ]

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition({ commands })

    if (!browserSupportsSpeechRecognition) {
        return null 
    }

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening()
            setIsOpen(false)
        } else {
            SpeechRecognition.startListening({ continuous: true, language: 'id-ID' })
            setIsOpen(true)
        }
    }

    return (
        <>
            <Button
                size="icon"
                className={`fixed bottom-24 right-4 z-50 rounded-full shadow-xl transition-all ${listening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                onClick={toggleListening}
            >
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-36 right-4 z-50 bg-black/80 text-white p-4 rounded-xl backdrop-blur-md max-w-[250px]"
                    >
                        <p className="text-xs text-gray-400 mb-1">Mendengarkan...</p>
                        <p className="font-medium">"{transcript}"</p>
                        <div className="mt-2 text-[10px] text-gray-500">
                            Coba: "Buka Dashboard" atau "Lacak JP12345"
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
