/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      colors: {
        'terminal': {
          'bg': '#0a0a0a',
          'bg-alt': '#151515',
          'fg': '#00ff00',
          'fg-alt': '#ffffff',
          'accent': '#00ffff',
          'warning': '#ffff00',
          'error': '#ff0000',
          'success': '#00ff00',
          'muted': '#808080',
          'border': '#333333'
        }
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'typewriter': 'typewriter 2s steps(40) 1s 1 normal both',
      },
      keyframes: {
        'blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        'typewriter': {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        }
      }
    },
  },
  plugins: [],
}