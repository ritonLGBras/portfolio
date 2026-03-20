<template>
  <div class="min-h-screen bg-bg">
    <NavBar />
    <main class="max-w-3xl mx-auto px-8 py-16">
      <div v-if="store.loading" class="text-muted">Loading...</div>
      <MarkdownContent v-else :content="store.stack" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import { useContentStore } from '../store/content';

const store = useContentStore();
onMounted(() => store.stack || store.loadSection('stack'));
</script>
