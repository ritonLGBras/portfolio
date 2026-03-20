// scripts/parse-content.ts
// Reads data/*.md from repo root, writes apps/web/src/generated/content.json

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'apps/web/src/generated/content.json');

// --- Helpers ---

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function parseLines(raw: string): string[] {
  return raw.split('\n');
}

/** Extract lines of a heading-delimited section (exclusive of the heading line itself) */
function extractSection(lines: string[], heading: string): string[] {
  const start = lines.findIndex(l => l.startsWith(`## ${heading}`));
  if (start === -1) return [];
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  return end === -1 ? lines.slice(start + 1) : lines.slice(start + 1, end);
}

function extractBullets(lines: string[]): string[] {
  return lines
    .filter(l => l.trim().startsWith('- '))
    .map(l => l.replace(/^- /, '').trim());
}

function warnMissing(field: string, file: string) {
  console.warn(`[parse-content] WARN: missing "${field}" in ${file}`);
}

// --- experience.md ---

interface Role {
  title: string;
  org: string;
  period: string;
  location: string;
  bullets: string[];
}

interface Education {
  school: string;
  degree: string;
  period: string;
  location: string;
}

interface ExperienceData {
  roles: Role[];
  education: Education | null;
}

function parseExperience(): ExperienceData {
  const file = path.join(DATA, 'experience.md');
  const lines = parseLines(readFile(file));
  const roles: Role[] = [];
  let education: Education | null = null;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Role heading: ## Org — Title (em dash, NOT education heading)
    if (line.startsWith('## ') && line.includes(' \u2014 ') && !line.startsWith('## Education')) {
      const heading = line.replace('## ', '');
      const dashIdx = heading.indexOf(' \u2014 ');
      const org = heading.slice(0, dashIdx).trim();
      const title = heading.slice(dashIdx + 3).trim();
      const role: Partial<Role> = { title, org, bullets: [] };

      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('## ')) {
        // Bold period/location line: **2021 → Present · Paris, France**
        const metaMatch = lines[j].match(/^\*\*(.+?)\*\*/);
        if (metaMatch) {
          const dotIdx = metaMatch[1].indexOf(' \u00b7 ');
          if (dotIdx !== -1) {
            role.period = metaMatch[1].slice(0, dotIdx).trim();
            role.location = metaMatch[1].slice(dotIdx + 3).trim();
          } else {
            role.period = metaMatch[1].trim();
          }
        }
        if (lines[j].trim().startsWith('- ')) {
          role.bullets!.push(lines[j].replace(/^- /, '').trim());
        }
        j++;
      }

      if (!role.period) warnMissing('period', 'experience.md');
      if (!role.location) warnMissing('location', 'experience.md');
      roles.push(role as Role);
      i = j;
      continue;
    }

    // Education heading
    if (line.startsWith('## Education')) {
      let j = i + 1;
      const eduLines: string[] = [];
      while (j < lines.length && !lines[j].startsWith('## ')) {
        eduLines.push(lines[j]);
        j++;
      }
      // First **bold** line is school name
      const boldLine = eduLines.find(l => l.trim().startsWith('**'));
      // First line matching a 4-digit year is the details line
      const detailLine = eduLines.find(l => /\d{4}/.test(l));
      if (boldLine && detailLine) {
        const school = boldLine.replace(/\*\*/g, '').trim();
        const parts = detailLine.split(' \u00b7 ');
        education = {
          school,
          degree: parts[0]?.trim() ?? '',
          period: parts[1]?.trim() ?? '',
          location: parts[2]?.trim() ?? '',
        };
      } else {
        warnMissing('education details', 'experience.md');
      }
      i = j;
      continue;
    }

    i++;
  }

  if (roles.length === 0) warnMissing('roles', 'experience.md');
  return { roles, education };
}

// --- stack.md ---

type SkillLevel = 'expert' | 'comfortable' | 'learning';

interface SkillItem {
  name: string;
  level: SkillLevel;
}

interface SkillCategory {
  name: string;
  items: SkillItem[];
}

interface StackData {
  categories: SkillCategory[];
}

function parseStack(): StackData {
  const file = path.join(DATA, 'stack.md');
  const lines = parseLines(readFile(file));
  const categories: SkillCategory[] = [];

  let current: SkillCategory | null = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) categories.push(current);
      current = { name: line.replace('## ', '').trim(), items: [] };
    } else if (line.trim().startsWith('- ') && current) {
      const text = line.replace(/^- /, '').trim();
      const dashIdx = text.lastIndexOf(' \u2014 ');
      if (dashIdx === -1) {
        warnMissing(`level for "${text}"`, 'stack.md');
        current.items.push({ name: text, level: 'comfortable' });
      } else {
        const name = text.slice(0, dashIdx).trim();
        // Level is the first word after em dash; discard comma-separated qualifiers
        const rawLevelFull = text.slice(dashIdx + 3).trim();
        const rawLevel = rawLevelFull.split(',')[0].trim().toLowerCase();
        const level: SkillLevel =
          rawLevel === 'expert' ? 'expert' :
          rawLevel === 'comfortable' ? 'comfortable' :
          rawLevel === 'learning' ? 'learning' :
          'comfortable';
        if (!['expert', 'comfortable', 'learning'].includes(rawLevel)) {
          warnMissing(`valid level for "${name}" (got "${rawLevel}")`, 'stack.md');
        }
        current.items.push({ name, level });
      }
    }
  }
  if (current) categories.push(current);

  if (categories.length === 0) warnMissing('categories', 'stack.md');
  return { categories };
}

// --- ambitions.md ---

interface WorkPref {
  label: string;
  description: string;
}

interface AmbitionsData {
  headline: string;
  problems: string[];
  workPrefs: WorkPref[];
  availability: string;
}

function parseAmbitions(): AmbitionsData {
  const file = path.join(DATA, 'ambitions.md');
  const lines = parseLines(readFile(file));

  const excitedLines = extractSection(lines, 'What Excites Me Next');
  const problemLines = extractSection(lines, 'The Problems I Want to Solve');
  const workLines = extractSection(lines, 'How I Want to Work');
  const availLines = extractSection(lines, 'Availability');

  // Headline: first non-empty line, split on first '.'
  const headlineParagraph = excitedLines.find(l => l.trim().length > 0) ?? '';
  const dotIdx = headlineParagraph.indexOf('.');
  const headline = dotIdx !== -1
    ? headlineParagraph.slice(0, dotIdx + 1).trim()
    : headlineParagraph.trim();

  const problems = extractBullets(problemLines);
  if (problems.length === 0) warnMissing('problems', 'ambitions.md');

  const workPrefs: WorkPref[] = extractBullets(workLines).map(b => {
    // Format: "**Label:** description" (colon is inside the closing **)
    const match = b.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (match) return { label: match[1].trim(), description: match[2].trim() };
    warnMissing(`work pref format for "${b}"`, 'ambitions.md');
    return { label: b, description: '' };
  });

  const availability = availLines.find(l => l.trim().length > 0)?.trim() ?? '';
  if (!availability) warnMissing('availability', 'ambitions.md');

  return { headline, problems, workPrefs, availability };
}

// --- projects/*.md ---

interface ProjectData {
  name: string;
  problem: string;
  role: string;
  stack: string[];
  outcome: string[];
}

function parseProject(filePath: string): ProjectData {
  const filename = path.basename(filePath);
  const lines = parseLines(readFile(filePath));

  const nameLine = lines.find(l => l.startsWith('# ') && !l.startsWith('## '));
  const name = nameLine?.replace(/^# /, '').trim() ?? '';
  if (!name) warnMissing('name (h1)', filename);

  const problemLines = extractSection(lines, 'Problem');
  const roleLines = extractSection(lines, 'My Role');
  const stackLines = extractSection(lines, 'Stack');
  const outcomeLines = extractSection(lines, 'Outcome');
  // ## Code Highlights is intentionally ignored

  const problem = problemLines.find(l => l.trim().length > 0)?.trim() ?? '';
  if (!problem) warnMissing('problem', filename);

  const role = roleLines.find(l => l.trim().length > 0)?.trim() ?? '';
  if (!role) warnMissing('role', filename);

  const stack = extractBullets(stackLines);
  const outcome = extractBullets(outcomeLines);

  return { name, problem, role, stack, outcome };
}

function parseProjects(): ProjectData[] {
  const projectsDir = path.join(DATA, 'projects');
  const files = fs.readdirSync(projectsDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .sort(); // deterministic order
  return files.map(f => parseProject(path.join(projectsDir, f)));
}

// --- Main ---

function main() {
  console.log('[parse-content] Parsing data/*.md...');

  const content = {
    experience: parseExperience(),
    stack: parseStack(),
    ambitions: parseAmbitions(),
    projects: parseProjects(),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(content, null, 2));
  console.log(`[parse-content] Written to ${OUT}`);
}

main();
