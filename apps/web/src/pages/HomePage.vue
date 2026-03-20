<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <NavBar />
    <main class="flex-1 flex">
      <div class="flex-1 flex flex-col justify-center px-8 py-16" :style="chat.isOpen ? { maxWidth: '50%' } : {}">
        <div class="max-w-xl">
          <h1 class="text-5xl font-mono font-medium text-text mb-4">
            <span class="text-accent">const</span> dev
            <span class="text-accent">=</span>
            <span class="text-text">{{ ownerName }}</span>
          </h1>
          <p class="text-muted text-lg mb-8">Ask me anything about my experience, projects, or skills.</p>
          
          <form @submit.prevent="sendFromHero" class="flex gap-2">
            <input
              v-model="heroInput"
              type="text"
              placeholder="What would you like to know?"
              class="flex-1 bg-surface border border-gray-700 rounded px-4 py-3 text-text font-mono focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              class="bg-accent text-white px-6 py-3 rounded font-medium hover:bg-blue-600 transition-colors"
            >
              Ask
            </button>
          </form>

          <div class="mt-8 flex gap-4 text-sm">
            <router-link to="/experience" class="text-muted hover:text-accent">Experience</router-link>
            <router-link to="/skills" class="text-muted hover:text-accent">Skills</router-link>
            <router-link to="/projects" class="text-muted hover:text-accent">Projects</router-link>
            <router-link to="/ambitions" class="text-muted hover:text-accent">Ambitions</router-link>
          </div>
        </div>
      </div>

      <Transition name="slide">
        <div v-if="chat.isOpen" class="w-1/2 border-l border-gray-800">
          <ChatPanel />
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import ChatPanel from '../components/ChatPanel.vue';
import { useChatStore } from '../store/chat';

const chat = useChatStore();
const ownerName = 'Henri Gerardin';
const heroInput = ref('');

async function sendFromHero() {
  if (!heroInput.value.trim()) return;
  await chat.send(heroInput.value);
  heroInput.value = '';
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
