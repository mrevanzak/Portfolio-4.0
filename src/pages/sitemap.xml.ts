import type { APIRoute } from "astro";
import { getPortfolioContent } from "../lib/content";

export const GET: APIRoute = async ({ site }) => {
  const { work, writing } = await getPortfolioContent({ includeBody: false });
  // Trailing slash: Cloudflare 307s /work to /work/, so list the URL that actually answers 200.
  const paths = ["/", "/work/", ...[...work, ...writing].map((item) => `${item.href}/`)];
  const urls = paths.map((path) => `<url><loc>${new URL(path, site)}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml" }
  });
};
