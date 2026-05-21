/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          card: '#1c1f2e',
          elevated: '#252839',
          border: '#2a2d3e',
        },
        cash: {
          DEFAULT: '#4caf50',
          dim: '#0d2e0d',
          muted: '#2d5a2e',
        },
        card: {
          DEFAULT: '#5b9bd5',
          dim: '#0d1a2e',
          muted: '#1e3a5f',
        },
        account: {
          DEFAULT: '#d55b5b',
          dim: '#2e0d0d',
          muted: '#5a1e1e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
