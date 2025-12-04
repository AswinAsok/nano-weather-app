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
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 25px 70px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at 50% 30%, rgba(0,0,0,0.05) 0, rgba(0,0,0,0) 36%)',
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
