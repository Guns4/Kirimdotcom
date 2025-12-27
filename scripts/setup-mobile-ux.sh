#!/bin/bash

# Setup Mobile UX Module
echo "🚀 Setting up Mobile UX Enhancements..."

# 1. Install Dependencies
echo "📦 Installing use-gesture & react-spring..."
npm install @use-gesture/react react-spring framer-motion

# 2. Create Install Banner
echo "🎨 Creating PWA Install Banner..."
mkdir -p src/components/pwa
cat << 'EOF' > src/components/pwa/InstallBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { siteConfig } from '@/config/site'

export function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // Show banner only if not already installed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setIsVisible(true)
            }
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setIsVisible(false)
        }
        setDeferredPrompt(null)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t z-50 shadow-2xl"
                >
                    <div className="container-custom flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Download className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Install {siteConfig.name}</p>
                                <p className="text-xs text-muted-foreground">Lebih cepat & hemat kuota.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={handleInstall}>
                                Install
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
EOF

# 3. Create Swipeable Item Component
echo "gestures Creating Swipeable List Item..."
mkdir -p src/components/ui
cat << 'EOF' > src/components/ui/SwipeableItem.tsx
'use client'

import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from 'react-spring'
import { Trash2 } from 'lucide-react'

// A simple swipe-to-delete implementation
export function SwipeableItem({ children, onDelete }: { children: React.ReactNode, onDelete: () => void }) {
    const [{ x }, api] = useSpring(() => ({ x: 0 }))

    const bind = useDrag(({ down, movement: [mx] }) => {
        // Trigger delete if swiped left more than 100px
        if (!down && mx < -100) {
            onDelete()
        }
        
        api.start({ x: down ? mx : 0, immediate: down })
    }, { axis: 'x', bounds: { right: 0 } }) // Only allow left swipe

    return (
        <div className="relative overflow-hidden touch-none select-none">
            {/* Background Action (Delete) */}
            <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center text-white z-0">
                <Trash2 className="w-5 h-5" />
            </div>

            {/* Foreground Content */}
            <animated.div 
                {...bind()} 
                style={{ x, touchAction: 'pan-y' }}
                className="relative z-10 bg-white dark:bg-slate-950"
            >
                {children}
            </animated.div>
        </div>
    )
}
EOF

echo "✅ Mobile UX Module Setup Complete!"
