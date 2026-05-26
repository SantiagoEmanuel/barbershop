import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      registerType: "prompt",
      includeAssets: ["favicon.svg", "barber-icon-192.png", "barber-icon.png"],
      manifest: {
        name: "Peko Barber",
        short_name: "Peko Barber",
        description:
          "Barbería en Quimilí. Reservá tu turno online en menos de un minuto.",
        lang: "es-AR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#1e1d28",
        theme_color: "#1e1d28",
        icons: [
          {
            src: "barber-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "barber-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
