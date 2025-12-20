/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gaming: {
                    900: '#0f1012', // Krafton Dark BG
                    800: '#1a1b1e', // Card BG
                    700: '#2a2b30',
                    accent: '#F2A900', // Krafton Gold
                    primary: '#FFD700', // Bright Gold
                    secondary: '#ffffff', // White
                    success: '#00ff9d',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Orbitron', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
