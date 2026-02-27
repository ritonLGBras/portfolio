# Portfolio Design — AI-Powered Engineer Portfolio

**Date:** 2026-02-27  
**Status:** Approved

---

## 1. Project Goal

Build a minimalist, high-performance portfolio using a monorepo architecture. The site features a chat-first hero powered by a "Digital Twin" AI that answers questions about the owner's experience, projects, and ambitions. A NestJS gateway serves both static content and proxies AI requests. A Python FastAPI service handles LLM integration.

**Target audience:** Recruiters/hiring managers (primary), fellow engineers (secondary).

**AI scope:** Answers questions strictly about the owner — experience, stack, projects, availability — and can produce code samples or deep-dives on specific projects on demand.

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces |
| Frontend | Vue 3, Vite, Pinia, Tailwind CSS, pinia-shared-state |
| Gateway | NestJS (Node.js 22), deployed as Vercel serverless function |
| AI Engine | Python 3.12, FastAPI, Groq API |
| Hosting (frontend + API) | Vercel |
| Hosting (Python) | Render or Railway (free tier) |

**AI approach:** Option A — minimal Python. No vector DB. All `.md` files are read at request time and concatenated into the LLM system prompt. Stateless: conversation history is sent from the frontend with every request.

**NestJS rationale:** Showcases NestJS skills for portfolio purposes. Provides real value by serving parsed `.md` content to static pages and hiding the Python service URL from the browser.

---

## 3. Directory Structure

```
/portfolio-root
├── package.json                  # npm workspaces root: ["apps/*"]
├── vercel.json                   # routes /api/* → NestJS, /* → Vue SPA
├── .env.example
├── data/                         # single source of truth for all content
│   ├── bio.md
│   ├── experience.md
│   ├── stack.md
│   ├── ambitions.md
│   └── projects/
│       ├── _template.md
│       ├── project-one.md
│       └── project-two.md
├── docs/
│   └── plans/
└── apps/
    ├── web/                      # Vue 3 + Vite + Pinia + Tailwind
    │   └── src/
    │       ├── components/
    │       │   ├── NavBar.vue
    │       │   ├── ChatPanel.vue
    │       │   ├── ChatMessage.vue
    │       │   ├── TimelineItem.vue
    │       │   ├── SkillBadge.vue
    │       │   └── ProjectCard.vue
    │       ├── pages/
    │       │   ├── HomePage.vue
    │       │   ├── ExperiencePage.vue
    │       │   ├── SkillsPage.vue
    │       │   ├── ProjectsPage.vue
    │       │   └── AmbitionsPage.vue
    │       └── store/
    │           ├── chat.store.ts  # pinia-shared-state enabled
    │           └── ui.store.ts
    ├── api/                      # NestJS gateway
    │   └── src/
    │       ├── content/
    │       │   ├── content.controller.ts
    │       │   └── content.service.ts
    │       ├── chat/
    │       │   ├── chat.controller.ts
    │       │   └── chat.service.ts
    │       └── main.ts           # Vercel-compatible bootstrap
    └── ai-engine/                # Python FastAPI
        ├── main.py
        ├── tools/
        │   └── md_reader.py
        ├── requirements.txt
        └── Dockerfile
```

---

## 4. UI Layout & Theme

### Layout Behavior

**Initial state (no chat active):**
```
┌─────────────────────────────────────────────┐
│  Navbar (name + page links)                 │
├─────────────────────────────────────────────┤
│                                             │
│   "Ask me anything"   [ chat input  →  ]    │
│   tagline + name                            │
│                                             │
├─────────────────────────────────────────────┤
│  /experience  /skills  /projects  ...       │
└─────────────────────────────────────────────┘
```

**After first message (chat active):**
```
┌─────────────────────────────────────────────┐
│  Navbar                                     │
├────────────────────┬────────────────────────┤
│                    │                        │
│  Hero (50%,        │   Chat conversation    │
│  shrunk)           │   (50%, scrollable)    │
│                    │                        │
├────────────────────┴────────────────────────┤
│  /experience  /skills  /projects  ...       │
└─────────────────────────────────────────────┘
```

- Transition: CSS transform, ~300ms, chat panel slides in from the right
- Mobile: hero disappears entirely, chat takes full width
- Chat persists across page navigation (always mounted, shown/hidden via Pinia store)
- `pinia-shared-state` keeps chat open/closed state and conversation in sync across browser tabs

### Theme — Technical Minimalism

| Token | Value |
|---|---|
| Background | `#0a0a0a` |
| Text | `#e8e8e8` |
| Accent | `#3b82f6` (electric blue) or `#22c55e` (terminal green) — pick one |
| Heading font | JetBrains Mono or IBM Plex Mono |
| Body font | Inter |
| No gradients, no shadows, no decorative elements |

### Chat Panel Style

- Terminal aesthetic: monospace font, blinking cursor
- Messages prefixed with `you >` and `[yourname] >`
- `sources` field from API response subtly highlights which page section was referenced

---

## 5. API Design

### NestJS Gateway

```
GET  /api/content/:section     → parsed .md → JSON
POST /api/chat/ask             → proxied to Python AI engine
```

**Section routing:**
```
/api/content/bio          → data/bio.md
/api/content/experience   → data/experience.md
/api/content/stack        → data/stack.md
/api/content/ambitions    → data/ambitions.md
/api/content/projects     → data/projects/*.md  (array)
```

**Response shapes:**
```ts
// Single section
{ section: string, content: string, updatedAt: string }

// Projects
{ section: "projects", items: [{ filename: string, content: string }] }
```

**Chat request/response:**
```ts
// Request to NestJS (from browser)
POST /api/chat/ask
{ message: string, history: [{ role: "user" | "assistant", content: string }] }

// NestJS forwards same body to Python
// Response from NestJS (from Python)
{ answer: string, sources: string[] }
```

**Cold start protection:** NestJS chat service wraps Python call with a 10-second timeout. On timeout, returns a graceful fallback message.

### Python FastAPI

```
POST /ask      → AI endpoint
GET  /health   → keep-alive ping for UptimeRobot
```

**Internals:**
```python
@app.post("/ask")
async def ask(body: AskRequest):
    context = load_all_markdown()           # reads all .md files
    system_prompt = build_prompt(context)   # persona + context
    response = groq_client.chat(
        messages=[system_prompt, *body.history, {"role": "user", "content": body.message}]
    )
    return {"answer": response, "sources": detect_sources(response)}
```

Stateless — no session state on the server. History travels with every request from the Pinia store.

---

## 6. Knowledge Base Structure

### File Templates

Each `.md` file contains:
- Structured content sections for the owner to fill in
- `<!-- FILL_IN: ... -->` instructions
- `<!-- PROMPT_github: ... -->` — copy-paste query for GitHub/GitLab
- `<!-- PROMPT_confluence: ... -->` — query for Confluence/Notion
- `<!-- PROMPT_jira: ... -->` — JQL query for Jira/Linear

### Projects folder

```
data/projects/
├── _template.md          # copy to create a new project file
├── project-one.md
└── project-two.md
```

Each project file schema:
```md
## Problem
## My Role
## Stack
## Outcome
## Code Highlights (optional)
```

---

## 7. Deployment

### Vercel (Frontend + NestJS)

`vercel.json` rewrites:
- `/api/*` → NestJS serverless function at `apps/api`
- `/*` → Vue SPA at `apps/web`

Both deploy from the same GitHub repo via Vercel GitHub integration.

### Render/Railway (Python)

- Deploys from `apps/ai-engine/Dockerfile`
- Free tier: kept warm via UptimeRobot pinging `/health` every 5 minutes

### Environment Variables

```bash
# Vercel dashboard (NestJS runtime)
NEST_AI_SERVICE_URL=          # Python service URL on Render/Railway
LLM_API_KEY=                  # Groq API key

# Render/Railway dashboard (Python runtime)
LLM_API_KEY=                  # same Groq API key

# Vite build (prefix VITE_ to expose to browser)
VITE_API_BASE_URL=/api        # same-origin, no external URL needed
```

The browser never sees the Python service URL or the LLM API key.

---

## 8. Data Flow Summary

```
Static pages:
Browser → Vue → GET /api/content/:section → NestJS → reads data/*.md → JSON response → rendered page

Chat:
Browser → Vue → POST /api/chat/ask → NestJS → POST Python /ask → Groq LLM → answer + sources → Vue chat panel
```

---

## Implementation Phases

1. **Workspace shell** — monorepo init, vercel.json, hello-world deploys
2. **NestJS content API** — `GET /content/:section`, reads `.md` files
3. **Knowledge base** — create all template `.md` files with prompts
4. **Vue static pages** — all pages fetching from content API
5. **NestJS chat proxy** — `POST /chat/ask` forwarding to Python
6. **Python AI engine** — FastAPI, `load_all_markdown`, Groq integration
7. **Vue chat UI** — hero layout, split-screen transition, ChatPanel
8. **Pinia shared state** — cross-tab sync for chat store
9. **Deployment** — Vercel + Render, env vars, UptimeRobot keep-alive
