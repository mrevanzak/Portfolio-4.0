import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://rvnza.com",
  experimental: {
    clientPrerender: true
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
