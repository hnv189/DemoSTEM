import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CUBES, GUIDED_FACES } from '../content/vocabulary';
import { SCENES } from '../content/scenes';
import { useAppState } from '../state/AppState';
import { navigate, type Route } from '../state/router';
import { forced2D, hasWebGL, useReducedMotion } from '../lib/env';
import { useFaceTextures } from '../lib/useFaceTextures';
import type { RollCommand } from '../components/Cube3D';
import type { ViewSignal } from '../components/CubeScene';
import { SelectedCards } from '../components/SelectedCards';
import { FaceGallery } from '../components/FaceGallery';
import { LearningFlow } from '../components/LearningFlow';
import { CssCube } from '../components/CssCube';

const CubeScene = lazy(() => import('../components/CubeScene'));

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function randomOther(current: number, count: number) {
  const n = Math.floor(Math.random() * (count - 1));
  return n >= current ? n + 1 : n;
}

export function DemoPage({ route }: { route: Route }) {
  const { state, update, selection } = useAppState();
  const reducedMotion = useReducedMotion();
  const [use3D, setUse3D] = useState(() => !forced2D() && hasWebGL());
  const [fallbackReason, setFallbackReason] = useState(forced2D() ? 'Đang dùng chế độ 2D theo yêu cầu.' : 'Trình duyệt này không hiển thị được đồ họa 3D (WebGL).');
  const { textures, progress, total } = useFaceTextures(use3D);
  const [rolling, setRolling] = useState([false, false, false]);
  const [commands, setCommands] = useState<(RollCommand | null)[]>([null, null, null]);
  const [view, setView] = useState<ViewSignal>({ id: 0, kind: 'reset' });
  const [mismatches, setMismatches] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [notice, setNotice] = useState('');
  const cmdId = useRef(0);
  /** Runs once every cube in the current roll has settled. */
  const afterSettleRef = useRef<(() => void) | null>(null);
  // Faces at the moment the 3D scene mounted: cubes start in that orientation.
  const [mountFaces] = useState(() => [...state.faces]);
  const anyRolling = rolling.some(Boolean);
  const busy = anyRolling || (use3D && !textures);
  const allLocked = state.locks.every(Boolean);

  useEffect(() => {
    if (!anyRolling) setRounds((n) => n + 1);
  }, [anyRolling]);

  const turnTo = useCallback(
    (targets: (number | null)[], tumble: boolean, afterSettle?: () => void) => {
      if (busy) return;
      const active = targets.map((t) => t !== null);
      if (!active.some(Boolean)) return;
      setRolling((r) => r.map((v, i) => v || active[i]));
      update({ showSentences: false });
      afterSettleRef.current = afterSettle ?? null;
      if (use3D) {
        setCommands((c) => c.map((cmd, i) => (targets[i] === null ? cmd : { id: ++cmdId.current, face: targets[i]!, tumble })));
      } else {
        window.setTimeout(() => {
          update((s) => ({ faces: s.faces.map((v, i) => targets[i] ?? v) as typeof s.faces }));
          setRolling([false, false, false]);
          afterSettleRef.current?.();
          afterSettleRef.current = null;
        }, reducedMotion ? 0 : 650);
      }
    },
    [busy, use3D, reducedMotion, update],
  );

  const roll = (which: number[]) => {
    const targets = CUBES.map((c, i) => (which.includes(i) && !state.locks[i] ? randomOther(state.faces[i], c.faces.length) : null));
    turnTo(targets, true, () => update({ flowStep: 1 }));
  };

  const onSettled = useCallback(
    (cube: number, face: number, intended: number) => {
      if (face !== intended) {
        console.error(`Cube ${cube + 1} settled on face ${face} but ${intended} was intended`);
        setMismatches((m) => m + 1);
      }
      update((s) => ({ faces: s.faces.map((v, i) => (i === cube ? face : v)) as typeof s.faces }));
      setRolling((r) => {
        const next = r.map((v, i) => (i === cube ? false : v));
        if (!next.some(Boolean)) {
          const cb = afterSettleRef.current;
          afterSettleRef.current = null;
          if (cb) queueMicrotask(cb);
        }
        return next;
      });
    },
    [update],
  );

  const guidedExample = () => {
    const wasLocked = state.locks.some(Boolean);
    update({ locks: [false, false, false], demoMode: 'guided', pronounMode: 'repeat', rolesSwapped: false });
    setNotice(wasLocked ? 'Đã mở khóa các khối để đặt ví dụ có hướng dẫn.' : '');
    turnTo(GUIDED_FACES, true, () => update({ flowStep: 1 }));
  };

  const toggleLock = (i: number) => update((s) => ({ locks: s.locks.map((v, k) => (k === i ? !v : v)) as typeof s.locks }));

  const scene = route.from && route.from >= 1 && route.from <= SCENES.length ? route.from : null;

  return (
    <div className="page demo-page">
      {scene && (
        <div className="return-bar" role="region" aria-label="Quay lại bài thuyết trình">
          <span>Đang trình diễn từ cảnh {scene}: {SCENES[scene - 1].kicker}</span>
          <button type="button" className="btn btn--primary btn--small" onClick={() => navigate({ page: 'present', scene })}>
            ← Quay lại bài thuyết trình
          </button>
        </div>
      )}

      <header className="page-head">
        <div>
          <p className="eyebrow">Trải nghiệm 3D</p>
          <h1>Gieo, đọc, ghép câu và hỏi – đáp</h1>
        </div>
        <div className="segmented segmented--mode" role="radiogroup" aria-label="Chế độ">
          {(['guided', 'free'] as const).map((m) => (
            <label key={m} className={state.demoMode === m ? 'is-on' : ''}>
              <input type="radio" name="demo-mode" value={m} checked={state.demoMode === m} onChange={() => update({ demoMode: m, flowStep: 0, showSentences: false })} />
              <span>{m === 'guided' ? 'Có hướng dẫn' : 'Khám phá tự do'}</span>
            </label>
          ))}
        </div>
      </header>

      <div className="demo-grid">
        <div className="demo-main">
          <div className="stage" data-mode={use3D ? '3d' : '2d'} data-mismatches={mismatches} data-rounds={rounds} data-testid="stage" data-no-shortcuts>
            {use3D ? (
              <>
                <SceneBoundary
                  onError={() => {
                    setFallbackReason('Không khởi động được chế độ 3D trên trình duyệt này.');
                    setUse3D(false);
                  }}
                >
                  {textures && (
                    <Suspense fallback={null}>
                      <CubeScene
                        textures={textures}
                        initialFaces={mountFaces}
                        commands={commands}
                        busy={busy}
                        locks={state.locks}
                        reducedMotion={reducedMotion}
                        view={view}
                        onSettled={onSettled}
                        onRequestRoll={(i) => roll([i])}
                      />
                    </Suspense>
                  )}
                </SceneBoundary>
                {!textures && (
                  <div className="stage__loading" role="status">
                    Đang in các mặt khối… {progress}/{total}
                  </div>
                )}
                <p className="stage__hint">Kéo để xoay góc nhìn · Chạm vào khối để gieo</p>
                <p className="stage__label">Mô hình minh họa</p>
              </>
            ) : (
              <div className="fallback">
                <p className="fallback__note">{fallbackReason} Bản 2D vẫn gieo, khóa và ghép câu đầy đủ.</p>
                <div className="fallback__cubes">
                  {CUBES.map((cube, i) => (
                    <CssCube key={cube.id} cube={cube} face={state.faces[i]} size={150} rolling={rolling[i]} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="controls" role="group" aria-label="Điều khiển khối">
            <button type="button" className="btn btn--primary btn--big" onClick={() => roll([0, 1, 2])} disabled={busy || allLocked}>
              Gieo cả 3 khối
            </button>
            {allLocked && <span className="hint">Cả ba khối đang khóa.</span>}
            {use3D && (
              <div className="controls__view">
                <button type="button" className="btn btn--icon" aria-label="Xoay góc nhìn sang trái" onClick={() => setView((v) => ({ id: v.id + 1, kind: 'left' }))}>◀</button>
                <button type="button" className="btn btn--ghost" onClick={() => setView((v) => ({ id: v.id + 1, kind: 'reset' }))}>Đặt lại góc nhìn</button>
                <button type="button" className="btn btn--icon" aria-label="Xoay góc nhìn sang phải" onClick={() => setView((v) => ({ id: v.id + 1, kind: 'right' }))}>▶</button>
              </div>
            )}
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}

          <SelectedCards faces={state.faces} rolling={rolling} locks={state.locks} busy={busy} onRoll={(i) => roll([i])} onToggleLock={toggleLock} />
        </div>

        <LearningFlow selection={selection} busy={busy} rolling={anyRolling} onRollAll={() => roll([0, 1, 2])} onGuidedExample={guidedExample} />
      </div>

      <FaceGallery faces={state.faces} locks={state.locks} busy={busy} onShowFace={(cube, face) => turnTo(CUBES.map((_, i) => (i === cube ? face : null)), false)} />
    </div>
  );
}
