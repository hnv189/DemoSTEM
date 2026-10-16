import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { CUBES } from '../content/vocabulary';
import { BUILD_STEPS, MATERIALS, REINFORCEMENT, SAFETY } from '../content/build';
import { netMeasurements, TAB_COUNT } from '../lib/net';
import { forced2D, hasWebGL, useReducedMotion } from '../lib/env';
import { useFaceTextures } from '../lib/useFaceTextures';
import { useAppState } from '../state/AppState';
import { NetDiagram } from '../components/NetDiagram';
import { IsoCube } from '../components/IsoCube';
import type { Highlight } from '../components/NetFold3D';

const NetFold3D = lazy(() => import('../components/NetFold3D'));

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
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

const fmt = (n: number, d = 1) => n.toLocaleString('vi-VN', { maximumFractionDigits: d, minimumFractionDigits: d });
const fmt0 = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

const HIGHLIGHTS: { id: Highlight; label: string; count?: number }[] = [
  { id: 'none', label: 'Không' },
  { id: 'faces', label: 'Mặt', count: 6 },
  { id: 'edges', label: 'Cạnh', count: 12 },
  { id: 'vertices', label: 'Đỉnh', count: 8 },
];

export function BuildPage() {
  const { state, update } = useAppState();
  const a = state.edgeCm;
  const reducedMotion = useReducedMotion();
  const [use3D, setUse3D] = useState(() => !forced2D() && hasWebGL());
  const { textures, progress, total } = useFaceTextures(use3D);
  const [fold, setFold] = useState(0);
  const [shown, setShown] = useState(0);
  const [tab, setTab] = useState(1);
  const [cubeIndex, setCubeIndex] = useState(0);
  const [highlight, setHighlight] = useState<Highlight>('none');
  const m = netMeasurements(a, tab);
  const cube = CUBES[cubeIndex];

  const pickHighlight = (h: Highlight) => {
    setHighlight(h);
    if (h === 'edges' || h === 'vertices') setFold(1);
  };

  return (
    <div className="page build-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Thiết kế & Chế tạo</p>
          <h1>Hình khai triển và khối lập phương bằng bìa</h1>
        </div>
      </header>

      <div className="build-grid">
        <div className="build-stage-wrap">
          <div className="stage stage--build" data-mode={use3D ? '3d' : '2d'} data-fold={shown.toFixed(2)} data-testid="build-stage" data-no-shortcuts>
            {use3D ? (
              <>
                <Boundary onError={() => setUse3D(false)}>
                  {textures && (
                    <Suspense fallback={null}>
                      <NetFold3D a={a} tab={tab} fold={fold} cube={cube} textures={textures[cubeIndex]} highlight={highlight} reducedMotion={reducedMotion} onFoldProgress={setShown} />
                    </Suspense>
                  )}
                </Boundary>
                {!textures && <div className="stage__loading" role="status">Đang chuẩn bị mô hình… {progress}/{total}</div>}
                <p className="stage__label">Mô hình minh họa · không thay thế thử nghiệm trên bìa thật</p>
              </>
            ) : (
              <div className="fallback fallback--build">
                <p className="fallback__note">Không có WebGL: hiển thị bản vẽ 2D.</p>
                <div className="fallback__pair">
                  <NetDiagram a={a} tab={tab} cube={cube} />
                  <IsoCube highlight={highlight} color={cube.color} />
                </div>
              </div>
            )}
          </div>
          <p className="caption">
            Hình khai triển: 4 ô thẳng hàng, 1 ô phía trên và 1 ô phía dưới ô thứ hai. {TAB_COUNT} tai dán cho {TAB_COUNT} mép cần dán (12 cạnh − 5 nếp gấp).
          </p>
        </div>

        <aside className="panel build-controls" data-no-shortcuts>
          <div className="control">
            <span className="control__label">Gấp hình khai triển</span>
            <div className="btn-row">
              <button type="button" className="btn btn--primary" onClick={() => setFold(1)} disabled={fold === 1}>Gấp thành khối</button>
              <button type="button" className="btn btn--ghost" onClick={() => { setFold(0); if (highlight !== 'faces') setHighlight('none'); }} disabled={fold === 0}>Mở ra</button>
            </div>
            <label className="range">
              <span>Mức gấp: {Math.round(fold * 100)}%</span>
              <input id="fold" type="range" min={0} max={100} step={5} value={Math.round(fold * 100)} onChange={(e) => setFold(Number(e.target.value) / 100)} />
            </label>
          </div>

          <div className="control">
            <label className="range">
              <span className="control__label">Cạnh a = <output htmlFor="edge">{fmt(a)} cm</output></span>
              <input id="edge" type="range" min={5} max={6} step={0.1} value={a} onChange={(e) => update({ edgeCm: Number(e.target.value) })} />
            </label>
            <label className="range">
              <span>Tai dán: {fmt(tab)} cm</span>
              <input id="tab" type="range" min={0.7} max={1} step={0.1} value={tab} onChange={(e) => setTab(Number(e.target.value))} />
            </label>
          </div>

          <fieldset className="control">
            <legend className="control__label">Tô nổi</legend>
            <div className="segmented segmented--wrap">
              {HIGHLIGHTS.map((h) => (
                <label key={h.id} className={highlight === h.id ? 'is-on' : ''}>
                  <input type="radio" name="highlight" value={h.id} checked={highlight === h.id} onChange={() => pickHighlight(h.id)} />
                  <span>{h.label}{h.count ? ` (${h.count})` : ''}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="control">
            <legend className="control__label">In mặt của khối</legend>
            <div className="segmented segmented--wrap">
              {CUBES.map((c, i) => (
                <label key={c.id} className={cubeIndex === i ? 'is-on' : ''}>
                  <input type="radio" name="net-cube" value={c.id} checked={cubeIndex === i} onChange={() => setCubeIndex(i)} />
                  <span lang="en">{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <dl className="calc" aria-live="polite">
            <div><dt>Diện tích một mặt</dt><dd>a² = {fmt(a)}² = {fmt0(m.faceArea)} cm²</dd></div>
            <div className="calc__main"><dt>Diện tích 6 mặt</dt><dd>S = 6a² = 6 × {fmt(a)}² = <b>{fmt0(m.cubeArea)} cm²</b></dd></div>
            <div><dt>Tai dán ({TAB_COUNT} tai, rộng {fmt(tab)} cm)</dt><dd>≈ {fmt0(Math.round(m.tabArea * 10) / 10)} cm²</dd></div>
            <div><dt>Khổ bìa tối thiểu</dt><dd>≈ {fmt(m.sheetWidth)} × {fmt(m.sheetHeight)} cm</dd></div>
          </dl>
          <p className="hint">Tai dán cần thêm bìa ngoài 6a². Số liệu là tính toán lý thuyết; kích thước thật đo trên sản phẩm (sai lệch mục tiêu ≤ 0,5 cm).</p>
        </aside>
      </div>

      <section className="panel" aria-labelledby="net-title">
        <div className="panel__head">
          <h2 id="net-title">Bản vẽ khai triển</h2>
          <p className="muted">Bản vẽ theo cạnh a = {fmt(a)} cm và tai dán {fmt(tab)} cm. Các mặt in nội dung khối <span lang="en">{cube.label}</span>.</p>
        </div>
        <div className="net-wrap">
          <NetDiagram a={a} tab={tab} cube={cube} />
        </div>
      </section>

      <div className="two-col">
        <section className="panel" aria-labelledby="materials-title">
          <h2 id="materials-title">Vật liệu và dụng cụ</h2>
          <ul className="materials">
            {MATERIALS.map((x) => (
              <li key={x.name}><strong>{x.name}</strong><span>{x.note}</span></li>
            ))}
          </ul>
          <h3>An toàn</h3>
          <ul className="bullets">
            {SAFETY.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section className="panel" aria-labelledby="steps-title">
          <h2 id="steps-title">Quy trình làm khối</h2>
          <ol className="build-steps">
            {BUILD_STEPS.map((s) => (
              <li key={s.id}><strong>{s.name}</strong><span>{s.text}</span></li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel" aria-labelledby="reinforce-title">
        <div className="panel__head">
          <h2 id="reinforce-title">So sánh cách gia cố</h2>
          <p className="muted">So sánh định tính để chọn phương án. Độ bền thật phải kiểm chứng bằng ít nhất 10 lượt gieo/khối trên sản phẩm bìa.</p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th scope="col">Cách gia cố</th><th scope="col">Ưu điểm</th><th scope="col">Hạn chế</th><th scope="col">Khi nào dùng</th></tr>
            </thead>
            <tbody>
              {REINFORCEMENT.map((r) => (
                <tr key={r.name}><th scope="row">{r.name}</th><td>{r.pros}</td><td>{r.cons}</td><td>{r.when}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
