<template>
  <div class="min-h-screen bg-bg">
    <NavBar />
    <main class="max-w-3xl mx-auto px-8 py-16">
      <h1 class="text-4xl font-mono font-medium mb-8">Projects</h1>
      <div v-if="store.loading" class="text-muted">Loading...</div>
      <div v-else class="space-y-8">
        <div v-for="project in store.projects" :key="project.filename" class="border border-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-mono text-accent mb-4">{{ project.filename.replace('.md', '') }}</h2>
          <pre class="text-text whitespace-pre-wrap font-sans text-sm">{{ project.content }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import { useContentStore } from '../store/content';

const store = useContentStore();
onMounted(() => (!store.projects.length ? store.loadProjects() : null));
</script>
