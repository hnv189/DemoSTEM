import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei';
import { Vector3, type Texture } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CUBES } from '../content/vocabulary';
import { makeWoodTexture } from '../lib/faceTextures';
import { Cube3D, type RollCommand } from './Cube3D';

export interface ViewSignal {
  id: number;
  kind: 'reset' | 'left' | 'right';
}

interface Props {
  textures: Texture[][];
  initialFaces: number[];
  commands: (RollCommand | null)[];
  busy: boolean;
  locks: boolean[];
  reducedMotion: boolean;
  view: ViewSignal;
  onSettled: (cube: number, face: number, intended: number) => void;
  onRequestRoll: (cube: number) => void;
}

const TARGET = new Vector3(0, 0.45, 0);
const VIEW_DIR = new Vector3(0, 0.82, 0.57).normalize();
const FOV = 35;

function useLayout() {
  const { size } = useThree();
  return useMemo(() => {
    const aspect = size.width / size.height;
    const spacing = aspect < 1.4 ? 1.3 : 1.6;
    const halfWidth = spacing + 0.85;
    const vfov = (FOV * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const distance = Math.max(halfWidth / Math.tan(hfov / 2), 1.35 / Math.tan(vfov / 2), 4.6);
    return { spacing, distance };
  }, [size.width, size.height]);
}

function CameraRig({ view, distance }: { view: ViewSignal; distance: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const lastView = useRef(view.id);

  const reset = () => {
    camera.position.copy(VIEW_DIR.clone().multiplyScalar(distance).add(TARGET));
    if (controls) {
      controls.target.copy(TARGET);
      controls.update();
    }
    invalidate();
  };

  useEffect(reset, [distance, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lastView.current === view.id) return;
    lastView.current = view.id;
    if (view.kind === 'reset') return reset();
    if (!controls) return;
    controls.setAzimuthalAngle(controls.getAzimuthalAngle() + (Math.PI / 6) * (view.kind === 'left' ? -1 : 1));
    controls.update();
    invalidate();
  }, [view, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function Desk() {
  const wood = useMemo(() => makeWoodTexture(), []);
  return (
    <>
      <RoundedBox args={[22, 0.36, 14]} radius={0.14} smoothness={4} position={[0, -0.2, -1]} receiveShadow>
        <meshStandardMaterial map={wood} roughness={0.75} />
      </RoundedBox>
      {/* Low felt tray that keeps the cubes together (proposal: "gieo vào khay thấp"). */}
      <RoundedBox args={[5.6, 0.04, 2.3]} radius={0.02} smoothness={2} position={[0, -0.01, 0]} receiveShadow>
        <meshStandardMaterial color="#F3E6CF" roughness={0.95} />
      </RoundedBox>
    </>
  );
}

function Cubes(props: Props) {
  const { spacing, distance } = useLayout();
  return (
    <>
      <CameraRig view={props.view} distance={distance} />
      {CUBES.map((cube, i) => (
        <Cube3D
          key={cube.id}
          cube={cube}
          index={i}
          textures={props.textures[i]}
          x={(i - 1) * spacing}
          initialFace={props.initialFaces[i]}
          command={props.commands[i]}
          reducedMotion={props.reducedMotion}
          disabled={props.busy}
          locked={props.locks[i]}
          onSettled={(face, intended) => props.onSettled(i, face, intended)}
          onRequestRoll={() => props.onRequestRoll(i)}
        />
      ))}
    </>
  );
}

export default function CubeScene(props: Props) {
  return (
    <Canvas
      frameloop="demand"
      shadows
      flat
      dpr={[1, 2]}
      camera={{ fov: FOV, position: [0, 4, 5.4], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      role="img"
      aria-label="Ba khối lập phương bằng bìa in màu trên bàn gỗ. Kéo để xoay góc nhìn, chạm vào khối để gieo."
    >
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#FFFDF6', '#D7B58A', 0.55]} />
      <directionalLight
        position={[1.5, 9, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 3, 2]} intensity={0.3} />
      <Desk />
      <ContactShadows position={[0, 0.035, 0]} scale={10} opacity={0.32} blur={2.4} far={2.5} resolution={512} frames={Infinity} />
      <Cubes {...props} />
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={4} maxDistance={14} minPolarAngle={0.12} maxPolarAngle={1.3} target={[TARGET.x, TARGET.y, TARGET.z]} />
    </Canvas>
  );
}
