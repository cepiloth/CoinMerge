/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Toss Design System inspired */
        background: '#F2F4F6',
        primary: '#3182F6',
        text: '#191F28',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'sans-serif',
        ],
      },
      backgroundColor: {
        base: '#F2F4F6',
      },
    },
  },
  plugins: [],
}
