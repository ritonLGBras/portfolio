<template>
  <div class="ambitions">
    <blockquote class="headline">{{ content.ambitions.headline }}</blockquote>

    <div class="problems">
      <div class="subsection-label">Problems I care about</div>
      <ul class="problem-list">
        <li v-for="(p, i) in content.ambitions.problems" :key="i" class="problem-item">
          {{ p }}
        </li>
      </ul>
    </div>

    <div class="work-prefs">
      <div class="subsection-label">How I want to work</div>
      <div v-for="pref in content.ambitions.workPrefs" :key="pref.label" class="pref-row">
        <span class="pref-label">{{ pref.label }}</span>
        <span class="pref-desc">{{ pref.description }}</span>
      </div>
    </div>

    <div class="availability-badge">
      <span class="badge-dot"></span>
      {{ content.ambitions.availability }}
    </div>
  </div>
</template>

<script setup lang="ts">
import content from '../generated/content.json'
</script>

<style>
@reference "../style.css";

.ambitions {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.headline {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-text);
  border-left: 2px solid var(--color-accent);
  padding-left: 1rem;
  margin: 0;
  font-style: italic;
}

.subsection-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
}

.problem-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.problem-item {
  font-size: 0.875rem;
  color: #aaaaaa;
  line-height: 1.5;
}

.problem-item::before {
  content: "→";
  color: var(--color-accent);
  margin-right: 0.5rem;
}

.pref-row {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  margin-bottom: 0.4rem;
}

.pref-label {
  font-family: var(--font-mono);
  color: var(--color-muted);
  min-width: 100px;
  font-size: 0.75rem;
}

.pref-desc {
  color: var(--color-text);
  line-height: 1.5;
}

.availability-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-muted);
  font-family: var(--font-mono);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 6px #22c55e80;
}
</style>
