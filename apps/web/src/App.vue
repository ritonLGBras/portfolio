<template>
  <div class="app" :class="{ 'split-active': chatStore.messages.length > 0 }">
    <!-- Sticky navbar -->
    <NavBar />

    <!-- Content column -->
    <main class="content-col">
      <section id="hero" class="section">
        <h1 class="font-mono text-4xl text-text mb-4">Henri Gerardin</h1>
        <p class="text-muted text-lg max-w-xl">
          Co-founder &amp; engineer at Mayday. Building AI-native products in Paris.
        </p>
      </section>

      <section id="experience" class="section">
        <!-- ExperienceSection component goes here (Task 6) -->
        <h2 class="section-heading">Experience</h2>
        <p class="text-muted font-mono text-sm">Coming soon...</p>
      </section>

      <section id="skills" class="section">
        <!-- SkillsSection component goes here (Task 7) -->
        <h2 class="section-heading">Skills</h2>
        <p class="text-muted font-mono text-sm">Coming soon...</p>
      </section>

      <section id="projects" class="section">
        <!-- ProjectsSection component goes here (Task 8) -->
        <h2 class="section-heading">Projects</h2>
        <p class="text-muted font-mono text-sm">Coming soon...</p>
      </section>

      <section id="ambitions" class="section">
        <!-- AmbitionsSection component goes here (Task 9) -->
        <h2 class="section-heading">Ambitions</h2>
        <p class="text-muted font-mono text-sm">Coming soon...</p>
      </section>
    </main>

    <!-- Chat panel (right side, split mode only) -->
    <aside v-if="chatStore.messages.length > 0" class="chat-col">
      <ChatPanel />
    </aside>

    <!-- Bottom-pinned chat input bar (pre-chat mode only) -->
    <div v-if="chatStore.messages.length === 0" class="chat-bar">
      <form @submit.prevent="sendInitial" class="chat-bar-form">
        <span class="font-mono text-accent mr-2 select-none">›</span>
        <input
          v-model="chatInput"
          type="text"
          placeholder="Ask Henri anything..."
          class="chat-bar-input"
          autofocus
        />
        <button type="submit" class="chat-bar-btn" :disabled="!chatInput.trim()">
          Ask
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import ChatPanel from './components/ChatPanel.vue'
import { useChatStore } from './store/chat'

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

/* Layout */
.app {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  grid-template-areas:
    "nav"
    "content";
}

.app.split-active {
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "nav nav"
    "content chat";
}

.content-col {
  grid-area: content;
  overflow-y: auto;
  padding-bottom: 5rem; /* space for pinned chat bar */
}

.app.split-active .content-col {
  padding-bottom: 0;
  height: calc(100vh - 57px); /* subtract navbar height */
}

.chat-col {
  grid-area: chat;
  height: calc(100vh - 57px);
  position: sticky;
  top: 57px; /* navbar height */
  overflow: hidden;
  border-left: 1px solid #1f1f1f;
}

/* Sections */
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

/* Bottom chat bar */
.chat-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 3rem;
  background: var(--color-bg);
  border-top: 1px solid #1a1a1a;
  z-index: 50;
}

.chat-bar-form {
  display: flex;
  align-items: center;
  max-width: 720px;
}

.chat-bar-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  caret-color: var(--color-accent);
}

.chat-bar-input::placeholder {
  color: var(--color-muted);
}

.chat-bar-btn {
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  font-family: var(--font-mono);
}

.chat-bar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
