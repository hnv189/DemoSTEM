import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import type { AnyCube } from '../content/vocabulary';

const SIZE = 512;
const NAVY = '#17233B';
const DISPLAY = '"Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';

export interface FaceTextureResult {
  textures: CanvasTexture[][];
  /** Art files that could not be loaded; those faces print the words only. */
  failed: string[];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function fontsReady() {
  if (!('fonts' in document)) return;
  const wait = Promise.all([document.fonts.load(`800 96px ${DISPLAY}`), document.fonts.load('700 32px "Nunito"')]);
  await Promise.race([wait, new Promise((r) => setTimeout(r, 2500))]);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Deterministic speckle so every print looks like the same paper stock. */
function paperGrain(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, dark: string, light: string, count: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = rand() > 0.5 ? dark : light;
    const size = 0.6 + rand() * 1.8;
    ctx.fillRect(rand() * w, rand() * h, size, size * (0.4 + rand()));
  }
}

/** Split a phrase into at most two lines that fit `maxWidth` at the largest possible size. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  for (let size = 104; size >= 52; size -= 4) {
    ctx.font = `800 ${size}px ${DISPLAY}`;
    if (ctx.measureText(text).width <= maxWidth) return { size, lines: [text] };
  }
  const words = text.split(' ');
  let best = { size: 52, lines: [text] };
  for (let cut = 1; cut < words.length; cut++) {
    const lines = [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
    for (let size = 84; size >= 48; size -= 4) {
      ctx.font = `800 ${size}px ${DISPLAY}`;
      if (lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
        if (size > best.size || best.lines.length === 1) best = { size, lines };
        break;
      }
    }
  }
  return best;
}

/** One printed face: paper panel, words on top, illustration below. */
export function drawFace(canvas: HTMLCanvasElement, text: string, art: HTMLImageElement | null, accent: string, seed: number) {
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, SIZE, SIZE);

  roundRect(ctx, 6, 6, SIZE - 12, SIZE - 12, 40);
  ctx.fillStyle = '#FFFDF8';
  ctx.fill();
  ctx.save();
  ctx.clip();
  paperGrain(ctx, SIZE, SIZE, seed, 'rgba(120,96,60,0.10)', 'rgba(255,255,255,0.7)', 2600);
  ctx.restore();
  ctx.lineWidth = 7;
  ctx.strokeStyle = accent;
  roundRect(ctx, 6, 6, SIZE - 12, SIZE - 12, 40);
  ctx.stroke();

  const { size, lines } = fitText(ctx, text, SIZE - 70);
  ctx.font = `800 ${size}px ${DISPLAY}`;
  ctx.fillStyle = NAVY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const lineHeight = size * 0.92;
  const firstBaseline = lines.length === 1 ? 118 : 86;
  lines.forEach((l, i) => ctx.fillText(l, SIZE / 2, firstBaseline + i * lineHeight));
  const textBottom = firstBaseline + (lines.length - 1) * lineHeight;

  roundRect(ctx, SIZE / 2 - 40, textBottom + 14, 80, 10, 5);
  ctx.fillStyle = accent;
  ctx.fill();

  const top = textBottom + 34;
  const availH = SIZE - 20 - top;
  const w = Math.min(SIZE - 56, (availH * 200) / 150);
  const h = (w * 150) / 200;
  if (art) {
    ctx.drawImage(art, (SIZE - w) / 2, top + (availH - h) / 2, w, h);
  } else {
    ctx.fillStyle = '#596579';
    ctx.font = `700 28px "Nunito", system-ui, sans-serif`;
    ctx.fillText('(chưa có hình)', SIZE / 2, top + availH / 2);
  }
}

export async function buildFaceTextures(cubes: readonly AnyCube[], onProgress?: (done: number, total: number) => void): Promise<FaceTextureResult> {
  await fontsReady();
  const total = cubes.reduce((n, c) => n + c.faces.length, 0);
  let done = 0;
  const failed: string[] = [];
  const textures = await Promise.all(
    cubes.map((cube, ci) =>
      Promise.all(
        cube.faces.map(async (face, fi) => {
          const img = await loadImage(face.art);
          if (!img) failed.push(face.art);
          const canvas = document.createElement('canvas');
          drawFace(canvas, face.text, img, cube.color, 11 + ci * 7 + fi);
          const tex = new CanvasTexture(canvas);
          tex.colorSpace = SRGBColorSpace;
          tex.anisotropy = 8;
          onProgress?.(++done, total);
          return tex;
        }),
      ),
    ),
  );
  return { textures, failed };
}

/** Pastel printed cardboard for the cube body: base colour with fibre speckle. */
export function makeCardboardTexture(color: string, seed = 3): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  paperGrain(ctx, 256, 256, seed, 'rgba(60,40,20,0.12)', 'rgba(255,255,255,0.22)', 2200);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}

/** Unprinted recycled kraft board (inside of the net). */
export function makeKraftTexture(seed = 5): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#C9A57A';
  ctx.fillRect(0, 0, 256, 256);
  paperGrain(ctx, 256, 256, seed, 'rgba(90,60,30,0.22)', 'rgba(240,215,175,0.35)', 4000);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}

/** Light-oak tabletop grain. */
export function makeWoodTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#E8CA9C';
  ctx.fillRect(0, 0, c.width, c.height);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const y0 = rand() * c.height;
    const amp = 2 + rand() * 6;
    const freq = 0.004 + rand() * 0.01;
    ctx.beginPath();
    for (let x = 0; x <= c.width; x += 8) {
      const y = y0 + Math.sin(x * freq + i) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(196,148,92,0.3)' : 'rgba(250,228,192,0.5)';
    ctx.lineWidth = 1 + rand() * 3;
    ctx.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
