<template>
  <nav class="flex items-center justify-between px-8 py-4 border-b border-gray-800">
    <router-link to="/" class="font-mono text-lg text-text hover:text-accent">
      Heni Gerardin
    </router-link>
    <div class="flex gap-6">
      <router-link to="/experience" class="text-muted hover:text-accent transition-colors">Experience</router-link>
      <router-link to="/skills" class="text-muted hover:text-accent transition-colors">Skills</router-link>
      <router-link to="/projects" class="text-muted hover:text-accent transition-colors">Projects</router-link>
      <router-link to="/ambitions" class="text-muted hover:text-accent transition-colors">Ambitions</router-link>
    </div>
  </nav>
</template>
