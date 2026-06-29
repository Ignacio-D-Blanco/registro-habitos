import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0F13", // Tono ultra oscuro para el fondo
        surface: "#1A1A24", // Para tarjetas y modales
        textPrimary: "#FFFFFF",
        textSecondary: "#A0A0AB",
        brand: {
          purple: "#4B208C", // Púrpura Oscuro
          electric: "#8A2BE2", // Violeta Eléctrico
          magenta: "#B030B0", // Magenta/Fucsia Suave
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #4B208C, #8A2BE2, #B030B0)',
      }
    },
  },
  plugins: [],
};
export default config;