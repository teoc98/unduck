import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.VITE_BASE_URL || "/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
    }),
  ],
});
