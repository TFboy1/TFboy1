// Seek contribution food through actual calendar cells using shortest paths.
export function contributionRoute(cells) {
  if (!cells.length) throw new Error('贡献日历不能为空。');
  const key = cell => `${cell.column},${cell.row}`;
  const grid = new Map(cells.map(cell => [key(cell), cell]));
  const food = new Map(cells.filter(cell => cell.count > 0).map(cell => [key(cell), cell]));
  if (!food.size) return [cells[0]];
  const start = food.values().next().value;
  let current = start;
  const route = [start];
  food.delete(key(start));
  function search(origin) {
    const queue = [origin];
    const parents = new Map([[key(origin), null]]);
    const distances = new Map([[key(origin), 0]]);
    for (let index = 0; index < queue.length; index++) {
      const cell = queue[index];
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const next = grid.get(`${cell.column + dx},${cell.row + dy}`);
        if (!next || parents.has(key(next))) continue;
        parents.set(key(next), key(cell));
        distances.set(key(next), distances.get(key(cell)) + 1);
        queue.push(next);
      }
    }
    return { parents, distances };
  }
  function walk(target, parents) {
    const steps = [];
    for (let cursor = key(target); cursor !== key(current); cursor = parents.get(cursor)) {
      if (cursor == null || !parents.has(cursor)) throw new Error('贡献格子存在无法到达的区域。');
      steps.push(grid.get(cursor));
    }
    for (const cell of steps.reverse()) { route.push(cell); food.delete(key(cell)); }
    current = target;
  }
  while (food.size) {
    const { parents, distances } = search(current);
    let target;
    let best = Infinity;
    for (const cell of food.values()) {
      const distance = distances.get(key(cell));
      if (distance === undefined) continue;
      const score = distance / (1 + Math.log2(cell.count + 1) * .15);
      if (score < best) { target = cell; best = score; }
    }
    if (!target) throw new Error('贡献格子存在无法到达的区域。');
    walk(target, parents);
  }
  walk(start, search(current).parents);
  return route;
}
