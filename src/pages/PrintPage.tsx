import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CUBES } from '../content/vocabulary';
import { useAppState } from '../state/AppState';
import { A4, sheetLayout } from '../lib/printSheet';
import { downloadPdf, loadPrintAssets, renderPrintPages, renderSheet, type PrintOptions } from '../lib/printRender';

const fmt = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Screen preview of one sheet, drawn with the same renderer as the PDF. */
function SheetPreview({ cubeIndex, opts }: { cubeIndex: number; opts: PrintOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return;
    let alive = true;
    loadPrintAssets().then((art) => {
      if (!alive || !canvasRef.current) return;
      const pxPerMm = (width * Math.min(window.devicePixelRatio || 1, 2)) / A4.width;
      renderSheet(canvasRef.current, CUBES[cubeIndex], opts, pxPerMm, art);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [width, cubeIndex, opts.edgeCm, opts.tabCm, opts.inkSaver]); // eslint-disable-line react-hooks/exhaustive-deps

  const cube = CUBES[cubeIndex];
  return (
    <figure className="sheet">
      <div className="sheet__paper" ref={wrapRef} data-testid={`sheet-${cube.id}`} data-ready={ready}>
        <canvas ref={canvasRef} role="img" aria-label={`Bản xem trước trang A4 của khối ${cube.number} ${cube.label}, cạnh ${fmt(opts.edgeCm)} cm`} />
      </div>
      <figcaption>
        Trang {cubeIndex + 1} · Khối {cube.number} – <span lang="en">{cube.label}</span>
      </figcaption>
    </figure>
  );
}

export function PrintPage() {
  const { state, update } = useAppState();
  const [tabCm, setTabCm] = useState(1);
  const [inkSaver, setInkSaver] = useState(false);
  const [chosen, setChosen] = useState([true, true, true]);
  const [busy, setBusy] = useState<'' | 'pdf' | 'print'>('');
  const [status, setStatus] = useState('');
  const [printPages, setPrintPages] = useState<string[] | null>(null);
  const opts: PrintOptions = { edgeCm: state.edgeCm, tabCm, inkSaver };
  const layout = sheetLayout(opts.edgeCm, opts.tabCm);
  const indexes = chosen.flatMap((c, i) => (c ? [i] : []));

  const onPdf = async () => {
    setBusy('pdf');
    setStatus('Đang tạo PDF…');
    try {
      await downloadPdf(indexes, opts);
      setStatus(`Đã tạo PDF ${indexes.length} trang A4. Kiểm tra thư mục tải xuống.`);
    } catch (e) {
      console.error(e);
      setStatus('Không tạo được PDF. Hãy thử “In trực tiếp”.');
    } finally {
      setBusy('');
    }
  };

  const onPrint = async () => {
    setBusy('print');
    setStatus('Đang chuẩn bị bản in…');
    try {
      setPrintPages(await renderPrintPages(indexes, opts, 200));
    } catch (e) {
      console.error(e);
      setStatus('Không chuẩn bị được bản in.');
      setBusy('');
    }
  };

  // Once the print images are in the DOM and decoded, open the print dialog.
  useEffect(() => {
    if (!printPages) return;
    let alive = true;
    const imgs = [...document.querySelectorAll<HTMLImageElement>('.print-root img')];
    Promise.all(imgs.map((i) => i.decode().catch(() => undefined))).then(() => {
      if (!alive) return;
      const done = () => {
        setPrintPages(null);
        setBusy('');
        setStatus('');
        window.removeEventListener('afterprint', done);
      };
      window.addEventListener('afterprint', done);
      window.print();
      // Some browsers do not fire afterprint; clean up anyway.
      window.setTimeout(done, 1500);
    });
    return () => {
      alive = false;
    };
  }, [printPages]);

  return (
    <div className="page print-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">In mẫu</p>
          <h1>Mẫu in A4: cắt, gấp, dán thành khối</h1>
        </div>
      </header>

      <div className="print-grid">
        <aside className="panel print-controls" data-no-shortcuts>
          <div className="control">
            <label className="range">
              <span className="control__label">Cạnh a = <output htmlFor="print-edge">{fmt(state.edgeCm)} cm</output></span>
              <input id="print-edge" type="range" min={5} max={6} step={0.1} value={state.edgeCm} onChange={(e) => update({ edgeCm: Number(e.target.value) })} />
            </label>
            <label className="range">
              <span>Tai dán: {fmt(tabCm)} cm</span>
              <input id="print-tab" type="range" min={0.7} max={1} step={0.1} value={tabCm} onChange={(e) => setTabCm(Number(e.target.value))} />
            </label>
          </div>

          <fieldset className="control">
            <legend className="control__label">Khối cần in</legend>
            {CUBES.map((c, i) => (
              <label key={c.id} className="check">
                <input
                  type="checkbox"
                  id={`print-cube-${c.id}`}
                  checked={chosen[i]}
                  onChange={(e) => setChosen((v) => v.map((x, k) => (k === i ? e.target.checked : x)))}
                />
                <span className="swatch" style={{ background: c.color }} />
                Khối {c.number} – <span lang="en">{c.label}</span>
              </label>
            ))}
          </fieldset>

          <label className="check">
            <input type="checkbox" id="print-ink" checked={inkSaver} onChange={(e) => setInkSaver(e.target.checked)} />
            Tiết kiệm mực (nền trắng, viền màu)
          </label>

          <dl className="calc">
            <div><dt>Kích thước hình khai triển</dt><dd>{fmt(layout.bounds.width / 10)} × {fmt(layout.bounds.height / 10)} cm</dd></div>
            <div><dt>Số trang</dt><dd>{indexes.length} trang A4 ngang (1 khối/trang)</dd></div>
          </dl>

          <div className="btn-col">
            <button type="button" className="btn btn--primary btn--big" onClick={onPdf} disabled={!!busy || indexes.length === 0}>
              {busy === 'pdf' ? 'Đang tạo PDF…' : 'Tải PDF A4'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onPrint} disabled={!!busy || indexes.length === 0}>
              {busy === 'print' ? 'Đang chuẩn bị…' : 'In trực tiếp'}
            </button>
          </div>
          {indexes.length === 0 && <p className="hint">Chọn ít nhất một khối để in.</p>}
          <p className="notice" role="status" aria-live="polite">{status}</p>

          <div className="callout callout--print">
            <strong>In đúng kích thước</strong>
            <span>Chọn khổ <b>A4</b>, hướng <b>ngang</b>, tỷ lệ <b>100% / Kích thước thực</b> (tắt “Vừa trang”). Sau khi in, đo thước 10 cm ở mép phải trang.</span>
          </div>
        </aside>

        <section className="print-preview" aria-label="Xem trước trang in">
          {indexes.length === 0 ? (
            <p className="muted">Chưa chọn khối nào.</p>
          ) : (
            indexes.map((i) => <SheetPreview key={CUBES[i].id} cubeIndex={i} opts={opts} />)
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="assemble-title">
        <h2 id="assemble-title">Lắp khối từ bản in</h2>
        <ol className="build-steps">
          <li><strong>Dán lên bìa</strong><span>Dán tờ in lên bìa carton sạch, phẳng cho cứng (tùy chọn) và chờ khô.</span></li>
          <li><strong>Cắt</strong><span>Cắt theo đường liền, giữ nguyên các tai dán màu nâu nhạt.</span></li>
          <li><strong>Tạo nếp</strong><span>Miết thước theo đường nét đứt rồi gấp về phía sau để mặt in ở ngoài.</span></li>
          <li><strong>Gấp thử</strong><span>Gấp thử không dán: đủ 6 mặt, chữ trên mỗi mặt đều đứng thẳng.</span></li>
          <li><strong>Dán</strong><span>Bôi keo lên tai, dán vào mặt trong của ô kề bên; giữ vài giây, chờ khô.</span></li>
          <li><strong>Kiểm tra</strong><span>Đo cạnh (sai lệch ≤ 0,5 cm), gieo thử 10 lượt và ghi vào phiếu thử nghiệm.</span></li>
        </ol>
      </section>

      {printPages &&
        createPortal(
          <div className="print-root" aria-hidden="true">
            {printPages.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
