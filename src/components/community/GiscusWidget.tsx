'use client'

import React, { useEffect, useRef } from 'react'

interface GiscusWidgetProps {
    repo: string
    repoId: string
    category: string
    categoryId: string
    mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
    term?: string
    theme?: 'light' | 'dark' | 'dark_dimmed' | 'transparent_dark' | 'preferred_color_scheme'
    lang?: string
}

export default function GiscusWidget({
    repo,
    repoId,
    category,
    categoryId,
    mapping = 'pathname',
    term = '',
    theme = 'dark',
    lang = 'id'
}: GiscusWidgetProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current || ref.current.firstChild) return

        const script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'
        script.setAttribute('data-repo', repo)
        script.setAttribute('data-repo-id', repoId)
        script.setAttribute('data-category', category)
        script.setAttribute('data-category-id', categoryId)
        script.setAttribute('data-mapping', mapping)
        if (term) script.setAttribute('data-term', term)
        script.setAttribute('data-strict', '0')
        script.setAttribute('data-reactions-enabled', '1')
        script.setAttribute('data-emit-metadata', '0')
        script.setAttribute('data-input-position', 'top')
        script.setAttribute('data-theme', theme)
        script.setAttribute('data-lang', lang)
        script.setAttribute('data-loading', 'lazy')
        script.crossOrigin = 'anonymous'
        script.async = true

        ref.current.appendChild(script)
    }, [repo, repoId, category, categoryId, mapping, term, theme, lang])

    return <div ref={ref} className="w-full mt-8" />
}
