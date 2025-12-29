import type { Config } from "tailwindcss";

/**
 * CekKirim Design System
 * Theme: "Elegant, Friendly, & Professional"
 * 
 * Color Philosophy:
 * - Primary (Deep Ocean Blue): Trust, Reliability, Professional
 * - Secondary (Vibrant Orange): Energy, Speed, Logistics
 * - Surface (Off-white & Soft Gray): Friendly, Easy on eyes
 */

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // ============================================
            // COLOR PALETTE
            // ============================================
            colors: {
                // Primary: Deep Ocean Blue - Trust & Professional
                primary: {
                    50: '#e6f1ff',
                    100: '#cce3ff',
                    200: '#99c7ff',
                    300: '#66abff',
                    400: '#338fff',
                    500: '#0066CC', // Main primary
                    600: '#0052a3',
                    700: '#003d7a',
                    800: '#002952',
                    900: '#001429',
                    950: '#000a14',
                },

                // Secondary: Vibrant Orange - Energy & Speed
                secondary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316', // Main secondary
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    950: '#431407',
                },

                // Surface: Off-white & Soft Gray - Friendly
                surface: {
                    50: '#fafafa',  // Main background
                    100: '#f5f5f5', // Card background
                    200: '#eeeeee', // Borders
                    300: '#e0e0e0', // Dividers
                    400: '#bdbdbd', // Disabled text
                    500: '#9e9e9e', // Placeholder
                    600: '#757575', // Secondary text
                    700: '#616161', // Body text
                    800: '#424242', // Heading
                    900: '#212121', // Primary text
                },

                // Semantic Colors
                success: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                },
                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                },
                info: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
            },

            // ============================================
            // TYPOGRAPHY - Plus Jakarta Sans
            // ============================================
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
                heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            fontSize: {
                // Headings - Bold & Elegant
                'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
                'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
                'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
                'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
                'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
                'display-xs': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
                // Body - Readable & Friendly
                'body-xl': ['1.25rem', { lineHeight: '1.75', fontWeight: '400' }],
                'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
                'body-md': ['1rem', { lineHeight: '1.625', fontWeight: '400' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
            },

            // ============================================
            // BORDER RADIUS - Modern & Friendly
            // ============================================
            borderRadius: {
                'none': '0',
                'sm': '0.375rem',    // 6px
                'DEFAULT': '0.5rem', // 8px
                'md': '0.625rem',    // 10px
                'lg': '0.75rem',     // 12px
                'xl': '1rem',        // 16px - Default for cards
                '2xl': '1.25rem',    // 20px
                '3xl': '1.5rem',     // 24px
                '4xl': '2rem',       // 32px
                'full': '9999px',
            },

            // ============================================
            // SHADOWS - Soft & Diffused (Elegant Floating)
            // ============================================
            boxShadow: {
                // Soft shadows for cards
                'soft-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                'soft-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
                'soft-md': '0 6px 12px -2px rgba(0, 0, 0, 0.06), 0 3px 7px -3px rgba(0, 0, 0, 0.04)',
                'soft-lg': '0 12px 24px -4px rgba(0, 0, 0, 0.07), 0 4px 8px -4px rgba(0, 0, 0, 0.04)',
                'soft-xl': '0 20px 40px -8px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.04)',
                'soft-2xl': '0 32px 64px -12px rgba(0, 0, 0, 0.1)',

                // Colored shadows
                'primary': '0 4px 14px -2px rgba(0, 102, 204, 0.25)',
                'primary-lg': '0 10px 30px -4px rgba(0, 102, 204, 0.35)',
                'secondary': '0 4px 14px -2px rgba(249, 115, 22, 0.25)',
                'secondary-lg': '0 10px 30px -4px rgba(249, 115, 22, 0.35)',

                // Glow effects
                'glow-primary': '0 0 20px rgba(0, 102, 204, 0.3)',
                'glow-secondary': '0 0 20px rgba(249, 115, 22, 0.3)',

                // Inner shadows
                'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
            },

            // ============================================
            // BACKGROUND GRADIENTS
            // ============================================
            backgroundImage: {
                // Primary gradients
                'gradient-primary': 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
                'gradient-primary-light': 'linear-gradient(135deg, #338fff 0%, #0066CC 100%)',

                // Secondary gradients
                'gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                'gradient-secondary-light': 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',

                // Mixed gradients
                'gradient-brand': 'linear-gradient(135deg, #0066CC 0%, #f97316 100%)',
                'gradient-hero': 'linear-gradient(135deg, #0066CC 0%, #003d7a 50%, #f97316 100%)',

                // Surface gradients
                'gradient-surface': 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
                'gradient-card': 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',

                // Decorative
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-mesh': 'radial-gradient(at 40% 20%, #0066CC 0px, transparent 50%), radial-gradient(at 80% 0%, #f97316 0px, transparent 50%), radial-gradient(at 0% 50%, #338fff 0px, transparent 50%)',
            },

            // ============================================
            // SPACING & SIZING
            // ============================================
            spacing: {
                '4.5': '1.125rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },

            // ============================================
            // ANIMATIONS
            // ============================================
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'fade-in-down': 'fadeInDown 0.6s ease-out',
                'slide-in-left': 'slideInLeft 0.4s ease-out',
                'slide-in-right': 'slideInRight 0.4s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'bounce-soft': 'bounceSoft 0.6s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
            },

            // ============================================
            // TRANSITIONS
            // ============================================
            transitionDuration: {
                '250': '250ms',
                '350': '350ms',
                '400': '400ms',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },

            // ============================================
            // BACKDROP BLUR
            // ============================================
            backdropBlur: {
                xs: '2px',
                '4xl': '72px',
            },
        },
    },
    plugins: [],
};

export default config;
