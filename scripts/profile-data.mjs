import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';

function attribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

// GitHub's public calendar includes the exact count in each day's tooltip.
// Do not turn a color level into a guessed contribution count.
export function parseCalendar(html, today = new Date().toISOString().slice(0, 10)) {
  const counts = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
    const id = attribute(match[1], 'for');
    if (!id) continue;
    const label = match[2].replace(/<[^>]*>/g, '').trim();
    const numeric = label.match(/^([\d,]+) contributions?\b/i);
    if (numeric) counts.set(id, Number(numeric[1].replaceAll(',', '')));
    else if (/^No contributions?\b/i.test(label)) counts.set(id, 0);
  }

  const days = [];
  for (const match of html.matchAll(/<td\b([^>]*\bdata-date="[^"]+"[^>]*)>/gi)) {
    const date = attribute(match[1], 'data-date');
    const id = attribute(match[1], 'id');
    const level = Number(attribute(match[1], 'data-level'));
    const count = id ? counts.get(id) : undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
      throw new Error(`贡献日历包含无效日期：${date}`);
    }
    if (date > today) continue;
    if (!Number.isInteger(count) || count < 0 || !Number.isInteger(level) || level < 0 || level > 4) {
      throw new Error(`无法读取 ${date} 的真实贡献次数，保留原有快照。`);
    }
    days.push({ date, count, level });
  }
  days.sort((left, right) => left.date.localeCompare(right.date));
  if (new Set(days.map(day => day.date)).size !== days.length) {
    throw new Error('贡献日历出现重复日期，保留原有快照。');
  }
  return days;
}

export function validateCalendar(days, today = new Date().toISOString().slice(0, 10)) {
  if (days.length < 300) throw new Error('GitHub 返回的贡献日历不完整，保留原有快照。');
  for (let index = 1; index < days.length; index++) {
    if (Date.parse(days[index].date) - Date.parse(days[index - 1].date) !== 86400000) {
      throw new Error('GitHub 贡献日历存在日期缺口，保留原有快照。');
    }
  }
  if (Date.parse(today) - Date.parse(days.at(-1).date) > 2 * 86400000) {
    throw new Error('GitHub 返回的贡献日历已过期，保留原有快照。');
  }
}

async function fetchCalendar(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'TFboy1-profile-maintenance', 'Accept-Language': 'en-US' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`GitHub 贡献接口返回 HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
}

export async function refreshCalendar(username = 'TFboy1') {
  if (!/^[a-z\d-]+$/i.test(username)) throw new Error('GitHub 用户名无效。');
  const source = `https://github.com/users/${username}/contributions`;
  const days = parseCalendar(await fetchCalendar(source));
  validateCalendar(days);
  const snapshot = {
    schemaVersion: 1,
    username,
    fetchedAt: new Date().toISOString(),
    source,
    totalContributions: days.reduce((sum, day) => sum + day.count, 0),
    days,
  };
  const directory = new URL('../data/', import.meta.url);
  try {
    const previous = JSON.parse(await readFile(new URL('github-contributions.json', directory), 'utf8'));
    if (previous.schemaVersion === 1 && previous.username === username && previous.source === source
      && previous.totalContributions === snapshot.totalContributions && JSON.stringify(previous.days) === JSON.stringify(days)) {
      console.log(`已检查 ${username} 的真实贡献数据，内容未变化，保留已有快照。`);
      return;
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = new URL('github-contributions.json.next', directory);
  await mkdir(directory, { recursive: true });
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await rename(temporary, new URL('github-contributions.json', directory));
  console.log(`已同步 ${username} 的 ${days.length} 天真实贡献数据，共 ${snapshot.totalContributions} 次贡献。`);
}
