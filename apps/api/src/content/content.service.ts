import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContentService {
  private readonly DATA_DIR = path.join(__dirname, '..', 'data');

  private readonly SECTION_MAP: Record<string, string> = {
    bio: 'bio.md',
    experience: 'experience.md',
    stack: 'stack.md',
    ambitions: 'ambitions.md',
  };

  getSection(section: string) {
    const filename = this.SECTION_MAP[section];
    if (!filename) {
      throw new NotFoundException(`Section '${section}' not found`);
    }

    const filePath = path.join(this.DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File for section '${section}' not found`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);

    return {
      section,
      content,
      updatedAt: stats.mtime.toISOString(),
    };
  }

  getProjects() {
    const projectsDir = path.join(this.DATA_DIR, 'projects');
    if (!fs.existsSync(projectsDir)) {
      return { section: 'projects', items: [] };
    }

    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
    const items = files.map(filename => ({
      filename,
      content: fs.readFileSync(path.join(projectsDir, filename), 'utf-8'),
    }));

    return {
      section: 'projects',
      items,
    };
  }
}
