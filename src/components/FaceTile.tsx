import { useState } from 'react';
import type { AnyCube, VocabFace } from '../content/vocabulary';

/** A printed face as a flat card: words above the illustration (same design as the 3D faces). */
export function FaceTile({ cube, face, size = 'md' }: { cube: AnyCube; face: VocabFace; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={`face-tile face-tile--${size}`} style={{ ['--accent' as string]: cube.color }} lang="en">
      <span className="face-tile__word">{face.text}</span>
      <span className="face-tile__bar" aria-hidden="true" />
      {broken ? (
        <span className="face-tile__missing" lang="vi">Chưa có hình</span>
      ) : (
        <img className="face-tile__art" src={face.art} alt={face.alt} lang="vi" width={200} height={150} onError={() => setBroken(true)} />
      )}
    </span>
  );
}
