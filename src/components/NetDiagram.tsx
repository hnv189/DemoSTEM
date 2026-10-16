import { NET, type EdgeDir } from '../lib/net';
import type { AnyCube } from '../content/vocabulary';

const POS: Record<string, [number, number]> = { L: [0, 1], B0: [1, 1], R: [2, 1], U: [3, 1], T: [1, 0], F: [1, 2] };

const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

/**
 * Flat 2D drawing of the proposal's cube net with glue tabs and dimension labels.
 * `cube` (optional) prints that cube's words on the squares.
 */
export function NetDiagram({ a, tab = 1, cube, compact = false }: { a: number; tab?: number; cube?: AnyCube; compact?: boolean }) {
  const u = 60; // drawing units per cm-square side
  const t = (tab / a) * u;
  const pad = 46;
  const W = 4 * u + pad * 2 + t;
  const H = 3 * u + pad * 2;
  const x0 = pad;
  const y0 = pad;

  const tabPath = (cx: number, cy: number, dir: EdgeDir) => {
    const h = u / 2;
    const inset = Math.min(t, u * 0.2);
    switch (dir) {
      case '-x': return `M${cx - h} ${cy - h} L${cx - h - t} ${cy - h + inset} L${cx - h - t} ${cy + h - inset} L${cx - h} ${cy + h} Z`;
      case '+x': return `M${cx + h} ${cy - h} L${cx + h + t} ${cy - h + inset} L${cx + h + t} ${cy + h - inset} L${cx + h} ${cy + h} Z`;
      case '-z': return `M${cx - h} ${cy - h} L${cx - h + inset} ${cy - h - t} L${cx + h - inset} ${cy - h - t} L${cx + h} ${cy - h} Z`;
      case '+z': return `M${cx - h} ${cy + h} L${cx - h + inset} ${cy + h + t} L${cx + h - inset} ${cy + h + t} L${cx + h} ${cy + h} Z`;
    }
  };

  return (
    <svg className="net-diagram" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Hình khai triển hình lập phương cạnh ${fmt(a)} cm: 4 ô thẳng hàng, 1 ô phía trên và 1 ô phía dưới ô thứ hai, có 7 tai dán.`}>
      {NET.map((sq) => {
        const [c, r] = POS[sq.id];
        const cx = x0 + c * u + u / 2;
        const cy = y0 + r * u + u / 2;
        return sq.tabs.map((d) => <path key={sq.id + d} d={tabPath(cx, cy, d)} className="net-diagram__tab" />);
      })}
      {NET.map((sq, i) => {
        const [c, r] = POS[sq.id];
        const face = cube?.faces.find((f) => f.slot === sq.slot);
        return (
          <g key={sq.id}>
            <rect x={x0 + c * u} y={y0 + r * u} width={u} height={u} className="net-diagram__square" style={cube ? { fill: cube.softColor } : undefined} />
            <text x={x0 + c * u + u / 2} y={y0 + r * u + u / 2 + 4} className="net-diagram__label" lang="en">
              {face ? face.text : i + 1}
            </text>
          </g>
        );
      })}
      {/* dimension: one edge */}
      <g className="net-diagram__dim">
        <path d={`M${x0 + u} ${y0 - 14} H${x0 + 2 * u} M${x0 + u} ${y0 - 19} V${y0 - 9} M${x0 + 2 * u} ${y0 - 19} V${y0 - 9}`} />
        <text x={x0 + 1.5 * u} y={y0 - 20}>a = {fmt(a)} cm</text>
      </g>
      {!compact && (
        <g className="net-diagram__dim">
          <path d={`M${x0} ${H - 16} H${x0 + 4 * u} M${x0} ${H - 21} V${H - 11} M${x0 + 4 * u} ${H - 21} V${H - 11}`} />
          <text x={x0 + 2 * u} y={H - 22}>4a = {fmt(4 * a)} cm</text>
          <path d={`M${W - 18} ${y0} V${y0 + 3 * u} M${W - 23} ${y0} H${W - 13} M${W - 23} ${y0 + 3 * u} H${W - 13}`} />
          <text x={W - 24} y={y0 + 1.5 * u} transform={`rotate(-90 ${W - 24} ${y0 + 1.5 * u})`}>3a = {fmt(3 * a)} cm</text>
        </g>
      )}
    </svg>
  );
}
