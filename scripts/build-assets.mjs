import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// All artwork is self-contained: no scripts, remote fonts, or embedded HTML.
// Keep generated SVGs in Git so GitHub can display them directly in the README.
const WIDTH = 1120;
const theme = {
  background: '#080e17',
  line: '#203846',
  accent: '#74f8ce',
  ice: '#d6fff2',
  text: '#edf7f7',
  muted: '#91a9b8',
};

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character]);
}

function text(x, y, value, size = 16, fill = theme.text, attributes = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attributes}>${escapeXml(value)}</text>`;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function stars(height, count = 72, seed = 27, width = WIDTH) {
  const random = seededRandom(seed);
  return Array.from({ length: count }, (_, index) => {
    const x = (20 + random() * (width - 40)).toFixed(1);
    const y = (18 + random() * (height - 36)).toFixed(1);
    const radius = (0.45 + random() * 1.3).toFixed(2);
    const opacity = (0.15 + random() * 0.5).toFixed(2);
    const animated = index % 5 === 0;
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${index % 4 === 0 ? theme.accent : theme.text}" opacity="${opacity}"${animated ? ` class="twinkle" style="animation-delay:-${(random() * 7).toFixed(2)}s"` : ''}/>`;
  }).join('\n');
}

function ticks(radius, count = 72) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * Math.PI * 2 / count;
    const inner = radius - (index % 6 === 0 ? 12 : 4);
    return `<path d="M${(Math.cos(angle) * inner).toFixed(2)} ${(Math.sin(angle) * inner).toFixed(2)}L${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}"/>`;
  }).join('\n');
}

function cat(scale = 1) {
  return `<g transform="scale(${scale})">
    <path d="M-68-17L-82-94L-22-53Q0-61 22-53L82-94L68-17Q84 20 59 53Q31 76 0 76Q-31 76-59 53Q-84 20-68-17Z" fill="url(#glass)" stroke="url(#metal)" stroke-width="2.4"/>
    <g fill="none" stroke="${theme.accent}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
      <path d="M-59-35L-64-65L-39-48M59-35L64-65L39-48" opacity=".65" stroke-width="1.5"/>
      <g class="eyes" stroke-width="3.5">
        <path d="M-43-9L-23 1L-42 10M43-9L23 1L42 10"/>
      </g>
      <path d="M-5 23L0 27L5 23M0 27V34M0 34Q-10 42-17 34M0 34Q10 42 17 34" stroke-width="2"/>
      <path d="M-54 22L-92 16M-54 32L-96 34M54 22L92 16M54 32L96 34" opacity=".55" stroke-width="1.4"/>
    </g>
    <path d="M-40 54Q0 70 40 54" fill="none" stroke="${theme.ice}" stroke-opacity=".18"/>
  </g>`;
}

const motionCss = `
  text { font-family: 'Trebuchet MS', 'Segoe UI', 'Microsoft YaHei', sans-serif; }
  .mono, .mono text { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace; }
  .display { font-family: 'Arial Black', 'Segoe UI', sans-serif; font-weight: 900; letter-spacing: -7px; }
  .spin, .reverse, .orbit { transform-box: fill-box; transform-origin: center; }
  .spin { animation: rotate 38s linear infinite; }
  .reverse { animation: rotate 54s linear infinite reverse; }
  .orbit { animation: rotate 16s linear infinite; }
  .float { animation: float 7s ease-in-out infinite; }
  .breathe { animation: breathe 5s ease-in-out infinite; }
  .twinkle { animation: twinkle 5s ease-in-out infinite; }
  .signal { animation: signal 3s ease-in-out infinite; }
  .eyes { animation: eyes 8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .flow { stroke-dasharray: 12 88; animation: flow 3.2s linear infinite; }
  .flow-slow { stroke-dasharray: 4 96; animation: flow 6s linear infinite; }
  .sweep { animation: sweep 9s ease-in-out infinite; }
  .node-halo { animation: node 6.4s ease-in-out infinite; }
  .rise { animation: rise 1.2s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes rotate { to { transform: rotate(360deg); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  @keyframes breathe { 0%,100% { opacity:.36; } 50% { opacity:.8; } }
  @keyframes twinkle { 0%,100% { opacity:.18; } 50% { opacity:.85; } }
  @keyframes signal { 0%,100% { opacity:.35; } 50% { opacity:1; } }
  @keyframes eyes { 0%,43%,47%,100% { transform:scaleY(1); } 45% { transform:scaleY(.12); } }
  @keyframes flow { to { stroke-dashoffset:-100; } }
  @keyframes sweep { 0%,35% { transform:translateX(-360px); opacity:0; } 42% { opacity:.7; } 70%,100% { transform:translateX(900px); opacity:0; } }
  @keyframes node { 0%,15%,65%,100% { opacity:.12; } 28%,45% { opacity:.95; } }
  @keyframes rise { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation:none !important; }
    .rise { opacity:1; }
    .sweep { display:none; }
  }
`;

function svg(height, title, description, content, extraDefs = '', width = WIDTH) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0c1722"/><stop offset=".5" stop-color="${theme.background}"/><stop offset="1" stop-color="#10242a"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${theme.ice}"/><stop offset=".45" stop-color="${theme.accent}"/><stop offset="1" stop-color="#259b88"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#203c45" stop-opacity=".85"/><stop offset=".55" stop-color="#0c1c27" stop-opacity=".95"/><stop offset="1" stop-color="#152e32"/>
    </linearGradient>
    <linearGradient id="fade-line"><stop stop-color="${theme.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${theme.accent}"/><stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/></linearGradient>
    <linearGradient id="sheen"><stop stop-color="white" stop-opacity="0"/><stop offset=".5" stop-color="white" stop-opacity=".85"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
    <radialGradient id="aura"><stop stop-color="${theme.accent}" stop-opacity=".2"/><stop offset=".45" stop-color="#2da78f" stop-opacity=".09"/><stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" stroke="${theme.line}" stroke-opacity=".3" stroke-width=".6"/></pattern>
    <pattern id="dust" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".45" fill="white" opacity=".035"/><circle cx="5" cy="4" r=".35" fill="white" opacity=".025"/></pattern>
    <filter id="glow" x="-70%" y="-70%" width="240%" height="240%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="12"/></filter>
    <clipPath id="frame"><rect width="${width}" height="${height}" rx="24"/></clipPath>
    ${extraDefs}
  </defs>
  <style><![CDATA[${motionCss}]]></style>
  <g clip-path="url(#frame)">
    <rect width="${width}" height="${height}" fill="url(#background)"/>
    ${content}
    <rect width="${width}" height="${height}" fill="url(#dust)" pointer-events="none"/>
  </g>
  <rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="23.5" stroke="#9be7d8" stroke-opacity=".14"/>
</svg>
`;
}

function connection(path, delay = 0, duration = '3.2s') {
  return `<path d="${path}" stroke="${theme.accent}" stroke-opacity=".18" stroke-width="1.3"/>
    <path d="${path}" pathLength="100" class="flow" style="animation-delay:${delay}s;animation-duration:${duration}" stroke="${theme.accent}" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)"/>`;
}

function agent(x, y, label, role, index, width = 226) {
  const icons = [
    '<path d="M-9-7H9M-9 0H4M-9 7H7"/><circle cx="11" cy="7" r="2"/>',
    '<path d="M-5-8L-13 0L-5 8M5-8L13 0L5 8M2-11L-2 11"/>',
    '<path d="M-11 0L-3 8L12-8"/><circle r="16" stroke-opacity=".25"/>',
  ];
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="92" rx="13" fill="url(#glass)" stroke="${theme.line}"/>
    <rect x=".5" y=".5" width="${width - 1}" height="91" rx="12.5" stroke="${theme.accent}" stroke-width="1.5" class="node-halo" style="animation-delay:${index * -1.5}s" filter="url(#glow)"/>
    <path d="M14 1H${width - 14}" stroke="${theme.ice}" stroke-opacity=".16"/>
    <g transform="translate(34 44)" stroke="${theme.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[index]}</g>
    ${text(66, 37, label, 20, theme.text, 'font-weight="600"')}
    ${text(66, 61, role, 12, theme.muted, 'class="mono"')}
    <circle cx="${width - 17}" cy="18" r="2.5" fill="${theme.accent}" class="signal" style="animation-delay:${index * -1}s"/>
    <path d="M${width - 44} 76h5m4 0h5m4 0h5" stroke="${theme.accent}" stroke-opacity=".35" stroke-width="2"/>
  </g>`;
}

function collaboration() {
  const paths = [
    'M208 256H250',
    'M425 256H487',
    'M706 256H760Q786 256 786 230V166Q786 142 810 142H845',
    'M706 256H845',
    'M706 256H760Q786 256 786 282V346Q786 370 810 370H845',
  ];
  const content = `
    <rect width="1120" height="520" fill="url(#grid)" opacity=".4"/>
    <ellipse cx="595" cy="252" rx="285" ry="260" fill="url(#aura)" class="breathe"/>
    ${stars(520, 58, 42)}
    ${text(48, 51, 'VIBE–GIT', 25, theme.text, 'font-weight="700" letter-spacing="-1"')}
    ${text(48, 78, 'The collaboration layer above your code.', 15, theme.muted)}
    ${text(1072, 51, 'HUMAN × MULTI-AGENT', 11, theme.accent, 'class="mono" text-anchor="end" letter-spacing="1.8"')}
    <g fill="none">${paths.map((path, index) => connection(path, -index * .6)).join('\n')}</g>
    ${text(48, 195, '01 / HUMAN', 10, theme.muted, 'class="mono" letter-spacing="1.8"')}
    <rect x="48" y="211" width="160" height="90" rx="12" fill="url(#glass)" stroke="${theme.line}"/>
    <rect x="48" y="211" width="160" height="90" rx="12" stroke="${theme.accent}" class="node-halo" style="animation-delay:-.5s"/>
    <g transform="translate(78 250)" stroke="${theme.ice}" stroke-width="1.7">
      <circle cy="-9" r="7"/><path d="M-12 14V10Q-12 2 0 2Q12 2 12 10V14"/>
    </g>
    ${text(102, 249, 'Human', 19, theme.text, 'font-weight="600"')}
    ${text(102, 273, 'Direction', 11, theme.muted, 'class="mono"')}
    ${text(250, 195, '02 / INTENT', 10, theme.muted, 'class="mono" letter-spacing="1.8"')}
    <rect x="250" y="211" width="175" height="90" rx="12" fill="url(#glass)" stroke="${theme.line}"/>
    <rect x="250" y="211" width="175" height="90" rx="12" stroke="${theme.accent}" class="node-halo" style="animation-delay:-1.5s"/>
    <path d="M273 233L280 240L273 247L266 240Z" stroke="${theme.accent}" stroke-width="1.5"/>
    ${text(292, 248, 'Intent', 21, theme.text, 'font-weight="600"')}
    ${text(270, 276, '需求 · 任务 · 依赖', 14, theme.muted)}
    <g transform="translate(595 252)">
      <circle r="130" stroke="${theme.accent}" stroke-opacity=".12"/>
      <g class="reverse" stroke="${theme.accent}" stroke-opacity=".24" stroke-width="1">${ticks(130, 60)}</g>
      <g class="spin" stroke="${theme.accent}" stroke-width="1.5"><circle r="110" stroke-dasharray="90 28 8 28 60 477"/></g>
      <circle r="85" fill="url(#glass)" stroke="${theme.accent}" stroke-opacity=".4"/>
      <circle r="77" stroke="${theme.ice}" stroke-opacity=".08"/>
      <g class="float">${cat(.55)}</g>
      <circle cx="-110" r="3.5" fill="${theme.accent}" filter="url(#glow)" class="signal"/>
      <circle cx="110" r="3.5" fill="${theme.accent}" filter="url(#glow)" class="signal"/>
    </g>
    ${text(595, 353, 'VIBE-GIT', 19, theme.ice, 'class="mono" font-weight="700" text-anchor="middle" letter-spacing="3"')}
    ${text(595, 377, 'Shared context', 11, theme.muted, 'class="mono" text-anchor="middle" letter-spacing="1"')}
    ${agent(845, 96, 'Agent A', 'PLAN / 拆解需求', 0)}
    ${agent(845, 210, 'Agent B', 'BUILD / 实现产品', 1)}
    ${agent(845, 324, 'Agent C', 'REVIEW / 检查结果', 2)}
    <path d="M958 418V440Q958 452 946 452H350Q338 452 338 440V301" stroke="${theme.accent}" stroke-opacity=".16" stroke-dasharray="3 7"/>
    ${text(651, 442, 'FEEDBACK → SHARED INTENT', 10, theme.muted, 'class="mono" text-anchor="middle" letter-spacing="1.5"')}
    <path d="M48 484H264M856 484H1072" stroke="url(#fade-line)" stroke-opacity=".4"/>
    ${text(560, 489, 'One intent. Many agents. A shared direction.', 13, theme.ice, 'text-anchor="middle"')}
  `;
  return svg(520, 'Vibe-Git · 从人类意图到多 Agent 协作', '协作示意图：Human 提出方向，Intent 记录需求、任务与依赖；Vibe-Git 共享上下文，连接负责规划、构建与检查的 Agent，并让反馈回到共同意图。', content);
}

function heroMobile() {
  const content = `
    <rect width="600" height="550" fill="url(#grid)" opacity=".35"/>
    <ellipse cx="465" cy="142" rx="240" ry="245" fill="url(#aura)" class="breathe"/>
    ${stars(550, 62, 27, 600)}
    <g transform="translate(454 144)">
      <g class="reverse" stroke="${theme.accent}" stroke-opacity=".25">${ticks(115, 48)}</g>
      <g class="spin"><circle r="100" stroke="${theme.accent}" stroke-width="1.5" stroke-dasharray="85 26 12 250"/></g>
      <g transform="rotate(-28)">
        <ellipse rx="138" ry="45" stroke="${theme.accent}" stroke-opacity=".22"/>
        <ellipse rx="138" ry="45" pathLength="100" stroke="${theme.accent}" stroke-width="2" class="flow-slow" filter="url(#glow)"/>
      </g>
      <circle r="75" fill="url(#glass)" stroke="${theme.accent}" stroke-opacity=".2"/>
      <g class="float">${cat(.49)}</g>
    </g>
    <path d="M34 38H52M34 38V56" stroke="${theme.accent}" stroke-width="2"/>
    ${text(64, 50, 'TFBOY1 / CREATIVE ENGINEERING', 11, theme.muted, 'class="mono" letter-spacing="1"')}
    <rect x="34" y="139" width="215" height="33" rx="4" fill="${theme.accent}" fill-opacity=".07" stroke="${theme.accent}" stroke-opacity=".25"/>
    <circle cx="50" cy="155" r="3" fill="${theme.accent}" class="signal"/>
    ${text(65, 160, 'AI NATIVE BUILDER', 14, theme.accent, 'class="mono" letter-spacing="1"')}
    ${text(27, 288, 'TFboy1', 119, theme.text, 'class="display rise"')}
    ${text(34, 342, 'Human ideas. Agent power.', 29, theme.ice, 'font-weight="600" letter-spacing="-.7"')}
    ${text(34, 382, '把人类的想法，变成真正运行的产品。', 22, theme.muted)}
    <path d="M34 416H566" stroke="url(#fade-line)" stroke-opacity=".5"/>
    ${text(34, 450, 'AGENT SYSTEMS  /  VIBE CODING  /  FULL STACK', 12, theme.muted, 'class="mono" letter-spacing=".4"')}
    ${text(34, 506, 'VERSION THE INTENT, NOT JUST THE CODE.', 12, theme.accent, 'class="mono" letter-spacing=".5"')}
  `;
  return svg(550, 'TFboy1 · AI Native Builder', '移动端主视觉：发光猫与旋转星环。把人类的想法，变成真正运行的产品。', content, '', 600);
}

function collaborationMobile() {
  const paths = [
    'M294 127H324',
    'M420 212V235Q420 252 403 252H300V268',
    'M300 493V496Q300 508 288 508H120V548',
    'M300 493V508M300 538V548',
    'M300 493V496Q300 508 312 508H480V548',
  ];
  const content = `
    <rect width="600" height="780" fill="url(#grid)" opacity=".4"/>
    <ellipse cx="300" cy="365" rx="290" ry="270" fill="url(#aura)" class="breathe"/>
    ${stars(780, 54, 42, 600)}
    ${text(34, 49, 'VIBE–GIT', 26, theme.text, 'font-weight="700" letter-spacing="-1"')}
    ${text(34, 77, 'The collaboration layer above your code.', 16, theme.muted)}
    ${paths.map((path, index) => connection(path, -index * .6)).join('\n')}
    <rect x="34" y="100" width="260" height="112" rx="14" fill="url(#glass)" stroke="${theme.line}"/>
    <g transform="translate(69 144)" stroke="${theme.ice}" stroke-width="1.8"><circle cy="-8" r="8"/><path d="M-13 15V11Q-13 3 0 3Q13 3 13 11V15"/></g>
    ${text(97, 147, 'Human', 24, theme.text, 'font-weight="600"')}
    ${text(56, 185, '人类决定方向', 19, theme.muted)}
    <rect x="324" y="100" width="242" height="112" rx="14" fill="url(#glass)" stroke="${theme.line}"/>
    <path d="M351 132L361 142L351 152L341 142Z" stroke="${theme.accent}" stroke-width="1.7"/>
    ${text(379, 149, 'Intent', 24, theme.text, 'font-weight="600"')}
    ${text(346, 185, '需求 · 任务 · 依赖', 18, theme.muted)}
    <g transform="translate(300 369)">
      <circle r="121" stroke="${theme.accent}" stroke-opacity=".15"/>
      <g class="reverse" stroke="${theme.accent}" stroke-opacity=".3">${ticks(121, 60)}</g>
      <g class="spin"><circle r="103" stroke="${theme.accent}" stroke-width="1.5" stroke-dasharray="90 20 10 230"/></g>
      <circle r="83" fill="url(#glass)" stroke="${theme.accent}" stroke-opacity=".4"/>
      <g class="float">${cat(.55)}</g>
    </g>
    ${text(300, 469, 'VIBE-GIT', 19, theme.ice, 'class="mono" text-anchor="middle" font-weight="700" letter-spacing="3"')}
    ${text(300, 531, '共享上下文 · 协调任务与依赖', 18, theme.muted, 'text-anchor="middle"')}
    ${mobileAgent(34, 'Agent A', 'PLAN', '拆解需求', 0)}
    ${mobileAgent(214, 'Agent B', 'BUILD', '实现产品', 1)}
    ${mobileAgent(394, 'Agent C', 'REVIEW', '检查结果', 2)}
    <path d="M56 733H174M426 733H544" stroke="url(#fade-line)" stroke-opacity=".5"/>
    ${text(300, 740, '同一个意图，一起向前。', 18, theme.ice, 'text-anchor="middle"')}
  `;
  return svg(780, 'Vibe-Git · 多 Agent 协作', '移动端协作示意图：人类意图通过 Vibe-Git 的共享上下文连接规划、构建和检查三个 Agent。', content, '', 600);
}

function mobileAgent(x, label, role, detail, index) {
  return `<g transform="translate(${x} 548)">
    <rect width="172" height="145" rx="13" fill="url(#glass)" stroke="${theme.line}"/>
    <rect width="172" height="145" rx="13" stroke="${theme.accent}" class="node-halo" style="animation-delay:${index * -1.5}s" filter="url(#glow)"/>
    <circle cx="86" cy="24" r="3.5" fill="${theme.accent}" class="signal"/>
    ${text(86, 59, label, 21, theme.text, 'text-anchor="middle" font-weight="600"')}
    ${text(86, 90, role, 13, theme.accent, 'class="mono" text-anchor="middle" letter-spacing="2"')}
    ${text(86, 119, detail, 18, theme.muted, 'text-anchor="middle"')}
  </g>`;
}

function hero() {
  const wave = Array.from({ length: 20 }, (_, index) => {
    const y = 317 + index * 6;
    return `<path d="M-80 ${y}C210 ${y - 92} 387 ${y + 132} 645 ${y - 6}S942 ${y - 126} 1220 ${y - 56}" stroke="${theme.accent}" stroke-opacity="${(0.025 + index * 0.002).toFixed(3)}"/>`;
  }).join('\n');

  const content = `
    <rect width="1120" height="480" fill="url(#grid)" opacity=".35"/>
    <ellipse cx="854" cy="245" rx="345" ry="305" fill="url(#aura)" class="breathe"/>
    <ellipse cx="118" cy="460" rx="340" ry="160" fill="url(#aura)" opacity=".4"/>
    ${stars(480, 92)}
    <g fill="none">${wave}</g>
    <path d="M650 40H1024L1072 88V358L1024 406H692" stroke="${theme.line}" stroke-opacity=".7"/>
    <path d="M652 40H729M1072 294V358L1024 406H970" stroke="${theme.accent}" stroke-opacity=".5"/>
    <g transform="translate(850 232)">
      <circle r="210" fill="url(#aura)"/>
      <g class="reverse" stroke="${theme.accent}" stroke-opacity=".24" stroke-width="1">${ticks(188)}</g>
      <circle r="171" stroke="${theme.accent}" stroke-opacity=".12"/>
      <g class="spin" stroke="url(#metal)" stroke-width="2">
        <circle r="153" stroke-dasharray="125 32 18 50 80 656"/>
        <circle r="166" stroke-width=".7" stroke-dasharray="4 32" opacity=".6"/>
      </g>
      <g transform="rotate(-28)">
        <ellipse rx="222" ry="62" stroke="${theme.accent}" stroke-opacity=".2"/>
        <ellipse rx="222" ry="62" pathLength="100" class="flow-slow" stroke="${theme.accent}" stroke-width="2" filter="url(#glow)"/>
      </g>
      <g transform="rotate(32)">
        <ellipse rx="207" ry="73" stroke="${theme.ice}" stroke-opacity=".1"/>
        <ellipse rx="207" ry="73" pathLength="100" class="flow-slow" style="animation-delay:-3s" stroke="${theme.ice}" stroke-width="1.5" filter="url(#glow)"/>
      </g>
      <g class="orbit">
        <circle r="136" stroke="${theme.accent}" stroke-opacity=".08"/>
        <circle cx="136" r="4" fill="${theme.accent}" filter="url(#glow)"/>
        <circle cx="-136" r="2" fill="${theme.ice}"/>
      </g>
      <circle r="113" fill="url(#glass)" stroke="${theme.accent}" stroke-opacity=".18"/>
      <circle r="106" stroke="${theme.ice}" stroke-opacity=".08"/>
      <g class="float">${cat(.87)}</g>
    </g>
    <g class="rise">
      <path d="M54 54H72M54 54V72" stroke="${theme.accent}" stroke-width="2"/>
      ${text(86, 66, 'TFBOY1 / CREATIVE ENGINEERING', 12, theme.muted, 'class="mono" letter-spacing="2"')}
      <rect x="58" y="108" width="189" height="29" rx="4" fill="${theme.accent}" fill-opacity=".08" stroke="${theme.accent}" stroke-opacity=".25"/>
      <circle cx="72" cy="122" r="3" fill="${theme.accent}" class="signal"/>
      ${text(85, 126, 'AI NATIVE BUILDER', 12, theme.accent, 'class="mono" letter-spacing="1.2"')}
      ${text(53, 247, 'TFboy1', 118, theme.text, 'class="display"')}
      <g clip-path="url(#title-mask)"><rect x="0" y="150" width="155" height="110" fill="url(#sheen)" class="sweep" transform="rotate(-12 70 210)"/></g>
      ${text(60, 292, 'Human ideas. Agent power.', 27, theme.ice, 'font-weight="600" letter-spacing="-.7"')}
      ${text(60, 328, '把人类的想法，变成真正运行的产品。', 17, theme.muted)}
    </g>
    <path d="M60 370H595" stroke="url(#fade-line)" stroke-opacity=".6"/>
    <g class="mono" fill="${theme.muted}" font-size="11" letter-spacing="1.6">
      ${text(60, 398, 'AGENT SYSTEMS', 11, theme.muted, 'class="mono" letter-spacing="1.6"')}
      <circle cx="194" cy="394" r="1.6" fill="${theme.accent}"/>
      ${text(211, 398, 'VIBE CODING', 11, theme.muted, 'class="mono" letter-spacing="1.6"')}
      <circle cx="332" cy="394" r="1.6" fill="${theme.accent}"/>
      ${text(349, 398, 'FULL STACK', 11, theme.muted, 'class="mono" letter-spacing="1.6"')}
    </g>
    ${text(60, 448, 'VERSION THE INTENT, NOT JUST THE CODE.', 11, theme.accent, 'class="mono" letter-spacing="1.5"')}
    ${text(850, 448, 'HUMAN × AGENT', 11, theme.muted, 'class="mono" text-anchor="middle" letter-spacing="3"')}
  `;
  return svg(480, 'TFboy1 · AI Native Builder', '深空粒子、旋转轨道与发光猫标识。Human ideas. Agent power. 把人类的想法，变成真正运行的产品。', content,
    `<clipPath id="title-mask">${text(53, 247, 'TFboy1', 118, '#fff', 'class="display"')}</clipPath>`);
}

function divider() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="32" viewBox="0 0 1120 32" fill="none" role="img" aria-label="流动的薄荷绿分隔线">
  <defs><linearGradient id="line"><stop stop-color="#74f8ce" stop-opacity="0"/><stop offset=".5" stop-color="#74f8ce" stop-opacity=".5"/><stop offset="1" stop-color="#74f8ce" stop-opacity="0"/></linearGradient></defs>
  <style><![CDATA[
    .spark { animation:travel 8s ease-in-out infinite; }
    @keyframes travel { 0% { transform:translateX(-450px); opacity:0; } 20%,80% { opacity:.8; } 100% { transform:translateX(450px); opacity:0; } }
    @media (prefers-reduced-motion:reduce) { .spark { animation:none; opacity:.4; } }
  ]]></style>
  <path d="M40 16H1080" stroke="url(#line)"/>
  <path d="M550 16L560 10L570 16L560 22Z" fill="#74f8ce" fill-opacity=".12" stroke="#74f8ce" stroke-opacity=".5"/>
  <circle cx="560" cy="16" r="2" fill="#d6fff2" class="spark"/>
</svg>
`;
}

function footer(mobile = false) {
  const width = mobile ? 600 : WIDTH;
  const height = mobile ? 290 : 240;
  const center = width / 2;
  const ribbons = Array.from({ length: 15 }, (_, index) => {
    const y = height - 34 + index * 5;
    return `<path d="M-50 ${y}Q${center} ${y - 170} ${width + 50} ${y}" stroke="${theme.accent}" stroke-opacity="${(0.028 + index * .003).toFixed(3)}"/>`;
  }).join('\n');
  const content = `
    <ellipse cx="${center}" cy="${height + 60}" rx="${width / 1.4}" ry="260" fill="url(#aura)" class="breathe"/>
    ${stars(height, mobile ? 30 : 50, 91, width)}
    ${ribbons}
    <path d="M${center - 35} 38H${center - 12}M${center + 12} 38H${center + 35}" stroke="${theme.accent}" stroke-opacity=".5"/>
    <path d="M${center} 32L${center + 6} 38L${center} 44L${center - 6} 38Z" stroke="${theme.accent}" class="signal"/>
    ${mobile
      ? `${text(center, 108, 'Good ideas deserve', 34, theme.text, 'text-anchor="middle" font-weight="700" letter-spacing="-1"')}
         ${text(center, 151, 'real software.', 34, theme.ice, 'text-anchor="middle" font-weight="700" letter-spacing="-1"')}
         ${text(center, 197, 'Building for the age of AI agents.', 18, theme.muted, 'text-anchor="middle"')}
         ${text(center, 251, 'TFBOY1 / KEEP BUILDING', 12, theme.accent, 'class="mono" text-anchor="middle" letter-spacing="2"')}`
      : `${text(center, 111, 'Good ideas deserve real software.', 37, theme.text, 'text-anchor="middle" font-weight="700" letter-spacing="-1.3"')}
         ${text(center, 150, 'Building for the age of AI agents.', 17, theme.muted, 'text-anchor="middle"')}
         ${text(center, 209, 'TFBOY1 / KEEP BUILDING', 11, theme.accent, 'class="mono" text-anchor="middle" letter-spacing="3"')}`}
  `;
  return svg(height, 'Good ideas deserve real software.', '好的想法，值得变成真实的软件。Building for the age of AI agents.', content, '', width);
}

const outputDirectory = new URL('../assets/', import.meta.url);
const artwork = [
  ['hero.svg', hero()],
  ['hero-mobile.svg', heroMobile()],
  ['vibe-git.svg', collaboration()],
  ['vibe-git-mobile.svg', collaborationMobile()],
  ['divider.svg', divider()],
  ['footer.svg', footer()],
  ['footer-mobile.svg', footer(true)],
];

await mkdir(outputDirectory, { recursive: true });
for (const [name, content] of artwork) {
  await writeFile(new URL(name, outputDirectory), content, { encoding: 'utf8' });
  console.log(`Built ${name} (${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)} KB)`);
}
console.log(`\nGenerated ${artwork.length} SVG assets in ${fileURLToPath(outputDirectory)}`);
