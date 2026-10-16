import { NET, type EdgeDir } from './net';

/**
 * A4 printable sheet (landscape, millimetres) for one cube: the proposal's net
 * with glue tabs, printed faces, cut/fold lines and a 10 cm calibration ruler.
 * Layout is pure geometry so it can be unit-tested; drawing lives in printRender.ts.
 */

export const A4 = { width: 297, height: 210 } as const;
const MARGIN_X = 14;
const HEADER = 16; // top band for the title and legend
const BOTTOM = 10;
export const RULER_MM = 100;

/** Grid position (column, row) of each net square, same arrangement as the 3D model. */
export const NET_GRID: Record<string, [number, number]> = { L: [0, 1], B0: [1, 1], R: [2, 1], U: [3, 1], T: [1, 0], F: [1, 2] };

export interface Pt {
  x: number;
  y: number;
}

export interface SheetSquare {
  id: string;
  slot: (typeof NET)[number]['slot'];
  x: number;
  y: number;
  /** Clockwise rotation (degrees) that makes the printed text upright once folded. */
  rotation: number;
}

export interface SheetTab {
  square: string;
  dir: EdgeDir;
  /** Trapezoid: hinge edge first (p0 → p1), then the free edge (p2 → p3). */
  points: [Pt, Pt, Pt, Pt];
}

export interface Segment {
  a: Pt;
  b: Pt;
}

export interface SheetLayout {
  /** Edge length and tab width in mm. */
  edge: number;
  tab: number;
  squares: SheetSquare[];
  tabs: SheetTab[];
  cuts: Segment[];
  folds: Segment[];
  bounds: { x: number; y: number; width: number; height: number };
  ruler: { x: number; y1: number; y2: number };
  fits: boolean;
}

const ROTATION: Record<EdgeDir, number> = { '-z': 0, '+x': 90, '+z': 180, '-x': -90 };

/** Edge of square (col,row) in direction `dir`, as two points in mm. */
function edgeOf(x: number, y: number, a: number, dir: EdgeDir): Segment {
  switch (dir) {
    case '-z': return { a: { x, y }, b: { x: x + a, y } };
    case '+z': return { a: { x, y: y + a }, b: { x: x + a, y: y + a } };
    case '-x': return { a: { x, y }, b: { x, y: y + a } };
    case '+x': return { a: { x: x + a, y }, b: { x: x + a, y: y + a } };
  }
}

const NEIGHBOUR: Record<EdgeDir, [number, number]> = { '+x': [1, 0], '-x': [-1, 0], '+z': [0, 1], '-z': [0, -1] };
const OUTWARD: Record<EdgeDir, Pt> = { '+x': { x: 1, y: 0 }, '-x': { x: -1, y: 0 }, '+z': { x: 0, y: 1 }, '-z': { x: 0, y: -1 } };

export function sheetLayout(edgeCm: number, tabCm: number): SheetLayout {
  const a = edgeCm * 10;
  const w = tabCm * 10;
  const netWidth = 4 * a + w; // the fourth square carries a tab on its far edge
  const netHeight = 3 * a; // other tabs stay inside the 3-row band
  const x0 = MARGIN_X;
  const y0 = HEADER + Math.max(0, (A4.height - HEADER - BOTTOM - netHeight) / 2);
  const occupied = new Set(Object.values(NET_GRID).map(([c, r]) => `${c},${r}`));

  const squares: SheetSquare[] = [];
  const tabs: SheetTab[] = [];
  const cuts: Segment[] = [];
  const folds: Segment[] = [];
  const seenFolds = new Set<string>();

  for (const sq of NET) {
    const [c, r] = NET_GRID[sq.id];
    const x = x0 + c * a;
    const y = y0 + r * a;
    squares.push({ id: sq.id, slot: sq.slot, x, y, rotation: ROTATION[sq.textUp] });

    for (const dir of ['-z', '+z', '-x', '+x'] as EdgeDir[]) {
      const seg = edgeOf(x, y, a, dir);
      const [dc, dr] = NEIGHBOUR[dir];
      const shared = occupied.has(`${c + dc},${r + dr}`);
      if (shared) {
        const key = [seg.a, seg.b].map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).sort().join('|');
        if (!seenFolds.has(key)) {
          seenFolds.add(key);
          folds.push(seg);
        }
      } else if (sq.tabs.includes(dir)) {
        folds.push(seg);
        const o = OUTWARD[dir];
        const inset = Math.min(w, a * 0.2);
        const along = { x: (seg.b.x - seg.a.x) / a, y: (seg.b.y - seg.a.y) / a };
        const p2 = { x: seg.b.x + o.x * w - along.x * inset, y: seg.b.y + o.y * w - along.y * inset };
        const p3 = { x: seg.a.x + o.x * w + along.x * inset, y: seg.a.y + o.y * w + along.y * inset };
        tabs.push({ square: sq.id, dir, points: [seg.a, seg.b, p2, p3] });
        cuts.push({ a: seg.b, b: p2 }, { a: p2, b: p3 }, { a: p3, b: seg.a });
      } else {
        cuts.push(seg);
      }
    }
  }

  const ruler = { x: A4.width - MARGIN_X, y1: y0, y2: y0 + RULER_MM };
  const fits = x0 + netWidth <= ruler.x - 12 && y0 + netHeight <= A4.height - BOTTOM + 2;
  return { edge: a, tab: w, squares, tabs, cuts, folds, bounds: { x: x0, y: y0, width: netWidth, height: netHeight }, ruler, fits };
}
