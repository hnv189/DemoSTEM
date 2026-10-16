import type { ReactNode } from 'react';
import { CUBES } from '../content/vocabulary';
import { PROJECT, blankOr } from '../content/project';
import { ACTIVITIES, FLOW_STEPS, FUTURE_TOPICS } from '../content/teaching';
import { WEIGHTS } from '../content/assessment';
import { MATERIALS } from '../content/build';
import { buildSentences } from '../lib/language';
import { netMeasurements } from '../lib/net';
import { useAppState } from '../state/AppState';
import { navigate } from '../state/router';
import { CubeTrio } from '../components/CssCube';
import { NetDiagram } from '../components/NetDiagram';
import { Parts } from '../components/Parts';

const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

function Frame({ kicker, title, children, className = '' }: { kicker: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`scene ${className}`}>
      <header className="scene__head">
        <p className="scene__kicker">{kicker}</p>
        <h2 className="scene__title">{title}</h2>
      </header>
      <div className="scene__body">{children}</div>
    </div>
  );
}

function IntroScene() {
  const { state } = useAppState();
  return (
    <div className="scene scene--intro">
      <div className="intro__text">
        <p className="scene__kicker">Chủ đề dạy học STEM/STEAM</p>
        <h1 className="intro__title" lang="en">Magic English Cubes</h1>
        <p className="intro__sub">{PROJECT.titleVi}</p>
        <ul className="pill-row">
          <li className="pill">{PROJECT.subject} · {PROJECT.grade}</li>
          <li className="pill" lang="en">{PROJECT.textbook}</li>
          <li className="pill" lang="en">{PROJECT.unit}</li>
        </ul>
        <dl className="intro__meta">
          <div><dt>Đơn vị</dt><dd>{PROJECT.school}, {PROJECT.locality}</dd></div>
          <div><dt>Giáo viên</dt><dd>{blankOr(PROJECT.teacherName)}</dd></div>
          <div><dt>Năm học</dt><dd>{blankOr(PROJECT.schoolYear)}</dd></div>
        </dl>
      </div>
      <div className="intro__visual">
        <CubeTrio faces={state.faces} size={150} />
      </div>
    </div>
  );
}

function ProblemScene() {
  const steps = [
    { label: 'Nhận biết từ vựng', state: 'ok', note: 'Học sinh nhớ được từ rời rạc' },
    { label: 'Ghép thành câu', state: 'gap', note: 'Chưa vận dụng linh hoạt' },
    { label: 'Nói và tương tác', state: 'gap', note: 'Ít chủ động luyện nói' },
  ];
  return (
    <Frame kicker="Vấn đề thực tiễn" title="Biết từ, nhưng chưa nói thành câu">
      <div className="ladder" role="list">
        {steps.map((s, i) => (
          <div key={s.label} role="listitem" className={`ladder__step ladder__step--${s.state}`} style={{ ['--i' as string]: i }}>
            <span className="ladder__mark" aria-hidden="true">{s.state === 'ok' ? '✓' : '?'}</span>
            <strong>{s.label}</strong>
            <span>{s.note}</span>
          </div>
        ))}
      </div>
      <blockquote className="quote">
        Làm thế nào để học sinh <b>tự chế tạo</b> một bộ xúc xắc <b>tái sử dụng</b>, ghép được nhiều câu Tiếng Anh <b>đúng ngữ pháp</b>, dễ chơi và khuyến khích giao tiếp tự nhiên?
      </blockquote>
    </Frame>
  );
}

function SolutionScene() {
  const cycle = [
    { name: 'Thiết kế', text: 'Hình khai triển, 18 mặt từ, màu phân biệt 3 khối' },
    { name: 'Chế tạo', text: 'Bìa tái chế, cạnh 5–6 cm, tai dán chắc' },
    { name: 'Thử nghiệm', text: '≥ 10 lượt gieo/khối, ghi lỗi và cải tiến' },
    { name: 'Sử dụng', text: 'Gieo, ghép 2 câu, hỏi – đáp theo cặp' },
  ];
  const steam = [
    ['S', 'Vật liệu, độ bền, khả năng lăn'],
    ['T', 'Thiết kế mẫu in chữ và hình'],
    ['E', 'Kết cấu hình khai triển có tai dán'],
    ['M', '6 mặt, 12 cạnh, 8 đỉnh; diện tích'],
    ['A', 'Màu sắc, biểu tượng, kiểu chữ'],
  ];
  return (
    <Frame kicker="Giải pháp" title="Học sinh tự làm ra học cụ của mình">
      <div className="solution">
        <ol className="cycle">
          {cycle.map((c) => (
            <li key={c.name} className="cycle__item">
              <strong>{c.name}</strong>
              <span>{c.text}</span>
            </li>
          ))}
        </ol>
        <figure className="ref-photo">
          <img src={`${import.meta.env.BASE_URL}reference/teacher-reference-cubes.png`} alt="Ảnh tham khảo: nhiều khối lập phương giấy in từ Tiếng Anh và một hình khai triển." />
          <figcaption className="caption">Ảnh tham khảo ý tưởng do giáo viên cung cấp, không phải sản phẩm học sinh.</figcaption>
        </figure>
      </div>
      <ul className="steam">
        {steam.map(([k, v]) => (
          <li key={k}><b>{k}</b> {v}</li>
        ))}
      </ul>
    </Frame>
  );
}

function MechanismScene() {
  const { selection, state } = useAppState();
  const [s1, s2] = buildSentences(selection, state.pronounMode);
  return (
    <Frame kicker="Nguyên lý ngôn ngữ" title="Ba khối, hai câu đúng ngữ pháp">
      <div className="vocab-cols">
        {CUBES.map((cube) => (
          <div key={cube.id} className={`vocab-col vocab-col--${cube.id}`}>
            <h3 lang="en">Cube {cube.number}: {cube.label}</h3>
            <ul lang="en">
              {cube.faces.map((f) => (
                <li key={f.id}>{f.text}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mechanism">
        <p className="mechanism__rule">
          <span className="hl hl--who">WHO</span> + <span className="hl hl--looks">LOOKS</span> → <span className="mechanism__out"><Parts parts={s1} /></span>
        </p>
        <p className="mechanism__rule">
          <span className="hl hl--who">WHO / he / she</span> + <span className="hl hl--personality">PERSONALITY</span> → <span className="mechanism__out"><Parts parts={s2} /></span>
        </p>
        <p className="mechanism__why">
          Mọi chủ ngữ đều ở ngôi thứ ba số ít, mỗi mặt khối 2 và 3 đã có sẵn <b lang="en">is</b> / <b lang="en">has</b>, nên cả 216 tổ hợp đều ghép được câu đúng.
          <span className="wrong" lang="en"> She friendly ✗</span> <span className="right" lang="en">She is friendly ✓</span>
        </p>
      </div>
    </Frame>
  );
}

function DemoScene({ scene }: { scene: number }) {
  const { state, update } = useAppState();
  const open = (mode: 'guided' | 'free') => {
    update({ demoMode: mode, flowStep: 0, showSentences: false });
    navigate({ page: 'demo', from: scene });
  };
  return (
    <Frame kicker="Trình diễn trực tiếp" title="Gieo thử và nói thành câu">
      <div className="demo-scene">
        <div className="demo-scene__left">
          <ol className="flow-chips" lang="en">
            {FLOW_STEPS.map((s, i) => (
              <li key={s.id}>
                <span>{i + 1}</span>
                {s.en}
              </li>
            ))}
          </ol>
          <p className="demo-scene__example">
            Ví dụ có hướng dẫn: <b lang="en">Lan / has long hair / is friendly</b>
          </p>
          <div className="demo-scene__actions">
            <button type="button" className="btn btn--primary btn--big" onClick={() => open('guided')}>
              Mở demo có hướng dẫn
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => open('free')}>
              Khám phá tự do
            </button>
          </div>
        </div>
        <CubeTrio faces={state.faces} size={120} />
      </div>
    </Frame>
  );
}

function BuildScene() {
  const a = 6;
  const m = netMeasurements(a, 1);
  return (
    <Frame kicker="STEM – Chế tạo" title="Từ hình khai triển đến khối lập phương">
      <div className="build-scene">
        <figure className="build-scene__net">
          <NetDiagram a={a} tab={1} compact />
          <figcaption className="caption">4 ô thẳng hàng, 1 ô trên và 1 ô dưới ô thứ hai · 7 tai dán (minh họa)</figcaption>
        </figure>
        <div className="facts">
          <div className="fact"><b>6</b> mặt vuông</div>
          <div className="fact"><b>12</b> cạnh</div>
          <div className="fact"><b>8</b> đỉnh</div>
          <div className="fact fact--wide">
            S = 6a² = 6 × {a}² = <b>{fmt(m.cubeArea)} cm²</b>
            <small>chưa tính tai dán 0,7–1,0 cm</small>
          </div>
          <div className="fact fact--wide">
            Thử <b>≥ 10</b> lượt gieo/khối, <b>≥ 5</b> lượt gieo cả 3 khối
          </div>
          <p className="materials-line">{MATERIALS.map((x) => x.name).join(' · ')}</p>
        </div>
      </div>
    </Frame>
  );
}

function PlanScene() {
  return (
    <Frame kicker="Tiến trình dạy học" title="5 hoạt động, 2 tiết học 45 phút">
      <ol className="timeline">
        {ACTIVITIES.map((a) => (
          <li key={a.number} className={`timeline__item timeline__item--${a.where}`}>
            <span className="timeline__when">{a.when}{a.duration ? ` · ${a.duration}` : ''}</span>
            <span className="timeline__num">{a.number}</span>
            <strong>{a.title}</strong>
            <span className="timeline__where">{a.where === 'class' ? 'Trên lớp' : 'Ở nhà'}</span>
            {a.steps && (
              <span className="timeline__mins" title={a.steps.map((s) => `${s.label} ${s.minutes} phút`).join(', ')}>
                {a.steps.map((s) => `${s.minutes}′`).join(' + ')}
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="scene__foot">Chuẩn bị trước: phiếu nhiệm vụ, sơ đồ khai triển, bảng 18 cụm từ, rubric; nhóm 4–5 học sinh với vai trò rõ ràng.</p>
    </Frame>
  );
}

function AssessmentScene() {
  return (
    <Frame kicker="Đánh giá" title="Đánh giá bằng minh chứng">
      <div className="weights" role="img" aria-label="Thiết kế 30%, Sản phẩm và trình bày 60%, Hồ sơ học tập 10%">
        {WEIGHTS.map((w) => (
          <div key={w.id} className="weights__seg" style={{ flexGrow: w.percent, background: w.color }}>
            <b>{w.percent}%</b>
            <span>{w.label}</span>
          </div>
        ))}
      </div>
      <div className="assess-cards">
        <div className="assess-card">
          <strong>Điểm nhóm</strong>
          <span>Thiết kế và Sản phẩm: GV 70% + HS đánh giá chéo 30%</span>
        </div>
        <div className="assess-card assess-card--accent">
          <strong>Quan sát nói cá nhân</strong>
          <span>5 tiêu chí × 0–2 điểm, ghi riêng từng học sinh, không thay điểm nhóm</span>
        </div>
        <div className="assess-card">
          <strong>Phiếu thử nghiệm</strong>
          <span>Kích thước, 10 lượt gieo/khối, đọc mặt, ≥ 5 lượt ghép câu, sự tham gia</span>
        </div>
        <div className="assess-card">
          <strong>Hồ sơ học tập</strong>
          <span>Nhật ký nhóm, bản vẽ, ảnh tự chụp, bài phản tư 3–5 câu</span>
        </div>
      </div>
    </Frame>
  );
}

function ClosingScene() {
  const { state } = useAppState();
  return (
    <Frame kicker="Tổng kết" title="Một bộ khối, dùng lại cho nhiều bài học">
      <div className="closing">
        <div className="closing__visual">
          <CubeTrio faces={state.faces} size={110} caption={false} />
          <p className="caption">Thẻ mặt khối có thể thay mới; khung bìa được dùng lại.</p>
        </div>
        <div className="closing__lists">
          <div>
            <h3>Cải tiến tiếp</h3>
            <ul>
              <li>Thêm 6 mặt mới, kiểm tra lại mọi tổ hợp</li>
              <li>Tăng cỡ chữ, màu tương phản sau thử nghiệm</li>
              <li>Mã QR phát âm (tùy điều kiện)</li>
            </ul>
          </div>
          <div>
            <h3>Chủ đề mở rộng</h3>
            <ul>
              {FUTURE_TOPICS.map((t) => (
                <li key={t.unit}><b lang="en">{t.unit}</b><br /><small>{t.note}</small></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <p className="thanks">Cảm ơn thầy cô đã lắng nghe!</p>
    </Frame>
  );
}

export function SceneView({ index }: { index: number }) {
  switch (index) {
    case 0: return <IntroScene />;
    case 1: return <ProblemScene />;
    case 2: return <SolutionScene />;
    case 3: return <MechanismScene />;
    case 4: return <DemoScene scene={5} />;
    case 5: return <BuildScene />;
    case 6: return <PlanScene />;
    case 7: return <AssessmentScene />;
    default: return <ClosingScene />;
  }
}
