import { CUBES } from '../content/vocabulary';
import { FaceTile } from './FaceTile';

interface Props {
  faces: number[];
  rolling: boolean[];
  locks: boolean[];
  busy: boolean;
  onRoll: (cube: number) => void;
  onToggleLock: (cube: number) => void;
}

/** Large cards for the three faces that are up, each with roll and lock controls. */
export function SelectedCards({ faces, rolling, locks, busy, onRoll, onToggleLock }: Props) {
  return (
    <div className="selected" aria-live="polite">
      {CUBES.map((cube, i) => {
        const face = cube.faces[faces[i]];
        return (
          <article
            key={cube.id}
            className={`selected__card selected__card--${cube.id}${locks[i] ? ' is-locked' : ''}`}
            data-testid={`result-${cube.id}`}
            data-face-id={rolling[i] ? '' : face.id}
          >
            <header className="selected__head">
              <span className={`tag tag--${cube.id}`} title={`Khối ${cube.number}`}>
                {cube.number} · <span lang="en">{cube.label}</span>
              </span>
              <span className="selected__status">{rolling[i] ? 'Đang gieo…' : locks[i] ? 'Đã khóa' : 'Mặt trên'}</span>
            </header>
            {rolling[i] ? (
              <div className="selected__placeholder" aria-label={`Khối ${cube.label} đang gieo`}>
                <span className="dice-dots" aria-hidden="true"><i /><i /><i /></span>
              </div>
            ) : (
              <FaceTile cube={cube} face={face} size="md" />
            )}
            <div className="selected__actions">
              <button type="button" className={`btn btn--cube btn--${cube.id}`} onClick={() => onRoll(i)} disabled={busy || locks[i]}>
                Gieo khối {cube.number}
              </button>
              <button
                type="button"
                className={`btn btn--lock${locks[i] ? ' is-on' : ''}`}
                aria-pressed={locks[i]}
                onClick={() => onToggleLock(i)}
                disabled={busy}
                aria-label={locks[i] ? `Mở khóa khối ${cube.number}` : `Khóa khối ${cube.number}`}
                title={locks[i] ? 'Mở khóa' : 'Khóa để giữ kết quả'}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" />
                  <path d={locks[i] ? 'M8 11V8a4 4 0 0 1 8 0v3' : 'M8 11V8a4 4 0 0 1 7.6-1.8'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
