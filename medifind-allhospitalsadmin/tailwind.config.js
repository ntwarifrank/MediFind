/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend :{
     colors: {
       mainBlue:"#3A8EF6",
       deepBlue: "#6F3AFA",
       mainWhite: "#FFFFFF",
       DarkBlue: "#031432",
       mainGray: "#6C87AE",
       whiteGray: "#E2EDFF",
     },
     fontFamily: {
       poppins: ['var(--font-poppins)', 'sans-serif'],
     }
    },
   },
  plugins: [],
};
