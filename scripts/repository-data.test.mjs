import test from 'node:test';
import assert from 'node:assert/strict';
import { repositorySlug, parseRepositoryStats, updateRepositoryStats } from './repository-data.mjs';

test('accepts only GitHub repository URLs, preserving case', () => {
  assert.equal(repositorySlug('https://github.com/TFboy1/ChatGPT-Share-Gate/'), 'TFboy1/ChatGPT-Share-Gate');
  for (const url of ['https://example.com/TFboy1/project', 'https://github.com/TFboy1', 'https://github.com/TFboy1/project/issues']) assert.throws(() => repositorySlug(url));
});
test('reads exact Stars and Forks, including real zero counts', () => {
  assert.deepEqual(parseRepositoryStats({ full_name: 'TFboy1/MITI', stargazers_count: 0, forks_count: 12 }, 'tfboy1/miti'), { stars: 0, forks: 12 });
});
test('rejects wrong repositories and missing or invalid counts', () => {
  const valid = { full_name: 'TFboy1/MITI', stargazers_count: 2, forks_count: 1 };
  assert.throws(() => parseRepositoryStats({ ...valid, full_name: 'another/repo' }, 'TFboy1/MITI'));
  for (const value of [undefined, -1, 2.5, '3', NaN]) assert.throws(() => parseRepositoryStats({ ...valid, forks_count: value }, 'TFboy1/MITI'));
});
test('unchanged statistics preserve the snapshot instead of creating timestamp-only commits', () => {
  const previous = { stars: 10, forks: 2, fetchedAt: '2026-10-01T00:00:00Z' };
  assert.equal(updateRepositoryStats(previous, { stars: 10, forks: 2 }, 'later'), previous);
  assert.deepEqual(updateRepositoryStats(previous, { stars: 11, forks: 2 }, 'later'), { stars: 11, forks: 2, fetchedAt: 'later' });
});
