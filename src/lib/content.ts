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

export interface PortfolioImage {
  src: string;
  alt: string;
}

export interface PortfolioItem {
  kind: PortfolioKind;
  slug: string;
  pageId?: string;
  title: string;
  date: string;
  href: string;
  summary?: string;
  images?: PortfolioImage[];
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
    images: [
      {
        src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=360&q=80",
        alt: "Warm desk with interface notes"
      },
      {
        src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=360&q=80",
        alt: "Blue abstract interface shape"
      }
    ],
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
    images: [
      {
        src: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=360&q=80",
        alt: "Paper cards on a desk"
      },
      {
        src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=360&q=80",
        alt: "Small digital workspace"
      }
    ],
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
    images: [
      {
        src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=360&q=80",
        alt: "Code editor on a blue screen"
      },
      {
        src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=360&q=80",
        alt: "Colorful app icon grid"
      }
    ],
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
    images: [
      {
        src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=360&q=80",
        alt: "Archive shelves"
      },
      {
        src: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=360&q=80",
        alt: "Open notebook pages"
      }
    ],
    body: [
      { type: "paragraph", text: "An index for small archives with enough structure to stay searchable." },
      { type: "divider" },
      { type: "paragraph", text: "The emphasis is on retention, resurfacing, and making old material feel nearby again." }
    ]
  }
];

const fallbackWriting: PortfolioItem[] = [];

interface PortfolioContentOptions {
  includeBody?: boolean;
}

export async function getPortfolioContent(options: PortfolioContentOptions = {}) {
  const { includeBody = true } = options;
  const projectsDatabaseId = import.meta.env.NOTION_PROJECTS_DATABASE_ID ?? import.meta.env.NOTION_DATABASE;
  const writingDatabaseId = import.meta.env.NOTION_WRITING_DATABASE_ID ?? import.meta.env.NOTION_DATABASE;

  if (projectsDatabaseId && projectsDatabaseId === writingDatabaseId) {
    const items = await getNotionItems(projectsDatabaseId, "work", fallbackWork, { includeBody });
    const work = items.filter((item) => item.kind === "work");
    const writing = items.filter((item) => item.kind === "writing");

    return {
      work: addFallbackImages(work.length > 0 ? work : fallbackWork),
      writing,
      updatedAt: formatUpdatedAt()
    };
  }

  const [work, writing] = await Promise.all([
    getNotionItems(projectsDatabaseId, "work", fallbackWork, { includeBody }),
    getNotionItems(writingDatabaseId, "writing", fallbackWriting, { includeBody })
  ]);

  return {
    work: addFallbackImages(work),
    writing,
    updatedAt: formatUpdatedAt()
  };
}

function addFallbackImages(items: PortfolioItem[]) {
  return items.map((item, index) => ({
    ...item,
    images: item.images?.length ? item.images : createDefaultImages(item, index)
  }));
}

function createDefaultImages(item: PortfolioItem, index: number): PortfolioImage[] {
  const initials = item.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.at(0)?.toUpperCase())
    .join("") || "R";

  const palettes = [
    ["#8fbce6", "#f6efe6", "#2d6f9f"],
    ["#d7b48c", "#f8f0dc", "#7b4e2e"],
    ["#9cc9ad", "#eff7ee", "#3b7350"],
    ["#c8a4d8", "#f4edf7", "#704382"]
  ];
  const palette = palettes[index % palettes.length];

  return [
    {
      src: svgPreview(`${item.title} interface`, initials, palette, 0),
      alt: `${item.title} interface preview`
    },
    {
      src: svgPreview(`${item.title} detail`, initials, palette, 1),
      alt: `${item.title} detail preview`
    }
  ];
}

function svgPreview(label: string, initials: string, palette: string[], variant: number) {
  const [accent, paper, ink] = palette;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 108" role="img" aria-label="${escapeHtml(label)}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${accent}"/>
          <stop offset="1" stop-color="${paper}"/>
        </linearGradient>
      </defs>
      <rect width="184" height="108" rx="8" fill="url(#bg)"/>
      <rect x="18" y="16" width="148" height="76" rx="10" fill="${paper}" opacity=".88"/>
      <rect x="32" y="30" width="${variant ? 86 : 112}" height="8" rx="4" fill="${ink}" opacity=".28"/>
      <rect x="32" y="46" width="${variant ? 118 : 74}" height="8" rx="4" fill="${ink}" opacity=".18"/>
      <circle cx="${variant ? 126 : 126}" cy="${variant ? 61 : 58}" r="22" fill="${accent}" opacity=".72"/>
      <text x="126" y="67" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="18" font-weight="700" fill="${ink}" opacity=".78">${escapeHtml(initials)}</text>
    </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatUpdatedAt() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
}
