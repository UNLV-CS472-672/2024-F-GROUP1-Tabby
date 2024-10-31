// tailwind.config.js

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",  // Include all JS, JSX, TS, and TSX files in the app folder
    "./components/**/*.{js,jsx,ts,tsx}",  // Include all JS, JSX, TS, and TSX files in the components folder]
    "./app/(tabs)/meditate.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        rmono: ['Roboto-Mono', 'sans-serif']
      }
    },
    // ,
    // colors: {
    //   "primary": "#1E1E1E",
    //   "background": "#FFFFFF",
    //   "textWhite": "#FFFFFF",
    //   "textGray": "#9ca3af",
    //   "textDark": "#1A1A1A"
    // }
  },
  plugins: [],
}