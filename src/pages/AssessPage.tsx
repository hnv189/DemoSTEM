import { useEffect, useState } from 'react';
import { DESIGN_RUBRIC, EVIDENCE_SLOTS, PORTFOLIO_LOG, PRODUCT_RUBRIC, SAMPLE_TEST_RECORD, SPEAKING_OBSERVATION, WEIGHTS } from '../content/assessment';

interface TestForm {
  group: string;
  edges: string[];
  intact: string[];
  readable: string[];
  combos: { roll: string; sentences: string; ok: boolean }[];
  spoke: string;
  members: string;
  problem: string;
  change: string;
  retest: string;
}

const EMPTY: TestForm = {
  group: '',
  edges: ['', '', ''],
  intact: ['', '', ''],
  readable: ['', '', ''],
  combos: Array.from({ length: 5 }, () => ({ roll: '', sentences: '', ok: false })),
  spoke: '',
  members: '',
  problem: '',
  change: '',
  retest: '',
};

const KEY = 'mec-test-form-v1';

function loadForm(): TestForm {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function sampleAsForm(): TestForm {
  const s = SAMPLE_TEST_RECORD;
  return {
    group: s.group,
    edges: s.edges,
    intact: s.intact.map(String),
    readable: s.readable.map(String),
    combos: s.combos,
    spoke: String(s.members.spoke),
    members: String(s.members.total),
    problem: s.problem,
    change: s.change,
    retest: s.retest,
  };
}

export function AssessPage() {
  const [form, setForm] = useState<TestForm>(loadForm);
  const [showSample, setShowSample] = useState(false);
  const view = showSample ? sampleAsForm() : form;
  const readOnly = showSample;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(form));
    } catch {
      /* storage unavailable */
    }
  }, [form]);

  const setArr = (field: 'edges' | 'intact' | 'readable', i: number, v: string) =>
    setForm((f) => ({ ...f, [field]: f[field].map((x, k) => (k === i ? v : x)) }));
  const setCombo = (i: number, patch: Partial<TestForm['combos'][number]>) =>
    setForm((f) => ({ ...f, combos: f.combos.map((c, k) => (k === i ? { ...c, ...patch } : c)) }));
  const okCount = view.combos.filter((c) => c.ok).length;

  return (
    <div className="page assess-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Đánh giá</p>
          <h1>Đánh giá bằng minh chứng</h1>
        </div>
      </header>

      <section className="panel" aria-labelledby="weights-title">
        <div className="panel__head">
          <h2 id="weights-title">Cơ cấu điểm đề xuất</h2>
          <p className="muted">Theo hồ sơ mẫu: Thiết kế 30% + Sản phẩm và trình bày 60% + Hồ sơ học tập 10%.</p>
        </div>
        <div className="weights weights--page" role="img" aria-label="Thiết kế 30%, Sản phẩm và trình bày 60%, Hồ sơ học tập 10%">
          {WEIGHTS.map((w) => (
            <div key={w.id} className="weights__seg" style={{ flexGrow: w.percent, background: w.color }}>
              <b>{w.percent}%</b>
              <span>{w.label}</span>
            </div>
          ))}
        </div>
        <ul className="weights__notes">
          {WEIGHTS.map((w) => (
            <li key={w.id}><span className="swatch" style={{ background: w.color }} /> <b>{w.label}:</b> {w.note}</li>
          ))}
        </ul>
        <p className="callout">
          <b>Điểm nhóm và điểm cá nhân tách riêng.</b> Kỹ năng nói được quan sát cho từng học sinh để tránh tình trạng một bạn nói thay cả nhóm. Phiếu quan sát nói không thay thế điểm sản phẩm nhóm.
        </p>
      </section>

      <div className="two-col">
        <section className="panel" aria-labelledby="design-rubric">
          <h2 id="design-rubric">Phụ lục 1 · Rubric thiết kế (10 điểm)</h2>
          <p className="tag-line"><span className="tag tag--who">Điểm nhóm</span></p>
          <ol className="rubric-list">
            {DESIGN_RUBRIC.map((c) => (
              <li key={c}><span>{c}</span><b>1</b></li>
            ))}
          </ol>
        </section>

        <section className="panel panel--accent" aria-labelledby="speaking">
          <h2 id="speaking">Phụ lục 5 · Quan sát nói cá nhân (10 điểm)</h2>
          <p className="tag-line"><span className="tag tag--personality">Từng học sinh</span></p>
          <table className="table table--compact">
            <thead><tr><th scope="col">Yếu tố quan sát</th><th scope="col">Mức</th><th scope="col">Ghi chú</th></tr></thead>
            <tbody>
              {SPEAKING_OBSERVATION.map((s) => (
                <tr key={s}><th scope="row">{s}</th><td>0–2</td><td className="blank">…</td></tr>
              ))}
              <tr className="total"><th scope="row">Tổng</th><td>/10</td><td /></tr>
            </tbody>
          </table>
          <p className="hint">Ghi nhận riêng từng học sinh; không thay thế toàn bộ điểm sản phẩm nhóm.</p>
        </section>
      </div>

      <section className="panel" aria-labelledby="product-rubric">
        <h2 id="product-rubric">Phụ lục 2 · Rubric sản phẩm – thực hành (10 điểm)</h2>
        <p className="tag-line"><span className="tag tag--looks">Điểm nhóm</span></p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th scope="col">Tiêu chí</th><th scope="col">Tốt</th><th scope="col">Đạt</th><th scope="col">Chưa đạt</th><th scope="col">Tối đa</th></tr>
            </thead>
            <tbody>
              {PRODUCT_RUBRIC.map((r, i) => (
                <tr key={r.criterion}><th scope="row">{i + 1}. {r.criterion}</th><td>{r.good}</td><td>{r.pass}</td><td>{r.fail}</td><td className="num">{r.max}</td></tr>
              ))}
              <tr className="total"><th scope="row">Tổng</th><td colSpan={3} /><td className="num">10</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" aria-labelledby="test-form" data-no-shortcuts>
        <div className="panel__head panel__head--row">
          <div>
            <h2 id="test-form">Phụ lục 3 · Phiếu thử nghiệm</h2>
            <p className="muted">Nhóm điền sau khi chế tạo. Dữ liệu chỉ lưu trên trình duyệt này.</p>
          </div>
          <div className="segmented" role="radiogroup" aria-label="Xem phiếu">
            <label className={!showSample ? 'is-on' : ''}>
              <input type="radio" name="form-view" checked={!showSample} onChange={() => setShowSample(false)} />
              <span>Phiếu của nhóm</span>
            </label>
            <label className={showSample ? 'is-on' : ''}>
              <input type="radio" name="form-view" checked={showSample} onChange={() => setShowSample(true)} />
              <span>Ví dụ điền mẫu</span>
            </label>
          </div>
        </div>
        {showSample ? (
          <p className="badge-illustrative" role="note">Dữ liệu minh họa – không phải kết quả lớp học thực tế</p>
        ) : (
          <p className="badge-pending" role="note">Dữ liệu thực tế: bổ sung sau khi triển khai</p>
        )}

        <fieldset className={`test-form${showSample ? ' is-sample' : ''}`} disabled={readOnly}>
          <label className="field field--inline">
            <span>Tên nhóm</span>
            <input id="tf-group" value={view.group} onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))} />
          </label>

          <div className="table-wrap">
            <table className="table table--form">
              <thead>
                <tr><th scope="col">Tiêu chí</th><th scope="col">Khối 1 · WHO</th><th scope="col">Khối 2 · LOOKS</th><th scope="col">Khối 3 · PERSONALITY</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Cạnh đo được (cm)<small>Đối chiếu bản thiết kế</small></th>
                  {[0, 1, 2].map((i) => <td key={i}><input id={`tf-edge-${i}`} inputMode="decimal" aria-label={`Cạnh khối ${i + 1}`} value={view.edges[i]} onChange={(e) => setArr('edges', i, e.target.value)} /></td>)}
                </tr>
                <tr>
                  <th scope="row">Còn nguyên sau 10 lượt gieo<small>Ghi nứt, bung mép</small></th>
                  {[0, 1, 2].map((i) => <td key={i}><span className="of"><input id={`tf-intact-${i}`} inputMode="numeric" aria-label={`Số lượt còn nguyên khối ${i + 1}`} value={view.intact[i]} onChange={(e) => setArr('intact', i, e.target.value)} />/10</span></td>)}
                </tr>
                <tr>
                  <th scope="row">Đọc rõ mặt trên<small>Gieo trên bàn phẳng</small></th>
                  {[0, 1, 2].map((i) => <td key={i}><span className="of"><input id={`tf-read-${i}`} inputMode="numeric" aria-label={`Số lượt đọc được khối ${i + 1}`} value={view.readable[i]} onChange={(e) => setArr('readable', i, e.target.value)} />/10</span></td>)}
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Gieo cả 3 khối ít nhất 5 lượt, tạo 2 câu mỗi lượt</h3>
          <div className="table-wrap">
            <table className="table table--form">
              <thead><tr><th scope="col">Lượt</th><th scope="col">Kết quả gieo</th><th scope="col">Hai câu nói được</th><th scope="col">Đúng</th></tr></thead>
              <tbody>
                {view.combos.map((c, i) => (
                  <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    <td><input id={`tf-roll-${i}`} lang="en" aria-label={`Kết quả gieo lượt ${i + 1}`} value={c.roll} onChange={(e) => setCombo(i, { roll: e.target.value })} /></td>
                    <td><input id={`tf-sent-${i}`} lang="en" aria-label={`Hai câu lượt ${i + 1}`} value={c.sentences} onChange={(e) => setCombo(i, { sentences: e.target.value })} /></td>
                    <td><input id={`tf-ok-${i}`} type="checkbox" aria-label={`Lượt ${i + 1} ghép đúng`} checked={c.ok} onChange={(e) => setCombo(i, { ok: e.target.checked })} /></td>
                  </tr>
                ))}
                <tr className="total"><th scope="row" colSpan={3}>Số tổ hợp ghép đúng</th><td className="num">{okCount}/5</td></tr>
              </tbody>
            </table>
          </div>

          <div className="form-grid">
            <label className="field field--inline">
              <span>Thành viên đã nói</span>
              <span className="of">
                <input id="tf-spoke" inputMode="numeric" aria-label="Số thành viên đã nói" value={view.spoke} onChange={(e) => setForm((f) => ({ ...f, spoke: e.target.value }))} />/
                <input id="tf-members" inputMode="numeric" aria-label="Tổng số thành viên" value={view.members} onChange={(e) => setForm((f) => ({ ...f, members: e.target.value }))} />
              </span>
            </label>
            <label className="field">
              <span>Lỗi phát hiện</span>
              <textarea id="tf-problem" rows={2} value={view.problem} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} />
            </label>
            <label className="field">
              <span>Điều chỉnh đã thực hiện</span>
              <textarea id="tf-change" rows={2} value={view.change} onChange={(e) => setForm((f) => ({ ...f, change: e.target.value }))} />
            </label>
            <label className="field">
              <span>Kết quả kiểm tra lại</span>
              <textarea id="tf-retest" rows={2} value={view.retest} onChange={(e) => setForm((f) => ({ ...f, retest: e.target.value }))} />
            </label>
          </div>
        </fieldset>
        {!showSample && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setForm(EMPTY)}>
            Xóa phiếu
          </button>
        )}
      </section>

      <div className="two-col">
        <section className="panel" aria-labelledby="portfolio">
          <h2 id="portfolio">Phụ lục 6 · Nhật ký học tập nhóm</h2>
          <div className="table-wrap">
            <table className="table table--compact">
              <thead><tr><th scope="col">Ngày</th><th scope="col">Công việc</th><th scope="col">Người phụ trách</th><th scope="col">Minh chứng / khó khăn</th></tr></thead>
              <tbody>
                {PORTFOLIO_LOG.map((w) => (
                  <tr key={w}><td className="blank">…/…/…</td><th scope="row">{w}</th><td className="blank">…</td><td className="blank">…</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" aria-labelledby="evidence">
          <h2 id="evidence">Phụ lục 7 · Minh chứng lớp học</h2>
          <p className="muted">Ảnh thật sẽ được bổ sung sau khi triển khai. Không dùng ảnh minh họa hoặc số liệu mô phỏng làm bằng chứng.</p>
          <ul className="evidence">
            {EVIDENCE_SLOTS.map((e) => (
              <li key={e.figure} className="evidence__slot">
                <strong>{e.figure}</strong>
                <span>{e.label}</span>
                <em>[Bổ sung sau khi triển khai]</em>
              </li>
            ))}
          </ul>
          <figure className="ref-figure">
            <img src={`${import.meta.env.BASE_URL}reference/cube-roles-diagram.png`} alt="Sơ đồ ba nhóm ngữ liệu WHO, LOOKS, PERSONALITY với 6 mặt mỗi khối." />
            <figcaption className="caption">Hình 1. Sơ đồ ba nhóm ngữ liệu (mô phỏng minh họa do người biên soạn tạo).</figcaption>
          </figure>
        </section>
      </div>
    </div>
  );
}
