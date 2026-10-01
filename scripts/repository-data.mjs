import { readFile, writeFile, rename } from 'node:fs/promises';

export function repositorySlug(url) {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://github.com' || !/^\/[\w.-]+\/[\w.-]+\/?$/.test(parsed.pathname)) throw new Error('项目仓库必须是有效 GitHub 仓库地址。');
  return parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
}

export function parseRepositoryStats(payload, slug) {
  if (payload.full_name?.toLowerCase() !== slug.toLowerCase()) throw new Error(`GitHub 返回了错误的仓库：${slug}`);
  for (const key of ['stargazers_count', 'forks_count']) {
    if (!Number.isSafeInteger(payload[key]) || payload[key] < 0) throw new Error(`${slug} 的 ${key} 无效，保留已有数据。`);
  }
  return { stars: payload.stargazers_count, forks: payload.forks_count };
}

export function updateRepositoryStats(previous, stats, fetchedAt) {
  if (previous?.stars === stats.stars && previous?.forks === stats.forks) return previous;
  return { ...stats, fetchedAt };
}

export async function refreshRepositories(projects) {
  const target = new URL('../data/github-repositories.json', import.meta.url);
  let previous = { schemaVersion: 1, repositories: {} };
  try { previous = JSON.parse(await readFile(target, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const repositories = {};
  const slugs = [...new Set(projects.filter(project => project.repo).map(project => repositorySlug(project.repo)))];
  await Promise.all(slugs.map(async slug => {
    try {
      const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'TFboy1-profile-maintenance', 'X-GitHub-Api-Version': '2022-11-28' };
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const response = await fetch(`https://api.github.com/repos/${slug}`, { headers, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      repositories[slug] = updateRepositoryStats(previous.repositories[slug], parseRepositoryStats(await response.json(), slug), new Date().toISOString());
    } catch (error) {
      const cached = previous.repositories[slug];
      if (!cached || !Number.isSafeInteger(cached.stars) || !Number.isSafeInteger(cached.forks) || cached.stars < 0 || cached.forks < 0) throw new Error(`无法同步 ${slug}，且没有有效缓存：${error.message}`);
      repositories[slug] = cached;
      console.warn(`无法同步 ${slug}，保留已有统计：${error.message}`);
    }
  }));
  const snapshot = { schemaVersion: 1, repositories: Object.fromEntries(slugs.map(slug => [slug, repositories[slug]])) };
  if (JSON.stringify(snapshot) === JSON.stringify(previous)) {
    console.log('已检查仓库 Stars / Forks，数据未变化。');
    return;
  }
  const temporary = new URL('../data/github-repositories.json.next', import.meta.url);
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await rename(temporary, target);
  console.log(`已同步 ${slugs.length} 个仓库的 Stars / Forks。`);
}
