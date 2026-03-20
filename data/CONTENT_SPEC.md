# Content Specification

This file documents the required structure for each `.md` file in `data/`.
The build-time parser (`scripts/parse-content.ts`) reads these files and
produces `apps/web/src/generated/content.json`.

---

## `experience.md`

Required structure:

```
# Professional Experience

## {Role} — {Org}

**{Year} → {Year|Present} · {City, Country}**

- bullet
- bullet

## Education

**{School}**
{Degree} · {Year} – {Year} · {City, Country}
```

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
```

Level must be one of: `expert`, `comfortable`, `learning`

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

{one or more paragraphs — first sentence used as headline}

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
```

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
