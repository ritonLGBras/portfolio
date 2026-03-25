<template>
  <div class="skills-grid">
    <div v-for="cat in content.stack.categories" :key="cat.name" class="skill-group">
      <div class="skill-cat-name">{{ cat.name }}</div>
      <div class="skill-pills">
        <span
          v-for="item in cat.items"
          :key="item.name"
          class="skill-pill"
          :class="`level-${item.level}`"
        >
          {{ item.name }}
        </span>
      </div>
    </div>
  </div>

  <div class="skills-legend">
    <span class="skill-pill level-expert">expert</span>
    <span class="skill-pill level-comfortable">comfortable</span>
    <span class="skill-pill level-learning">learning</span>
  </div>
</template>

<script setup lang="ts">
import content from '../generated/content.json'
</script>

<style>
@reference "../style.css";

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.skill-cat-name {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
}

.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-pill {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 3px;
  border: 1px solid #2a2a2a;
  background: #111;
}

.skill-pill.level-expert    { color: #e8e8e8; border-color: #3b82f6; }
.skill-pill.level-comfortable { color: rgba(232, 232, 232, 0.8); }
.skill-pill.level-learning  { color: rgba(232, 232, 232, 0.6); font-style: italic; }

.skills-legend {
  display: flex;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #1a1a1a;
}
</style>
