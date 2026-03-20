<template>
  <div>
    <div class="timeline">
      <div v-for="role in content.experience.roles" :key="role.org + role.period" class="timeline-item">
        <div class="timeline-header">
          <div>
            <span class="text-text font-medium">{{ role.title }}</span>
            <span class="text-muted"> at </span>
            <span class="text-accent">{{ role.org }}</span>
          </div>
          <span class="text-muted font-mono text-xs">{{ role.period }}</span>
        </div>
        <div class="text-muted font-mono text-xs mb-3">{{ role.location }}</div>
        <ul class="bullets">
          <li v-for="(b, i) in role.bullets" :key="i" class="bullet">{{ b }}</li>
        </ul>
      </div>
    </div>

    <div v-if="content.experience.education" class="edu-block">
      <div class="text-text font-medium">{{ content.experience.education.school }}</div>
      <div class="text-muted text-sm">{{ content.experience.education.degree }}</div>
      <div class="text-muted font-mono text-xs">
        {{ content.experience.education.period }} · {{ content.experience.education.location }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import content from '../generated/content.json'
</script>

<style>
@reference "../style.css";

.timeline {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-bottom: 3rem;
}

.timeline-item {
  border-left: 1px solid #2a2a2a;
  padding-left: 1.25rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bullet {
  font-size: 0.875rem;
  color: #aaaaaa;
  line-height: 1.5;
}

.bullet::before {
  content: "—";
  color: #444;
  margin-right: 0.5rem;
}

.edu-block {
  border-top: 1px solid #1a1a1a;
  padding-top: 2rem;
}
</style>
