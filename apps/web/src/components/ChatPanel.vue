<template>
  <div class="chat-panel">
    <!-- Header with close button -->
    <div class="chat-header">
      <span class="chat-header-label">chat</span>
      <button class="chat-close-btn" @click="chat.reset()" title="Close chat">×</button>
    </div>

    <div class="chat-messages" ref="messagesEl">
      <div v-for="(msg, i) in chat.messages" :key="i" class="chat-message">
        <div class="msg-role">{{ msg.role === 'user' ? 'you ›' : 'ai ›' }}</div>
        <div class="msg-content">{{ msg.content }}</div>
      </div>
      <div v-if="chat.isLoading" class="msg-thinking">thinking...</div>
    </div>

    <form @submit.prevent="send" class="chat-input-row">
      <span class="font-mono text-accent mr-2 select-none">›</span>
      <input
        v-model="input"
        type="text"
        placeholder="Ask anything..."
        class="chat-input"
        :disabled="chat.isLoading"
        autofocus
      />
      <button type="submit" class="chat-send-btn" :disabled="chat.isLoading || !input.trim()">
        Send
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../store/chat'

const chat = useChatStore()
const input = ref('')
const messagesEl = ref<HTMLElement | null>(null)

async function send() {
  if (!input.value.trim() || chat.isLoading) return
  await chat.send(input.value)
  input.value = ''
}

function scrollToBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

watch(() => chat.messages.length, async () => {
  await nextTick()
  scrollToBottom()
})
</script>

<style>
@reference "../style.css";

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #1a1a1a;
  flex-shrink: 0;
}

.chat-header-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.chat-close-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  transition: color 0.15s;
}

.chat-close-btn:hover {
  color: var(--color-text);
}

.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chat-message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.msg-role {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.msg-content {
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.65;
  white-space: pre-wrap;
}

.msg-thinking {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-muted);
  animation: chat-thinking-pulse 1.2s infinite;
}

@keyframes chat-thinking-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.chat-input-row {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #1a1a1a;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  caret-color: var(--color-accent);
}

.chat-input::placeholder {
  color: var(--color-muted);
}

.chat-send-btn {
  padding: 0.25rem 0.75rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  cursor: pointer;
}

.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
