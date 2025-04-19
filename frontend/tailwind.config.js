/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#D81F26", // Netflix-like red
                secondary: "#181818", // Dark background
                dark: "#000000",
                light: "#E5E5E5",
            },
            animation: {
                'fadeIn': 'fadeIn 0.5s ease-in-out',
                'fadeInUp': 'fadeInUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            aspectRatio: {
                'poster': '2 / 3',
                'backdrop': '16 / 9',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
} 