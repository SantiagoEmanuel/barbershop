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
      // La actualización se ofrece al usuario para no interrumpir formularios
      // o acciones del panel que estén en curso.
      registerType: "prompt",
      workbox: {
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        sourcemap: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      includeAssets: ["favicon.svg", "barber-icon-192.png", "barber-icon.png"],
      manifest: {
        name: "PJBARBERSHOP",
        short_name: "PJ Barber",
        description: "PJBARBERSHOP: reservas y gestión de barbería.",
        lang: "es-AR",
        start_url: "/admin",
        scope: "/",
        display: "standalone",
        background_color: "#0e0e0e",
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
