import { Matrix4, Vector3 } from 'three';
import type { FaceSlot } from '../content/vocabulary';

/**
 * Cube net from the proposal: four squares in a row, plus one square above and
 * one below the second square. The net lies flat in the XZ plane with the
 * printed side facing +Y; every hinge folds downward (printed side out).
 *
 *            [ T ]
 *   [ L ] [ B0 ] [ R ] [ U ]
 *            [ F ]
 *
 * B0 (second square) becomes the top of the cube, L/R the side walls,
 * T/F the back/front walls and U (fourth square) the bottom.
 */

export type EdgeDir = '+x' | '-x' | '+z' | '-z';

export interface NetSquare {
  id: string;
  /** Which side of the finished cube this square becomes. */
  slot: FaceSlot;
  parent: string | null;
  /** Edge of the parent the square hangs from. */
  hinge: EdgeDir | null;
  /** Direction (in this square's flat frame) that is "up" for printed text when folded. */
  textUp: EdgeDir;
  /** Free edges that carry a glue tab. */
  tabs: EdgeDir[];
}

export const NET: NetSquare[] = [
  { id: 'B0', slot: 'top', parent: null, hinge: null, textUp: '-z', tabs: [] },
  { id: 'L', slot: 'left', parent: 'B0', hinge: '-x', textUp: '+x', tabs: [] },
  { id: 'R', slot: 'right', parent: 'B0', hinge: '+x', textUp: '-x', tabs: [] },
  { id: 'T', slot: 'back', parent: 'B0', hinge: '-z', textUp: '+z', tabs: ['-x', '+x'] },
  { id: 'F', slot: 'front', parent: 'B0', hinge: '+z', textUp: '-z', tabs: ['-x', '+x'] },
  { id: 'U', slot: 'bottom', parent: 'R', hinge: '+x', textUp: '-x', tabs: ['-z', '+z', '+x'] },
];

export const TAB_COUNT = NET.reduce((n, s) => n + s.tabs.length, 0); // 7 seams = 12 edges − 5 hinges

const DIR: Record<EdgeDir, Vector3> = {
  '+x': new Vector3(1, 0, 0),
  '-x': new Vector3(-1, 0, 0),
  '+z': new Vector3(0, 0, 1),
  '-z': new Vector3(0, 0, -1),
};

/** Rotation that folds a flap hanging off edge `dir` downward by `angle`. */
function foldRotation(dir: EdgeDir, angle: number): Matrix4 {
  switch (dir) {
    case '+x': return new Matrix4().makeRotationZ(-angle);
    case '-x': return new Matrix4().makeRotationZ(angle);
    case '+z': return new Matrix4().makeRotationX(angle);
    case '-z': return new Matrix4().makeRotationX(-angle);
  }
}

/** Matrix from a child's local frame to its parent's frame, for a hinge on `dir`. */
export function hingeMatrix(dir: EdgeDir, a: number, angle: number, childOffset = a / 2): Matrix4 {
  const toEdge = new Matrix4().makeTranslation(DIR[dir].clone().multiplyScalar(a / 2));
  const outward = new Matrix4().makeTranslation(DIR[dir].clone().multiplyScalar(childOffset));
  return toEdge.multiply(foldRotation(dir, angle)).multiply(outward);
}

/** Local-to-net matrices for every square at fold angle `angle` (0 = flat, π/2 = cube). */
export function squareMatrices(a: number, angle: number): Record<string, Matrix4> {
  const out: Record<string, Matrix4> = {};
  for (const sq of NET) {
    out[sq.id] = sq.parent ? out[sq.parent].clone().multiply(hingeMatrix(sq.hinge!, a, angle)) : new Matrix4();
  }
  return out;
}

export function squareCorners(a: number): Vector3[] {
  const h = a / 2;
  return [new Vector3(-h, 0, -h), new Vector3(h, 0, -h), new Vector3(h, 0, h), new Vector3(-h, 0, h)];
}

/** How far to lift and shift the whole net so it rests on the table and stays centred. */
export function netPlacement(a: number, angle: number): Vector3 {
  const mats = squareMatrices(a, angle);
  let minY = Infinity;
  for (const sq of NET) for (const c of squareCorners(a)) minY = Math.min(minY, c.clone().applyMatrix4(mats[sq.id]).y);
  const progress = angle / (Math.PI / 2);
  return new Vector3(-0.5 * a * (1 - progress), -minY, 0);
}

/** Rotation (about Y) that turns a printed panel so its text points along `textUp`. */
export function textRotationY(textUp: EdgeDir): number {
  switch (textUp) {
    case '-z': return 0;
    case '+z': return Math.PI;
    case '+x': return -Math.PI / 2;
    case '-x': return Math.PI / 2;
  }
}

/** Surface-area facts for an edge length `a` (cm) and glue tab width `w` (cm). */
export function netMeasurements(a: number, w: number) {
  const faceArea = a * a;
  const cubeArea = 6 * faceArea;
  // Trapezoid tabs: long side a, short side a − 2w, height w.
  const tabArea = TAB_COUNT * ((a + (a - 2 * w)) / 2) * w;
  return {
    faceArea,
    cubeArea,
    tabArea,
    totalArea: cubeArea + tabArea,
    sheetWidth: 4 * a + w,
    sheetHeight: 3 * a + 2 * w,
  };
}
