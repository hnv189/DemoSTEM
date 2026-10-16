import type { Highlight } from './NetFold3D';

/** 2D isometric cube used when WebGL is unavailable, with the same face/edge/vertex highlights. */
export function IsoCube({ highlight, color }: { highlight: Highlight; color: string }) {
  const s = 70;
  const cx = 110;
  const cy = 120;
  const iso = (x: number, y: number, z: number): [number, number] => [cx + (x - z) * s * 0.866, cy + (x + z) * s * 0.5 - y * s];
  const V = [0, 1].flatMap((x) => [0, 1].flatMap((y) => [0, 1].map((z) => iso(x - 0.5, y - 0.5, z - 0.5))));
  const idx = (x: number, y: number, z: number) => x * 4 + y * 2 + z;
  const poly = (ids: number[]) => ids.map((i) => V[i].join(',')).join(' ');
  const top = [idx(0, 1, 0), idx(1, 1, 0), idx(1, 1, 1), idx(0, 1, 1)];
  const left = [idx(0, 1, 1), idx(1, 1, 1), idx(1, 0, 1), idx(0, 0, 1)];
  const right = [idx(1, 1, 0), idx(1, 1, 1), idx(1, 0, 1), idx(1, 0, 0)];
  const edges: [number, number][] = [];
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
    const d = a ^ b;
    if (d === 1 || d === 2 || d === 4) edges.push([a, b]);
  }
  const hidden = (a: number, b: number) => a === idx(0, 0, 0) || b === idx(0, 0, 0);
  return (
    <svg viewBox="0 0 220 230" className="iso-cube" role="img" aria-label="Hình lập phương có 6 mặt, 12 cạnh, 8 đỉnh">
      <polygon points={poly(top)} fill={color} opacity={0.75} />
      <polygon points={poly(left)} fill={color} opacity={0.95} />
      <polygon points={poly(right)} fill={color} opacity={0.55} />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={V[a][0]} y1={V[a][1]} x2={V[b][0]} y2={V[b][1]}
          stroke={highlight === 'edges' ? '#E8546A' : '#17233B'}
          strokeWidth={highlight === 'edges' ? 5 : 2.5}
          strokeDasharray={hidden(a, b) ? '6 5' : undefined}
          strokeLinecap="round"
        />
      ))}
      {highlight === 'vertices' && V.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill="#17233B" stroke="#fff" strokeWidth={2} />)}
      {highlight === 'faces' && (
        <g className="iso-cube__labels">
          <text {...centre(top, V)}>1</text>
          <text {...centre(left, V)}>2</text>
          <text {...centre(right, V)}>3</text>
        </g>
      )}
    </svg>
  );
}

function centre(ids: number[], V: [number, number][]) {
  const x = ids.reduce((n, i) => n + V[i][0], 0) / ids.length;
  const y = ids.reduce((n, i) => n + V[i][1], 0) / ids.length + 6;
  return { x, y, textAnchor: 'middle' as const };
}
