// Original illustrations and charts generated from project facts and GitHub data.
export function createProfileArtwork({ svg, text, theme, stars, escapeXml }) {
  function icon(name) {
    const icons = {
      paper: '<path d="M-34-40H19L37-22V43H-34Z"/><path d="M19-40V-22H37M-19-10H18M-19 3H18M-19 16H8M-19 29H14"/><path d="M-43-30V51H26" opacity=".3"/>',
      film: '<rect x="-43" y="-19" width="73" height="58" rx="9"/><circle cx="-25" cy="-38" r="17"/><circle cx="14" cy="-38" r="17"/><path d="M30-3L50-14V32L30 20Z"/><path d="M-19 0L2 11L-19 22Z"/>',
      collab: '<circle r="15"/><circle cx="-39" cy="-35" r="10"/><circle cx="40" cy="-35" r="10"/><circle cy="45" r="10"/><path d="M-28-25L-11-12M29-25L11-12M0 15V35"/><circle r="53" stroke-dasharray="3 12" opacity=".25"/>',
      blocks: '<path d="M0-48L43-24V24L0 48L-43 24V-24ZM-43-24L0 0L43-24M0 0V48"/><path d="M-22-36L21-12V36M22-36L-21-12V36M-43 0L0 24L43 0" opacity=".3"/>',
      chat: '<path d="M-45-35H23Q34-35 34-24V9Q34 20 23 20H-13L-33 37V20H-45Q-54 20-54 9V-24Q-54-35-45-35Z"/><path d="M-2 31H20L40 47V31H47Q56 31 56 21V-9Q56-19 45-19" opacity=".45"/><path d="M-36-10H16M-36 3H3"/>',
      frog: '<ellipse rx="44" ry="33" cy="11"/><circle cx="-24" cy="-21" r="18"/><circle cx="24" cy="-21" r="18"/><circle cx="-24" cy="-21" r="5"/><circle cx="24" cy="-21" r="5"/><path d="M-21 18Q0 38 21 18"/><path d="M-43 26L-54 40M43 26L54 40" opacity=".5"/>',
      plant: '<path d="M0 45V-22M0 14Q-40 15-42-15Q-9-20 0 14ZM0 4Q39 3 41-25Q10-28 0 4Z"/><circle cy="-37" r="19"/><circle cx="-7" cy="-40" r="2"/><circle cx="7" cy="-40" r="2"/><path d="M-29 46H30" opacity=".35"/>',
      space: '<circle r="32"/><ellipse rx="61" ry="17" transform="rotate(-28)"/><path d="M-10-30Q-35-3-8 31M14-29Q-9 0 15 28" opacity=".3"/><path d="M40-46V-32M33-39H47M-42 37V47M-47 42H-37"/>',
      chess: '<path d="M-35 42H35L28 29H-28ZM-23 29L-12 9L-22-11L-3-34H23L35-20L14-5L19 29M-3-34V-45L10-35"/><circle cx="17" cy="-23" r="2"/><circle r="60" opacity=".18"/>',
      cards: '<rect x="-28" y="-41" width="57" height="83" rx="7"/><path d="M-35-33L-51-27L-30 46L-17 42M37-32L51-27L32 46L21 42" opacity=".5"/><path d="M0-18L6-3L22 0L9 10L12 27L0 18L-12 27L-9 10L-22 0L-6-3Z"/>',
      monster: '<path d="M-31-19L-39-47L-13-27Q0-33 13-27L39-47L31-19Q51 8 33 32Q0 53-33 32Q-51 8-31-19Z"/><circle cx="-16" cy="4" r="6"/><circle cx="16" cy="4" r="6"/><path d="M-11 26L0 19L11 26M-45 17L-55 31M45 17L55 31"/>',
      realm: '<ellipse rx="32" ry="48"/><ellipse rx="21" ry="37" opacity=".45"/><path d="M-49 46H49M-43 46V-18L-33-39M43 46V-18L33-39M-11 1H11M0-10V12"/><circle r="60" stroke-dasharray="2 10" opacity=".2"/>',
      rope: '<path d="M-44-46Q-10-12 5 23M42-45Q28-4 5 23"/><circle cx="-44" cy="-46" r="5"/><circle cx="42" cy="-45" r="5"/><circle cx="5" cy="23" r="23"/><path d="M-8 23Q5 5 18 23Q5 41-8 23ZM-13 39L-24 49M23 39L34 49"/>',
      list: '<rect x="-42" y="-42" width="84" height="84" rx="12"/><path d="M0-42V42M-42 0H42" opacity=".4"/><path d="M-32-21L-23-12L-11-28M10 20L19 29L32 12"/><path d="M12-22H31M-31 21H-11" opacity=".35"/>',
      diary: '<path d="M0-34Q-24-48-47-37V37Q-24 25 0 39Q24 25 47 37V-37Q24-48 0-34ZM0-34V39"/><path d="M-34-17H-12M-34-4H-12M12-17H34M12-4H34M12 9H26" opacity=".5"/><path d="M18 43L32 47V19"/>',
      clip: '<path d="M-7-27L11-45Q27-59 43-43Q59-27 43-11L22 10Q6 24-10 8M7 27L-11 45Q-27 59-43 43Q-59 27-43 11L-22-10Q-6-24 10-8M-20 20L20-20"/>',
      personality: '<path d="M0-48L46-15L28 39H-28L-46-15ZM0 0V-48M0 0L46-15M0 0L28 39M0 0L-28 39M0 0L-46-15" opacity=".45"/><path d="M0-30L27-9L14 24L-20 27L-35-11Z"/><circle r="4"/>',
    };
    if (!icons[name]) throw new Error(`没有为项目图标 ${name} 定义插画。`);
    return icons[name];
  }

  function headlineLines(value) {
    const lines = [''];
    let length = 0;
    for (const character of value) {
      const weight = /[\u0000-\u007f]/.test(character) ? .55 : 1;
      if (length + weight > 10 && lines.length < 2) { lines.push(''); length = 0; }
      lines[lines.length - 1] += character;
      length += weight;
    }
    return lines;
  }

  function projectCard(project, index) {
    const category = { tools: 'AI / AUTOMATION', games: 'PLAY / EXPLORE', apps: 'LIFE / UTILITIES' }[project.category];
    const lines = headlineLines(project.headline);
    const content = `
      <rect width="560" height="224" fill="url(#grid)" opacity=".4"/>
      <ellipse cx="448" cy="114" rx="175" ry="170" fill="url(#aura)" class="breathe"/>
      ${stars(224, 15, 27 + index * 11, 560)}
      <path d="M330 1L290 223M347 1L307 223" stroke="${theme.accent}" stroke-opacity=".04"/>
      ${text(28, 33, category, 10, theme.accent, 'class="mono" letter-spacing="1.4"')}
      ${text(532, 33, String(index + 1).padStart(2, '0'), 11, theme.muted, 'class="mono" text-anchor="end"')}
      ${lines.map((line, lineIndex) => text(28, (lines.length === 1 ? 113 : 96) + lineIndex * 43, line, 30, theme.text, 'font-weight="700" letter-spacing="-.8"')).join('')}
      ${text(28, 194, project.status === 'polishing' ? '正在打磨 · 敬请期待' : project.tags.slice(0, 2).join(' / '), 12, theme.muted)}
      <g transform="translate(440 115)">
        <g class="spin"><circle r="75" stroke="${theme.accent}" stroke-opacity=".3" stroke-dasharray="66 20 8 85 24 268"/></g>
        <circle r="62" stroke="${theme.ice}" stroke-opacity=".08"/>
        <g class="float" stroke="${theme.accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">${icon(project.icon)}</g>
      </g>
      <path d="M28 223H532" stroke="url(#fade-line)" stroke-opacity=".3"/>
    `;
    return svg(224, `${project.title} · ${project.headline}`, project.description, content, '', 560);
  }

  function syncLabel(snapshot) {
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(snapshot.fetchedAt));
  }

  function activity(snapshot, mobile = false) {
    const days = snapshot.days.slice(-31);
    const width = mobile ? 600 : 1120;
    const height = mobile ? 390 : 360;
    const startX = mobile ? 49 : 70;
    const endX = width - (mobile ? 36 : 48);
    const top = mobile ? 138 : 118;
    const bottom = mobile ? 284 : 278;
    const maximum = Math.max(3, Math.ceil(Math.max(...days.map(day => day.count)) / 3) * 3);
    const points = days.map((day, index) => ({
      ...day,
      x: startX + index * (endX - startX) / (days.length - 1),
      y: bottom - day.count * (bottom - top) / maximum,
    }));
    const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join('');
    const area = `${line}L${endX} ${bottom}H${startX}Z`;
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const ticks = Array.from({ length: 4 }, (_, index) => {
      const y = bottom - index * (bottom - top) / 3;
      return `<path d="M${startX} ${y}H${endX}" stroke="${theme.line}" stroke-opacity=".65"/>
        ${text(startX - 14, y + 4, maximum * index / 3, 11, theme.muted, 'class="mono" text-anchor="end"')}`;
    }).join('');
    const labels = [0, 10, 20, 30].map(index => text(points[index].x, bottom + 28, days[index].date.slice(5).replace('-', '.'), 11, theme.muted,
      `class="mono" text-anchor="${index === 0 ? 'start' : index === 30 ? 'end' : 'middle'}"`)).join('');
    const content = `
      <ellipse cx="${width / 2}" cy="${height}" rx="${width / 1.6}" ry="260" fill="url(#aura)" opacity=".45"/>
      ${text(mobile ? 30 : 48, 51, 'Contribution activity', mobile ? 25 : 27, theme.text, 'font-weight="700" letter-spacing="-.6"')}
      ${text(mobile ? 30 : 48, 81, 'GitHub 真实贡献 · 最近 31 天', mobile ? 16 : 15, theme.muted)}
      ${text(mobile ? 30 : width - 48, mobile ? 113 : 54, `${total} contributions / 31 days`, mobile ? 13 : 12, theme.accent, `class="mono" text-anchor="${mobile ? 'start' : 'end'}"`)}
      ${!mobile ? text(width - 48, 80, `SYNC / ${syncLabel(snapshot)} CST`, 10, theme.muted, 'class="mono" text-anchor="end"') : ''}
      ${ticks}
      <path d="${area}" fill="url(#chart-area)"/>
      <path d="${line}" stroke="${theme.accent}" stroke-opacity=".12" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${line}" pathLength="100" stroke="${theme.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line" filter="url(#glow)"/>
      ${points.filter(point => point.count > 0).map(point => `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3.5" fill="${theme.ice}" stroke="${theme.accent}"><title>${point.date} / ${point.count} 次贡献</title></circle>`).join('')}
      ${labels}
      ${text(mobile ? 30 : 48, mobile ? 348 : 336, `${days[0].date} → ${days.at(-1).date}`, 11, theme.muted, 'class="mono"')}
      ${mobile ? text(30, 372, `同步于 ${syncLabel(snapshot)}（北京时间）`, 11, theme.muted) : text(width - 48, 336, 'SOURCE / GITHUB CONTRIBUTION CALENDAR', 10, theme.muted, 'class="mono" text-anchor="end" letter-spacing="1"')}
    `;
    return svg(height, `${snapshot.username} 的 GitHub 贡献曲线`, `最近 31 天共 ${total} 次贡献。数据来自 ${snapshot.source}，更新于 ${syncLabel(snapshot)}，使用北京时间。`, content,
      `<linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${theme.accent}" stop-opacity=".23"/><stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/></linearGradient>
       <style><![CDATA[.chart-line{stroke-dasharray:100;animation:chart-draw 2.4s ease-out both}@keyframes chart-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}]]></style>`, width);
  }

  function snake(snapshot, dark = true) {
    const foreground = dark ? theme.text : '#183f3b';
    const muted = dark ? theme.muted : '#52716c';
    const accent = dark ? theme.accent : '#1ba881';
    const colors = dark ? ['#101c29', '#153e3c', '#1b6557', '#2b9c7c', '#74f8ce'] : ['#e9f1ee', '#d0f1e5', '#97e5ca', '#58cfa8', '#219675'];
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
      ${!dark ? '<rect width="1120" height="316" fill="#f6fbf8"/>' : ''}
      ${text(48, 48, 'Contribution snake', 24, foreground, 'font-weight="700" letter-spacing="-.5"')}
      ${text(1072, 48, `${snapshot.totalContributions} contributions / displayed period`, 11, muted, 'class="mono" text-anchor="end"')}
      ${[...labels.values()].join('')}
      ${[1, 3, 5].map(row => text(62, 124 + row * step, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][row], 9, muted, 'class="mono" text-anchor="end"')).join('')}
      ${rectangles}
      <path d="${path}" stroke="${accent}" stroke-opacity=".035" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${path}" pathLength="1000" class="snake-tail" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      <g class="snake-head" transform="translate(${route[0].x} ${route[0].y})">
        <circle r="5.1" fill="${accent}"/>
        <circle cx="-1.6" cy="-1.5" r=".95" fill="${dark ? theme.background : '#f6fbf8'}"/>
        <circle cx="1.6" cy="-1.5" r=".95" fill="${dark ? theme.background : '#f6fbf8'}"/>
      </g>
      ${text(48, 282, `${snapshot.days[0].date} → ${snapshot.days.at(-1).date}`, 10, muted, 'class="mono"')}
      ${text(1072, 282, `SYNC / ${syncLabel(snapshot)} CST`, 10, muted, 'class="mono" text-anchor="end"')}
      ${text(48, 301, '每一格来自真实贡献记录，光蛇沿日历巡游。', 11, muted)}
    `;
    const css = `<style><![CDATA[
      .snake-tail{stroke-dasharray:22 978;stroke-dashoffset:22;animation:snake-tail 38s linear infinite}
      .snake-head{animation:snake-head 38s linear infinite}
      .snake-food{animation:snake-food 38s linear infinite}
      @keyframes snake-tail{from{stroke-dashoffset:22}to{stroke-dashoffset:-978}}
      @keyframes snake-head{${headFrames}}
      @keyframes snake-food{0%,.2%{opacity:1}.4%,78%{opacity:.18}90%,100%{opacity:1}}
    ]]></style>`;
    return svg(316, `${snapshot.username} 的贡献贪吃蛇动画`, `基于真实 GitHub 贡献日历生成的原创巡游动画。展示区间共有 ${snapshot.totalContributions} 次贡献，数据更新于 ${syncLabel(snapshot)}，使用北京时间。`, content, css);
  }

  function projectSection(projects) {
    const categories = [
      ['tools', 'AI 与开发工具', '让研究、创作和开发少一点重复。'],
      ['games', '游戏与互动世界', '解谜、塔防、卡牌、星海和位面冒险。'],
      ['apps', '应用与日常工具', '把时间、记录和设备之间的小事安排好。'],
    ];
    function card(project) {
      const primary = project.repo || project.previewUrl || 'https://tfboyhomepage.netlify.app/';
      const links = [];
      if (project.repo) links.push(`<a href="${escapeXml(project.repo)}">源码 ↗</a>`);
      if (project.previewUrl && project.previewUrl !== project.repo) {
        links.push(`<a href="${escapeXml(project.previewUrl)}">${project.category === 'games' ? '试玩' : project.id === 'vibe-git' ? '文档' : '打开'} ↗</a>`);
      }
      if (project.download) links.push(`<a href="${escapeXml(project.download)}">下载 ↗</a>`);
      if (!links.length) links.push('<a href="https://tfboyhomepage.netlify.app/">作品介绍 ↗</a>');
      return `<td width="50%" valign="top">
<a href="${escapeXml(primary)}"><img width="100%" src="./assets/projects/${project.id}.svg" alt="${escapeXml(`${project.title} · ${project.headline}`)}" /></a>
<h3>${escapeXml(project.title)}</h3>
<p>${escapeXml(project.description)}</p>
<p><code>${escapeXml(project.tags.join(' · '))}</code>${project.status === 'polishing' ? ' · <strong>正在打磨</strong>' : ''}</p>
<p>${links.join(' · ')}</p>
</td>`;
    }
    return categories.map(([category, title, subtitle]) => {
      const items = projects.filter(project => project.category === category);
      const rows = [];
      for (let index = 0; index < items.length; index += 2) {
        rows.push(`<tr>\n${card(items[index])}\n${items[index + 1] ? card(items[index + 1]) : '<td width="50%" valign="top"><p><strong>继续翻阅作品册</strong></p><p>完整作品与最新介绍，收在个人网站里。</p><a href="https://tfboyhomepage.netlify.app/">打开 TFBOY 之家 ↗</a></td>'}\n</tr>`);
      }
      return `### ${title}\n\n${subtitle}\n\n<table>\n${rows.join('\n')}\n</table>`;
    }).join('\n\n');
  }

  return { projectCard, projectSection, activity, snake };
}
