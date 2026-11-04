import type { APIRoute } from "astro";
import { getResumeFile } from "../lib/notion";

// Notion's file link expires an hour after the build, so the PDF is copied into dist.
export const GET: APIRoute = async () => {
  const url = (await getResumeFile())?.src;
  if (!url) throw new Error('Resume not found: expected a Notion row titled "CV" with the PDF in its Image property');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Resume download failed (${res.status})`);
  return new Response(await res.arrayBuffer(), { headers: { "Content-Type": "application/pdf" } });
};
