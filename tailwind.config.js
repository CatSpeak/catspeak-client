import scrollbar from "tailwind-scrollbar"
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "cath-red": {
          50: "#100002",
          100: "#230004",
          200: "#370006",
          300: "#4b0008",
          400: "#5e000a",
          500: "#72000d",
          600: "#85000f",
          700: "#990011",
          800: "#ad0013",
          900: "#c00015",
          950: "#d40018",
          1000: "#e7001a",
          1050: "#fb001c",
        },
        "cath-orange": {
          400: "#f08d1d",
          500: "#f4ab1b",
          600: "#ffb84d",
        },
        "cath-yellow": {
          400: "#f4ab1b",
          500: "#ffc107",
        },
        primary: "#72000d",
        danger: "#fb001c",
        warning: "#e7001a",
        success: "#4b0008",
        headingColor: "#2e2e2e",
        textColor: "#515151",
        primary2: "#f3f3f3",
        darkOverlay: "rgba(0,0,0,0.2)",
        lightOverlay: "rgba(255,255,255,0.4)",
        lighttextGray: "#9ca0ab",
        card: "rgba(256,256,256,0.8)",
        cartBg: "#282a2c",
        cartItem: "#2e3033",
        cartTotal: "#343739",
        primaryDark: "#131417",
        primaryText: "#868CA0",
        text555: "#555",
        secondary: "#606060",
        dusk: "#1a1a2e",
        border: "#e5e5e5",
        "main-bg": "#f3f3f3",
      },
      width: {
        150: "150px",
        190: "190px",
        225: "225px",
        275: "275px",
        300: "300px",
        340: "340px",
        350: "350px",
        375: "375px",
        460: "460px",
        656: "656px",
        880: "880px",
        508: "508px",
      },
      height: {
        80: "80px",
        150: "150px",
        225: "225px",
        300: "300px",
        340: "340px",
        370: "370px",
        420: "420px",
        510: "510px",
        600: "600px",
        650: "650px",
        685: "685px",
        800: "800px",
        "90vh": "90vh",
      },
      minWidth: {
        210: "210px",
        350: "350px",
        620: "620px",
      },
      screens: {
        xs: "426px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1800px",
        "2xl": "2024px",
      },
      backgroundImage: {
        "gradient-faq":
          "linear-gradient(to bottom, #72000d, #990011, #c00015, #f08d1d, #f4ab1b)",
        "gradient-red-orange":
          "linear-gradient(to bottom, #72000d, #990011, #c00015, #f08d1d)",
      },
      boxShadow: {
        "faq-card":
          "0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "faq-card-expanded":
          "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        search: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-primary)"],
        nunito: ["var(--font-nunito)"],
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-10deg) scale(1.1)' },
          '50%': { transform: 'rotate(10deg) scale(1.1)' },
        },
        enter: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        leave: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.9)', opacity: 0 },
        },
      },
      animation: {
        wiggle: 'wiggle 0.3s ease-in-out infinite',
        enter: 'enter 200ms ease-out',
        leave: 'leave 150ms ease-in forwards',
      }
    },
  },
  plugins: [scrollbar],
}
