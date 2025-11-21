/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode:'class',
  theme: {
    extend: {
      fontFamily:{
        quintessential:['Quintessential','serif'],
        imFellFrench:['IM Fell French Canon', 'serif']
      }
    },
  },
  plugins: [],
}