import { mkdir, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createProfileArtwork } from './profile-artwork.mjs';

// Self-contained vector artwork, without remote fonts, images or scripts.
const theme = { background: '#0b1830', text: '#eaf4ff', muted: '#91abc8', accent: '#f8ce79' };
function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
}
function text(x, y, value, size = 16, fill = theme.text, attributes = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attributes}>${escapeXml(value)}</text>`;
}
function svg(height, title, description, content, extraDefs = '', width = 1120) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title description">
<title id="title">${escapeXml(title)}</title><desc id="description">${escapeXml(description)}</desc>
<defs>
<linearGradient id="background" x2="1" y2="1"><stop stop-color="#142e51"/><stop offset=".55" stop-color="#0b1830"/><stop offset="1" stop-color="#22244c"/></linearGradient>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2.5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="frame"><rect width="${width}" height="${height}" rx="14"/></clipPath>
${extraDefs}
</defs>
<style><![CDATA[
text{font-family:'Segoe UI','Microsoft YaHei',sans-serif}.mono{font-family:Consolas,'Liberation Mono',monospace}
@media(prefers-reduced-motion:reduce){*{animation:none!important}.signature{opacity:1!important}.brush{stroke-dashoffset:0!important}.meteor,.arrival,.spark,.pigment-light,.snake-tail,.snake-head{display:none!important}.snake-food{opacity:1!important}}
]]></style>
<g clip-path="url(#frame)"><rect width="${width}" height="${height}" fill="url(#background)"/>${content}</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="13.5" stroke="#d4b879" stroke-opacity=".18"/>
</svg>\n`;
}

// Hand-lettered silhouettes and broad writing guides are separate. The reveal
// brush uncovers the tapered contours rather than drawing a constant-width font.
const letters = [
  { name: 'T',
    ink: 'M17 56C53 22 140 15 213 25L226 15Q228 44 191 50C130 36 69 44 27 67ZM128 41C120 93 98 142 71 181C60 199 43 208 29 200C17 193 22 174 42 156C26 182 29 190 44 185C64 172 76 113 99 55Z',
    guide: 'M20 56C71 23 156 28 216 33M116 44C92 125 62 215 30 190Q15 178 39 161' },
  { name: 'F',
    ink: 'M271 29C264 58 252 97 240 127C220 178 205 197 180 189C170 180 176 160 190 151C184 169 185 178 197 171C209 157 232 72 246 40ZM237 42C286 9 335 15 373 24L369 38C329 32 286 32 241 58ZM225 98C261 73 300 72 326 81L316 97C282 87 256 91 220 112Z',
    guide: 'M241 48C286 21 339 23 370 30M259 36C237 109 212 206 181 175M227 102Q276 75 322 88' },
  { name: 'B',
    ink: 'M420 27C408 69 389 128 372 174L349 190C368 130 384 69 397 38ZM388 45C432 7 493 16 485 52C481 73 461 87 431 97C470 90 497 107 478 141C457 181 408 203 365 182L373 167C412 176 450 151 458 131C470 105 438 105 397 113L405 91C442 83 467 64 465 47C464 30 431 30 393 59Z',
    guide: 'M410 32L361 181M391 49C451 9 502 40 452 83L405 103C492 81 494 140 446 164Q406 190 369 176' },
  { name: 'O',
    ink: 'M516 162C493 127 513 62 555 31C594 3 642 18 643 57C645 96 607 157 567 179C543 192 525 187 516 162ZM533 154C544 178 573 155 599 121C626 86 638 39 610 34C578 26 552 59 538 91C527 118 525 139 533 154Z',
    guide: 'M530 171C504 132 531 48 578 28C630 5 654 48 622 106C595 151 553 193 530 171' },
  { name: 'Y',
    ink: 'M672 36C663 66 652 103 666 115C679 125 715 85 750 32L769 25C743 74 713 119 687 142C662 162 641 144 643 120C644 95 655 58 657 45ZM754 61C741 108 720 160 686 205C666 230 632 230 619 211C604 189 631 158 668 148C640 164 618 190 637 204C653 215 674 191 689 166C712 128 729 84 736 65Z',
    guide: 'M665 38C637 116 646 168 698 116Q730 83 759 29M746 65C720 146 678 240 631 212C611 200 619 169 665 152' },
];
// Ascending hairline joins carry each cursive letter into the next one.
const joins = [
  { ink: 'M42 185C84 187 134 163 162 136Q191 100 234 103L229 110Q193 108 169 143C130 184 74 200 42 191Z', guide: 'M40 189C120 193 168 109 232 106' },
  { ink: 'M189 178C233 195 278 144 309 113Q337 85 393 91L389 97Q345 94 318 120C277 165 230 205 190 186Z', guide: 'M189 182C238 200 288 142 313 116Q342 89 391 95' },
  { ink: 'M383 175C434 204 485 173 516 139L525 141C482 189 427 205 385 183Z', guide: 'M380 179Q450 211 522 139' },
  { ink: 'M549 174C583 185 621 169 649 140L660 131L666 135C629 178 585 196 551 181Z', guide: 'M550 177Q607 200 664 132' },
];
for (const [index, join] of joins.entries()) {
  letters[index].ink += join.ink;
  letters[index].guide += join.guide;
}
function letterPaths(letter, attributes = '') {
  // Keep O's negative-space counter; separate overlapping brush strokes so
  // their intersections remain painted instead of becoming even-odd holes.
  const strokes = letter.ink.match(/M[^M]*/g);
  const contours = letter.name === 'O' ? [strokes.slice(0, 2).join(''), ...strokes.slice(2)] : strokes;
  return contours.map((d, index) => `<path d="${d}" ${letter.name === 'O' && index === 0 ? 'fill-rule="evenodd" clip-rule="evenodd"' : ''} ${attributes}/>`).join('');
}
const flourish = 'M29 222C242 179 500 213 712 192C760 188 792 175 824 162C785 191 756 208 712 211C445 229 249 200 39 230Z';
function hero(mobile = false) {
  const width = mobile ? 600 : 1120;
  const height = mobile ? 430 : 380;
  const signatureTransform = mobile ? 'translate(22 128) scale(.66)' : 'translate(68 69) scale(1.19)';
  const brushMasks = letters.map((letter, index) => `<mask id="write-${index}" maskUnits="userSpaceOnUse" x="0" y="0" width="850" height="250"><path class="brush brush-${index}" d="${letter.guide}" pathLength="100" stroke="white" stroke-width="58" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="0"/></mask>`).join('');
  const writingCss = letters.map((_, index) => {
    const start = ((2 + index * .58) / 12 * 100).toFixed(3);
    const end = ((2.56 + index * .58) / 12 * 100).toFixed(3);
    return `.brush-${index}{animation:write-${index} 12s linear infinite}@keyframes write-${index}{0%,${start}%{stroke-dashoffset:100}${end}%,100%{stroke-dashoffset:0}}`;
  }).join('');
  const dryBrush = ['M112 66L87 135', 'M86 139L76 160', 'M254 53L234 112', 'M240 99Q283 79 303 88', 'M404 46L377 134', 'M431 35Q457 26 468 38', 'M463 120Q457 146 418 166', 'M529 111Q520 136 532 156', 'M610 32Q636 43 621 81', 'M660 73Q649 107 657 121', 'M736 89L717 137', 'M690 186Q659 224 637 212'];
  const sparklePositions = [[50, 18, 5], [205, 79, 3], [287, 15, 4], [379, 156, 3], [478, 70, 4], [587, 15, 5], [674, 173, 3], [793, 108, 5]];
  const stars = Array.from({ length: mobile ? 36 : 58 }, (_, index) => `<circle cx="${(index * 179 + 47) % 1080 + 20}" cy="${(index * 83 + 31) % 330 + 20}" r="${index % 7 === 0 ? 1.2 : .65}" fill="#c7e7ff" opacity="${index % 3 === 0 ? .5 : .22}"/>`).join('');
  const defs = `
<linearGradient id="paint" gradientUnits="userSpaceOnUse" x1="20" y1="38" x2="790" y2="173"><stop stop-color="#62e7b3"/><stop offset=".24" stop-color="#60bffa"/><stop offset=".46" stop-color="#b888f3"/><stop offset=".69" stop-color="#ffd176"/><stop offset="1" stop-color="#ff8195"/></linearGradient>
<linearGradient id="cloud" x2="0" y2="1"><stop stop-color="#8dbfe4" stop-opacity=".14"/><stop offset="1" stop-color="#315181" stop-opacity="0"/></linearGradient>
<linearGradient id="comet-blue"><stop stop-color="#60bffa" stop-opacity="0"/><stop offset=".65" stop-color="#8cd8ff" stop-opacity=".5"/><stop offset="1" stop-color="#e6f6ff"/></linearGradient>
<linearGradient id="comet-gold"><stop stop-color="#edb764" stop-opacity="0"/><stop offset=".65" stop-color="#ffd584" stop-opacity=".8"/><stop offset="1" stop-color="#fff8d9"/></linearGradient>
<radialGradient id="arrival-light"><stop stop-color="#fff4ce" stop-opacity=".75"/><stop offset=".22" stop-color="#ffce7c" stop-opacity=".35"/><stop offset="1" stop-color="#f0b876" stop-opacity="0"/></radialGradient>
<linearGradient id="pigment-sheen"><stop stop-color="white" stop-opacity="0"/><stop offset=".5" stop-color="#fff8e9" stop-opacity=".7"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
${brushMasks}
<mask id="dry-brush" maskUnits="userSpaceOnUse" x="0" y="0" width="850" height="250"><rect width="850" height="250" fill="white"/><g stroke="black" stroke-width="1.3" stroke-linecap="round">${dryBrush.map(d => `<path d="${d}"/>`).join('')}</g></mask>
<clipPath id="signature-clip">${letters.map(letter => letterPaths(letter)).join('')}</clipPath>
<style><![CDATA[
.signature{animation:ink-cycle 12s linear infinite}.meteor{opacity:0;animation:meteor 12s linear infinite}.comet-gold{animation:comet-color 12s linear infinite}.arrival{opacity:0;animation:arrival 12s ease-out infinite}.spark{opacity:0;animation:spark 12s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.flourish{animation:flourish 12s ease-out infinite}.pigment-light{opacity:0;animation:pigment-light 12s ease-in-out infinite}
${writingCss}
@keyframes ink-cycle{0%,15%{opacity:0}16.667%,91.667%{opacity:1}100%{opacity:0}}
@keyframes meteor{0%{opacity:0;transform:translate(-120px,-60px)}2%{opacity:1}14%{opacity:1;transform:translate(640px,210px)}16.667%,100%{opacity:0;transform:translate(720px,238px)}}
@keyframes comet-color{0%,7%{opacity:0}12%,100%{opacity:1}}
@keyframes arrival{0%,15%{opacity:0;transform:scale(.75)}18%{opacity:1;transform:scale(1)}31%,100%{opacity:0;transform:scale(1.12)}}
@keyframes spark{0%,40%{opacity:0;transform:scale(.75)}48%,72%{opacity:.85;transform:scale(1)}59%,83%{opacity:.25;transform:scale(.85)}91%{opacity:.7}100%{opacity:0}}
@keyframes flourish{0%,39%{opacity:0}42%,100%{opacity:1}}
@keyframes pigment-light{0%,45%{opacity:0;transform:translateX(-160px)}49%{opacity:.5}70%{opacity:.5;transform:translateX(960px)}74%,100%{opacity:0;transform:translateX(960px)}}
@media(prefers-reduced-motion:reduce){.flourish{opacity:1!important}}
]]></style>`;
  const content = `
<g transform="scale(${width / 1120} ${height / 380})">
<path d="M-60 87C70 31 201 64 283 35S447 17 540 49C349 85 170 120-60 158Z" fill="url(#cloud)"/>
<path d="M642 8C773 68 828 24 925 66S1105 24 1180 72V174C1003 117 807 144 642 8Z" fill="url(#cloud)"/>
<path d="M-90 312C79 247 167 289 307 261S483 294 595 310C336 367 147 347-90 400Z" fill="url(#cloud)"/>
<path d="M674 313C825 254 920 314 1044 271L1190 229V410H674Z" fill="url(#cloud)"/>
<path d="M-30 170C266 38 566 33 935 89M687 335Q908 262 1145 289" stroke="#a8d6ed" stroke-opacity=".08"/>
${stars}
<g class="meteor"><path d="M-370-139Q-185-82 0 0Q-175-55-370-139Z" fill="url(#comet-blue)"/><path d="M-330-126Q-155-70 0 0Q-139-42-330-126Z" fill="url(#comet-gold)" class="comet-gold"/><path d="M-260-99L0 0" stroke="#e0f5ff" stroke-width="1.4"/><path d="M0-12L3-3L12 0L3 3L0 12L-3 3L-12 0L-3-3Z" fill="#fff4d0" filter="url(#glow)"/></g>
<g transform="translate(640 190)"><g class="arrival"><ellipse rx="390" ry="235" fill="url(#arrival-light)"/><path d="M-430 0H430M0-125V125M-125-105L125 105M-125 105L125-105" stroke="#fff2cf" stroke-opacity=".65" stroke-width="1"/></g></g>
</g>
${text(mobile ? 28 : 38, mobile ? 39 : 32, 'TFBOY / INDEPENDENT BUILDER', mobile ? 11 : 12, '#a9c5df', 'class="mono" letter-spacing="1.7"')}
<g transform="${signatureTransform}" aria-label="TFBOY">
<g class="signature" mask="url(#dry-brush)">
${letters.map((letter, index) => `<g mask="url(#write-${index})">${letterPaths(letter, 'fill="url(#paint)"')}</g>`).join('')}
<path class="flourish" d="${flourish}" fill="url(#paint)" opacity=".8"/>
<g clip-path="url(#signature-clip)"><rect class="pigment-light" x="-130" y="0" width="130" height="250" fill="url(#pigment-sheen)"/></g>
</g>
<g fill="url(#paint)" class="signature">${[[25, 80, 2], [13, 94, 1.2], [176, 204, 2.6], [301, 42, 1.7], [495, 190, 1.3], [755, 144, 2.3], [793, 141, 1.3], [810, 135, .8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
<g fill="#ffedbc">${sparklePositions.map(([x, y, r]) => `<g transform="translate(${x} ${y})"><path class="spark" d="M0-${r * 2}L${r / 3}-${r / 3}L${r * 2} 0L${r / 3} ${r / 3}L0 ${r * 2}L-${r / 3} ${r / 3}L-${r * 2} 0L-${r / 3}-${r / 3}Z"/></g>`).join('')}</g>
</g>
${text(width / 2, mobile ? 329 : 359, '让世界更加自动化，也更有趣。', mobile ? 18 : 15, '#c0d4e8', 'text-anchor="middle" letter-spacing="2"')}
${mobile ? text(300, 383, 'AI TOOLS · GAMES · USEFUL APPS', 11, '#8faac7', 'class="mono" text-anchor="middle" letter-spacing="1"') : ''}`;
  return svg(height, 'TFBOY · 五彩草书与金色流星', '苍蓝云层中的流星由青蓝转成金色，金辉展开后，青绿、蓝、紫、金黄和珊瑚红的颜料逐笔写出草书 TFBOY。', content, defs, width);
}

const outputDirectory = new URL('../assets/', import.meta.url);
const { projects, pinnedOrder } = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url), 'utf8'));
const calendar = JSON.parse(await readFile(new URL('../data/github-contributions.json', import.meta.url), 'utf8'));
const repositories = JSON.parse(await readFile(new URL('../data/github-repositories.json', import.meta.url), 'utf8'));
const readmePath = new URL('../README.md', import.meta.url);
const readme = await readFile(readmePath, 'utf8');
if (!readme.includes('<!-- PROJECTS:START -->') || !readme.includes('<!-- PROJECTS:END -->')) throw new Error('README 缺少作品展示区构建标记。');
if (new Set(projects.map(project => project.id)).size !== projects.length || projects.some(project => !/^[a-z0-9-]+$/.test(project.id))) throw new Error('项目 ID 必须唯一，且只能包含小写字母、数字和短横线。');
const profileArtwork = createProfileArtwork({ svg, text, theme, escapeXml });
const projectSection = profileArtwork.projectSection(projects, pinnedOrder, repositories);
const artwork = [
  ['hero.svg', hero()], ['hero-mobile.svg', hero(true)],
  ['github-contribution-grid-snake.svg', profileArtwork.snake(calendar, false)],
  ['github-contribution-grid-snake-dark.svg', profileArtwork.snake(calendar, true)],
];
const desktopBytes = Buffer.byteLength(artwork[0][1], 'utf8') + Math.max(...artwork.slice(2).map(([, content]) => Buffer.byteLength(content, 'utf8')));
if (desktopBytes > 100 * 1024) throw new Error(`桌面图片组合超出 100 KiB：${desktopBytes} bytes`);
await mkdir(outputDirectory, { recursive: true });
for (const [name, content] of artwork) {
  await writeFile(new URL(name, outputDirectory), content, 'utf8');
  console.log(`Built ${name} (${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)} KiB)`);
}
// Remove only known outputs of the previous generator, never unrelated assets.
const obsolete = ['divider.svg', 'footer.svg', 'footer-mobile.svg', 'contribution-activity.svg', 'contribution-activity-mobile.svg', ...projects.map(project => `projects/${project.id}.svg`)];
for (const name of obsolete) {
  await unlink(new URL(name, outputDirectory)).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
await rmdir(new URL('projects/', outputDirectory)).catch(error => { if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error; });
const snakeVersion = createHash('sha256').update(artwork.slice(2).map(([, content]) => content).join('')).digest('hex').slice(0, 12);
const updatedReadme = readme.replace(/(<!-- PROJECTS:START -->)[\s\S]*?(<!-- PROJECTS:END -->)/, (_, start, end) => `${start}\n\n${projectSection}\n\n${end}`)
  .replace(/(\.\/assets\/github-contribution-grid-snake(?:-dark)?\.svg)(?:\?v=[a-f0-9]+)?/g, (_, path) => `${path}?v=${snakeVersion}`);
if (updatedReadme !== readme) await writeFile(readmePath, updatedReadme, 'utf8');
console.log(`\nGenerated ${artwork.length} SVG assets in ${fileURLToPath(outputDirectory)}; desktop pair ${(desktopBytes / 1024).toFixed(1)} KiB`);
