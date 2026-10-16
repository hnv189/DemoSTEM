import { Matrix4, Quaternion, Vector3 } from 'three';
import type { FaceSlot } from '../content/vocabulary';

/**
 * Each slot has an outward normal and a "text up" direction in cube space.
 * The printed panel's +Y axis follows `up`, so text reads upright on that side.
 */
export const SLOT_FRAMES: Record<FaceSlot, { normal: Vector3; up: Vector3 }> = {
  right: { normal: new Vector3(1, 0, 0), up: new Vector3(0, 1, 0) },
  left: { normal: new Vector3(-1, 0, 0), up: new Vector3(0, 1, 0) },
  top: { normal: new Vector3(0, 1, 0), up: new Vector3(0, 0, -1) },
  bottom: { normal: new Vector3(0, -1, 0), up: new Vector3(0, 0, 1) },
  front: { normal: new Vector3(0, 0, 1), up: new Vector3(0, 1, 0) },
  back: { normal: new Vector3(0, 0, -1), up: new Vector3(0, 1, 0) },
};

export const SLOTS = Object.keys(SLOT_FRAMES) as FaceSlot[];

/** Rotation that places a flat panel (facing +Z, text up +Y) onto the given side. */
export function panelQuaternion(slot: FaceSlot): Quaternion {
  const { normal, up } = SLOT_FRAMES[slot];
  const x = up.clone().cross(normal);
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x, up, normal));
}

const WORLD_UP = new Vector3(0, 1, 0);
const AWAY_FROM_VIEWER = new Vector3(0, 0, -1);

/**
 * Cube rotation that puts `slot` facing straight up, with its text reading
 * upright for a camera in front of the table (text top points away from the viewer).
 */
export function restQuaternion(slot: FaceSlot): Quaternion {
  const { normal, up } = SLOT_FRAMES[slot];
  const source = new Matrix4().makeBasis(up, normal, up.clone().cross(normal));
  const target = new Matrix4().makeBasis(AWAY_FROM_VIEWER, WORLD_UP, AWAY_FROM_VIEWER.clone().cross(WORLD_UP));
  const rotation = target.multiply(source.transpose());
  return new Quaternion().setFromRotationMatrix(rotation);
}

/** Which slot currently points most nearly upward for a cube with rotation `q`. */
export function detectTopSlot(q: Quaternion): FaceSlot {
  let best: FaceSlot = 'top';
  let bestY = -Infinity;
  for (const slot of SLOTS) {
    const y = SLOT_FRAMES[slot].normal.clone().applyQuaternion(q).y;
    if (y > bestY) {
      bestY = y;
      best = slot;
    }
  }
  return best;
}
