import { useRef, useState, type KeyboardEvent } from 'react';
import { CUBES } from '../content/vocabulary';
import { FaceTile } from './FaceTile';

interface Props {
  faces: number[];
  locks: boolean[];
  busy: boolean;
  onShowFace: (cube: number, face: number) => void;
}

const SLOT_LABEL: Record<string, string> = {
  top: 'Mặt trên', bottom: 'Mặt đáy', front: 'Mặt trước', back: 'Mặt sau', left: 'Mặt trái', right: 'Mặt phải',
};

export function FaceGallery({ faces, locks, busy, onShowFace }: Props) {
  const [tab, setTab] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (tab + (e.key === 'ArrowRight' ? 1 : CUBES.length - 1)) % CUBES.length;
    setTab(next);
    tabs.current[next]?.focus();
  };

  const cube = CUBES[tab];
  return (
    <section className="panel gallery" aria-labelledby="gallery-title">
      <div className="panel__head">
        <h2 id="gallery-title">Bộ sưu tập 18 mặt</h2>
        <p className="muted">Xem đủ 6 mặt của từng khối. Chọn một mặt để xoay mặt đó lên trên.</p>
      </div>
      <div className="tabs" role="tablist" aria-label="Chọn khối" onKeyDown={onKey}>
        {CUBES.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => (tabs.current[i] = el)}
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={tab === i}
            aria-controls={`tabpanel-${c.id}`}
            tabIndex={tab === i ? 0 : -1}
            className={`tab tab--${c.id}`}
            onClick={() => setTab(i)}
          >
            Khối {c.number} · <span lang="en">{c.label}</span>
          </button>
        ))}
      </div>
      {locks[tab] && <p className="hint">Khối này đang khóa. Mở khóa để xoay sang mặt khác.</p>}
      <div role="tabpanel" id={`tabpanel-${cube.id}`} aria-labelledby={`tab-${cube.id}`} className="gallery__grid">
        {cube.faces.map((face, f) => {
          const isUp = faces[tab] === f;
          return (
            <button
              key={face.id}
              type="button"
              className={`gallery__item${isUp ? ' is-up' : ''}`}
              onClick={() => onShowFace(tab, f)}
              disabled={busy || isUp || locks[tab]}
              data-face-id={face.id}
              aria-label={isUp ? `${face.text}: đang ở mặt trên` : `Xoay "${face.text}" lên mặt trên của khối ${cube.number}`}
            >
              <FaceTile cube={cube} face={face} size="sm" />
              <span className="gallery__meta">{isUp ? 'Đang ở mặt trên' : `${SLOT_LABEL[face.slot]} · Xoay lên`}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
