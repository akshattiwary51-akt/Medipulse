// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 30%, 50%)",
        accent: "hsl(340, 30%, 60%)",
        background: "hsl(210, 20%, 95%)",
      },
    },
  },
  plugins: [],
};
