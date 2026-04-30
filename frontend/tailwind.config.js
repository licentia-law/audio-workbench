/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          raised: '#16213e',
          overlay: '#0f3460',
        },
        accent: {
          DEFAULT: '#e94560',
          hover: '#c73652',
        },
        ink: {
          850: '#0B1020',
          800: '#0F1428',
          700: '#141A2E',
          600: '#1A2138',
          500: '#222B47',
        },
        line: {
          DEFAULT: '#1F2742',
          2: '#2A3358',
        },
        fg: {
          DEFAULT: '#E6ECFF',
          dim: '#A8B0CF',
          mute: '#6E769B',
          faint: '#4A527A',
        },
        brand: {
          cyan: '#5EE6D6',
          cyanDeep: '#2DBEAE',
          indigo: '#7C8CFF',
        },
        play: '#FFB347',
        ok: '#3FCF8E',
        warn: '#F2B544',
        err: '#F46E7A',
      },
    },
  },
  plugins: [],
}
