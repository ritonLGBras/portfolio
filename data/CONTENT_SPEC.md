# Content Specification

This file documents the required structure for each `.md` file in `data/`.
The build-time parser (`scripts/parse-content.ts`) reads these files and
produces `apps/web/src/generated/content.json`.

---

## `experience.md`

Required structure:

```
# Professional Experience

## {Org} — {Role}

**{Year} → {Year|Present} · {City, Country}**

- bullet
- bullet

## Education

**{School}**
{Degree} · {Year} – {Year} · {City, Country}
```

The parser splits each `## …` heading on ` — ` (space + em dash U+2014 + space) to
extract `{Org}` and `{Role}`. `roles` is a list: the parser collects **all**
`## {Org} — {Role}` headings it finds (zero-to-many).

Parsed into:

```json
{
  "roles": [
    {
      "title": "Co-founder & Engineer",
      "org": "Mayday",
      "period": "2021 → Present",
      "location": "Paris, France",
      "bullets": ["..."]
    }
  ],
  "education": {
    "school": "HEI - Hautes Etudes d'Ingénieur",
    "degree": "Engineering degree",
    "period": "2016 – 2021",
    "location": "Lille, France"
  }
}
```

---

## `stack.md`

Required structure:

```
# Technical Stack

## {Category Name}

- {Skill name} — {level}
- {Skill name} — {level}, {optional free-text qualifier}
```

Level must be one of: `expert`, `comfortable`, `learning`. The text after `—` starts
with the level keyword; any additional text after a comma is a free-text qualifier
and is stripped/discarded by the parser — the output `name` field never contains
the qualifier portion. Example: `TypeScript — expert, primary language` →
`{ "name": "TypeScript", "level": "expert" }` (qualifier discarded).

Parsed into:

```json
{
  "categories": [
    {
      "name": "Languages",
      "items": [
        { "name": "TypeScript", "level": "expert" }
      ]
    }
  ]
}
```

---

## `ambitions.md`

Required structure:

```
# Ambitions & Direction

## What Excites Me Next

{one or more paragraphs — headline extracted as raw markdown (inline formatting
like **bold** preserved), split on the first `.` character}

## The Problems I Want to Solve

- bullet

## How I Want to Work

- **{Pref label}:** {description}

## Availability

{Single paragraph}
```

Parsed into:

```json
{
  "headline": "I'm excited about the next wave of AI-native products...",
  "problems": ["Making knowledge accessible...", "..."],
  "workPrefs": [
    { "label": "Team size", "description": "Small, high-trust teams..." }
  ],
  "availability": "Open to conversations about technically ambitious roles..."
}
```

---

## `projects/*.md`

Required structure:

```
# {Project Name}

## Problem

{paragraph}

## My Role

{paragraph}

## Stack

- item

## Outcome

- bullet

## Code Highlights (optional)

{paragraph}
```

The `## Code Highlights` section is present in some project files but is **ignored
by the parser** and not included in the parsed output.

Parsed into:

```json
{
  "name": "Ask Mayday",
  "problem": "Customer service agents spend...",
  "role": "Core contributor on the engineering side...",
  "stack": ["TypeScript / NestJS", "Vue 3"],
  "outcome": ["Deployed to 100+ enterprise customers...", "..."]
}
```

---

## `bio.md`

Used only for AI context (system prompt). Not parsed into `content.json`.
Free-form markdown, no required structure.
