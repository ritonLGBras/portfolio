<template>
  <div class="projects-grid">
    <div v-for="project in content.projects" :key="project.name" class="project-card">
      <div class="project-name">{{ project.name }}</div>
      <div class="project-problem">{{ project.problem }}</div>
      <div class="project-stack">
        <span v-for="tech in project.stack" :key="tech" class="stack-tag">{{ tech }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import content from '../generated/content.json'
</script>

<style>
@reference "../style.css";

.projects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .projects-grid { grid-template-columns: 1fr; }
}

.project-card {
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  padding: 1.25rem;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-name {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 600;
}

.project-problem {
  font-size: 0.8rem;
  color: var(--color-muted);
  line-height: 1.5;
  flex: 1;
}

.project-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.stack-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  background: #1a1a1a;
  border-radius: 3px;
  color: var(--color-muted);
}
</style>
