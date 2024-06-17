import type { Config } from 'tailwindcss'

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./app.vue",
  ],
  theme: {
    maxHeight: {
      500: '31.25rem',
    },
    extend: {
      spacing: {
        '12-5': "3.25rem"
      },
      fontSize: {
        xxs: "0.625rem",
        l: '1.125rem'
      },
      colors: {
        ssprimary: '#ff3a59',
        'ssprimary-light': '#fd7f73',
        'ssprimary-light-50': "#fee6e5",
        '2e': '#2e2e2e',
        background: '#f5f5f5'
      },
    },
  },
  plugins: [],
} satisfies Config

