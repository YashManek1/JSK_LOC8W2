/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                neutral: {
                    950: '#0a0a0a',
                    900: '#111111',
                    850: '#1a1a1a',
                    800: '#222222',
                    700: '#333333',
                    600: '#555555',
                    500: '#777777',
                    400: '#999999',
                    300: '#bbbbbb',
                    200: '#dddddd',
                    100: '#f0f0f0',
                    50: '#fafafa',
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};
