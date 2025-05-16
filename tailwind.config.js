// tailwind.config.js
const plugin = require('tailwindcss/plugin');

<<<<<<< HEAD
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
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        primary: 'oklch(var(--primary) / <alpha-value>)',
        'primary-foreground': 'oklch(var(--primary-foreground) / <alpha-value>)',
        secondary: 'oklch(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'oklch(var(--secondary-foreground) / <alpha-value>)',
        // Add more if needed
      },
    },
  },
  plugins: [],
=======

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
       background: 'oklch(var(--background) / <alpha-value>)',
       foreground: 'oklch(var(--foreground) / <alpha-value>)',
       primary: 'oklch(var(--primary) / <alpha-value>)',
       'primary-foreground': 'oklch(var(--primary-foreground) / <alpha-value>)',
       secondary: 'oklch(var(--secondary) / <alpha-value>)',
       'secondary-foreground': 'oklch(var(--secondary-foreground) / <alpha-value>)',
       // Add more if needed
     },
   },
 },
 plugins: [],
>>>>>>> Landon
}
