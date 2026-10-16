import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENES } from '../content/scenes';
import { useAppState } from '../state/AppState';
import { isTypingTarget, navigate, type Route } from '../state/router';
import { SceneView } from '../scenes/Scenes';

export function PresentationPage({ route }: { route: Route }) {
  const { state, update } = useAppState();
  const rootRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const total = SCENES.length;
  const index = state.sceneIndex;
  const scene = SCENES[index];

  // URL → state (deep link or browser back/forward).
  useEffect(() => {
    if (route.scene && route.scene >= 1 && route.scene <= total && route.scene - 1 !== index) update({ sceneIndex: route.scene - 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.scene]);

  // State → URL.
  useEffect(() => {
    if (route.scene !== index + 1) history.replaceState(null, '', `#/present/${index + 1}`);
  }, [index, route.scene]);

  const go = useCallback((i: number) => update({ sceneIndex: Math.max(0, Math.min(total - 1, i)) }), [update, total]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch {
      /* fullscreen not allowed here: the page still works */
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isTypingTarget(e.target)) return;
      if (pickerOpen) {
        if (e.key === 'Escape') setPickerOpen(false);
        return;
      }
      // Let buttons and links keep Space/Enter.
      const onControl = e.target instanceof HTMLElement && !!e.target.closest('button, a, [role="tab"], summary');
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          go(index + 1);
          break;
        case ' ':
          if (onControl) return;
          e.preventDefault();
          go(index + 1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          go(index - 1);
          break;
        case 'Home':
          e.preventDefault();
          go(0);
          break;
        case 'End':
          e.preventDefault();
          go(total - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          update({ showNotes: !state.showNotes });
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, total, pickerOpen, toggleFullscreen, update, state.showNotes]);

  useEffect(() => {
    if (pickerOpen) pickerRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  }, [pickerOpen]);

  return (
    <div ref={rootRef} className={`present${fullscreen ? ' is-fullscreen' : ''}`}>
      <div className="present__bar">
        <span className="present__counter" aria-live="polite">
          Cảnh <b>{index + 1}</b>/{total}
          <span className="present__kicker"> · {scene.kicker}</span>
        </span>
        <div className="present__tools">
          <button type="button" className="btn btn--ghost btn--small" aria-expanded={pickerOpen} aria-haspopup="true" onClick={() => setPickerOpen((v) => !v)}>
            Chọn cảnh
          </button>
          <button type="button" className={`btn btn--ghost btn--small${state.showNotes ? ' is-on' : ''}`} aria-pressed={state.showNotes} onClick={() => update({ showNotes: !state.showNotes })}>
            Ghi chú <kbd>N</kbd>
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={toggleFullscreen}>
            {fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} <kbd>F</kbd>
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => navigate({ page: 'home' })}>
            Thoát
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div className="picker" ref={pickerRef} role="dialog" aria-label="Chọn cảnh">
          <ol>
            {SCENES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => {
                    go(i);
                    setPickerOpen(false);
                  }}
                >
                  <span className="picker__num">{i + 1}</span>
                  <span>
                    <small>{s.kicker}</small>
                    {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="present__stage">
        <section className="slide" aria-roledescription="cảnh trình chiếu" aria-label={`Cảnh ${index + 1}: ${scene.title}`} key={scene.id}>
          <SceneView index={index} />
        </section>
      </div>

      <div className="present__nav">
        <button type="button" className="btn btn--ghost" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Cảnh trước">
          ← Trước
        </button>
        <div className="dots" aria-hidden="true">
          {SCENES.map((s, i) => (
            <span key={s.id} className={i === index ? 'is-on' : ''} />
          ))}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Cảnh tiếp">
          Tiếp →
        </button>
      </div>

      {state.showNotes && (
        <aside className="notes" aria-label="Ghi chú người trình bày">
          <div className="notes__head">
            <strong>Ghi chú · khoảng {scene.minutes.toLocaleString('vi-VN')} phút</strong>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => update({ showNotes: false })}>Ẩn</button>
          </div>
          <ul>
            {scene.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
