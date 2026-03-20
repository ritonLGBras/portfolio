<template>
  <div class="h-full flex flex-col bg-bg">
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <div v-if="!chat.messages.length" class="text-muted text-center py-8 font-mono">
        <span class="animate-pulse">_</span> Awaiting your question...
      </div>
      <div v-for="(msg, i) in chat.messages" :key="i" class="font-mono text-sm">
        <div class="text-muted mb-1">{{ msg.role === 'user' ? 'you >' : 'assistant >' }}</div>
        <div class="text-text whitespace-pre-wrap">{{ msg.content }}</div>
      </div>
      <div v-if="chat.isLoading" class="text-muted font-mono text-sm animate-pulse">
        thinking...
      </div>
    </div>
    <form @submit.prevent="send" class="p-4 border-t border-gray-800 flex gap-2">
      <input
        v-model="input"
        type="text"
        placeholder="Ask me anything..."
        class="flex-1 bg-surface border border-gray-700 rounded px-4 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
        :disabled="chat.isLoading"
      />
      <button
        type="submit"
        class="bg-accent text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        :disabled="chat.isLoading"
      >
        Send
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../store/chat';

const chat = useChatStore();
const input = ref('');

async function send() {
  if (!input.value.trim() || chat.isLoading) return;
  await chat.send(input.value);
  input.value = '';
}
</script>
