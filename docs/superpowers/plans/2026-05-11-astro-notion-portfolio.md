# Astro Notion Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Astro portfolio inspired by ja.mt with smooth transitions, precise hover motion, and Notion-ready content loading.

**Architecture:** Astro renders static pages for speed and SEO. Content comes from a small typed content adapter that uses Notion when credentials are present and local fallback data otherwise. Motion is handled with Astro View Transitions, CSS transform/opacity animations, and a tiny vanilla hover guard script.

**Tech Stack:** Astro 5, TypeScript, Notion API, custom CSS, Astro ClientRouter/View Transitions.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`

- [x] **Step 1:** Add Astro, TypeScript, and Notion dependencies.
- [x] **Step 2:** Configure Astro static output.
- [x] **Step 3:** Add environment variable template for Notion credentials.

### Task 2: Portfolio UI

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro`
- Create: `src/styles/global.css`
- Create: `src/scripts/hover-guard.ts`

- [ ] **Step 1:** Add global theme, typography, and route transition CSS.
- [ ] **Step 2:** Create homepage with intro, work list, writing list, and animated hover relationships.
- [ ] **Step 3:** Add a cold-load hover guard so items under the cursor do not animate immediately on first paint.

### Task 3: Notion adapter

**Files:**
- Create: `src/lib/content.ts`
- Create: `src/lib/notion.ts`

- [ ] **Step 1:** Define `PortfolioItem` and local fallback content.
- [ ] **Step 2:** Query Notion databases at build time when env vars exist.
- [ ] **Step 3:** Normalize Notion properties into portfolio items.

### Task 4: Verify

**Files:**
- Modify only if checks fail.

- [ ] **Step 1:** Run `npm install`.
- [ ] **Step 2:** Run `npm run build`.
- [ ] **Step 3:** Fix any type/build errors.
