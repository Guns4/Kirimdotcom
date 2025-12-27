'use client';

import dynamic from 'next/dynamic'

const LabelGenerator = dynamic(() => import('@/components/label/LabelGenerator').then(mod => mod.LabelGenerator), {
    loading: () => <div className="text-white text-center py-20">Loading Generator...</div>,
    ssr: false
})

export default function LabelGeneratorWrapper() {
    return <LabelGenerator />
}
