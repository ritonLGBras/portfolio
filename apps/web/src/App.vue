<template>
  <div class="app" :class="{ 'split-active': chatStore.messages.length > 0 }">
    <NavBar />

    <!-- Chat bar: sticky under navbar, visible until first message sent -->
    <div
      v-if="chatStore.messages.length === 0"
      class="chat-bar"
    >
      <form @submit.prevent="sendInitial" class="chat-bar-form">
        <input
          v-model="chatInput"
          type="text"
          placeholder="Ask me anything about Henri..."
          class="chat-bar-input"
          autofocus
        />
        <button type="submit" class="chat-bar-btn" :disabled="!chatInput.trim()">
          Ask
        </button>
      </form>
    </div>

    <main class="content-col">

      <!-- ── Hero: full-viewport landing ── -->
      <section id="hero" class="hero-section">
        <div class="hero-content">
          <p class="hero-const">const dev = "Henri Gerardin";</p>
          <p class="hero-tagline">
            Engineer at Mayday. Building AI-native products in Paris.
          </p>
        </div>

        <!-- Scroll hint -->
        <div class="chevron-hint" v-show="chatStore.messages.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </section>

      <!-- ── Content sections ── -->
      <section id="experience" class="section">
        <h2 class="section-heading">Experience</h2>
        <ExperienceSection />
      </section>

      <section id="skills" class="section">
        <h2 class="section-heading">Skills</h2>
        <SkillsSection />
      </section>

      <section id="projects" class="section">
        <h2 class="section-heading">Projects</h2>
        <ProjectsSection />
      </section>

      <section id="ambitions" class="section">
        <h2 class="section-heading">Ambitions</h2>
        <AmbitionsSection />
      </section>

    </main>

    <!-- Chat panel (right side, split mode only) -->
    <aside v-if="chatStore.messages.length > 0" class="chat-col">
      <ChatPanel />
    </aside>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import ChatPanel from './components/ChatPanel.vue'
import { useChatStore } from './store/chat'
import ExperienceSection from './components/ExperienceSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import AmbitionsSection from './components/AmbitionsSection.vue'

const chatStore = useChatStore()
const chatInput = ref('')

async function sendInitial() {
  if (!chatInput.value.trim()) return
  await chatStore.send(chatInput.value)
  chatInput.value = ''
}
</script>

<style>
@reference "./style.css";

/* ── App grid layout ── */
.app {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto auto 1fr;
  grid-template-columns: 1fr;
  grid-template-areas:
    "nav"
    "bar"
    "content";
}

.app.split-active {
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "nav nav"
    "bar bar"
    "content chat";
}

.content-col {
  grid-area: content;
  overflow-y: auto;
}

.app.split-active .content-col {
  height: calc(100vh - 57px);
}

.chat-col {
  grid-area: chat;
  height: calc(100vh - 57px);
  position: sticky;
  top: 57px;
  overflow: hidden;
  border-left: 1px solid #1f1f1f;
}

/* ── Hero section: full viewport ── */
.hero-section {
  position: relative;
  min-height: calc(100vh - 57px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 3rem 6rem;
  gap: 3rem;
}

.app.split-active .hero-section {
  min-height: unset;
  padding: 4rem 3rem;
}

.hero-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-const {
  font-family: var(--font-mono);
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.hero-tagline {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: var(--color-muted);
  max-width: 480px;
  line-height: 1.6;
}

/* ── Chat bar: always sticky under navbar ── */
.chat-bar {
  position: sticky;
  top: 57px;
  z-index: 90;
  padding: 0.5rem 3rem;
  background: var(--color-bg);
  border-bottom: 1px solid #1e1e1e;
  grid-area: bar;
}

.chat-bar-form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 720px;
  background: #0f0f0f;
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.1),
    0 0 40px rgba(59, 130, 246, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.chat-bar-form:focus-within {
  border-color: rgba(99, 160, 255, 0.9);
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.2),
    0 0 60px rgba(59, 130, 246, 0.35),
    0 8px 40px rgba(0, 0, 0, 0.5);
}

.chat-bar-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 1.05rem;
  caret-color: var(--color-accent);
  min-width: 0;
}

.chat-bar-input::placeholder {
  color: var(--color-muted);
  opacity: 0.6;
}

.chat-bar-btn {
  flex-shrink: 0;
  padding: 0.5rem 1.25rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}

.chat-bar-btn:hover:not(:disabled) {
  background: rgba(99, 160, 255, 1);
}

.chat-bar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Scroll chevron ── */
.chevron-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-muted);
  animation: chevron-bounce 2s ease-in-out infinite;
}

.app.split-active .chevron-hint {
  display: none;
}

@keyframes chevron-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; }
  50% { transform: translateX(-50%) translateY(8px); opacity: 0.9; }
}

/* ── Content sections ── */
.section {
  padding: 4rem 3rem;
  border-bottom: 1px solid #1a1a1a;
  max-width: 720px;
}

.section-heading {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
</style>
