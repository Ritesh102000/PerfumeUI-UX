import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/modesi-jewellery/",
  plugins: [react()],
  build: {
    outDir: "../modesi-jewellery",
    emptyOutDir: true,
    sourcemap: false,
  },
});
