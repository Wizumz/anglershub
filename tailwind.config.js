/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
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
        },
        'light': {
          'bg': '#ffffff',
          'bg-alt': '#f8f9fa',
          'text': '#1a1a1a',
          'fg': '#1a1a1a', // alias for text
          'accent': '#0066cc',
          'warning': '#ff8c00',
          'error': '#dc3545',
          'success': '#28a745',
          'muted': '#6c757d',
          'border': '#dee2e6',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}