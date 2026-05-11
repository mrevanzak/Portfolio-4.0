import { getNotionItems } from "./notion";

export interface PortfolioItem {
  title: string;
  date: string;
  href: string;
  summary?: string;
}

const fallbackWork: PortfolioItem[] = [
  { title: "Quiet Systems", date: "May 2026", href: "/work/quiet-systems", summary: "Interfaces for slower thinking" },
  { title: "Index Cards", date: "Apr 2026", href: "/work/index-cards", summary: "A tiny research workspace" },
  { title: "Soft Tools", date: "Feb 2026", href: "/work/soft-tools", summary: "Useful objects for daily software" },
  { title: "Archive Study", date: "Nov 2025", href: "/work/archive-study", summary: "Notes, fragments, and retrieval" }
];

const fallbackWriting: PortfolioItem[] = [
  { title: "Interfaces Should Exhale", date: "May 2026", href: "/writing/interfaces-should-exhale", summary: "On calm, responsive surfaces" },
  { title: "The Texture of Fast Software", date: "Mar 2026", href: "/writing/texture-of-fast-software", summary: "Speed as a material choice" },
  { title: "Notes on Small Details", date: "Jan 2026", href: "/writing/small-details", summary: "What polish quietly teaches" }
];

export async function getPortfolioContent() {
  const [work, writing] = await Promise.all([
    getNotionItems(import.meta.env.NOTION_PROJECTS_DATABASE_ID, fallbackWork),
    getNotionItems(import.meta.env.NOTION_WRITING_DATABASE_ID, fallbackWriting)
  ]);

  return {
    work,
    writing,
    updatedAt: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date())
  };
}
