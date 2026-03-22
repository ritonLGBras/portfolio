import { defineStore } from 'pinia';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    isOpen: false,
    messages: [] as ChatMessage[],
    isLoading: false,
  }),
  actions: {
    async send(message: string) {
      this.isLoading = true;
      this.isOpen = true;
      this.messages.push({ role: 'user', content: message });

      try {
        const res = await fetch(`${API_BASE}/api/chat/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history: this.messages.slice(0, -1),
          }),
        });
        const data = await res.json();
        this.messages.push({ role: 'assistant', content: data.answer });
      } catch {
        this.messages.push({
          role: 'assistant',
          content: "I'm having trouble responding right now. Please try again.",
        });
      } finally {
        this.isLoading = false;
      }
    },
    reset() {
      this.messages = []
      this.isLoading = false
      this.isOpen = false
    },
  },
  share: { enable: true },
});
