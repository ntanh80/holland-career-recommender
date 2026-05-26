/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af' },
        holland: {
          R: '#e74c3c', I: '#3498db', A: '#9b59b6',
          S: '#2ecc71', E: '#f39c12', C: '#1abc9c',
        },
      },
    },
  },
  plugins: [],
};
