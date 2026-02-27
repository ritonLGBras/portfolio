# Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a monorepo AI-powered engineer portfolio with a Vue 3 chat-first frontend, NestJS content/proxy gateway, and Python FastAPI AI engine.

**Architecture:** npm workspaces monorepo with three apps (web, api, ai-engine). NestJS serves parsed `.md` content to static pages and proxies chat requests to a Python FastAPI service. Python reads all `.md` files at request time and calls the Groq LLM. Conversation history is stateless on the server — the frontend sends history with every request.

**Tech Stack:** Vue 3, Vite, Pinia, pinia-shared-state, Tailwind CSS, Vue Router, NestJS, @nestjs/axios, Python 3.12, FastAPI, httpx, Groq SDK, Vercel, Render.

---

## Phase 1: Workspace Shell

### Task 1: Initialize monorepo root

**Files:**
- Create: `package.json`
- Create: `vercel.json`
- Create: `.env.example`
- Create: `.gitignore`

**Step 1: Create root `package.json`**

```json
{
  "name": "portfolio-root",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run start:dev --workspace=apps/api",
    "dev:ai": "cd apps/ai-engine && uvicorn main:app --reload --port 8000",
    "build:web": "npm run build --workspace=apps/web",
    "build:api": "npm run build --workspace=apps/api"
  }
}
```

**Step 2: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "builds": [
    { "src": "apps/web/vite.config.ts", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "apps/api/src/main.ts", "use": "@vercel/node" }
  ]
}
```

**Step 3: Create `.env.example`**

```bash
# NestJS (Vercel dashboard)
NEST_AI_SERVICE_URL=          # Python service URL on Render/Railway
LLM_API_KEY=                  # Groq API key — get free at console.groq.com

# Python (Render/Railway dashboard)
LLM_API_KEY=                  # same Groq API key

# Vue (Vite build — VITE_ prefix exposes to browser)
VITE_API_BASE_URL=/api
```

**Step 4: Create `.gitignore`**

```
node_modules/
dist/
.env
*.env.local
__pycache__/
*.pyc
.venv/
.vercel/
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize monorepo root with workspace config"
```

---

### Task 2: Scaffold Vue 3 app

**Files:**
- Create: `apps/web/` (Vite scaffold)

**Step 1: Scaffold Vite + Vue 3 app**

```bash
npm create vite@latest apps/web -- --template vue-ts
```

**Step 2: Install dependencies**

```bash
cd apps/web && npm install
npm install pinia pinia-shared-state vue-router @vueuse/core
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind — edit `apps/web/tailwind.config.js`**

```js
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#111111",
        text: "#e8e8e8",
        muted: "#666666",
        accent: "#3b82f6",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
```

**Step 4: Replace `apps/web/src/main.ts`**

```ts
import { createApp } from "vue"
import { createPinia } from "pinia"
import { PiniaSharedState } from "pinia-shared-state"
import router from "./router"
import App from "./App.vue"
import "./style.css"

const pinia = createPinia()
pinia.use(PiniaSharedState({ enable: true }))

createApp(App).use(pinia).use(router).mount("#app")
```

**Step 5: Replace `apps/web/src/style.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500&display=swap");

body {
  background-color: #0a0a0a;
  color: #e8e8e8;
  font-family: "Inter", sans-serif;
}
```

**Step 6: Commit**

```bash
git add apps/web/
git commit -m "chore: scaffold Vue 3 app with Tailwind and Pinia"
```

---

### Task 3: Scaffold NestJS app

**Files:**
- Create: `apps/api/`

**Step 1: Scaffold NestJS**

```bash
npx @nestjs/cli new apps/api --package-manager npm --skip-git
```

**Step 2: Install dependencies**

```bash
cd apps/api && npm install @nestjs/axios axios
```

**Step 3: Create Vercel-compatible entry — replace `apps/api/src/main.ts`**

```ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

let app: any

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule)
    app.enableCors({ origin: process.env.FRONTEND_URL || "*" })
    app.setGlobalPrefix("api")
    await app.init()
  }
  return app
}

// Local dev
if (process.env.NODE_ENV !== "production") {
  bootstrap().then((a) => a.listen(3001))
}

// Vercel serverless export
export default async (req: any, res: any) => {
  const server = await bootstrap()
  server.getHttpAdapter().getInstance()(req, res)
}
```

**Step 4: Commit**

```bash
git add apps/api/
git commit -m "chore: scaffold NestJS gateway with Vercel-compatible entry"
```

---

### Task 4: Scaffold Python AI engine

**Files:**
- Create: `apps/ai-engine/main.py`
- Create: `apps/ai-engine/requirements.txt`
- Create: `apps/ai-engine/Dockerfile`
- Create: `apps/ai-engine/tools/__init__.py`
- Create: `apps/ai-engine/tools/md_reader.py`

**Step 1: Create `apps/ai-engine/requirements.txt`**

```
fastapi==0.111.0
uvicorn==0.30.1
groq==0.9.0
python-dotenv==1.0.1
pydantic==2.7.1
```

**Step 2: Create `apps/ai-engine/main.py` (hello world)**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ask")
async def ask(body: dict):
    return {"answer": "AI engine not yet configured", "sources": []}
```

**Step 3: Create `apps/ai-engine/Dockerfile`**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# data folder is mounted from monorepo root — copy it in for Docker builds
COPY ../../data ./data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Step 4: Create `apps/ai-engine/tools/__init__.py`** (empty)

**Step 5: Create `apps/ai-engine/tools/md_reader.py`**

```python
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"


def get_file_content(filename: str) -> str:
    """Read a single .md file by name (without extension)."""
    path = DATA_DIR / f"{filename}.md"
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def search_markdown(query: str) -> list[dict]:
    """Return all .md files whose content contains the query string (case-insensitive)."""
    results = []
    for md_file in DATA_DIR.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        if query.lower() in content.lower():
            results.append({"filename": str(md_file.relative_to(DATA_DIR)), "content": content})
    return results


def load_all_markdown() -> str:
    """Load all .md files and concatenate into a single context string."""
    parts = []
    for md_file in sorted(DATA_DIR.rglob("*.md")):
        if md_file.name.startswith("_"):
            continue  # skip templates
        relative = md_file.relative_to(DATA_DIR)
        content = md_file.read_text(encoding="utf-8")
        parts.append(f"## FILE: {relative}\n\n{content}")
    return "\n\n---\n\n".join(parts)
```

**Step 6: Commit**

```bash
git add apps/ai-engine/
git commit -m "chore: scaffold Python FastAPI AI engine"
```

---

## Phase 2: Knowledge Base

### Task 5: Create knowledge base templates

**Files:**
- Create: `data/bio.md`
- Create: `data/experience.md`
- Create: `data/stack.md`
- Create: `data/ambitions.md`
- Create: `data/projects/_template.md`

**Step 1: Create `data/bio.md`**

```markdown
# Bio

<!-- FILL_IN: 2-3 paragraphs. Who you are, your engineering identity, what drives you, your values. Write in first person as if introducing yourself to a senior engineer. -->
<!-- PROMPT_github: Run `gh api user` to get your profile data. Run `gh repo list --json name,description --limit 20` for a sense of your public work. -->
<!-- PROMPT_confluence: Search for pages you authored tagged "about me" or "team intro". Extract how you describe yourself professionally. -->

## About Me

[Your name] is a fullstack engineer with [X] years of experience building [type of products].

## What I Care About

- 
- 

## Outside Engineering

- 
```

**Step 2: Create `data/experience.md`**

```markdown
# Professional Experience

<!-- FILL_IN: List roles chronologically (most recent first). For each: company, title, dates, 2-3 bullet points of impact. Focus on outcomes, not tasks. -->
<!-- PROMPT_github: Run `gh search prs --author @me --state merged --limit 50 --json title,body,mergedAt,repository`. Group PRs by repository/employer. For each group, identify the top 3 most impactful changes and note the business outcome. -->
<!-- PROMPT_confluence: Search "architecture decision" OR "RFC" OR "technical spec" filtered to pages you authored. For each page: what problem did you solve, what was your proposed solution, what was the outcome? -->
<!-- PROMPT_jira: JQL: `assignee = currentUser() AND status = Done AND type in (Story, Task) ORDER BY resolutiondate DESC`. For each epic grouping: what feature did you deliver, what was the measurable result? -->

## [Company Name] — [Your Title]
**[Start Month Year] → [End Month Year or Present]**

- 
- 
- 

## [Previous Company] — [Your Title]
**[Start Month Year] → [End Month Year]**

- 
- 
```

**Step 3: Create `data/stack.md`**

```markdown
# Technical Stack

<!-- FILL_IN: Group technologies by category. For each, note your proficiency (learning / comfortable / expert) and years of experience. Be honest — this feeds the AI that talks to engineers. -->
<!-- PROMPT_github: Run `gh api repos/{owner}/{repo}/languages` for your top 5 repos. Aggregate the language percentages across all repos to find your most-used languages. -->
<!-- PROMPT_confluence: Search "tech stack" OR "architecture" pages you authored. Extract every technology mentioned and your role with it. -->
<!-- PROMPT_jira: Search components or labels on tickets you've resolved. These often map to services/technologies you've worked with. -->

## Languages
- TypeScript — expert, 4+ years
- Python — learning
- [Add more]

## Frontend
- Vue 3 / Nuxt — 
- React — 
- Tailwind CSS — 

## Backend
- NestJS — 
- Node.js — 
- FastAPI — 

## Infrastructure & Tooling
- Docker — 
- Vercel — 
- [Cloud provider] — 

## Databases
- [Database] — 
```

**Step 4: Create `data/ambitions.md`**

```markdown
# Ambitions & Direction

<!-- FILL_IN: Where are you headed? What type of work excites you next? What problems do you want to solve? Write this as if answering "where do you see yourself in 3 years?" in an interview — honest, specific, forward-looking. -->
<!-- PROMPT_confluence: Search your personal notes or "learning goals" pages. What skills or areas have you noted as wanting to develop? -->
<!-- PROMPT_jira: Look at tickets you've volunteered for or created yourself outside your assigned work. These reveal what you're drawn to. -->
<!-- PROMPT_github: Which repos have you starred or contributed to outside work? These signal your genuine interests. Run `gh api user/starred --limit 20`. -->

## What Excites Me Next

- 
- 

## The Problems I Want to Solve

- 

## How I Want to Work

- Team size preference:
- Domain preference:
- Engineering culture I thrive in:
```

**Step 5: Create `data/projects/_template.md`**

```markdown
# [Project Name]

<!-- FILL_IN: Copy this file, rename it to your-project-name.md, and fill in each section. Delete comment blocks when done. -->
<!-- PROMPT_github: Run `gh pr list --repo [org/repo] --author @me --state merged --json title,body,mergedAt,additions,deletions`. Identify your most impactful PRs by additions+deletions or business context. -->
<!-- PROMPT_confluence: Search "[project name]" filtered to pages you authored or commented on. Extract: problem statement, your contribution, architectural decisions you influenced. -->
<!-- PROMPT_jira: JQL: `project = [KEY] AND assignee = currentUser() AND type = Epic`. For each epic: title, description, linked PRs, completion date, business outcome. -->

## Problem
<!-- What pain point or need did this project address? One paragraph. -->

## My Role
<!-- Your specific contribution. Not just "fullstack dev" — what decisions did you own, what did you build end-to-end? -->

## Stack
<!-- Technologies used. Briefly note why each was chosen if notable. -->
- 
- 

## Outcome
<!-- Measurable result: users served, performance gains, business impact, internal adoption, etc. -->

## Code Highlights
<!-- Optional: 1-2 technical decisions worth explaining to another engineer. This is what the AI will use to go deep on your projects. -->
```

**Step 6: Commit**

```bash
git add data/
git commit -m "feat: add knowledge base templates with repository prompts"
```

---

## Phase 3: NestJS Content API

### Task 6: Content module — read and serve `.md` files

**Files:**
- Create: `apps/api/src/content/content.controller.ts`
- Create: `apps/api/src/content/content.service.ts`
- Create: `apps/api/src/content/content.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Step 1: Write the failing test — `apps/api/src/content/content.service.spec.ts`**

```ts
import { ContentService } from "./content.service"
import * as fs from "fs"

jest.mock("fs")

describe("ContentService", () => {
  let service: ContentService

  beforeEach(() => {
    service = new ContentService()
  })

  it("returns content for a known section", () => {
    ;(fs.readFileSync as jest.Mock).mockReturnValue("# Bio\nHello world")
    const result = service.getSection("bio")
    expect(result.section).toBe("bio")
    expect(result.content).toContain("Hello world")
  })

  it("throws NotFoundException for unknown section", () => {
    ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("ENOENT")
    })
    expect(() => service.getSection("nonexistent")).toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/api && npm test -- --testPathPattern=content.service
```
Expected: FAIL — `ContentService` not found.

**Step 3: Create `apps/api/src/content/content.service.ts`**

```ts
import { Injectable, NotFoundException } from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"

const DATA_DIR = path.resolve(__dirname, "../../../../data")

const SECTION_MAP: Record<string, string> = {
  bio: "bio.md",
  experience: "experience.md",
  stack: "stack.md",
  ambitions: "ambitions.md",
}

@Injectable()
export class ContentService {
  getSection(section: string): { section: string; content: string; updatedAt: string } {
    if (section === "projects") {
      return this.getProjects() as any
    }

    const filename = SECTION_MAP[section]
    if (!filename) {
      throw new NotFoundException(`Section "${section}" not found`)
    }

    try {
      const filePath = path.join(DATA_DIR, filename)
      const content = fs.readFileSync(filePath, "utf-8")
      const stats = fs.statSync(filePath)
      return { section, content, updatedAt: stats.mtime.toISOString() }
    } catch {
      throw new NotFoundException(`Content for "${section}" not found`)
    }
  }

  getProjects(): { section: string; items: { filename: string; content: string }[] } {
    const projectsDir = path.join(DATA_DIR, "projects")
    try {
      const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      const items = files.map((file) => ({
        filename: file.replace(".md", ""),
        content: fs.readFileSync(path.join(projectsDir, file), "utf-8"),
      }))
      return { section: "projects", items }
    } catch {
      return { section: "projects", items: [] }
    }
  }
}
```

**Step 4: Create `apps/api/src/content/content.controller.ts`**

```ts
import { Controller, Get, Param } from "@nestjs/common"
import { ContentService } from "./content.service"

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(":section")
  getSection(@Param("section") section: string) {
    return this.contentService.getSection(section)
  }
}
```

**Step 5: Create `apps/api/src/content/content.module.ts`**

```ts
import { Module } from "@nestjs/common"
import { ContentController } from "./content.controller"
import { ContentService } from "./content.service"

@Module({
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
```

**Step 6: Register in `apps/api/src/app.module.ts`**

Add `ContentModule` to the `imports` array.

**Step 7: Run test to verify it passes**

```bash
cd apps/api && npm test -- --testPathPattern=content.service
```
Expected: PASS

**Step 8: Commit**

```bash
git add apps/api/src/content/ apps/api/src/app.module.ts
git commit -m "feat(api): add content module serving .md files as JSON"
```

---

## Phase 4: NestJS Chat Proxy

### Task 7: Chat module — proxy to Python

**Files:**
- Create: `apps/api/src/chat/chat.controller.ts`
- Create: `apps/api/src/chat/chat.service.ts`
- Create: `apps/api/src/chat/chat.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Step 1: Write the failing test — `apps/api/src/chat/chat.service.spec.ts`**

```ts
import { ChatService } from "./chat.service"
import { HttpService } from "@nestjs/axios"
import { of } from "rxjs"

describe("ChatService", () => {
  let service: ChatService
  let httpService: Partial<HttpService>

  beforeEach(() => {
    httpService = {
      post: jest.fn().mockReturnValue(of({ data: { answer: "Hello", sources: ["bio"] } })),
    }
    service = new ChatService(httpService as HttpService)
  })

  it("forwards message and history to Python service", async () => {
    const result = await service.ask({ message: "hi", history: [] })
    expect(result.answer).toBe("Hello")
    expect(result.sources).toContain("bio")
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/api && npm test -- --testPathPattern=chat.service
```
Expected: FAIL

**Step 3: Create `apps/api/src/chat/chat.service.ts`**

```ts
import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { HttpService } from "@nestjs/axios"
import { firstValueFrom, timeout } from "rxjs"

const FALLBACK = "I'm temporarily unavailable. Please try again in a moment."

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface AskDto {
  message: string
  history: ChatMessage[]
}

@Injectable()
export class ChatService {
  constructor(private readonly httpService: HttpService) {}

  async ask(dto: AskDto): Promise<{ answer: string; sources: string[] }> {
    const aiUrl = process.env.NEST_AI_SERVICE_URL
    if (!aiUrl) {
      throw new HttpException("AI service not configured", HttpStatus.SERVICE_UNAVAILABLE)
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${aiUrl}/ask`, dto).pipe(timeout(10000))
      )
      return response.data
    } catch {
      return { answer: FALLBACK, sources: [] }
    }
  }
}
```

**Step 4: Create `apps/api/src/chat/chat.controller.ts`**

```ts
import { Controller, Post, Body } from "@nestjs/common"
import { ChatService, AskDto } from "./chat.service"

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("ask")
  ask(@Body() dto: AskDto) {
    return this.chatService.ask(dto)
  }
}
```

**Step 5: Create `apps/api/src/chat/chat.module.ts`**

```ts
import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { ChatController } from "./chat.controller"
import { ChatService } from "./chat.service"

@Module({
  imports: [HttpModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
```

**Step 6: Register in `apps/api/src/app.module.ts`**

Add `ChatModule` to the `imports` array.

**Step 7: Run test to verify it passes**

```bash
cd apps/api && npm test -- --testPathPattern=chat.service
```
Expected: PASS

**Step 8: Commit**

```bash
git add apps/api/src/chat/ apps/api/src/app.module.ts
git commit -m "feat(api): add chat proxy module with 10s timeout and fallback"
```

---

## Phase 5: Python AI Engine

### Task 8: Implement full `/ask` endpoint with Groq

**Files:**
- Modify: `apps/ai-engine/main.py`
- Modify: `apps/ai-engine/tools/md_reader.py` (already created)

**Step 1: Set up Python virtualenv and install deps**

```bash
cd apps/ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Step 2: Create `apps/ai-engine/.env` (local only, not committed)**

```bash
LLM_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at https://console.groq.com

**Step 3: Write a manual test — `apps/ai-engine/tools/test_md_reader.py`**

```python
from tools.md_reader import load_all_markdown, get_file_content

def test_load_all():
    result = load_all_markdown()
    assert len(result) > 0, "Should load at least one file"
    print("load_all_markdown OK — length:", len(result))

def test_get_file():
    result = get_file_content("bio")
    # may be empty if not filled in yet, but should not raise
    print("get_file_content('bio') OK:", result[:80] if result else "(empty)")

if __name__ == "__main__":
    test_load_all()
    test_get_file()
```

**Step 4: Run the test**

```bash
cd apps/ai-engine && python tools/test_md_reader.py
```
Expected: prints "load_all_markdown OK" without error

**Step 5: Replace `apps/ai-engine/main.py` with full implementation**

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from tools.md_reader import load_all_markdown

load_dotenv()

app = FastAPI(title="Portfolio AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("LLM_API_KEY"))
MODEL = "llama3-8b-8192"  # free tier, fast


class ChatMessage(BaseModel):
    role: str
    content: str


class AskRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


def build_system_prompt(context: str) -> dict:
    return {
        "role": "system",
        "content": f"""You are the digital twin of the portfolio owner. You answer questions about their professional experience, technical skills, projects, and career ambitions.

Rules:
- Only answer based on the provided knowledge base below.
- If asked about a specific project, provide technical depth — explain architecture decisions and code-level details if available.
- If asked to show code examples from their projects, do so if the knowledge base contains enough detail.
- If asked something outside the knowledge base, say "I don't have information about that in my knowledge base."
- Be concise but precise. You are talking to both recruiters and engineers.
- Refer to yourself as the person (not "the owner"), e.g. "I worked on..." or "My stack includes..."

Knowledge base:
---
{context}
---""",
    }


def detect_sources(answer: str, context_files: list[str]) -> list[str]:
    """Return which knowledge base files were likely referenced in the answer."""
    answer_lower = answer.lower()
    return [f for f in context_files if any(word in answer_lower for word in f.lower().split("/")[-1].replace(".md", "").split("-"))]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ask")
async def ask(body: AskRequest):
    context = load_all_markdown()
    system_prompt = build_system_prompt(context)

    messages = [system_prompt] + [m.model_dump() for m in body.history] + [{"role": "user", "content": body.message}]

    completion = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0.7,
    )

    answer = completion.choices[0].message.content or ""
    sources = detect_sources(answer, [])  # extend later when md_reader returns filenames

    return {"answer": answer, "sources": sources}
```

**Step 6: Run the service locally**

```bash
cd apps/ai-engine && uvicorn main:app --reload --port 8000
```

**Step 7: Test the endpoint manually**

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Who are you?", "history": []}'
```
Expected: JSON with `answer` field (will be sparse until knowledge base is filled).

**Step 8: Commit**

```bash
git add apps/ai-engine/
git commit -m "feat(ai): implement full /ask endpoint with Groq LLM integration"
```

---

## Phase 6: Vue Router & Pinia Stores

### Task 9: Set up router and Pinia stores

**Files:**
- Create: `apps/web/src/router/index.ts`
- Create: `apps/web/src/store/chat.store.ts`
- Create: `apps/web/src/store/ui.store.ts`
- Create: `apps/web/src/store/content.store.ts`

**Step 1: Create `apps/web/src/router/index.ts`**

```ts
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", component: () => import("../pages/HomePage.vue") },
  { path: "/experience", component: () => import("../pages/ExperiencePage.vue") },
  { path: "/skills", component: () => import("../pages/SkillsPage.vue") },
  { path: "/projects", component: () => import("../pages/ProjectsPage.vue") },
  { path: "/ambitions", component: () => import("../pages/AmbitionsPage.vue") },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
```

**Step 2: Create `apps/web/src/store/chat.store.ts`**

```ts
import { defineStore } from "pinia"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    isOpen: false,
    messages: [] as ChatMessage[],
    isLoading: false,
  }),
  actions: {
    toggle() {
      this.isOpen = !this.isOpen
    },
    open() {
      this.isOpen = true
    },
    async sendMessage(text: string) {
      this.messages.push({ role: "user", content: text })
      this.isLoading = true
      this.isOpen = true

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: this.messages.slice(0, -1) }),
        })
        const data = await res.json()
        this.messages.push({ role: "assistant", content: data.answer })
      } catch {
        this.messages.push({ role: "assistant", content: "Something went wrong. Please try again." })
      } finally {
        this.isLoading = false
      }
    },
  },
  share: { enable: true },  // pinia-shared-state
})
```

**Step 3: Create `apps/web/src/store/ui.store.ts`**

```ts
import { defineStore } from "pinia"

export const useUIStore = defineStore("ui", {
  state: () => ({
    chatExpanded: false,  // hero split-screen state
  }),
  actions: {
    expandChat() {
      this.chatExpanded = true
    },
  },
  share: { enable: true },
})
```

**Step 4: Create `apps/web/src/store/content.store.ts`**

```ts
import { defineStore } from "pinia"

const BASE = import.meta.env.VITE_API_BASE_URL || "/api"

export const useContentStore = defineStore("content", {
  state: () => ({
    bio: "",
    experience: "",
    stack: "",
    ambitions: "",
    projects: [] as { filename: string; content: string }[],
    loading: {} as Record<string, boolean>,
  }),
  actions: {
    async fetchSection(section: string) {
      this.loading[section] = true
      try {
        const res = await fetch(`${BASE}/content/${section}`)
        const data = await res.json()
        if (section === "projects") {
          this.projects = data.items
        } else {
          (this as any)[section] = data.content
        }
      } finally {
        this.loading[section] = false
      }
    },
  },
})
```

**Step 5: Commit**

```bash
git add apps/web/src/router/ apps/web/src/store/
git commit -m "feat(web): add Vue Router and Pinia stores (chat, ui, content)"
```

---

## Phase 7: Vue Components & Pages

### Task 10: NavBar component

**Files:**
- Create: `apps/web/src/components/NavBar.vue`

```vue
<template>
  <nav class="fixed top-0 w-full z-50 bg-bg border-b border-surface px-6 py-4 flex items-center justify-between">
    <router-link to="/" class="font-mono text-accent font-semibold text-sm tracking-widest uppercase">
      {{ ownerName }}
    </router-link>
    <div class="flex items-center gap-6">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="font-mono text-xs text-muted hover:text-text transition-colors"
        active-class="text-text"
      >
        {{ link.label }}
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
const ownerName = "Your Name"  // replace with actual name

const links = [
  { to: "/experience", label: "experience" },
  { to: "/skills", label: "skills" },
  { to: "/projects", label: "projects" },
  { to: "/ambitions", label: "ambitions" },
]
</script>
```

**Step: Commit**

```bash
git add apps/web/src/components/NavBar.vue
git commit -m "feat(web): add NavBar component"
```

---

### Task 11: HomePage with chat-first hero and split-screen

**Files:**
- Create: `apps/web/src/pages/HomePage.vue`
- Create: `apps/web/src/components/ChatPanel.vue`
- Create: `apps/web/src/components/ChatMessage.vue`

**Step 1: Create `apps/web/src/components/ChatMessage.vue`**

```vue
<template>
  <div class="font-mono text-sm leading-relaxed">
    <span :class="role === 'user' ? 'text-accent' : 'text-text'">
      {{ role === 'user' ? 'you' : ownerName }} &gt;
    </span>
    <span class="ml-2 text-text whitespace-pre-wrap">{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ role: "user" | "assistant"; content: string }>()
const ownerName = "henri"  // replace with actual name
</script>
```

**Step 2: Create `apps/web/src/components/ChatPanel.vue`**

```vue
<template>
  <div class="flex flex-col h-full bg-surface border-l border-surface">
    <!-- Messages -->
    <div ref="scrollEl" class="flex-1 overflow-y-auto p-6 space-y-4">
      <div v-if="store.messages.length === 0" class="font-mono text-xs text-muted">
        Ask me about my experience, projects, or stack...
      </div>
      <ChatMessage
        v-for="(msg, i) in store.messages"
        :key="i"
        :role="msg.role"
        :content="msg.content"
      />
      <div v-if="store.isLoading" class="font-mono text-xs text-muted animate-pulse">
        thinking...
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-surface p-4">
      <form @submit.prevent="send" class="flex items-center gap-2">
        <span class="font-mono text-accent text-sm">you &gt;</span>
        <input
          v-model="input"
          type="text"
          placeholder="ask anything..."
          class="flex-1 bg-transparent font-mono text-sm text-text placeholder-muted outline-none"
          autofocus
        />
        <button type="submit" class="font-mono text-xs text-muted hover:text-accent transition-colors">
          send
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue"
import { useChatStore } from "../store/chat.store"
import { useUIStore } from "../store/ui.store"
import ChatMessage from "./ChatMessage.vue"

const store = useChatStore()
const ui = useUIStore()
const input = ref("")
const scrollEl = ref<HTMLElement>()

async function send() {
  if (!input.value.trim()) return
  const msg = input.value.trim()
  input.value = ""
  ui.expandChat()
  await store.sendMessage(msg)
}

watch(() => store.messages.length, async () => {
  await nextTick()
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
})
</script>
```

**Step 3: Create `apps/web/src/pages/HomePage.vue`**

```vue
<template>
  <div class="pt-16 min-h-screen">
    <!-- Hero + Chat split -->
    <div class="flex transition-all duration-300 ease-in-out" :style="heroStyle">
      <!-- Hero left panel -->
      <div
        class="flex flex-col justify-center px-12 py-16 transition-all duration-300"
        :class="ui.chatExpanded ? 'w-1/2' : 'w-full'"
      >
        <p class="font-mono text-xs text-muted mb-2 tracking-widest uppercase">fullstack engineer</p>
        <h1 class="font-mono text-4xl font-semibold text-text mb-4">Your Name</h1>
        <p class="text-muted text-sm mb-8 max-w-md">
          Building products at the intersection of engineering and product thinking.
        </p>

        <!-- Chat input (hero version) -->
        <form @submit.prevent="sendFromHero" class="flex items-center gap-3 max-w-lg border border-surface rounded px-4 py-3 bg-surface">
          <span class="font-mono text-accent text-sm">ask &gt;</span>
          <input
            v-model="heroInput"
            type="text"
            placeholder="ask me anything..."
            class="flex-1 bg-transparent font-mono text-sm text-text placeholder-muted outline-none"
          />
          <button type="submit" class="font-mono text-xs text-muted hover:text-accent transition-colors">→</button>
        </form>
      </div>

      <!-- Chat right panel (appears after first message) -->
      <Transition name="slide">
        <div v-if="ui.chatExpanded" class="w-1/2 h-[calc(100vh-4rem)] sticky top-16">
          <ChatPanel />
        </div>
      </Transition>
    </div>

    <!-- Sections below hero -->
    <div class="border-t border-surface px-12 py-6 flex gap-8">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="font-mono text-xs text-muted hover:text-accent transition-colors"
      >
        /{{ link.label }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useChatStore } from "../store/chat.store"
import { useUIStore } from "../store/ui.store"
import ChatPanel from "../components/ChatPanel.vue"

const chat = useChatStore()
const ui = useUIStore()
const heroInput = ref("")

const links = [
  { to: "/experience", label: "experience" },
  { to: "/skills", label: "skills" },
  { to: "/projects", label: "projects" },
  { to: "/ambitions", label: "ambitions" },
]

const heroStyle = { minHeight: "calc(100vh - 4rem)" }

async function sendFromHero() {
  if (!heroInput.value.trim()) return
  const msg = heroInput.value.trim()
  heroInput.value = ""
  await chat.sendMessage(msg)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

**Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat(web): add hero layout with split-screen chat panel"
```

---

### Task 12: Static content pages

**Files:**
- Create: `apps/web/src/pages/ExperiencePage.vue`
- Create: `apps/web/src/pages/SkillsPage.vue`
- Create: `apps/web/src/pages/ProjectsPage.vue`
- Create: `apps/web/src/pages/AmbitionsPage.vue`

Each page follows the same pattern: fetch from content store on mount, render markdown as preformatted text for now (a markdown renderer can be added later).

**Step 1: Create `apps/web/src/pages/ExperiencePage.vue`**

```vue
<template>
  <div class="pt-24 px-12 max-w-3xl mx-auto">
    <h1 class="font-mono text-xs text-accent uppercase tracking-widest mb-8">/ experience</h1>
    <div v-if="store.loading.experience" class="font-mono text-xs text-muted animate-pulse">loading...</div>
    <pre v-else class="font-mono text-sm text-text whitespace-pre-wrap leading-relaxed">{{ store.experience }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useContentStore } from "../store/content.store"

const store = useContentStore()
onMounted(() => store.fetchSection("experience"))
</script>
```

Repeat the same pattern for `SkillsPage.vue` (section: `stack`), `AmbitionsPage.vue` (section: `ambitions`).

**Step 2: Create `apps/web/src/pages/ProjectsPage.vue`**

```vue
<template>
  <div class="pt-24 px-12 max-w-5xl mx-auto">
    <h1 class="font-mono text-xs text-accent uppercase tracking-widest mb-8">/ projects</h1>
    <div v-if="store.loading.projects" class="font-mono text-xs text-muted animate-pulse">loading...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="project in store.projects"
        :key="project.filename"
        class="border border-surface p-6 hover:border-accent transition-colors cursor-pointer"
        @click="selected = selected === project.filename ? null : project.filename"
      >
        <h2 class="font-mono text-sm text-text font-semibold mb-2">{{ project.filename }}</h2>
        <pre
          v-if="selected === project.filename"
          class="font-mono text-xs text-muted whitespace-pre-wrap leading-relaxed mt-4"
        >{{ project.content }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useContentStore } from "../store/content.store"

const store = useContentStore()
const selected = ref<string | null>(null)
onMounted(() => store.fetchSection("projects"))
</script>
```

**Step 3: Update `apps/web/src/App.vue`**

```vue
<template>
  <div class="min-h-screen bg-bg text-text">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import NavBar from "./components/NavBar.vue"
</script>
```

**Step 4: Commit**

```bash
git add apps/web/src/pages/ apps/web/src/App.vue
git commit -m "feat(web): add experience, skills, projects, ambitions pages"
```

---

## Phase 8: Deployment

### Task 13: Vercel deployment configuration

**Files:**
- Modify: `vercel.json`
- Create: `apps/api/vercel.json`

**Step 1: Update root `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index" },
    { "source": "/:path*", "destination": "/index.html" }
  ]
}
```

**Step 2: Create `apps/web/vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Step 3: Add `VITE_API_BASE_URL=/api` to Vercel environment variables in the dashboard**

**Step 4: Commit**

```bash
git add vercel.json apps/web/vercel.json
git commit -m "chore: configure Vercel deployment routing"
```

---

### Task 14: Render/Railway Dockerfile and keep-alive

**Files:**
- Verify: `apps/ai-engine/Dockerfile` (created in Task 4)

**Step 1: Final `apps/ai-engine/Dockerfile`**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY apps/ai-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ai-engine/ ./
COPY data/ ./data/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Note: Render/Railway builds from the repo root. Set the build context to `/` and Dockerfile path to `apps/ai-engine/Dockerfile` in the service settings.

**Step 2: Set environment variables in Render/Railway dashboard**

```
LLM_API_KEY=your_groq_api_key
```

**Step 3: Set up UptimeRobot**

- Create free account at uptimerobot.com
- Add HTTP monitor pointing to `https://your-service.render.com/health`
- Set interval: 5 minutes
- This prevents the free tier from spinning down

**Step 4: Set `NEST_AI_SERVICE_URL` in Vercel dashboard**

```
NEST_AI_SERVICE_URL=https://your-service.render.com
```

**Step 5: Commit**

```bash
git add apps/ai-engine/Dockerfile
git commit -m "chore: finalize Dockerfile for Render/Railway deployment"
```

---

## Implementation Order Summary

```
Phase 1: Tasks 1-4   → monorepo shell, all three apps scaffold
Phase 2: Task 5      → knowledge base templates
Phase 3: Tasks 6-7   → NestJS content API + chat proxy
Phase 4: Task 8      → Python AI engine
Phase 5: Tasks 9-12  → Vue router, stores, all pages and components
Phase 6: Tasks 13-14 → deployment config
```

**Before deploying:** Fill in the `.md` files in `/data` using the prompts in each template. The AI will not give meaningful answers until the knowledge base has real content.
