/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#FBC303",
        concrete: "#ECEAE4",
        asphalt: "#1B1B1B",
        mute: "#6B6B6B",
        line: "#E6E6E6",
        soft: "#F4F4F2",
        danger: "#B42318",
      },
      fontFamily: {
        heading: ['"Inter Tight"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: { site: "1200px" },
    },
  },
  plugins: [],
};
