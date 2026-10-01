import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCalendar, validateCalendar } from './profile-data.mjs';

function day(date, label, level = 0, id = date) {
  return `<td data-date="${date}" id="${id}" data-level="${level}"></td><tool-tip for="${id}">${label}</tool-tip>`;
}

function completeCalendar() {
  return Array.from({ length: 365 }, (_, index) => ({
    date: new Date(Date.UTC(2025, 0, 1) + index * 86400000).toISOString().slice(0, 10),
    count: 0,
    level: 0,
  }));
}

test('reads zero, singular and comma-separated counts without inferring from color', () => {
  const html = day('2026-09-29', 'No contributions on September 29th.')
    + day('2026-09-30', '1 contribution on September 30th.', 4)
    + day('2026-10-01', '1,234 contributions on October 1st.', 1);
  assert.deepEqual(parseCalendar(html, '2026-10-01').map(item => item.count), [0, 1, 1234]);
});

test('ignores future calendar placeholders', () => {
  const html = day('2026-10-01', '2 contributions on October 1st.', 1)
    + '<td data-date="2026-10-02" id="future" data-level="0"></td>';
  assert.equal(parseCalendar(html, '2026-10-01').length, 1);
});

test('rejects a cell whose exact count is missing', () => {
  assert.throws(() => parseCalendar('<td data-date="2026-10-01" id="missing" data-level="4"></td>', '2026-10-01'), /真实贡献次数/);
});

test('does not attach an unrelated tooltip to a cell without an ID', () => {
  assert.throws(() => parseCalendar('<td data-date="2026-10-01" data-level="1"></td><tool-tip>5 contributions</tool-tip>', '2026-10-01'), /真实贡献次数/);
});

test('rejects duplicate dates and impossible calendar dates', () => {
  assert.throws(() => parseCalendar(day('2026-10-01', '1 contribution', 1) + day('2026-10-01', '1 contribution', 1), '2026-10-01'), /重复日期/);
  assert.throws(() => parseCalendar(day('2026-02-31', 'No contributions'), '2026-10-01'), /无效日期/);
});

test('accepts a complete current year', () => {
  assert.doesNotThrow(() => validateCalendar(completeCalendar(), '2025-12-31'));
});

test('rejects incomplete, non-contiguous and stale responses', () => {
  assert.throws(() => validateCalendar(completeCalendar().slice(0, 20), '2025-12-31'), /不完整/);
  const missingDay = completeCalendar();
  missingDay.splice(200, 1);
  assert.throws(() => validateCalendar(missingDay, '2025-12-31'), /日期缺口/);
  assert.throws(() => validateCalendar(completeCalendar(), '2026-01-03'), /过期/);
});
