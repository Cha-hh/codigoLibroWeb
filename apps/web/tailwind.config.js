/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}