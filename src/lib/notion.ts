import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { PortfolioItem } from "./content";

const token = import.meta.env.NOTION_TOKEN;

function hasNotionConfig(databaseId: string | undefined): databaseId is string {
  return Boolean(token && databaseId);
}

export async function getNotionItems(databaseId: string | undefined, fallback: PortfolioItem[]) {
  if (!hasNotionConfig(databaseId)) return fallback;

  const notion = new Client({ auth: token });
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: { equals: true }
    },
    sorts: [{ property: "Date", direction: "descending" }]
  });

  const items = response.results
    .filter((page): page is PageObjectResponse => "properties" in page)
    .map(pageToPortfolioItem)
    .filter((item): item is PortfolioItem => Boolean(item));

  return items.length > 0 ? items : fallback;
}

function pageToPortfolioItem(page: PageObjectResponse): PortfolioItem | null {
  const title = readTitle(page, "Name") ?? readTitle(page, "Title");
  if (!title) return null;

  const slug = readText(page, "Slug") ?? slugify(title);
  const type = readSelect(page, "Type") ?? "work";
  const date = readDateLabel(page, "Date") ?? "Now";
  const summary = readText(page, "Summary");

  return {
    title,
    date,
    href: `/${type === "writing" ? "writing" : "work"}/${slug}`,
    summary
  };
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
