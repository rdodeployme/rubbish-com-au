import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// GitHub Pages serves this site from /<repo>/. Change BASE when a custom domain is added (then "/").
const BASE = process.env.SITE_BASE || "/rubbish-com-au/";

export default defineConfig({
  base: BASE,
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});
