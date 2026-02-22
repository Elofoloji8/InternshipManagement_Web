/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Tüm alt klasörleri kapsadığından emin ol
  ],
  theme: {
    extend: {
      colors: {
        "blue-primary": "#2F6FED",
        "blue-dark": "#1C3FAA",
        "light-bg": "#F8F9FF",
        "gray-surface": "#F0F2F5",
      },
      borderRadius: {
        "5xl": "40px",
      },
    },
  },
  plugins: [],
};
