import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, RoundedBox } from '@react-three/drei';
import { BoxGeometry, BufferGeometry, DoubleSide, Float32BufferAttribute, Group, Matrix4, MeshStandardMaterial, Vector3, type Texture } from 'three';
import type { AnyCube } from '../content/vocabulary';
import { NET, hingeMatrix, netPlacement, squareMatrices, textRotationY, type EdgeDir } from '../lib/net';
import { makeCardboardTexture, makeKraftTexture, makeWoodTexture } from '../lib/faceTextures';

export type Highlight = 'none' | 'faces' | 'edges' | 'vertices';

interface Props {
  a: number;
  tab: number;
  fold: number; // target 0..1
  cube: AnyCube;
  textures: Texture[];
  highlight: Highlight;
  reducedMotion: boolean;
  onFoldProgress?: (p: number) => void;
}

const THICK = 0.18; // cardboard thickness (cm) for the model
const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

const DIRS: Record<EdgeDir, [Vector3, Vector3]> = {
  '+x': [new Vector3(1, 0, 0), new Vector3(0, 0, 1)],
  '-x': [new Vector3(-1, 0, 0), new Vector3(0, 0, 1)],
  '+z': [new Vector3(0, 0, 1), new Vector3(1, 0, 0)],
  '-z': [new Vector3(0, 0, -1), new Vector3(1, 0, 0)],
};

/** Trapezoid glue tab centred on its own origin; the hinge edge is on the −dir side. */
function tabGeometry(dir: EdgeDir, a: number, w: number) {
  const [p, q] = DIRS[dir];
  const inset = Math.min(w, a * 0.2);
  const pts = [
    p.clone().multiplyScalar(-w / 2).addScaledVector(q, -a / 2),
    p.clone().multiplyScalar(-w / 2).addScaledVector(q, a / 2),
    p.clone().multiplyScalar(w / 2).addScaledVector(q, a / 2 - inset),
    p.clone().multiplyScalar(w / 2).addScaledVector(q, -a / 2 + inset),
  ];
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute([pts[0], pts[1], pts[2], pts[0], pts[2], pts[3]].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.computeVertexNormals();
  return g;
}

function FoldingNet({ a, tab, fold, cube, textures, highlight, reducedMotion, onFoldProgress }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const angle = useRef(fold * (Math.PI / 2));
  const root = useRef<Group>(null!);
  const squares = useRef<Record<string, Group | null>>({});
  const tabs = useRef<Record<string, Group | null>>({});
  const reported = useRef(-1);
  const [folded, setFolded] = useState(fold === 1);

  const kraft = useMemo(() => makeKraftTexture(), []);
  const board = useMemo(() => makeCardboardTexture(cube.color, 9), [cube.color]);
  const materials = useMemo(() => {
    const k = new MeshStandardMaterial({ map: kraft, roughness: 0.95 });
    const top = new MeshStandardMaterial({ map: board, roughness: 0.9 });
    return [k, k, top, k, k, k];
  }, [kraft, board]);
  const kraftDouble = useMemo(() => new MeshStandardMaterial({ map: kraft, roughness: 0.95, side: DoubleSide }), [kraft]);
  const tabGeos = useMemo(() => Object.fromEntries((['+x', '-x', '+z', '-z'] as EdgeDir[]).map((d) => [d, tabGeometry(d, a, tab)])), [a, tab]);
  const boxGeo = useMemo(() => new BoxGeometry(a, THICK, a), [a]);

  useEffect(() => invalidate(), [fold, a, tab, highlight, cube, invalidate]);

  useFrame((state, delta) => {
    const target = fold * (Math.PI / 2);
    const speed = Math.PI / 2 / 1.6; // full fold in 1.6 s
    const diff = target - angle.current;
    if (reducedMotion || Math.abs(diff) < 1e-4) angle.current = target;
    else angle.current += Math.sign(diff) * Math.min(Math.abs(diff), speed * Math.min(delta, 0.05));

    const mats = squareMatrices(a, angle.current);
    const place = netPlacement(a, angle.current);
    root.current.position.copy(place);
    for (const sq of NET) {
      const g = squares.current[sq.id];
      if (g) {
        g.matrix.copy(mats[sq.id]);
        g.matrixWorldNeedsUpdate = true;
      }
      for (const d of sq.tabs) {
        const t = tabs.current[sq.id + d];
        if (!t) continue;
        // Tabs fold inward a little ahead of the faces so they tuck inside.
        const tabAngle = Math.min(Math.PI / 2, angle.current * 1.05);
        t.matrix.copy(mats[sq.id].clone().multiply(hingeMatrix(d, a, tabAngle, tab / 2)).multiply(new Matrix4().makeTranslation(0, -THICK / 2 - 0.01, 0)));
        t.matrixWorldNeedsUpdate = true;
      }
    }
    const p = angle.current / (Math.PI / 2);
    const isFolded = p > 0.999;
    if (isFolded !== folded) setFolded(isFolded);
    if (Math.abs(p - reported.current) > 0.004 || (p === target / (Math.PI / 2) && reported.current !== p)) {
      reported.current = p;
      onFoldProgress?.(p);
    }
    if (angle.current !== target) state.invalidate();
  });

  const h = a / 2 + THICK / 2;
  const corners = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => new Vector3(x * h, -a / 2 + y * h, z * h))));

  return (
    <group ref={root}>
      {NET.map((sq, i) => {
        const faceIndex = cube.faces.findIndex((f) => f.slot === sq.slot);
        return (
          <group key={sq.id} ref={(el) => (squares.current[sq.id] = el)} matrixAutoUpdate={false}>
            <mesh geometry={boxGeo} material={materials} castShadow receiveShadow />
            <mesh position={[0, THICK / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, textRotationY(sq.textUp)]}>
              <planeGeometry args={[a * 0.9, a * 0.9]} />
              <meshStandardMaterial map={textures[faceIndex]} alphaTest={0.5} roughness={0.9} />
            </mesh>
            {highlight === 'faces' && (
              <Html position={[0, THICK + 0.3, 0]} center zIndexRange={[20, 0]}>
                <span className="net-badge">{i + 1}</span>
              </Html>
            )}
            {sq.id === 'L' && fold === 0 && (
              <Html position={[0, 0.2, -a / 2 - 0.9]} center zIndexRange={[20, 0]}>
                <span className="net-dim">a = {fmt(a)} cm</span>
              </Html>
            )}
          </group>
        );
      })}
      {NET.flatMap((sq) =>
        sq.tabs.map((d) => (
          <group key={sq.id + d} ref={(el) => (tabs.current[sq.id + d] = el)} matrixAutoUpdate={false}>
            <mesh geometry={tabGeos[d]} material={kraftDouble} />
          </group>
        )),
      )}
      {folded && highlight === 'edges' && <EdgeTubes a={a + THICK} />}
      {folded && highlight === 'vertices' &&
        corners.map((c, i) => (
          <mesh key={i} position={c}>
            <sphereGeometry args={[0.42, 20, 16]} />
            <meshStandardMaterial color="#17233B" />
          </mesh>
        ))}
    </group>
  );
}

/** Thick, visible edges (WebGL line width is always 1 px). */
function EdgeTubes({ a }: { a: number }) {
  const h = a / 2;
  const items: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
  for (const s of [-1, 1]) for (const t of [-1, 1]) {
    items.push({ pos: [0, -a / 2 + s * h, t * h], rot: [0, 0, Math.PI / 2] });
    items.push({ pos: [s * h, -a / 2, t * h], rot: [0, 0, 0] });
    items.push({ pos: [s * h, -a / 2 + t * h, 0], rot: [Math.PI / 2, 0, 0] });
  }
  return (
    <>
      {items.map((e, i) => (
        <mesh key={i} position={e.pos} rotation={e.rot}>
          <cylinderGeometry args={[0.17, 0.17, a, 10]} />
          <meshStandardMaterial color="#E8546A" />
        </mesh>
      ))}
    </>
  );
}

function Table() {
  const wood = useMemo(() => makeWoodTexture(), []);
  return (
    <RoundedBox args={[60, 0.6, 44]} radius={0.2} smoothness={3} position={[0, -0.32, 0]} receiveShadow>
      <meshStandardMaterial map={wood} roughness={0.75} />
    </RoundedBox>
  );
}

export default function NetFold3D(props: Props) {
  return (
    <Canvas
      frameloop="demand"
      shadows
      flat
      dpr={[1, 2]}
      camera={{ fov: 35, position: [2, 30, 30], near: 0.5, far: 200 }}
      role="img"
      aria-label="Mô hình hình khai triển hình lập phương bằng bìa, có thể gấp thành khối và mở ra."
    >
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#FFFDF6', '#D7B58A', 0.5]} />
      <directionalLight position={[8, 30, 14]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
      <Table />
      <FoldingNet {...props} />
      <OrbitControls makeDefault enablePan={false} enableDamping target={[2, 2, 0]} minDistance={14} maxDistance={70} maxPolarAngle={1.35} />
    </Canvas>
  );
}
