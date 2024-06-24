import type { Config } from 'tailwindcss'

export default {
  darkMode: 'selector',
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
        "font-color": '#333639',
        'dark-background-50': '#18181c',
        'dark-background': '#101014',
        'dark-line': '#2d2d30',
      },
    },
  },
  plugins: [],
} satisfies Config

