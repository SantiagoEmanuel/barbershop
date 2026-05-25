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
      includeAssets: ["barber-icon.png", "barber-icon.png", "barber-icon.png"],
      manifest: {
        name: "Gestor de turnos",
        short_name: "Gestor",
        description: "Aplicación para la gestión de turnos y pagos",
        theme_color: "#0e0e0e",
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
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: "./",
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
