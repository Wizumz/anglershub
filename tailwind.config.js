/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal': {
          'bg': '#0a0a0a',
          'bg-alt': '#151515',
          'text': '#00ff00',
          'fg': '#00ff00', // alias for text
          'accent': '#00ffff',
          'warning': '#ffff00',
          'error': '#ff0000',
          'success': '#00ff00',
          'muted': '#808080',
          'border': '#333333',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}