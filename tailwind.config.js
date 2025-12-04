/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 20px 60px rgba(15, 23, 42, 0.25)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 25px 70px rgba(14, 116, 255, 0.25)',
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 35%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.25) 0, rgba(255,255,255,0) 40%), radial-gradient(circle at 20% 90%, rgba(99,102,241,0.18) 0, rgba(255,255,255,0) 45%)',
      },
      colors: {
        night: '#0B1224',
        glacier: '#89F0FF',
        ink: '#0F172A',
      },
    },
  },
  plugins: [],
};
