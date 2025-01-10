/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false
  },
  important: true,
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  media: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  plugins: []
}
