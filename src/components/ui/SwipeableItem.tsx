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
