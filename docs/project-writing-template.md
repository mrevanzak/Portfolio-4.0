# Project Writing Template

How I write project entries for the portfolio. One flexible structure, two modes.
The goal: explain what a thing is, why it exists, and what I actually did, without
overselling or padding.

## The two modes

**Default: sectioned.** Most projects use the 4-section skeleton below. It scales,
it is repeatable, and it gives broad projects somewhere to put their pieces.

**Escape hatch: essay.** If a project is small or has one tight story, drop the
section headers and write it as a flowing personal essay:

problem -> why existing tools fall short -> so I made one -> what it does, woven
through the story -> images between paragraphs -> a dry one-liner to close.

Do not scaffold a small project just to fill the template.

Rule of thumb: if you cannot fill at least 3 highlighted pieces with real substance,
write the essay version instead.

## The default skeleton

### 1. Header

- **Title:** the project name.
- **One line:** what it is, in a single sentence. Present tense. No hype.
- **Year only:** just the year under the title. Everything else gets woven into the
  prose, including role, stack, team, and links.

One-liner patterns that work:

- What + who it is for + benefit
- What + platform + the notable thing
- What + built with + context

### 2. Overview

What the product is, who it is for, and what you owned.

This is where role, stack, team context, and timeline go, but write it like a normal
paragraph. No meta-strip. No resume bullet list.

For engineering projects, the overview should also name the main technical shape of
the work:

- frontend/mobile feature work
- backend/API work
- infra or tooling
- performance work
- migration or refactor
- growth or experimentation work

### 3. What I built

The heart of the entry. Pick 3 to 5 highlighted pieces, not every feature in the
product. Each piece is an H3 with a small technical story.

For each piece, answer:

- What was the feature or system?
- What made it technically annoying?
- What decision did I make?
- What changed for users, the team, or the product?
- What evidence do I have? Screenshot, screen recording, PR, metric, commit, or note.

This section should sound like an engineer explaining work to another engineer over
coffee. Specific, casual, and concrete.

Good engineering evidence examples:

- screen recordings
- screenshots
- PR links
- architecture diagrams
- before/after clips
- perf numbers
- release notes
- commit history
- short code snippets, only if the code is actually interesting

**Media placeholders.** When the asset is not ready yet, drop a clearly marked
placeholder where the media goes. Note what the clip should show, not just "add
media."

```
> 📹 [Media placeholder: screen recording of X]
```

If you might not have the screenshot or recording, still add the placeholder. It
creates a todo for future evidence instead of pretending the proof exists.

### 4. What I learned

A reflective close. End with one specific war story:

- the bug that ate a week
- the tradeoff you would make differently now
- the platform detail that surprised you
- the constraint that changed the implementation

Specific beats general every time.

## Engineering case-study lens

Borrow the useful parts from product/design case studies, but translate them for
engineering.

Design case-study wording:

- challenge
- process
- solution
- impact
- reflection

Engineering version:

- context
- constraint
- technical decision
- implementation
- tradeoff
- impact
- what I learned

Do not over-index on process theater. The writeup should show judgment, not list
every step.

## Voice

Write like an engineer explaining work to another engineer over coffee.

Rules:

- No em dashes.
- No startup polish.
- No phrases like "seamless experience," "robust solution," or "delightful user journey."
- Short sentences are fine.
- A slightly imperfect human rhythm is fine.
- First-person is fine.
- Say what was annoying, tricky, or weird.
- Use concrete implementation details.
- Do not invent metrics.
- If there is no proof yet, add an evidence placeholder.

Examples:

Bad:

> I implemented a seamless AI-powered experience that improved user engagement.

Better:

> I streamed the answer token by token so the user saw something happening right away instead of waiting on a spinner.

Bad:

> This resulted in a polished and reliable mobile experience.

Better:

> Most of the polish was boring Android work: keyboards, safe areas, layout animations, and list jank.

## Checklist before publishing

- [ ] One-line summary reads clearly to someone who has never heard of the project
- [ ] Year is set
- [ ] Role, stack, and context are in the overview prose
- [ ] 3 to 5 highlighted pieces, each with a technical story
- [ ] Each highlighted piece has media, proof, or a placeholder
- [ ] What I learned ends on one specific story
- [ ] No em dashes
- [ ] No hype words
- [ ] No invented metrics
