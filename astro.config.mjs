import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://rvnza.com",
  // Lets Photo.astro pull Notion/S3 (and any other https) images into the build to resize them.
  image: {
    remotePatterns: [{ protocol: "https" }]
  },
  experimental: {
    clientPrerender: true
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
