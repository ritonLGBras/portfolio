import { defineStore } from 'pinia';

const BASE = '/api/content';

interface ContentData {
  bio: string;
  experience: string;
  stack: string;
  ambitions: string;
  projects: Array<{ filename: string; content: string }>;
  loading: boolean;
}

type TextSection = 'bio' | 'experience' | 'stack' | 'ambitions';

export const useContentStore = defineStore('content', {
  state: (): ContentData => ({
    bio: '',
    experience: '',
    stack: '',
    ambitions: '',
    projects: [],
    loading: false,
  }),
  actions: {
    async loadSection(section: TextSection) {
      try {
        const res = await fetch(`${BASE}/${section}`);
        const data = await res.json();
        (this as unknown as Record<string, string>)[section] = data.content;
      } catch (err) {
        console.error(`Failed to load ${section}:`, err);
      }
    },
    async loadProjects() {
      this.loading = true;
      try {
        const res = await fetch(`${BASE}/projects`);
        const data = await res.json();
        this.projects = data.items;
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        this.loading = false;
      }
    },
    async loadAll() {
      this.loading = true;
      await Promise.all([
        this.loadSection('bio'),
        this.loadSection('experience'),
        this.loadSection('stack'),
        this.loadSection('ambitions'),
        this.loadProjects(),
      ]);
      this.loading = false;
    },
  },
  share: { enable: false },
});
