import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Group, Quaternion, Vector3, type Texture } from 'three';
import type { AnyCube } from '../content/vocabulary';
import { SLOT_FRAMES, detectTopSlot, panelQuaternion, restQuaternion } from '../lib/orientation';
import { makeCardboardTexture } from '../lib/faceTextures';

export const CUBE_SIZE = 1;
const HALF = CUBE_SIZE / 2;
const PANEL = 0.9;

export interface RollCommand {
  id: number;
  face: number;
  /** true: tumble through the air; false: gently turn to the face. */
  tumble: boolean;
}

interface Props {
  cube: AnyCube;
  index: number;
  textures: Texture[];
  x: number;
  initialFace: number;
  command: RollCommand | null;
  reducedMotion: boolean;
  disabled: boolean;
  locked: boolean;
  onSettled: (face: number, intended: number) => void;
  onRequestRoll: () => void;
}

interface Anim {
  start: number | null;
  from: Quaternion;
  to: Quaternion;
  axis: Vector3;
  turns: number;
  hop: number;
  duration: number;
  face: number;
}

/** One printed-cardboard cube. Its result is always read back from its real orientation. */
export function Cube3D({ cube, index, textures, x, initialFace, command, reducedMotion, disabled, locked, onSettled, onRequestRoll }: Props) {
  const group = useRef<Group>(null!);
  const anim = useRef<Anim | null>(null);
  const settled = useRef(onSettled);
  settled.current = onSettled;
  const invalidate = useThree((s) => s.invalidate);
  const [hovered, setHovered] = useState(false);
  const board = useMemo(() => makeCardboardTexture(cube.color, 3 + index), [cube.color, index]);

  const panels = useMemo(
    () =>
      cube.faces.map((f) => ({
        position: SLOT_FRAMES[f.slot].normal.clone().multiplyScalar(HALF + 0.003),
        quaternion: panelQuaternion(f.slot),
      })),
    [cube],
  );

  useEffect(() => {
    group.current.quaternion.copy(restQuaternion(cube.faces[initialFace].slot));
    invalidate();
    // Initial orientation only; later changes come from roll commands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!command) return;
    const angle = Math.random() * Math.PI * 2;
    anim.current = {
      start: null,
      from: group.current.quaternion.clone(),
      to: restQuaternion(cube.faces[command.face].slot),
      axis: new Vector3(Math.cos(angle), 0.25, Math.sin(angle)).normalize(),
      turns: command.tumble ? 2 : 0,
      hop: command.tumble ? 1.1 : 0.4,
      duration: reducedMotion ? 0 : command.tumble ? 1.2 : 0.7,
      face: command.face,
    };
    invalidate();
    // A new command id is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.id]);

  useFrame((state) => {
    const a = anim.current;
    if (!a) return;
    const g = group.current;
    if (a.start === null) a.start = state.clock.elapsedTime;
    const t = a.duration === 0 ? 1 : Math.min(1, (state.clock.elapsedTime - a.start) / a.duration);
    const e = 1 - Math.pow(1 - t, 3);
    const q = a.from.clone().slerp(a.to, e);
    if (a.turns) q.premultiply(new Quaternion().setFromAxisAngle(a.axis, a.turns * Math.PI * 2 * (1 - e)));
    g.quaternion.copy(q);
    g.position.y = HALF + a.hop * 4 * t * (1 - t);
    if (t >= 1) {
      g.quaternion.copy(a.to);
      g.position.y = HALF;
      anim.current = null;
      const topSlot = detectTopSlot(g.quaternion);
      settled.current(cube.faces.findIndex((f) => f.slot === topSlot), a.face);
    }
    state.invalidate();
  });

  useEffect(() => {
    document.body.style.cursor = hovered && !disabled && !locked ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered, disabled, locked]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6 || disabled || locked) return; // a drag, not a tap
    onRequestRoll();
  };

  return (
    <group position={[x, 0, 0]}>
      <group
        ref={group}
        position={[0, HALF, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} radius={0.035} smoothness={4} castShadow>
          <meshStandardMaterial map={board} color="#ffffff" roughness={0.88} />
        </RoundedBox>
        {panels.map((p, i) => (
          <mesh key={cube.faces[i].id} position={p.position} quaternion={p.quaternion}>
            <planeGeometry args={[PANEL, PANEL]} />
            <meshStandardMaterial map={textures[i]} alphaTest={0.5} roughness={0.9} />
          </mesh>
        ))}
      </group>
      {locked && (
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.86, 48]} />
          <meshBasicMaterial color="#176B9A" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
