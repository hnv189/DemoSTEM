import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { NET, TAB_COUNT, netMeasurements, netPlacement, squareCorners, squareMatrices } from './net';

const key = (v: Vector3) => [v.x, v.y, v.z].map((n) => Math.round(n * 1e6) / 1e6).join(',');

describe('cube net', () => {
  it('is the proposal net: 4 in a row, one above and one below the second square', () => {
    const flat = squareMatrices(6, 0);
    const centres = Object.fromEntries(NET.map((s) => [s.id, new Vector3().applyMatrix4(flat[s.id])]));
    expect(key(centres.L)).toBe(key(new Vector3(-6, 0, 0)));
    expect(key(centres.B0)).toBe(key(new Vector3(0, 0, 0)));
    expect(key(centres.R)).toBe(key(new Vector3(6, 0, 0)));
    expect(key(centres.U)).toBe(key(new Vector3(12, 0, 0)));
    expect(key(centres.T)).toBe(key(new Vector3(0, 0, -6)));
    expect(key(centres.F)).toBe(key(new Vector3(0, 0, 6)));
  });

  it.each([5, 5.5, 6])('folds into a closed cube (a = %s cm)', (a) => {
    const mats = squareMatrices(a, Math.PI / 2);
    const vertices = new Set<string>();
    const edges = new Set<string>();
    const centre = new Vector3(0, -a / 2, 0);
    const slots = new Set<string>();
    for (const sq of NET) {
      const corners = squareCorners(a).map((c) => c.clone().applyMatrix4(mats[sq.id]));
      corners.forEach((c) => vertices.add(key(c)));
      corners.forEach((c, i) => {
        const pair = [key(c), key(corners[(i + 1) % 4])].sort().join('|');
        edges.add(pair);
      });
      // Each face sits a/2 from the cube centre, and its outward side faces away from it.
      const mid = new Vector3().applyMatrix4(mats[sq.id]);
      expect(mid.distanceTo(centre)).toBeCloseTo(a / 2, 6);
      const normal = new Vector3(0, 1, 0).transformDirection(mats[sq.id]);
      expect(normal.dot(mid.clone().sub(centre).normalize())).toBeCloseTo(1, 6);
      slots.add(sq.slot);
    }
    expect(vertices.size).toBe(8);
    expect(edges.size).toBe(12);
    expect(slots.size).toBe(6);
  });

  it('has a glue tab for every seam that is not a fold', () => {
    expect(TAB_COUNT).toBe(12 - (NET.length - 1));
  });

  it('rests on the table at every fold step', () => {
    for (const t of [0, 0.3, 0.7, 1]) {
      const angle = (t * Math.PI) / 2;
      const lift = netPlacement(6, angle);
      const mats = squareMatrices(6, angle);
      let minY = Infinity;
      for (const sq of NET) for (const c of squareCorners(6)) minY = Math.min(minY, c.applyMatrix4(mats[sq.id]).y + lift.y);
      expect(minY).toBeCloseTo(0, 6);
    }
  });

  it('surface area is 6a² before tabs', () => {
    expect(netMeasurements(6, 1).cubeArea).toBe(216);
    expect(netMeasurements(5, 1).cubeArea).toBe(150);
    expect(netMeasurements(6, 1).tabArea).toBeGreaterThan(0);
  });
});
