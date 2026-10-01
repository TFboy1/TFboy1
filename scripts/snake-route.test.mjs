import test from 'node:test';
import assert from 'node:assert/strict';
import { contributionRoute } from './snake-route.mjs';

function calendar(food) {
  return Array.from({ length: 20 }, (_, index) => ({ column: Math.floor(index / 4), row: index % 4, date: `day-${index}`, count: food[index] || 0 }));
}
test('visits every real contribution cell with adjacent steps and a closed loop', () => {
  const cells = calendar({ 1: 2, 5: 1, 11: 6, 17: 4 });
  const route = contributionRoute(cells);
  for (const cell of cells.filter(cell => cell.count > 0)) assert(route.includes(cell));
  for (let index = 1; index < route.length; index++) assert.equal(Math.abs(route[index].column-route[index-1].column)+Math.abs(route[index].row-route[index-1].row),1);
  assert.equal(route[0],route.at(-1));
});
test('changing contribution locations changes the route', () => {
  assert.notDeepEqual(contributionRoute(calendar({ 1: 1, 19: 1 })).map(cell=>cell.date), contributionRoute(calendar({ 1: 1, 8: 1 })).map(cell=>cell.date));
});
test('contribution counts influence the next target at equal distances', () => {
  const first = contributionRoute(calendar({ 1: 1, 2: 1, 5: 20 }));
  const second = contributionRoute(calendar({ 1: 1, 2: 20, 5: 1 }));
  assert.equal(first[1].date,'day-5');
  assert.equal(second[1].date,'day-2');
});
test('zero contributions keep a stationary calendar without fake food', () => {
  assert.equal(contributionRoute(calendar({})).length,1);
  assert.throws(() => contributionRoute([]));
});
test('rejects unreachable food instead of drawing across missing calendar cells', () => {
  assert.throws(() => contributionRoute([{ column: 0, row: 0, count: 1 }, { column: 3, row: 0, count: 1 }]), /无法到达/);
});
