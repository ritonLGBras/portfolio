<template>
  <nav class="navbar">
    <button class="nav-name" @click="goHome">Henri Gerardin</button>
    <div class="flex gap-6">
      <a
        v-for="link in links"
        :key="link.id"
        :href="`#${link.id}`"
        class="nav-link"
        :class="{ active: activeSection === link.id }"
      >{{ link.label }}</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../store/chat'

const chatStore = useChatStore()

const links = [
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'ambitions', label: 'Ambitions' },
]

const activeSection = ref('')

let observer: IntersectionObserver | null = null

function goHome() {
  chatStore.reset()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  // Use a narrow rootMargin band so only the section crossing the top ~20% of
  // the viewport is considered "active". This prevents a section below (e.g.
  // Skills) from stealing the highlight while the section above (Experience)
  // is still the primary visible one.
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    {
      // Top of the detection zone: flush with the navbar (0px from top)
      // Bottom of the detection zone: 80% up from the bottom (so only the
      // top 20% of the viewport counts as the trigger strip)
      rootMargin: '0px 0px -80% 0px',
      threshold: 0,
    }
  )
  const sections = ['hero', 'experience', 'skills', 'projects', 'ambitions']
  for (const id of sections) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
})

onUnmounted(() => observer?.disconnect())
</script>

<style>
@reference "../style.css";

.navbar {
  grid-area: nav;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 3rem;
  background: var(--color-bg);
  border-bottom: 1px solid #1a1a1a;
  height: 57px;
  box-sizing: border-box;
}

.nav-name {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.nav-name:hover {
  color: var(--color-accent);
}

.nav-link {
  font-size: 0.8rem;
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-accent);
}
</style>
