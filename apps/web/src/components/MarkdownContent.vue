<template>
  <div class="markdown-content" v-html="rendered" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{ content: string }>();

const rendered = computed(() => marked.parse(props.content) as string);
</script>

<style scoped>
@reference "../style.css";

.markdown-content :deep(h1) { @apply text-3xl font-mono font-medium text-text mb-6 mt-8; }
.markdown-content :deep(h2) { @apply text-xl font-mono font-medium text-accent mb-3 mt-6; }
.markdown-content :deep(h3) { @apply text-base font-mono font-medium text-text mb-2 mt-4; }
.markdown-content :deep(p)  { @apply text-muted leading-relaxed mb-4; }
.markdown-content :deep(ul) { @apply list-disc list-inside space-y-1 mb-4 pl-2; }
.markdown-content :deep(ol) { @apply list-decimal list-inside space-y-1 mb-4 pl-2; }
.markdown-content :deep(li) { @apply text-muted; }
.markdown-content :deep(strong) { @apply text-text font-medium; }
.markdown-content :deep(code) { @apply font-mono text-accent bg-surface px-1 rounded text-sm; }
.markdown-content :deep(pre)  { @apply bg-surface rounded p-4 overflow-x-auto mb-4; }
.markdown-content :deep(pre code) { background: none; padding: 0; }
.markdown-content :deep(a) { @apply text-accent hover:underline; }
.markdown-content :deep(hr) { @apply border-gray-800 my-6; }
</style>
