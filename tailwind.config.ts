import type { Config } from "tailwindcss";
import { siteConfig } from "./src/config/site";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: siteConfig.theme.primary,
                purple: siteConfig.theme.secondary, // Keeping 'purple' alias for backward compatibility if needed, or better map 'secondary'
                secondary: siteConfig.theme.secondary,
            },
            backgroundImage: {
                'gradient-primary': `linear-gradient(135deg, ${siteConfig.theme.primary[500]} 0%, ${siteConfig.theme.secondary[600]} 100%)`,
                'gradient-primary-hover': `linear-gradient(135deg, ${siteConfig.theme.primary[600]} 0%, ${siteConfig.theme.secondary[700]} 100%)`,
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeInUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': {
                        transform: 'translateX(-10px)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1',
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
