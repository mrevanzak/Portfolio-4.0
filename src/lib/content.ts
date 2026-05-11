import { getNotionItems } from "./notion";

export type PortfolioKind = "work" | "writing";

export type DetailBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "bulleted-list"; items: string[] }
  | { type: "numbered-list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "divider" }
  | { type: "image"; src: string; alt?: string; caption?: string };

export interface PortfolioItem {
  kind: PortfolioKind;
  slug: string;
  pageId?: string;
  title: string;
  date: string;
  href: string;
  summary?: string;
  body?: DetailBlock[];
}

const fallbackWork: PortfolioItem[] = [
  {
    kind: "work",
    slug: "quiet-systems",
    title: "Quiet Systems",
    date: "May 2026",
    href: "/work/quiet-systems",
    summary: "Interfaces for slower thinking",
    body: [
      { type: "paragraph", text: "A study in interfaces that hold still until they are needed." },
      { type: "paragraph", text: "The system favors calm hierarchy, compact rhythm, and soft motion so the content can do the talking." }
    ]
  },
  {
    kind: "work",
    slug: "index-cards",
    title: "Index Cards",
    date: "Apr 2026",
    href: "/work/index-cards",
    summary: "A tiny research workspace",
    body: [
      { type: "paragraph", text: "A lightweight tool for collecting fragments, references, and half-formed ideas." },
      { type: "quote", text: "The best research tools disappear after the note lands." }
    ]
  },
  {
    kind: "work",
    slug: "soft-tools",
    title: "Soft Tools",
    date: "Feb 2026",
    href: "/work/soft-tools",
    summary: "Useful objects for daily software",
    body: [
      { type: "paragraph", text: "A collection of small interfaces designed to feel domestic instead of industrial." },
      { type: "bulleted-list", items: ["gentle defaults", "clear affordances", "quiet feedback"] }
    ]
  },
  {
    kind: "work",
    slug: "archive-study",
    title: "Archive Study",
    date: "Nov 2025",
    href: "/work/archive-study",
    summary: "Notes, fragments, and retrieval",
    body: [
      { type: "paragraph", text: "An index for small archives with enough structure to stay searchable." },
      { type: "divider" },
      { type: "paragraph", text: "The emphasis is on retention, resurfacing, and making old material feel nearby again." }
    ]
  }
];

const fallbackWriting: PortfolioItem[] = [
  {
    kind: "writing",
    slug: "interfaces-should-exhale",
    title: "Interfaces Should Exhale",
    date: "May 2026",
    href: "/writing/interfaces-should-exhale",
    summary: "On calm, responsive surfaces",
    body: [
      { type: "paragraph", text: "Good interfaces make room before they ask for attention." },
      { type: "paragraph", text: "When motion is restrained and spacing is deliberate, the work feels easier to enter." }
    ]
  },
  {
    kind: "writing",
    slug: "texture-of-fast-software",
    title: "The Texture of Fast Software",
    date: "Mar 2026",
    href: "/writing/texture-of-fast-software",
    summary: "Speed as a material choice",
    body: [
      { type: "paragraph", text: "Fast software is less about raw throughput than about how quickly a person regains their bearings." },
      { type: "numbered-list", items: ["reduce waiting", "preserve context", "reply with care"] }
    ]
  },
  {
    kind: "writing",
    slug: "small-details",
    title: "Notes on Small Details",
    date: "Jan 2026",
    href: "/writing/small-details",
    summary: "What polish quietly teaches",
    body: [
      { type: "paragraph", text: "Tiny refinements can teach people how a system expects to be used." },
      { type: "image", src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80", alt: "Warm editorial desk scene", caption: "A small detail can change the tone of the whole page." }
    ]
  }
];

interface PortfolioContentOptions {
  includeBody?: boolean;
}

export async function getPortfolioContent(options: PortfolioContentOptions = {}) {
  const { includeBody = true } = options;
  const [work, writing] = await Promise.all([
    getNotionItems(import.meta.env.NOTION_PROJECTS_DATABASE_ID, "work", fallbackWork, { includeBody }),
    getNotionItems(import.meta.env.NOTION_WRITING_DATABASE_ID, "writing", fallbackWriting, { includeBody })
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
