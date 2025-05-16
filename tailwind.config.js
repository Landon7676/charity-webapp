/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: "#332288",
        cyan: "#88CCEE",
        teal: "#44AA99",
        green: "#117733",
        olive: "#999933",
        sand: "#DDCC77",
        rose: "#CC6677",
        wine: "#882255",
        purple: "#AA4499",
        palegray: "#DDDDDD",
      },
    },
  },
  plugins: [],
};
