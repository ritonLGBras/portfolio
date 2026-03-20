<template>
  <div class="min-h-screen bg-bg">
    <NavBar />
    <main class="max-w-3xl mx-auto px-8 py-16">
      <h1 class="text-4xl font-mono font-medium mb-8">Experience</h1>
      <div v-if="store.loading" class="text-muted">Loading...</div>
      <pre v-else class="text-text whitespace-pre-wrap font-sans">{{ store.experience }}</pre>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import { useContentStore } from '../store/content';

const store = useContentStore();
onMounted(() => store.experience || store.loadSection('experience'));
</script>
