import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse
} from "@notionhq/client/build/src/api-endpoints";
import type { DetailBlock, PortfolioItem, PortfolioKind } from "./content";

const token = import.meta.env.NOTION_TOKEN ?? import.meta.env.NOTION_KEY;

interface NotionItemOptions {
  includeBody?: boolean;
}

function hasNotionConfig(databaseId: string | undefined): databaseId is string {
  return Boolean(token && databaseId);
}

export async function getNotionItems(
  databaseId: string | undefined,
  kind: PortfolioKind,
  fallback: PortfolioItem[],
  options: NotionItemOptions = {}
) {
  if (!hasNotionConfig(databaseId)) return fallback;

  const notion = new Client({ auth: token });
  try {
    const pages: PageObjectResponse[] = [];
    let cursor: string | undefined;

    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        filter: {
          property: "Published",
          checkbox: { equals: true }
        },
        sorts: [{ property: "Date", direction: "descending" }]
      });

      pages.push(...response.results.filter((page): page is PageObjectResponse => "properties" in page));
      cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    const items = await Promise.all(
      pages.map((page) => pageToPortfolioItem(notion, kind, page, options.includeBody ?? true))
    );

    const validItems = items.filter((item): item is PortfolioItem => Boolean(item));
    return validItems.length > 0 ? validItems : fallback;
  } catch (error) {
    console.warn(`Failed to load Notion ${kind} content`, error);
    return fallback;
  }
}

async function pageToPortfolioItem(
  notion: Client,
  kind: PortfolioKind,
  page: PageObjectResponse,
  includeBody: boolean
): Promise<PortfolioItem | null> {
  const title = readTitle(page, "Name") ?? readTitle(page, "Title");
  if (!title) return null;

  const slug = slugify(readText(page, "Slug") ?? title);
  if (!slug) return null;

  const date = readDateLabel(page, "Date") ?? "Now";
  const summary = readText(page, "Summary");
  let images = readPreviewImages(page);
  const itemKind = readSelect(page, "Type") === "writing" ? "writing" : kind;
  const body = includeBody ? await readPageBody(notion, page.id) : [];

  if (!images?.length) {
    images = await readPagePreviewImages(notion, page.id);
  }

  return {
    kind: itemKind,
    slug,
    pageId: page.id,
    title,
    date,
    href: `/${itemKind}/${slug}`,
    summary,
    images,
    body: body.length > 0 ? body : undefined
  };
}

async function readPageBody(notion: Client, pageId: string) {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    blocks.push(...response.results.filter(isBlockObject));
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return normalizeBlocks(blocks);
}

function normalizeBlocks(blocks: BlockObjectResponse[]): DetailBlock[] {
  const normalized: DetailBlock[] = [];
  let pendingList: { type: "bulleted-list" | "numbered-list"; items: string[] } | null = null;

  const flushList = () => {
    if (pendingList && pendingList.items.length > 0) {
      normalized.push(pendingList);
    }
    pendingList = null;
  };

  for (const block of blocks) {
    if (block.type === "paragraph") {
      flushList();
      const text = richTextToText(block.paragraph.rich_text);
      if (text) normalized.push({ type: "paragraph", text });
      continue;
    }

    if (block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3") {
      flushList();
      const richText =
        block.type === "heading_1"
          ? block.heading_1.rich_text
          : block.type === "heading_2"
            ? block.heading_2.rich_text
            : block.heading_3.rich_text;
      const text = richTextToText(richText);
      if (text) normalized.push({ type: "heading", level: block.type === "heading_3" ? 3 : 2, text });
      continue;
    }

    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      const richText = block.type === "bulleted_list_item" ? block.bulleted_list_item.rich_text : block.numbered_list_item.rich_text;
      const text = richTextToText(richText);
      if (!text) continue;
      const type = block.type === "bulleted_list_item" ? "bulleted-list" : "numbered-list";
      if (!pendingList || pendingList.type !== type) {
        flushList();
        pendingList = { type, items: [] };
      }
      pendingList.items.push(text);
      continue;
    }

    flushList();

    if (block.type === "quote") {
      const text = richTextToText(block.quote.rich_text);
      if (text) normalized.push({ type: "quote", text });
      continue;
    }

    if (block.type === "divider") {
      normalized.push({ type: "divider" });
      continue;
    }

    if (block.type === "image") {
      const src = readImageAssetUrl(block.image);
      if (!src) continue;

      const caption = richTextToText(block.image.caption);
      normalized.push({
        type: "image",
        src,
        alt: caption || undefined,
        caption: caption || undefined
      });
    }
  }

  flushList();
  return normalized;
}

function richTextToText(richText: RichTextItemResponse[]) {
  // Keep the first pass intentionally static/simple: links and annotations are
  // flattened until the detail renderer supports a richer inline model.
  return richText.map((part) => part.plain_text).join("").trim();
}

function isBlockObject(block: BlockObjectResponse | unknown): block is BlockObjectResponse {
  return Boolean(block && typeof block === "object" && "type" in block && "object" in block && (block as { object?: string }).object === "block");
}

async function readPagePreviewImages(notion: Client, pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 20
  });

  const images = response.results
    .filter(isBlockObject)
    .flatMap((block) => {
      if (block.type !== "image") return [];
      const src = readImageAssetUrl(block.image);
      if (!src) return [];

      const caption = richTextToText(block.image.caption);
      return [{ src, alt: caption || "Project preview" }];
    });

  return images.length > 0 ? images : undefined;
}

function readTitle(page: PageObjectResponse, propertyName: string) {
  const property = page.properties[propertyName];
  if (!property || property.type !== "title") return undefined;
  return property.title.map((part) => part.plain_text).join("").trim() || undefined;
}

function readText(page: PageObjectResponse, propertyName: string) {
  const property = page.properties[propertyName];
  if (!property || property.type !== "rich_text") return undefined;
  return property.rich_text.map((part) => part.plain_text).join("").trim() || undefined;
}

function readPreviewImages(page: PageObjectResponse) {
  const images = [
    ...readCoverImage(page),
    ...readImages(page, "Images"),
    ...readImages(page, "Image"),
    ...readImages(page, "Thumbnail"),
    ...readImages(page, "Cover"),
    ...readImages(page, "Screenshot")
  ];

  return images.length > 0 ? images : undefined;
}

function readCoverImage(page: PageObjectResponse) {
  if (!page.cover) return [];

  const src = readImageAssetUrl(page.cover);
  if (!src) return [];

  return [
    {
      src,
      alt: "Project cover"
    }
  ];
}

function readImages(page: PageObjectResponse, propertyName: string) {
  const property = page.properties[propertyName];
  if (!property || property.type !== "files") return [];

  return property.files.flatMap((file) => {
    if ("external" in file) {
      return [{ src: file.external.url, alt: file.name || "Project preview" }];
    }

    if ("file" in file) {
      return [{ src: file.file.url, alt: file.name || "Project preview" }];
    }

    return [];
  });
}

function readImageAssetUrl(asset: { external?: { url: string }; file?: { url: string } }) {
  if ("external" in asset && asset.external?.url) return asset.external.url;
  if ("file" in asset && asset.file?.url) return asset.file.url;
  return undefined;
}

function readSelect(page: PageObjectResponse, propertyName: string) {
  const property = page.properties[propertyName];
  if (!property || property.type !== "select") return undefined;
  return property.select?.name.toLowerCase();
}

function readDateLabel(page: PageObjectResponse, propertyName: string) {
  const property = page.properties[propertyName];
  if (!property || property.type !== "date" || !property.date?.start) return undefined;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric"
  }).format(new Date(property.date.start));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
