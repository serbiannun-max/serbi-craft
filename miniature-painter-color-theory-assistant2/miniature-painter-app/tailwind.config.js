/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#14120F',
          panel: '#1C1916',
          panel2: '#242019',
          border: '#332C24',
          copper: '#C77B3D',
          copperDim: '#8F5A2E',
          sage: '#6B8F71',
          ink: '#EDE6DA',
          mute: '#9C948A',
          warn: '#C7554A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
