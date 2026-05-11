import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://example.com",
  experimental: {
    clientPrerender: true
  }
});
