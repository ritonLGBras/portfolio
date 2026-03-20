<template>
  <div class="min-h-screen bg-bg">
    <NavBar />
    <main class="max-w-3xl mx-auto px-8 py-16">
      <div v-if="store.loading" class="text-muted">Loading...</div>
      <div v-else class="space-y-12">
        <div v-for="project in store.projects" :key="project.filename" class="border border-gray-800 rounded-lg p-6">
          <MarkdownContent :content="project.content" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import { useContentStore } from '../store/content';

const store = useContentStore();
onMounted(() => (!store.projects.length ? store.loadProjects() : null));
</script>
