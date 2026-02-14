/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#00f0ff',
        'neon-purple': '#ff00ff',
        'deep-purple': '#6600ff',
        'dark-bg': '#050510',
        'darker-bg': '#020208',
      },
      animation: {
        'grid-move': 'gridMove 20s linear infinite',
        'orb-pulse': 'orbPulse 8s ease-in-out infinite',
      },
      keyframes: {
        gridMove: {
          '0%': { transform: 'perspective(500px) rotateX(60deg) translateY(0)' },
          '100%': { transform: 'perspective(500px) rotateX(60deg) translateY(50px)' },
        },
        orbPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
