import type { APIRoute, GetStaticPaths } from "astro";
import { getPortfolioContent } from "../../lib/content";

// Notion's file links expire an hour after the build, so Notion-hosted videos are downloaded
// into dist here, the way Photo.astro does for images.
export const getStaticPaths = (async () => {
  const { work, writing } = await getPortfolioContent();
  return [...work, ...writing]
    .flatMap((item) => item.body ?? [])
    .flatMap((block) =>
      block.type === "video" && block.remote
        ? [{ params: { file: block.src.slice("/media/".length) }, props: { url: block.remote } }]
        : []
    );
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const res = await fetch(props.url);
  if (!res.ok) throw new Error(`Video download failed (${res.status}): ${props.url.slice(0, 80)}`);
  return new Response(await res.arrayBuffer());
};
