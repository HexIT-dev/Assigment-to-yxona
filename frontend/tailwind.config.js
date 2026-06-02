/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b49a56',
          hover: '#967f44',
        },
        secondary: {
          DEFAULT: '#1a1a1a',
          hover: '#000000',
        },
        surface: {
          DEFAULT: '#ffffff',
          light: '#f8f6f2',
          hover: '#f1ede6',
        },
        accent: '#e2d5b5',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        text: {
          DEFAULT: '#1a1a1a',
          muted: '#666666',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.1)',
        '5xl': '0 50px 100px -20px rgba(180, 154, 86, 0.15)',
      }
    },
  },
  plugins: [],
}
