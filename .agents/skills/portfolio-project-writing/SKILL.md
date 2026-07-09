---
name: portfolio-project-writing
description: Use when creating, editing, or reviewing Revanza's portfolio project case studies, Notion work entries, project pages, or engineering-first portfolio content.
---

# Portfolio Project Writing

## Core Rule

Write project pages like an engineer explaining the work over coffee: specific, candid, technical enough to be credible, and never startup-polished.

User-provided corrections override repo evidence. If the user says not to mention something, do not mention it even if it exists in code or git history.

## Required Voice

- Casual first-person is allowed.
- No em dashes. Ever.
- No startup phrases: seamless, robust, delightful user journey, leverage, innovative, scalable solution, product-market fit.
- Prefer plain lines: "this was annoying", "the hard part was", "it worked once we fixed".
- Technology is not the hero. Explain why the tech choice mattered for the user or constraint.
- Do not copy LinkedIn style. Use LinkedIn posts only for facts, milestones, and firsthand stories.

## Default Structure

Use this unless the project is tiny.

1. Opening
   - What the product is.
   - Who it is for.
   - Why it existed.
   - One concrete tension or constraint.

2. What I built
   - 3 to 5 engineering pieces.
   - For each: problem, constraint, decision, implementation detail, tradeoff.
   - Add media/evidence near the matching section.

3. After launch, optional
   - Milestones only after the work is clear.
   - Keep modest: "almost 500 monthly active users", "reached #66 in Travel", "got covered by local media".
   - Do not inflate milestones into the main point.

4. What I learned
   - Specific technical or product lesson.
   - Mention what broke, surprised you, or changed your mind.
   - Avoid generic endings like "ship fast" or "listen to users".

## Essay Mode

For small projects, collapse the structure into a short narrative with no obvious section padding. Still keep the same arc: why it existed, what was built, what got tricky, what was learned.

## Evidence Rules

- Never invent metrics, quotes, screenshots, or impact.
- If proof is missing, write a clear placeholder.
- Good evidence: screenshots, App Store chart, MAU graph, article link, architecture diagram, demo clip, bug story, before/after behavior.
- Attached chat images are not automatically uploadable. Ask for local file paths or public URLs before claiming they were embedded.

## Anti-Mistake Checks

Before updating Notion or finalizing copy, check:

| Risk | Check |
|---|---|
| User correction ignored | Did the user exclude anything, like in-progress migration work? |
| Repo overrules user | Did code history add facts the user did not want public? Remove them. |
| AI-sounding copy | Any startup phrases or generic claims? Rewrite plainly. |
| Long dash slipped in | Search for the em dash character and replace it. |
| Milestone inflation | Are metrics near the bottom as validation, not the headline? |
| Tech boosterism | Does every tech mention explain why it mattered? |
| Hallucinated backstory | Did the user actually provide this origin story? |
| LinkedIn drift | Does it sound like a portfolio case study, not a launch post? |
