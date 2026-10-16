import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { CUBES, faceIndexForSlot } from '../content/vocabulary';
import { SLOTS, SLOT_FRAMES, detectTopSlot, panelQuaternion, restQuaternion } from './orientation';

const close = (a: Vector3, b: Vector3) => a.distanceTo(b) < 1e-6;

describe('cube configuration', () => {
  it.each(CUBES.map((c) => [c.id, c] as const))('%s cube has six faces on six different sides', (_id, cube) => {
    expect(cube.faces).toHaveLength(6);
    expect(new Set(cube.faces.map((f) => f.slot))).toEqual(new Set(SLOTS));
    expect(new Set(cube.faces.map((f) => f.id)).size).toBe(6);
  });

  it('uses the exact proposal vocabulary', () => {
    expect(CUBES.map((c) => c.faces.map((f) => f.text))).toEqual([
      ['He', 'She', 'Lan', 'Nam', 'My best friend', 'My classmate'],
      ['is tall', 'is short', 'is slim', 'has long hair', 'has short hair', 'has curly hair'],
      ['is kind', 'is funny', 'is friendly', 'is creative', 'is confident', 'is hard-working'],
    ]);
  });

  it('every vocabulary id maps to a slot and back', () => {
    for (const cube of CUBES) {
      cube.faces.forEach((f, i) => {
        expect(faceIndexForSlot(cube, f.slot)).toBe(i);
        expect(detectTopSlot(restQuaternion(f.slot))).toBe(f.slot);
      });
    }
  });
});

describe('orientation', () => {
  it.each(SLOTS)('resting on %s puts that face up and its text upright', (slot) => {
    const q = restQuaternion(slot);
    expect(detectTopSlot(q)).toBe(slot);
    const { normal, up } = SLOT_FRAMES[slot];
    expect(close(normal.clone().applyQuaternion(q), new Vector3(0, 1, 0))).toBe(true);
    // Text top points away from the viewer, text left-to-right runs along +X.
    expect(close(up.clone().applyQuaternion(q), new Vector3(0, 0, -1))).toBe(true);
    expect(close(up.clone().cross(normal).applyQuaternion(q), new Vector3(1, 0, 0))).toBe(true);
  });

  it.each(SLOTS)('panel for %s faces outward without mirroring', (slot) => {
    const p = panelQuaternion(slot);
    const { normal, up } = SLOT_FRAMES[slot];
    expect(close(new Vector3(0, 0, 1).applyQuaternion(p), normal)).toBe(true);
    expect(close(new Vector3(0, 1, 0).applyQuaternion(p), up)).toBe(true);
  });

  it('detection survives a small wobble', () => {
    const wobble = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 1).normalize(), 0.3);
    for (const slot of SLOTS) expect(detectTopSlot(restQuaternion(slot).premultiply(wobble))).toBe(slot);
  });
});
