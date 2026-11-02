import type { APIRoute } from "astro";
import { getNotionFileUrl } from "../lib/notion";

// The PDF sits on the "CV" row in Notion. Its file link expires an hour after the build, so it is copied into dist.
export const GET: APIRoute = async () => {
  const databaseId = import.meta.env.NOTION_PROJECTS_DATABASE_ID ?? import.meta.env.NOTION_DATABASE;
  const url = await getNotionFileUrl(databaseId, "CV");
  if (!url) throw new Error('Resume not found: expected a Notion row titled "CV" with the PDF in its Image property');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Resume download failed (${res.status})`);
  return new Response(await res.arrayBuffer(), { headers: { "Content-Type": "application/pdf" } });
};
