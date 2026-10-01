// Text project catalogue and original contribution artwork, generated offline.
export function createProfileArtwork({ svg, text, theme, escapeXml }) {
  function syncLabel(snapshot) {
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(snapshot.fetchedAt));
  }

  function snake(snapshot, dark = true) {
    const foreground = dark ? theme.text : '#203954';
    const muted = dark ? theme.muted : '#5b718c';
    const accent = dark ? theme.accent : '#aa7622';
    const colors = dark ? ['#13253d', '#173d60', '#225b85', '#3d87b5', '#71c2e5'] : ['#eaf0f8', '#dbe9f6', '#b3d2e9', '#78b5d7', '#4595be'];
    const first = Date.parse(snapshot.days[0].date);
    const firstWeekday = new Date(first).getUTCDay();
    const weekStart = first - firstWeekday * 86400000;
    const step = 18;
    const cells = snapshot.days.map(day => {
      const dayIndex = Math.round((Date.parse(day.date) - weekStart) / 86400000);
      const column = Math.floor(dayIndex / 7);
      const row = dayIndex % 7;
      return { ...day, column, row, x: 83 + column * step, y: 120 + row * step };
    });
    const route = [...cells].sort((left, right) => left.column - right.column || (left.column % 2 ? right.row - left.row : left.row - right.row));
    const positions = new Map(route.map((cell, index) => [cell.date, index]));
    const path = route.map((cell, index) => `${index ? 'L' : 'M'}${cell.x} ${cell.y}`).join('');
    const headFrames = route.map((cell, index) => `${(index / (route.length - 1) * 100).toFixed(3)}%{transform:translate(${cell.x}px,${cell.y}px)}`).join('');
    const labels = new Map();
    let previousMonth = '';
    for (const cell of cells) {
      const month = cell.date.slice(0, 7);
      if (month !== previousMonth && (cell.column === 0 || cell.date.endsWith('-01')) && cell.column < 51) {
        labels.set(cell.column, text(cell.x - 6, 96, `${Number(cell.date.slice(5, 7))}月`, 10, muted));
        previousMonth = month;
      }
    }
    const rectangles = cells.map(cell => `<rect x="${cell.x - 6}" y="${cell.y - 6}" width="12" height="12" rx="3" fill="${colors[cell.level]}"${cell.count > 0 ? ` class="snake-food" style="animation-delay:${(positions.get(cell.date) / (route.length - 1) * 38).toFixed(3)}s"` : ''}><title>${cell.date} / ${cell.count} 次贡献</title></rect>`).join('');
    const content = `
      ${!dark ? '<rect width="1120" height="316" fill="#f4f7fc"/>' : ''}
      ${text(48, 48, 'Contribution snake', 24, foreground, 'font-weight="700" letter-spacing="-.5"')}
      ${text(1072, 48, `${snapshot.totalContributions} contributions / displayed period`, 11, muted, 'class="mono" text-anchor="end"')}
      ${[...labels.values()].join('')}
      ${[1, 3, 5].map(row => text(62, 124 + row * step, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][row], 9, muted, 'class="mono" text-anchor="end"')).join('')}
      ${rectangles}
      <path d="${path}" stroke="${accent}" stroke-opacity=".035" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${path}" pathLength="1000" class="snake-tail" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      <g class="snake-head" transform="translate(${route[0].x} ${route[0].y})">
        <path d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="${accent}" filter="url(#glow)"/>
      </g>
      ${text(48, 282, `${snapshot.days[0].date} → ${snapshot.days.at(-1).date}`, 10, muted, 'class="mono"')}
      ${text(1072, 282, `SYNC / ${syncLabel(snapshot)} CST`, 10, muted, 'class="mono" text-anchor="end"')}
      ${text(48, 301, '每一格来自真实贡献记录，金色星芒沿日历巡游。', 11, muted)}
    `;
    const css = `<style><![CDATA[
      .snake-tail{stroke-dasharray:22 978;stroke-dashoffset:22;animation:snake-tail 38s linear infinite}
      .snake-head{animation:snake-head 38s linear infinite}
      .snake-food{animation:snake-food 38s linear infinite}
      @keyframes snake-tail{from{stroke-dashoffset:22}to{stroke-dashoffset:-978}}
      @keyframes snake-head{${headFrames}}
      @keyframes snake-food{0%,.2%{opacity:1}.4%,2%{opacity:.35}5%,100%{opacity:1}}
    ]]></style>`;
    return svg(316, `${snapshot.username} 的贡献贪吃蛇动画`, `基于真实 GitHub 贡献日历生成的原创巡游动画。展示区间共有 ${snapshot.totalContributions} 次贡献，数据更新于 ${syncLabel(snapshot)}，使用北京时间。`, content, css);
  }

  function projectSection(projects, pinnedOrder) {
    const byId = new Map(projects.map(project => [project.id, project]));
    if (!Array.isArray(pinnedOrder) || !pinnedOrder.length || new Set(pinnedOrder).size !== pinnedOrder.length || pinnedOrder.some(id => !byId.has(id) || !byId.get(id).repo)) {
      throw new Error('pinnedOrder 必须包含唯一、存在且具有仓库链接的项目 ID。');
    }
    const pinned = pinnedOrder.map(id => byId.get(id));
    const remaining = projects.filter(project => !pinnedOrder.includes(project.id));
    function entry(project, isPinned = false) {
      const primary = project.repo || project.previewUrl || 'https://tfboyhomepage.netlify.app/';
      const name = isPinned ? new URL(project.repo).pathname.split('/').filter(Boolean).at(-1) : project.title;
      const heading = isPinned ? 'h3' : 'h4';
      const links = [];
      if (project.repo) links.push(`<a href="${escapeXml(project.repo)}">源码 ↗</a>`);
      if (project.previewUrl && project.previewUrl !== project.repo) {
        const label = project.category === 'games' ? '试玩' : project.id === 'vibe-git' ? '文档' : '打开';
        links.push(`<a href="${escapeXml(project.previewUrl)}">${label} ↗</a>`);
      }
      if (project.download) links.push(`<a href="${escapeXml(project.download)}">下载 ↗</a>`);
      if (!links.length) links.push('<a href="https://tfboyhomepage.netlify.app/">作品介绍 ↗</a>');
      return `<${heading}><a href="${escapeXml(primary)}">${escapeXml(name)}</a></${heading}>\n\n${escapeXml(project.description)}\n\n<code>${escapeXml(project.tags.join(' · '))}</code>${project.status === 'polishing' ? ' · <strong>正在打磨</strong>' : ''} · ${links.join(' · ')}`;
    }
    const categories = [['tools','AI 与开发工具'],['games','游戏与互动世界'],['apps','应用与日常工具']];
    const others = categories.map(([category,title]) => {
      const items = remaining.filter(project => project.category === category);
      return items.length ? `### ${title}\n\n${items.map(project => entry(project)).join('\n\n')}` : '';
    }).filter(Boolean).join('\n\n');
    return `## 01 / 置顶项目\n\n${pinned.map(project => entry(project,true)).join('\n\n')}\n\n## 02 / 更多作品\n\n<details>\n<summary>展开其他 ${remaining.length} 个作品 · 游戏与应用</summary>\n\n${others}\n\n</details>`;
  }

  return { projectSection, snake };
}
