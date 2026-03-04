/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { backgroundColor: 'rgba(248, 113, 113, 0.5)' }, // light red
          '50%': { backgroundColor: 'rgba(248, 113, 113, 1)' },          // full red
        },
      },
      animation: {
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-red': 'pulseRed 1s infinite', // add red pulse animation
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};