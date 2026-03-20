import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('../pages/HomePage.vue') },
  { path: '/experience', component: () => import('../pages/ExperiencePage.vue') },
  { path: '/skills', component: () => import('../pages/SkillsPage.vue') },
  { path: '/projects', component: () => import('../pages/ProjectsPage.vue') },
  { path: '/ambitions', component: () => import('../pages/AmbitionsPage.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
