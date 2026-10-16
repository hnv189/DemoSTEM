// Generates the 18 flat cartoon illustrations printed on the cubes.
// Run with `npm run art`. Output: public/art/<face-id>.svg (200 × 150).
// Every file is self-contained (no external fonts or images) so it can be
// drawn onto a WebGL canvas texture without tainting it.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'art');

const NAVY = '#17233B';
const SKIN = ['#FFD9B8', '#E9B48E', '#C98E64'];
const HAIR = { brown: '#6B4A3A', black: '#2A2A35', ginger: '#C0602E', blond: '#E9B949' };
const NEUTRAL = '#D5DAE3';
const BLUE = '#69C7EE';
const MINT = '#8BD8BC';
const ORANGE = '#FFB45F';
const HALO = { who: '#D3F0FB', looks: '#D6F3E8', personality: '#FFE9CF' };
const PINK = '#E8546A';
const FONT = `font-family="'Baloo 2','Arial Rounded MT Bold','Trebuchet MS',sans-serif" font-weight="800"`;

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">` +
  `<g stroke="${NAVY}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>\n`;

const r = (n) => Math.round(n * 10) / 10;
const halo = (x, y, rx, ry, color) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" stroke="none"/>`;
const ground = (y = 140) => `<path d="M8 ${y} H192" stroke-width="3" opacity=".35"/>`;

function bubble(x, y, w = 34, h = 22, text = '…', tail = 'left') {
  const tx = tail === 'left' ? x + 8 : x + w - 8;
  const tip = tail === 'left' ? x + 2 : x + w - 2;
  return (
    `<path d="M${x + 10} ${y} H${x + w - 10} Q${x + w} ${y} ${x + w} ${y + 10} V${y + h - 10} Q${x + w} ${y + h} ${x + w - 10} ${y + h} ` +
    `H${tx + 6} L${tip} ${y + h + 9} L${tx - 2} ${y + h} H${x + 10} Q${x} ${y + h} ${x} ${y + h - 10} V${y + 10} Q${x} ${y} ${x + 10} ${y} Z" fill="#fff" stroke-width="3"/>` +
    `<text x="${x + w / 2}" y="${y + h / 2 + 6}" text-anchor="middle" font-size="16" ${FONT} fill="${NAVY}" stroke="none">${text}</text>`
  );
}

/** Arm end + control point for a pose, side d = -1 (left) or 1 (right). */
function armPose(pose, x, g, s, d) {
  const sy = g - 56 * s;
  switch (pose) {
    case 'point': return [x + d * 28 * s, sy + 4 * s, x + d * 46 * s, sy + 2 * s];
    case 'up': return [x + d * 24 * s, sy - 8 * s, x + d * 24 * s, sy - 40 * s];
    case 'wave': return [x + d * 32 * s, sy + 2 * s, x + d * 30 * s, sy - 30 * s];
    case 'chest': return [x + d * 20 * s, sy + 24 * s, x - d * 2 * s, sy + 16 * s];
    case 'reach': return [x + d * 24 * s, sy + 16 * s, x + d * 38 * s, sy + 18 * s];
    case 'low': return [x + d * 22 * s, sy + 22 * s, x + d * 26 * s, g - 22 * s];
    default: return [x + d * 21 * s, sy + 12 * s, x + d * 21 * s, g - 28 * s];
  }
}

function arm(pose, x, g, s, d, skin) {
  const sx = x + d * 12 * s;
  const sy = g - 52 * s;
  const [cx, cy, ex, ey] = armPose(pose, x, g, s, d);
  const p = `M${r(sx)} ${r(sy)} Q${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}`;
  return (
    `<path d="${p}" fill="none" stroke-width="${r(11 * s)}"/>` +
    `<path d="${p}" fill="none" stroke="${skin}" stroke-width="${r(5 * s)}"/>` +
    `<circle cx="${r(ex)}" cy="${r(ey)}" r="${r(5.5 * s)}" fill="${skin}" stroke-width="3"/>`
  );
}

/**
 * A child figure standing on ground line g.
 * opts: s (scale), shirt, hair, skin, style ('short' | 'long' | 'pony' | 'curly'),
 * armL / armR (pose), mouth ('smile' | 'big' | 'tongue' | 'flat'), eyes ('open' | 'happy' | 'closed').
 */
function person(x, g, o = {}) {
  const s = o.s ?? 1;
  const skin = o.skin ?? SKIN[0];
  const hair = o.hair ?? HAIR.brown;
  const shirt = o.shirt ?? NEUTRAL;
  const style = o.style ?? 'short';
  const hy = g - 80 * s;
  const hr = 17 * s;
  const sy = g - 56 * s;
  let out = '';
  // legs
  out += `<path d="M${r(x - 7 * s)} ${r(g - 16 * s)} V${r(g - 2)} M${r(x + 7 * s)} ${r(g - 16 * s)} V${r(g - 2)}" stroke-width="${r(7 * s)}"/>`;
  // back hair
  if (style === 'long') out += `<path d="M${r(x - 19 * s)} ${r(hy - 2 * s)} Q${r(x - 23 * s)} ${r(hy + 30 * s)} ${r(x - 14 * s)} ${r(hy + 26 * s)} H${r(x + 14 * s)} Q${r(x + 23 * s)} ${r(hy + 30 * s)} ${r(x + 19 * s)} ${r(hy - 2 * s)} Z" fill="${hair}" stroke-width="3"/>`;
  if (style === 'pony') out += `<circle cx="${r(x + 20 * s)}" cy="${r(hy - 8 * s)}" r="${r(8 * s)}" fill="${hair}" stroke-width="3"/>`;
  // arms behind body when pointing across the body is not needed; draw body first
  const bw = o.w ?? 1;
  out += `<path d="M${r(x - 16 * s * bw)} ${r(g - 14 * s)} Q${r(x - 18 * s * bw)} ${r(sy)} ${r(x)} ${r(sy - 2 * s)} Q${r(x + 18 * s * bw)} ${r(sy)} ${r(x + 16 * s * bw)} ${r(g - 14 * s)} Z" fill="${shirt}"/>`;
  out += arm(o.armL ?? 'down', x, g, s, -1, skin);
  out += arm(o.armR ?? 'down', x, g, s, 1, skin);
  // head
  out += `<circle cx="${r(x)}" cy="${r(hy)}" r="${r(hr)}" fill="${skin}"/>`;
  if (style === 'curly') {
    out += `<path d="M${r(x - 18 * s)} ${r(hy + 2 * s)} Q${r(x - 24 * s)} ${r(hy - 12 * s)} ${r(x - 12 * s)} ${r(hy - 18 * s)} Q${r(x - 4 * s)} ${r(hy - 26 * s)} ${r(x + 6 * s)} ${r(hy - 20 * s)} Q${r(x + 22 * s)} ${r(hy - 20 * s)} ${r(x + 19 * s)} ${r(hy + 2 * s)} Q${r(x + 10 * s)} ${r(hy - 8 * s)} ${r(x)} ${r(hy - 7 * s)} Q${r(x - 10 * s)} ${r(hy - 8 * s)} ${r(x - 18 * s)} ${r(hy + 2 * s)} Z" fill="${hair}" stroke-width="3"/>`;
  } else {
    out += `<path d="M${r(x - 18 * s)} ${r(hy + 2 * s)} Q${r(x - 18 * s)} ${r(hy - 19 * s)} ${r(x)} ${r(hy - 19 * s)} Q${r(x + 18 * s)} ${r(hy - 19 * s)} ${r(x + 18 * s)} ${r(hy + 2 * s)} Q${r(x + 8 * s)} ${r(hy - 8 * s)} ${r(x - 2 * s)} ${r(hy - 7 * s)} Q${r(x - 12 * s)} ${r(hy - 6 * s)} ${r(x - 18 * s)} ${r(hy + 2 * s)} Z" fill="${hair}" stroke-width="3"/>`;
  }
  // eyes
  const eyes = o.eyes ?? 'open';
  if (eyes === 'open') {
    out += `<circle cx="${r(x - 6 * s)}" cy="${r(hy + 3 * s)}" r="${r(2.6 * s)}" fill="${NAVY}" stroke="none"/><circle cx="${r(x + 6 * s)}" cy="${r(hy + 3 * s)}" r="${r(2.6 * s)}" fill="${NAVY}" stroke="none"/>`;
  } else if (eyes === 'down') {
    out += `<path d="M${r(x - 9 * s)} ${r(hy + 4 * s)} Q${r(x - 6 * s)} ${r(hy + 6 * s)} ${r(x - 3 * s)} ${r(hy + 4 * s)} M${r(x + 3 * s)} ${r(hy + 4 * s)} Q${r(x + 6 * s)} ${r(hy + 6 * s)} ${r(x + 9 * s)} ${r(hy + 4 * s)}" fill="none" stroke-width="2.5"/>`;
  } else {
    const k = eyes === 'happy' ? -1 : 1;
    out += `<path d="M${r(x - 9 * s)} ${r(hy + 3 * s)} Q${r(x - 6 * s)} ${r(hy + 3 * s + k * 4 * s)} ${r(x - 3 * s)} ${r(hy + 3 * s)} M${r(x + 3 * s)} ${r(hy + 3 * s)} Q${r(x + 6 * s)} ${r(hy + 3 * s + k * 4 * s)} ${r(x + 9 * s)} ${r(hy + 3 * s)}" fill="none" stroke-width="2.5"/>`;
  }
  // cheeks
  out += `<circle cx="${r(x - 11 * s)}" cy="${r(hy + 9 * s)}" r="${r(2.8 * s)}" fill="#FFA9A0" stroke="none"/><circle cx="${r(x + 11 * s)}" cy="${r(hy + 9 * s)}" r="${r(2.8 * s)}" fill="#FFA9A0" stroke="none"/>`;
  // mouth
  const m = o.mouth ?? 'smile';
  if (m === 'big' || m === 'tongue') {
    out += `<path d="M${r(x - 7 * s)} ${r(hy + 9 * s)} Q${r(x)} ${r(hy + 20 * s)} ${r(x + 7 * s)} ${r(hy + 9 * s)} Z" fill="${PINK}" stroke-width="2.5"/>`;
    if (m === 'tongue') out += `<path d="M${r(x - 3 * s)} ${r(hy + 13 * s)} Q${r(x)} ${r(hy + 21 * s)} ${r(x + 3 * s)} ${r(hy + 13 * s)}" fill="#FF8FA0" stroke-width="2"/>`;
  } else if (m === 'flat') {
    out += `<path d="M${r(x - 4 * s)} ${r(hy + 11 * s)} H${r(x + 4 * s)}" stroke-width="2.5"/>`;
  } else {
    out += `<path d="M${r(x - 6 * s)} ${r(hy + 9 * s)} Q${r(x)} ${r(hy + 15 * s)} ${r(x + 6 * s)} ${r(hy + 9 * s)}" fill="none" stroke-width="2.5"/>`;
  }
  return out;
}

const heart = (x, y, s = 1, fill = PINK) =>
  `<path d="M${x} ${r(y + 8 * s)} C${r(x - 12 * s)} ${r(y)} ${r(x - 8 * s)} ${r(y - 10 * s)} ${x} ${r(y - 4 * s)} C${r(x + 8 * s)} ${r(y - 10 * s)} ${r(x + 12 * s)} ${r(y)} ${x} ${r(y + 8 * s)} Z" fill="${fill}" stroke-width="2.5"/>`;

const arrow = (x1, y1, x2, y2, color = NAVY) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 10;
  const p1 = [x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)];
  const p2 = [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)];
  return `<path d="M${x1} ${y1} L${x2} ${y2} M${r(p1[0])} ${r(p1[1])} L${x2} ${y2} L${r(p2[0])} ${r(p2[1])}" fill="none" stroke="${color}" stroke-width="4"/>`;
};

const measure = (x, top, bottom) =>
  `<path d="M${x} ${top} V${bottom} M${x - 6} ${top + 7} L${x} ${top} L${x + 6} ${top + 7} M${x - 6} ${bottom - 7} L${x} ${bottom} L${x + 6} ${bottom - 7} M${x - 7} ${top} H${x + 7} M${x - 7} ${bottom} H${x + 7}" fill="none" stroke-width="3"/>`;

const heightChart = () => {
  let o = '';
  for (let y = 30; y <= 130; y += 20) o += `<path d="M14 ${y} H186" stroke="#B9C2D3" stroke-width="1.5" stroke-dasharray="4 5"/>`;
  return o;
};

// A name card held above a character (fictional names from the game).
const nameCard = (x, y, text, color) =>
  `<path d="M${x - 12} ${y + 26} L${x} ${y + 34} L${x + 12} ${y + 26}" fill="none" stroke-width="2.5"/>` +
  `<rect x="${x - 28}" y="${y}" width="56" height="26" rx="8" fill="#FFFFFF" stroke-width="3"/>` +
  `<rect x="${x - 28}" y="${y}" width="10" height="26" rx="4" fill="${color}" stroke="none"/>` +
  `<text x="${x + 5}" y="${y + 19}" text-anchor="middle" font-size="17" ${FONT} fill="${NAVY}" stroke="none">${text}</text>`;

// Big close-up head for the hair faces, with an arrow pointing at the hair.
function hairHead(kind) {
  const skin = kind === 'curly' ? SKIN[2] : kind === 'short' ? SKIN[1] : SKIN[0];
  const hair = kind === 'curly' ? HAIR.black : kind === 'short' ? HAIR.brown : HAIR.ginger;
  let back = '';
  let cap = '';
  if (kind === 'long') {
    back = `<path d="M58 62 Q50 28 100 26 Q150 28 142 62 Q150 110 146 146 L118 146 Q120 120 118 104 L82 104 Q80 120 82 146 L54 146 Q50 110 58 62 Z" fill="${hair}"/>`;
    cap = `<path d="M70 74 Q66 42 100 40 Q134 42 130 74 Q120 56 104 58 Q86 56 70 74 Z" fill="${hair}" stroke-width="3"/>`;
  } else if (kind === 'short') {
    cap = `<path d="M69 70 Q66 36 100 36 Q134 36 131 70 Q128 56 118 52 Q106 58 92 54 Q78 54 69 70 Z" fill="${hair}" stroke-width="3"/>`;
  } else {
    const curls = [[66, 62], [64, 82], [72, 44], [86, 34], [102, 30], [118, 34], [132, 44], [138, 62], [138, 82], [80, 50], [100, 42], [120, 50]];
    back = curls.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="14" fill="${hair}" stroke-width="3"/>`).join('');
    cap = [[82, 52], [100, 48], [118, 52]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="10" fill="${hair}" stroke-width="2.5"/>`).join('');
  }
  return (
    halo(100, 82, 74, 64, HALO.looks) +
    back +
    `<path d="M80 108 Q80 124 74 132 L126 132 Q120 124 120 108 Z" fill="${skin}"/>` +
    `<path d="M60 146 Q64 126 100 126 Q136 126 140 146 Z" fill="${MINT}"/>` +
    `<circle cx="100" cy="78" r="32" fill="${skin}"/>` +
    cap +
    `<circle cx="89" cy="82" r="3.4" fill="${NAVY}" stroke="none"/><circle cx="111" cy="82" r="3.4" fill="${NAVY}" stroke="none"/>` +
    `<circle cx="80" cy="92" r="4" fill="#FFA9A0" stroke="none"/><circle cx="120" cy="92" r="4" fill="#FFA9A0" stroke="none"/>` +
    `<path d="M90 94 Q100 102 110 94" fill="none" stroke-width="3"/>` +
    arrow(188, 14, kind === 'curly' ? 150 : 140, kind === 'curly' ? 40 : 46)
  );
}

// ---------- WHO: the person the subject refers to stands in a blue halo.
// The speaker is marked with a speech bubble.
const who = {
  'who-he': svg(
    halo(152, 92, 38, 54, HALO.who) +
      bubble(82, 12, 40, 24, '…') +
      ground() +
      person(30, 140, { s: 0.8, skin: SKIN[2], hair: HAIR.black, style: 'curly' }) +
      person(72, 140, { s: 0.8, armR: 'point', style: 'pony', hair: HAIR.brown }) +
      person(152, 140, { shirt: BLUE, style: 'short', hair: HAIR.black, skin: SKIN[1] }),
  ),
  'who-she': svg(
    halo(152, 92, 38, 54, HALO.who) +
      bubble(82, 12, 40, 24, '…') +
      ground() +
      person(30, 140, { s: 0.8, skin: SKIN[2], hair: HAIR.black, style: 'curly' }) +
      person(72, 140, { s: 0.8, armR: 'point', hair: HAIR.brown }) +
      person(152, 140, { shirt: BLUE, style: 'pony', hair: HAIR.blond }),
  ),
  'who-lan': svg(
    halo(100, 96, 46, 50, HALO.who) +
      nameCard(100, 4, 'Lan', BLUE) +
      ground() +
      person(100, 140, { shirt: BLUE, style: 'pony', hair: HAIR.black, armL: 'wave', mouth: 'big' }),
  ),
  'who-nam': svg(
    halo(100, 96, 46, 50, HALO.who) +
      nameCard(100, 4, 'Nam', BLUE) +
      ground() +
      person(100, 140, { shirt: BLUE, style: 'short', hair: HAIR.black, skin: SKIN[1], armR: 'wave', mouth: 'big' }),
  ),
  'who-best-friend': svg(
    halo(128, 92, 40, 54, HALO.who) +
      bubble(14, 8, 40, 24, '…', 'right') +
      heart(100, 30, 1.3) +
      ground() +
      person(72, 140, { armR: 'low', armL: 'chest', style: 'curly', hair: HAIR.brown, mouth: 'big' }) +
      person(128, 140, { shirt: BLUE, armL: 'low', armR: 'wave', style: 'pony', hair: HAIR.black, skin: SKIN[2], mouth: 'big' }),
  ),
  'who-classmate': svg(
    `<rect x="40" y="8" width="120" height="50" rx="6" fill="#2F5D50" stroke-width="4"/>` +
      `<text x="100" y="42" text-anchor="middle" font-size="22" ${FONT} fill="#FFFFFF" stroke="none">Class 6A</text>` +
      halo(146, 100, 36, 46, HALO.who) +
      bubble(8, 64, 34, 22, '…', 'right') +
      ground() +
      person(58, 140, { s: 0.88, armR: 'point', style: 'short', hair: HAIR.brown, shirt: '#FFFFFF' }) +
      person(146, 140, { s: 0.88, shirt: BLUE, style: 'long', hair: HAIR.black, skin: SKIN[1] }) +
      `<rect x="160" y="100" width="16" height="22" rx="4" fill="${ORANGE}" stroke-width="3"/>`,
  ),
};

// ---------- LOOKS: the child who shows the feature stands in a mint halo.
const looks = {
  'looks-tall': svg(
    heightChart() +
      halo(82, 80, 36, 64, HALO.looks) +
      ground() +
      measure(34, 18, 140) +
      person(82, 140, { s: 1.24, shirt: MINT, style: 'short', hair: HAIR.black, skin: SKIN[1] }) +
      person(146, 140, { s: 0.74, style: 'pony', hair: HAIR.brown }),
  ),
  'looks-short': svg(
    heightChart() +
      halo(146, 106, 30, 38, HALO.looks) +
      ground() +
      measure(178, 68, 140) +
      person(82, 140, { s: 1.24, style: 'short', hair: HAIR.black, skin: SKIN[1] }) +
      person(146, 140, { s: 0.74, shirt: MINT, style: 'pony', hair: HAIR.brown }),
  ),
  'looks-slim': svg(
    halo(70, 88, 32, 58, HALO.looks) +
      ground() +
      person(70, 140, { s: 1.12, w: 0.68, shirt: MINT, style: 'long', hair: HAIR.brown }) +
      `<path d="M54 114 H86" stroke="${NAVY}" stroke-width="2.5" stroke-dasharray="3 4"/>` +
      `<path d="M50 108 L44 114 L50 120 M90 108 L96 114 L90 120" fill="none" stroke-width="2.5"/>` +
      person(146, 140, { s: 1, style: 'short', hair: HAIR.ginger, skin: SKIN[1] }),
  ),
  'looks-long-hair': svg(hairHead('long')),
  'looks-short-hair': svg(hairHead('short')),
  'looks-curly-hair': svg(hairHead('curly')),
};

// ---------- PERSONALITY: shown through actions, in an orange halo.
const personality = {
  'personality-kind': svg(
    halo(78, 92, 40, 54, HALO.personality) +
      heart(118, 22, 1.1) +
      ground() +
      `<rect x="150" y="128" width="26" height="10" rx="2" fill="${BLUE}" stroke-width="3" transform="rotate(-12 163 133)"/>` +
      `<rect x="168" y="130" width="22" height="9" rx="2" fill="${MINT}" stroke-width="3" transform="rotate(10 179 134)"/>` +
      person(78, 140, { shirt: ORANGE, armR: 'reach', style: 'pony', hair: HAIR.brown }) +
      `<path d="M134 140 Q132 120 146 116 Q160 118 160 140 Z" fill="${NEUTRAL}"/>` +
      `<path d="M138 138 H174" stroke-width="7"/>` +
      arm('reach', 148, 152, 0.8, -1, SKIN[1]) +
      `<circle cx="148" cy="96" r="14" fill="${SKIN[1]}"/>` +
      `<path d="M134 97 Q134 82 148 82 Q162 82 162 97 Q154 89 147 90 Q139 90 134 97 Z" fill="${HAIR.black}" stroke-width="3"/>` +
      `<circle cx="143" cy="98" r="2.2" fill="${NAVY}" stroke="none"/><circle cx="153" cy="98" r="2.2" fill="${NAVY}" stroke="none"/>` +
      `<path d="M144 106 Q148 103 152 106" fill="none" stroke-width="2.5"/>`,
  ),
  'personality-funny': svg(
    halo(68, 90, 42, 56, HALO.personality) +
      ground() +
      person(68, 140, { shirt: ORANGE, armL: 'up', armR: 'up', mouth: 'tongue', style: 'short', hair: HAIR.ginger }) +
      `<circle cx="68" cy="66" r="5" fill="${PINK}" stroke-width="2.5"/>` +
      `<path d="M56 46 L68 18 L80 46 Z" fill="${MINT}" stroke-width="3"/><circle cx="68" cy="17" r="4" fill="${BLUE}" stroke-width="2.5"/>` +
      person(150, 140, { s: 0.92, eyes: 'happy', mouth: 'big', armR: 'chest', style: 'long', hair: HAIR.black, skin: SKIN[2] }) +
      `<text x="166" y="34" text-anchor="middle" font-size="18" ${FONT} fill="${NAVY}" stroke="none" transform="rotate(-10 166 34)">ha ha!</text>`,
  ),
  'personality-friendly': svg(
    halo(68, 92, 40, 54, HALO.personality) +
      bubble(88, 8, 40, 26, 'Hi!') +
      ground() +
      person(68, 140, { shirt: ORANGE, armR: 'wave', mouth: 'big', style: 'curly', skin: SKIN[2], hair: HAIR.black }) +
      person(148, 140, { s: 0.92, armL: 'wave', style: 'long', hair: HAIR.ginger }),
  ),
  'personality-creative': svg(
    halo(58, 92, 40, 54, HALO.personality) +
      ground() +
      `<path d="M128 140 L140 92 M176 140 L164 92 M152 140 V92" stroke-width="4"/>` +
      `<rect x="112" y="22" width="80" height="70" rx="4" fill="#FFFFFF" stroke-width="4"/>` +
      `<circle cx="170" cy="40" r="9" fill="#FFD25A" stroke-width="2.5"/>` +
      `<path d="M120 84 L140 58 L156 74 L166 64 L184 84 Z" fill="${MINT}" stroke-width="2.5"/>` +
      `<path d="M124 46 Q132 38 140 46 Q148 54 156 46" fill="none" stroke="${BLUE}" stroke-width="4"/>` +
      person(58, 140, { shirt: ORANGE, armR: 'point', armL: 'reach', style: 'pony', hair: HAIR.brown, mouth: 'big' }) +
      `<path d="M104 86 L116 70" stroke-width="4"/><path d="M116 70 L120 64" stroke="${PINK}" stroke-width="6"/>` +
      `<ellipse cx="22" cy="104" rx="16" ry="10" fill="#E9C79A" stroke-width="3"/>` +
      `<circle cx="16" cy="101" r="3" fill="${BLUE}" stroke="none"/><circle cx="24" cy="98" r="3" fill="${PINK}" stroke="none"/><circle cx="30" cy="104" r="3" fill="${MINT}" stroke="none"/>` +
      `<path d="M44 14 l3 -7 l3 7 l-3 7 Z M90 22 l3 -7 l3 7 l-3 7 Z" fill="#FFD25A" stroke-width="2"/>`,
  ),
  'personality-confident': svg(
    halo(96, 84, 44, 60, HALO.personality) +
      `<rect x="40" y="128" width="112" height="14" rx="4" fill="#E9C79A" stroke-width="3"/>` +
      person(96, 128, { shirt: ORANGE, armR: 'wave', armL: 'chest', style: 'short', hair: HAIR.black, skin: SKIN[1], mouth: 'big' }) +
      `<path d="M124 46 L131 28" stroke-width="5"/><circle cx="133" cy="22" r="7" fill="${NEUTRAL}" stroke-width="3"/>` +
      `<circle cx="126" cy="42" r="5.5" fill="${SKIN[1]}" stroke-width="3"/>` +
      `<circle cx="20" cy="138" r="10" fill="${SKIN[2]}" stroke-width="3"/><circle cx="176" cy="138" r="10" fill="${SKIN[0]}" stroke-width="3"/>` +
      `<path d="M10 136 Q12 124 20 124 Q28 124 30 136 Q24 130 20 130 Q14 130 10 136 Z" fill="${HAIR.black}" stroke-width="2.5"/>` +
      `<path d="M166 136 Q168 124 176 124 Q184 124 186 136 Q180 130 176 130 Q170 130 166 136 Z" fill="${HAIR.brown}" stroke-width="2.5"/>` +
      `<path d="M30 30 l4 -9 l4 9 l-4 9 Z M160 54 l4 -9 l4 9 l-4 9 Z" fill="#FFD25A" stroke-width="2"/>`,
  ),
  'personality-hard-working': svg(
    halo(92, 78, 60, 56, HALO.personality) +
      `<path d="M160 104 V70 L176 50" fill="none" stroke-width="4"/><path d="M168 42 L188 54 L178 64 Z" fill="#FFD25A" stroke-width="3"/>` +
      `<path d="M150 104 H172" stroke-width="5"/>` +
      person(92, 150, { shirt: ORANGE, armR: 'reach', armL: 'reach', style: 'long', hair: HAIR.black, skin: SKIN[2], eyes: 'down', mouth: 'flat' }) +
      `<rect x="20" y="104" width="164" height="12" rx="4" fill="#C98E5A" stroke-width="4"/>` +
      `<path d="M34 116 V146 M170 116 V146" stroke-width="5"/>` +
      `<path d="M74 104 L80 92 L104 94 L104 104 Z M104 104 L104 94 L128 92 L134 104 Z" fill="#FFFFFF" stroke-width="3"/>` +
      `<path d="M112 98 L124 88" stroke="${NAVY}" stroke-width="4"/><path d="M124 88 L128 84" stroke="#FFD25A" stroke-width="4"/>` +
      `<rect x="24" y="96" width="38" height="8" rx="2" fill="${PINK}" stroke-width="3"/><rect x="26" y="88" width="34" height="8" rx="2" fill="${BLUE}" stroke-width="3"/><rect x="30" y="80" width="30" height="8" rx="2" fill="${MINT}" stroke-width="3"/>`,
  ),
};

mkdirSync(OUT, { recursive: true });
let count = 0;
for (const faces of [who, looks, personality]) {
  for (const [id, content] of Object.entries(faces)) {
    writeFileSync(join(OUT, `${id}.svg`), content);
    count++;
  }
}
console.log(`Wrote ${count} illustrations to ${OUT}`);
