# Chat Bar Hero + Scroll-Dock Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the chat bar the hero element on landing — big and centred — then smoothly dock it under the navbar when the user scrolls, where it stays permanently until chat activates.

**Architecture:** All state lives in `App.vue` via a `scrolled` boolean (set by a `window` scroll listener, threshold 10px). The chat bar is always in the DOM pre-chat; a `.docked` CSS class is toggled on it. The hero chevron is a sibling element hidden once `scrolled` is true. All motion is CSS transitions — no JS animation.

**Tech Stack:** Vue 3 + Vite 5 + Tailwind v4 (CSS custom properties), pure CSS transitions.

---

### Task 1: Add `scrolled` state and scroll listener to `App.vue`

**Files:**
- Modify: `apps/web/src/App.vue`

**Step 1: Add scroll tracking to `<script setup>`**

Add after the existing refs:

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
```

Note: `ref` and other imports are already in the file — merge the import, don't duplicate it.

**Step 2: Verify reactivity in template**

Add a temporary debug line in the template to confirm it works:
```html
<!-- debug: remove after verifying -->
<span style="position:fixed;top:60px;left:10px;color:red;z-index:999">{{ scrolled }}</span>
```

Run `npm run dev:web` from the worktree root, scroll the page, confirm `scrolled` toggles between `false` and `true`.

Remove the debug span.

**Step 3: Commit**

```bash
git add apps/web/src/App.vue
git commit -m "feat: track scroll state for chat bar docking"
```

---

### Task 2: Add chevron element to the hero section

**Files:**
- Modify: `apps/web/src/App.vue`

**Step 1: Add chevron below the hero section content**

Replace the existing hero section:
```html
<section id="hero" class="section">
  <h1 class="font-mono text-4xl text-text mb-4">Henri Gerardin</h1>
  <p class="text-muted text-lg max-w-xl">
    Engineer at Mayday. Building AI-native products in Paris.
  </p>
</section>
```

With:
```html
<section id="hero" class="section hero-section">
  <h1 class="font-mono text-4xl text-text mb-4">Henri Gerardin</h1>
  <p class="text-muted text-lg max-w-xl">
    Engineer at Mayday. Building AI-native products in Paris.
  </p>
</section>

<div class="chevron-hint" v-show="!scrolled && chatStore.messages.length === 0">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
</div>
```

**Step 2: Add chevron CSS in `<style>` block**

```css
.chevron-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0 1rem;
  color: var(--color-muted);
  animation: chevron-bounce 2s ease-in-out infinite;
  /* only visible in the content column, not in split mode */
}

.app.split-active .chevron-hint {
  display: none;
}

@keyframes chevron-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(6px); opacity: 1; }
}
```

**Step 3: Verify**

Run `npm run dev:web`. On load the chevron should bounce below the hero text. On scroll past 10px it should disappear. On scroll back to top it should reappear.

**Step 4: Commit**

```bash
git add apps/web/src/App.vue
git commit -m "feat: add animated scroll hint chevron to hero"
```

---

### Task 3: Rewrite the chat bar — hero state + docked state

**Files:**
- Modify: `apps/web/src/App.vue`

This is the main visual task. The chat bar gets two modes:
- **Hero** (`.chat-bar`, default): large, centred in the viewport below hero text, prominent border + glow
- **Docked** (`.chat-bar.docked`): slim strip, sticks just below navbar (`position: sticky; top: 57px`), same height as today

**Step 1: Add `:class` binding for docked state on the chat bar div**

Change:
```html
<div v-if="chatStore.messages.length === 0" class="chat-bar">
```
To:
```html
<div v-if="chatStore.messages.length === 0" class="chat-bar" :class="{ docked: scrolled }">
```

**Step 2: Replace the `.chat-bar` CSS block entirely**

Remove all existing `.chat-bar`, `.chat-bar-form`, `.chat-bar-input`, `.chat-bar-input::placeholder`, `.chat-bar-btn`, `.chat-bar-btn:disabled` rules and replace with:

```css
/* ── Chat bar: hero state (landing) ── */
.chat-bar {
  /* in-flow, below hero + chevron */
  padding: 2rem 3rem 2.5rem;
  background: transparent;
  z-index: 50;
  transition: all 0.3s ease;
}

.chat-bar-form {
  display: flex;
  align-items: center;
  max-width: 640px;
  margin: 0 auto;
  background: #111;
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.15);
  transition: box-shadow 0.2s ease;
}

.chat-bar-form:focus-within {
  box-shadow: 0 0 32px rgba(59, 130, 246, 0.3);
}

.chat-bar-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 1rem;
  caret-color: var(--color-accent);
}

.chat-bar-input::placeholder {
  color: var(--color-muted);
}

.chat-bar-btn {
  margin-left: 1rem;
  padding: 0.35rem 0.9rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: var(--font-mono);
  transition: opacity 0.15s;
}

.chat-bar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Chat bar: docked state (after scroll) ── */
.chat-bar.docked {
  position: sticky;
  top: 57px; /* navbar height */
  padding: 0.6rem 3rem;
  background: var(--color-bg);
  border-bottom: 1px solid #1a1a1a;
  z-index: 90;
}

.chat-bar.docked .chat-bar-form {
  max-width: 720px;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.chat-bar.docked .chat-bar-form:focus-within {
  box-shadow: none;
}

.chat-bar.docked .chat-bar-input {
  font-size: 0.875rem;
}

.chat-bar.docked .chat-bar-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}
```

**Step 3: Verify both states**

Run `npm run dev:web`.

- On load (scrollY = 0): chat bar should be large, centred, glowing blue border. Hero text above it, bouncing chevron below it.
- Scroll 20px: bar should smoothly dock under navbar as a slim strip. Chevron gone.
- Scroll back to top: bar returns to hero state. Chevron reappears.

**Step 4: Commit**

```bash
git add apps/web/src/App.vue
git commit -m "feat: chat bar hero state with scroll-dock transition"
```

---

### Task 4: Adjust `content-col` padding and hero section height

**Files:**
- Modify: `apps/web/src/App.vue`

Currently `.content-col` has `padding-bottom: 5rem` to clear the fixed chat bar. In the new design the chat bar is in-flow (hero state) or sticky (docked). We need to remove that bottom padding and also ensure the hero section doesn't feel cramped.

**Step 1: Update `.content-col`**

Change:
```css
.content-col {
  grid-area: content;
  overflow-y: auto;
  padding-bottom: 5rem; /* space for pinned chat bar */
}
```
To:
```css
.content-col {
  grid-area: content;
  overflow-y: auto;
}
```

**Step 2: Verify no content is clipped**

Scroll to the bottom of the page. The last section (Ambitions) should not be obscured by anything.

**Step 3: Commit**

```bash
git add apps/web/src/App.vue
git commit -m "fix: remove stale content-col bottom padding"
```

---

### Task 5: Build verification + push

**Step 1: Run full build**

```bash
npm run build:web
```

Expected: parser runs, Vite builds cleanly, no TypeScript errors.

**Step 2: Push to origin**

```bash
git push origin feature/onepager-redesign
```

(Or directly to `main` if the worktree is tracking main — check with `git status`.)
