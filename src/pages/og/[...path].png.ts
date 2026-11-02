import type { APIRoute, GetStaticPaths } from "astro";
import sharp from "sharp";
import { escapeHtml, getPortfolioContent } from "../../lib/content";

// One 1200×630 share card per detail page: title and summary on the left, the hero photo fitted whole
// on the right (phone screenshots are tall, so cropping them to landscape loses the screen).
// Text uses Figtree from the build machine's fonts; without it librsvg falls back to a system sans.

const HERO = { left: 700, top: 60, width: 420, height: 510 };

export const getStaticPaths = (async () => {
  const { work, writing } = await getPortfolioContent({ includeBody: false });
  return [...work, ...writing].map((item) => ({ params: { path: item.href.slice(1) }, props: { item } }));
}) satisfies GetStaticPaths;

// Greedy word wrap by character count, ellipsised past `lines`.
function wrap(text: string, max: number, lines: number): string[] {
  const out: string[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const last = out.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= max) out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] += "…";
  }
  return out;
}

async function loadHero(src: string | undefined): Promise<sharp.OverlayOptions | undefined> {
  if (!src || !/^https?:/.test(src)) return undefined;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(HERO.width, HERO.height, { fit: "inside" })
      .png()
      .toBuffer({ resolveWithObject: true });
    const corners = Buffer.from(`<svg width="${info.width}" height="${info.height}"><rect width="100%" height="100%" rx="20"/></svg>`);
    return {
      input: await sharp(data).composite([{ input: corners, blend: "dest-in" }]).png().toBuffer(),
      left: HERO.left + Math.round((HERO.width - info.width) / 2),
      top: HERO.top + Math.round((HERO.height - info.height) / 2)
    };
  } catch (error) {
    console.warn(`OG: no photo from ${src.slice(0, 80)}`, (error as Error).message);
    return undefined;
  }
}

export const GET: APIRoute = async ({ props }) => {
  const { item } = props;
  // Same photo DetailPage uses as its hero.
  const hero = await loadHero(item.images?.[0]?.src);
  const title = wrap(item.title, hero ? 13 : 24, 2);
  const summary = wrap(item.summary ?? "", hero ? 32 : 58, 3);
  const summaryTop = 210 + title.length * 84;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><radialGradient id="g" cx="30%" cy="10%" r="80%"><stop offset="0" stop-color="#5179ff"/><stop offset="1" stop-color="#2a2fe8" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="630" fill="#2a2fe8"/><rect width="1200" height="630" fill="url(#g)"/>
    <g font-family="Figtree, sans-serif">
      <text x="80" y="130" font-size="30" font-weight="700" fill="#e6f83a">${item.kind}</text>
      ${title.map((line, i) => `<text x="80" y="${210 + i * 84}" font-size="76" font-weight="800" fill="#fff">${escapeHtml(line)}</text>`).join("")}
      ${summary.map((line, i) => `<text x="80" y="${summaryTop + i * 44}" font-size="32" font-weight="600" fill="#e4e7ff">${escapeHtml(line)}</text>`).join("")}
      <text x="80" y="560" font-size="28" font-weight="600" fill="#b4bcff">rvnza.com</text>
    </g>
  </svg>`;

  const png = await sharp(Buffer.from(svg)).composite(hero ? [hero] : []).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
