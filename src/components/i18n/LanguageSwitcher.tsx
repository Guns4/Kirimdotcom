'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Globe } from 'lucide-react'

const languages = [
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSwitcher() {
    const locale = useLocale()
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const currentLang = languages.find(l => l.code === locale) || languages[0]

    const switchLanguage = (langCode: string) => {
        // Set cookie for locale
        document.cookie = `NEXT_LOCALE=${langCode};path=/;max-age=31536000`
        // Reload page to apply new locale
        window.location.reload()
    }

    if (!mounted) {
        return (
            <div className="w-20 h-9 bg-white/5 rounded-lg animate-pulse" />
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-all"
            >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                <Globe className="w-4 h-4 opacity-50" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    switchLanguage(lang.code)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-all ${lang.code === locale ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-300'
                                    }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
