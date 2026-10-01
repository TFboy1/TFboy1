import { refreshCalendar } from './profile-data.mjs';
import { readFile } from 'node:fs/promises';
import { refreshRepositories } from './repository-data.mjs';

await refreshCalendar();
const { projects } = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url), 'utf8'));
await refreshRepositories(projects);
