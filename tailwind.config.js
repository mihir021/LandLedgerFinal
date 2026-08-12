/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFF8E7",
        voxel: {
          navy: "#0A1628",
          dark: "#060D17",
          gold: "#D4AF37",
          grass: "#4A7C3F",
          stone: "#8A8A8A",
          sand: "#C9A876",
        },
        comic: {
          blue: "#2D5BFF",
          yellow: "#FFD400",
          black: "#111111",
          red: "#FF4D5E",
          green: "#3FCB6B",
          purple: "#9D4EDD",
          orange: "#FF8500",
          pink: "#FF007F",
          cardBg: "#FFFFFF",
          muted: "#4A4A4A",
        }
      },
      fontFamily: {
        pixel: ['Pixelify Sans', 'Silkscreen', 'Press Start 2P', 'monospace'],
        sans: ['Pixelify Sans', 'Inter', 'sans-serif'],
        serif: ['Pixelify Sans', 'Fraunces', 'serif'],
        comic: ['Bangers', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'voxel-gold': '4px 4px 0px rgba(212, 175, 55, 0.3)',
        'voxel-dark': '4px 4px 0px #0A1628',
        'voxel-grass': '4px 4px 0px #4A7C3F',
        'pop-sm': '3px 3px 0px #111111',
        'pop': '5px 5px 0px #111111',
        'pop-lg': '7px 7px 0px #111111',
        'pop-xl': '10px 10px 0px #111111',
        'pop-yellow': '6px 6px 0px #FFD400',
        'pop-blue': '6px 6px 0px #2D5BFF',
        'pop-red': '6px 6px 0px #FF4D5E',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 5px rgba(255, 212, 0, 0.6))' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 15px rgba(255, 212, 0, 0.9))' },
        }
      },
      animation: {
        wiggle: 'wiggle 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
