/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0F1F",
        primary: "#3E8FFF",
        accent: "#FF1ED2",
      },
    },
  },
  plugins: [],
};
