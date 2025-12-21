/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentiment: {
          positive: '#10b981',
          negative: '#ef4444',
          neutral: '#f59e0b',
        },
        ground: {
          dark: '#1a1a1a',
          'dark-secondary': '#2a2a2a',
          'dark-tertiary': '#3a3a3a',
          light: '#ffffff',
          'light-secondary': '#f9fafb',
          'light-tertiary': '#f3f4f6',
          'light-grey': '#f5f5f5',
          'medium-grey': '#9ca3af',
          'text-primary': '#ffffff',
          'text-secondary': '#d1d5db',
          'text-tertiary': '#9ca3af',
          'text-dark-primary': '#111827',
          'text-dark-secondary': '#374151',
          'text-dark-tertiary': '#6b7280',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



