<template>
  <nav class="navbar">
    <a href="#hero" class="font-mono text-sm text-text hover:text-accent transition-colors no-underline">
      Henri Gerardin
    </a>
    <div class="flex gap-6">
      <a href="#experience" class="nav-link">Experience</a>
      <a href="#skills" class="nav-link">Skills</a>
      <a href="#projects" class="nav-link">Projects</a>
      <a href="#ambitions" class="nav-link">Ambitions</a>
    </div>
  </nav>
</template>

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

.nav-link {
  font-size: 0.8rem;
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.nav-link:hover {
  color: var(--color-accent);
}
</style>
