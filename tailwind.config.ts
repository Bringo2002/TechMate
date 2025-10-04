import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "node_modules/flowbite/**/*.js",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neon palette
        "neon-purple": "#8B5CF6",
        "neon-pink": "#EC4899",
        "neon-blue": "#3B82F6",
        "neon-cyan": "#06B6D4",
        "neon-green": "#10B981",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        scanlineSweep: {
          "0%": { left: "-150%" },
          "100%": { left: "150%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradientShift: "gradientShift 20s ease infinite",
        scanlineSweep: "scanlineSweep 0.8s ease forwards",
        shimmer: "shimmer 3s linear infinite",
        "gradient-x": "gradient-x 12s ease infinite",
      },
      boxShadow: {
        "neon-glow":
          "0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(236,72,153,0.6), 0 0 40px rgba(59,130,246,0.6)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui"),
    require("flowbite/plugin"),

    // ⚡ Custom utilities
    plugin(function ({ addComponents, addUtilities }) {
      addComponents({
        // Scanline effect
        ".scanline": {
          position: "relative",
          overflow: "hidden",
        },
        ".scanline::after": {
          content: "''",
          position: "absolute",
          top: "0",
          left: "-150%",
          width: "200%",
          height: "100%",
          background:
            "linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)",
          transform: "skewX(-20deg)",
          transition: "left 0.3s",
        },
        ".scanline:hover::after": {
          animation: "scanlineSweep 0.8s ease forwards",
        },

        // 3D Perspective + Tilt
        ".perspective": {
          perspective: "1000px",
        },
        ".tilt": {
          transformStyle: "preserve-3d",
          transition: "transform 0.3s ease",
        },
        ".tilt:hover": {
          transform: "rotateX(8deg) rotateY(8deg)",
        },
        ".tilt-deep:hover": {
          transform: "rotateX(15deg) rotateY(15deg)",
        },

        // Holographic shimmer text
        ".holo-text": {
          background:
            "linear-gradient(90deg, #8B5CF6, #EC4899, #3B82F6, #06B6D4, #10B981, #8B5CF6)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 6s linear infinite",
          fontWeight: "700",
        },
      });

      // Add gradient-x utility class
      addUtilities({
        ".animate-gradient-x": {
          "background-size": "200% 200%",
          animation: "gradient-x 12s ease infinite",
        },
      });
    }),
  ],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#8B5CF6",
          secondary: "#EC4899",
          accent: "#3B82F6",
          neutral: "#1E293B",
          "base-100": "#0F172A",
          info: "#06B6D4",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      "cupcake",
      "light"
    ],
  },
};

export default config;
