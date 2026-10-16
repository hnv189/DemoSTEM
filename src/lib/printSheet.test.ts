import { describe, expect, it } from 'vitest';
import { A4, RULER_MM, sheetLayout } from './printSheet';
import { NET, TAB_COUNT } from './net';

const len = (s: { a: { x: number; y: number }; b: { x: number; y: number } }) => Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);

describe('A4 printable sheet', () => {
  it.each([[5, 0.7], [5.5, 1], [6, 1]])('fits A4 landscape (a = %s cm, tab = %s cm)', (a, t) => {
    const l = sheetLayout(a, t);
    expect(l.fits).toBe(true);
    expect(l.bounds.x).toBeGreaterThanOrEqual(10);
    expect(l.bounds.y + l.bounds.height).toBeLessThanOrEqual(A4.height - 8);
    expect(l.bounds.x + l.bounds.width).toBeLessThan(l.ruler.x);
  });

  it('every square edge is exactly a, in millimetres', () => {
    const l = sheetLayout(6, 1);
    expect(l.edge).toBe(60);
    const squareEdges = [...l.folds.filter((s) => Math.abs(len(s) - 60) < 1e-9), ...l.cuts.filter((s) => Math.abs(len(s) - 60) < 1e-9)];
    // 6 squares × 4 edges, shared hinges counted once: 24 − 5 = 19
    expect(squareEdges).toHaveLength(19);
  });

  it('has 5 fold hinges between squares, 7 glue tabs and a closed cut outline', () => {
    const l = sheetLayout(6, 1);
    expect(l.tabs).toHaveLength(TAB_COUNT);
    expect(l.folds).toHaveLength(NET.length - 1 + TAB_COUNT);
    // Every cut endpoint is shared by exactly two cut segments (closed loop).
    const ends = new Map<string, number>();
    for (const s of l.cuts) for (const p of [s.a, s.b]) {
      const k = `${p.x.toFixed(4)},${p.y.toFixed(4)}`;
      ends.set(k, (ends.get(k) ?? 0) + 1);
    }
    expect([...ends.values()].every((n) => n === 2)).toBe(true);
  });

  it('tabs are as wide as requested and do not overlap squares', () => {
    const l = sheetLayout(6, 0.8);
    for (const t of l.tabs) {
      const [p0, p1, p2] = t.points;
      const hinge = { x: p1.x - p0.x, y: p1.y - p0.y };
      const depth = Math.abs((p2.x - p1.x) * hinge.y - (p2.y - p1.y) * hinge.x) / Math.hypot(hinge.x, hinge.y);
      expect(depth).toBeCloseTo(8, 9);
    }
  });

  it('prints text with the same orientation as the 3D net', () => {
    const l = sheetLayout(6, 1);
    const byId = Object.fromEntries(l.squares.map((s) => [s.id, s.rotation]));
    expect(byId).toEqual({ B0: 0, L: 90, R: -90, T: 180, F: 0, U: -90 });
  });

  it('includes a 10 cm calibration ruler', () => {
    const l = sheetLayout(5, 0.7);
    expect(l.ruler.y2 - l.ruler.y1).toBe(RULER_MM);
    expect(RULER_MM).toBe(100);
  });
});
