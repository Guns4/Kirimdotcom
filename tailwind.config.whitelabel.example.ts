import type { Config } from "tailwindcss";

/**
 * CekKirim Design System (Whitelabel Ready)
 * 
 * Uses CSS Variables for dynamic theming support.
 * Variables are defined in globals.css and can be overridden by ThemeProvider.
 */

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'var(--color-primary-50, #eff6ff)',
                    100: 'var(--color-primary-100, #dbeafe)',
                    200: 'var(--color-primary-200, #bfdbfe)',
                    300: 'var(--color-primary-300, #93c5fd)',
                    400: 'var(--color-primary-400, #60a5fa)',
                    500: 'var(--color-primary-500, #0066CC)', // Main
                    600: 'var(--color-primary-600, #0052a3)',
                    700: 'var(--color-primary-700, #1d4ed8)',
                    800: 'var(--color-primary-800, #1e40af)',
                    900: 'var(--color-primary-900, #1e3a8a)',
                },
                secondary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: 'var(--color-secondary-500, #f97316)',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                surface: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                }
            },
            fontFamily: {
                sans: ['var(--font-family-sans, "Plus Jakarta Sans")', 'sans-serif'],
                heading: ['var(--font-family-sans, "Plus Jakarta Sans")', 'sans-serif'],
            }
        },
    },
    plugins: [],
};

export default config;
