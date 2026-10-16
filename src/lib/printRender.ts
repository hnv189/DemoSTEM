import type { AnyCube } from '../content/vocabulary';
import { CUBES } from '../content/vocabulary';
import { drawFace, fontsReady, loadImage } from './faceTextures';
import { A4, RULER_MM, sheetLayout, type SheetLayout } from './printSheet';

export interface PrintOptions {
  edgeCm: number;
  tabCm: number;
  /** White squares with coloured borders instead of solid colour. */
  inkSaver: boolean;
}

const NAVY = '#17233B';
const SLATE = '#596579';
const DISPLAY = '"Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
const BODY = '"Nunito", "Segoe UI", system-ui, sans-serif';
const fmt = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Art images are loaded once and reused for previews and exports. */
let artCache: Promise<Map<string, HTMLImageElement | null>> | null = null;
export function loadPrintAssets() {
  if (!artCache) {
    artCache = (async () => {
      await fontsReady();
      const entries = await Promise.all(CUBES.flatMap((c) => c.faces.map(async (f) => [f.id, await loadImage(f.art)] as const)));
      return new Map(entries);
    })();
  }
  return artCache;
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/**
 * Draws one A4 landscape sheet onto `canvas` at `pxPerMm` pixels per millimetre.
 * All geometry is in millimetres, so the printed edge equals the chosen length.
 */
export function renderSheet(canvas: HTMLCanvasElement, cube: AnyCube, opts: PrintOptions, pxPerMm: number, art: Map<string, HTMLImageElement | null>): SheetLayout {
  const layout = sheetLayout(opts.edgeCm, opts.tabCm);
  const a = layout.edge;
  canvas.width = Math.round(A4.width * pxPerMm);
  canvas.height = Math.round(A4.height * pxPerMm);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(pxPerMm, 0, 0, pxPerMm, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ---- header
  ctx.fillStyle = NAVY;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `800 5.2px ${DISPLAY}`;
  ctx.fillText(`MAGIC ENGLISH CUBES · Khối ${cube.number} – ${cube.label}`, 14, 10);
  ctx.font = `700 3px ${BODY}`;
  ctx.fillStyle = SLATE;
  ctx.fillText(`Cạnh a = ${fmt(opts.edgeCm)} cm · tai dán ${fmt(opts.tabCm)} cm · In khổ A4 ngang, tỷ lệ 100%`, 14, 14);

  // legend (right side of header)
  const lx = 190;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 0.45;
  ctx.setLineDash([]);
  line(ctx, lx, 8.8, lx + 8, 8.8);
  ctx.fillStyle = NAVY;
  ctx.font = `700 3px ${BODY}`;
  ctx.fillText('Cắt', lx + 10, 9.8);
  ctx.setLineDash([1.6, 1.2]);
  line(ctx, lx + 22, 8.8, lx + 30, 8.8);
  ctx.setLineDash([]);
  ctx.fillText('Gấp', lx + 32, 9.8);
  ctx.fillStyle = '#EAD8BA';
  ctx.fillRect(lx + 45, 7.2, 8, 3.2);
  ctx.strokeRect(lx + 45, 7.2, 8, 3.2);
  ctx.fillStyle = NAVY;
  ctx.fillText('Bôi keo', lx + 55, 9.8);
  ctx.fillStyle = SLATE;
  ctx.font = `600 2.6px ${BODY}`;
  ctx.fillText('Gấp các nếp về phía sau (mặt in ở ngoài), dán tai vào bên trong.', lx, 14);

  // ---- glue tabs
  for (const t of layout.tabs) {
    const [p0, p1, p2, p3] = t.points;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = '#EAD8BA';
    ctx.fill();
    // label along the tab
    const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
    const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
    const vertical = Math.abs(p1.x - p0.x) < 1e-6;
    ctx.save();
    ctx.translate(cx, cy);
    if (vertical) ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#8A6A40';
    ctx.font = `700 ${Math.min(2.6, layout.tab * 0.38)}px ${BODY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BÔI KEO', 0, 0);
    ctx.restore();
  }

  // ---- printed squares
  const panel = a * 0.9;
  const facePx = Math.max(64, Math.round(panel * pxPerMm));
  for (const sq of layout.squares) {
    const faceIndex = cube.faces.findIndex((f) => f.slot === sq.slot);
    const face = cube.faces[faceIndex];
    ctx.fillStyle = opts.inkSaver ? '#FFFFFF' : cube.color;
    ctx.fillRect(sq.x, sq.y, a, a);
    if (opts.inkSaver) {
      ctx.strokeStyle = cube.color;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.strokeRect(sq.x + 1.2, sq.y + 1.2, a - 2.4, a - 2.4);
    }
    const off = document.createElement('canvas');
    drawFace(off, face.text, art.get(face.id) ?? null, cube.color, 11 + cube.number * 7 + faceIndex, facePx);
    ctx.save();
    ctx.translate(sq.x + a / 2, sq.y + a / 2);
    ctx.rotate((sq.rotation * Math.PI) / 180);
    ctx.drawImage(off, -panel / 2, -panel / 2, panel, panel);
    ctx.restore();
  }

  // ---- cut and fold lines
  ctx.strokeStyle = NAVY;
  ctx.setLineDash([]);
  ctx.lineWidth = 0.45;
  for (const s of layout.cuts) line(ctx, s.a.x, s.a.y, s.b.x, s.b.y);
  ctx.setLineDash([1.6, 1.2]);
  ctx.lineWidth = 0.35;
  ctx.strokeStyle = SLATE;
  for (const s of layout.folds) line(ctx, s.a.x, s.a.y, s.b.x, s.b.y);
  ctx.setLineDash([]);

  // ---- calibration ruler (10 cm)
  const { x, y1 } = layout.ruler;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 0.4;
  line(ctx, x, y1, x, y1 + RULER_MM);
  for (let mm = 0; mm <= RULER_MM; mm += 5) {
    const len = mm % 10 === 0 ? 3 : 1.6;
    line(ctx, x - len, y1 + mm, x, y1 + mm);
    if (mm % 10 === 0) {
      ctx.fillStyle = NAVY;
      ctx.font = `700 2.2px ${BODY}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(mm / 10), x - 3.6, y1 + mm);
    }
  }
  ctx.save();
  ctx.translate(x + 3.2, y1 + RULER_MM / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = SLATE;
  ctx.font = `700 2.5px ${BODY}`;
  ctx.fillText('Thước kiểm tra: đoạn này phải dài đúng 10 cm', 0, 0);
  ctx.restore();

  return layout;
}

/** Renders every chosen cube at print resolution and returns JPEG data URLs. */
export async function renderPrintPages(cubeIndexes: number[], opts: PrintOptions, dpi = 300) {
  const art = await loadPrintAssets();
  const pxPerMm = dpi / 25.4;
  return cubeIndexes.map((i) => {
    const canvas = document.createElement('canvas');
    renderSheet(canvas, CUBES[i], opts, pxPerMm, art);
    return canvas.toDataURL('image/jpeg', 0.92);
  });
}

/** Builds and downloads an A4 landscape PDF where 1 mm on paper = 1 mm in the layout. */
export async function downloadPdf(cubeIndexes: number[], opts: PrintOptions) {
  const [{ jsPDF }, pages] = await Promise.all([import('jspdf'), renderPrintPages(cubeIndexes, opts)]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  pages.forEach((url, i) => {
    if (i > 0) doc.addPage('a4', 'landscape');
    doc.addImage(url, 'JPEG', 0, 0, A4.width, A4.height, undefined, 'FAST');
  });
  doc.setProperties({ title: 'Magic English Cubes – mẫu in A4', subject: `Cạnh ${opts.edgeCm} cm` });
  doc.save(`magic-english-cubes-a${String(opts.edgeCm).replace('.', '_')}cm.pdf`);
}
