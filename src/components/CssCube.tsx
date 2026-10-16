import { CUBES, type AnyCube } from '../content/vocabulary';
import { FaceTile } from './FaceTile';

/**
 * Lightweight illustrated cube (CSS 3D, no WebGL) for slides, the home page and
 * the 2D fallback. Shows the chosen face on top plus two other faces.
 */
export function CssCube({ cube, face, size = 160, rolling = false }: { cube: AnyCube; face: number; size?: number; rolling?: boolean }) {
  const n = cube.faces.length;
  const front = cube.faces[(face + 1) % n];
  const right = cube.faces[(face + 2) % n];
  return (
    <div className={`css-cube${rolling ? ' is-rolling' : ''}`} style={{ ['--s' as string]: `${size}px`, ['--cube' as string]: cube.color }} aria-hidden="true">
      <div className="css-cube__body">
        <div className="css-cube__face css-cube__face--top">
          <FaceTile cube={cube} face={cube.faces[face]} size="xs" />
        </div>
        <div className="css-cube__face css-cube__face--front">
          <FaceTile cube={cube} face={front} size="xs" />
        </div>
        <div className="css-cube__face css-cube__face--right">
          <FaceTile cube={cube} face={right} size="xs" />
        </div>
      </div>
    </div>
  );
}

/** The three cubes side by side, with a caption marking them as an illustration. */
export function CubeTrio({ faces, size = 150, caption = true }: { faces: number[]; size?: number; caption?: boolean }) {
  return (
    <figure className="cube-trio">
      <div className="cube-trio__row">
        {CUBES.map((cube, i) => (
          <CssCube key={cube.id} cube={cube} face={faces[i]} size={size} />
        ))}
      </div>
      {caption && <figcaption className="caption">Hình minh họa mô phỏng, không phải ảnh sản phẩm học sinh.</figcaption>}
    </figure>
  );
}
