import { PROJECT, blankOr } from '../content/project';
import { useAppState } from '../state/AppState';
import { navigate, hrefFor } from '../state/router';
import { CubeTrio } from '../components/CssCube';

const AREAS = [
  { page: 'present' as const, title: 'Trình bày', text: '9 cảnh, khoảng 10 phút, có ghi chú người trình bày.', color: 'var(--who)' },
  { page: 'demo' as const, title: 'Demo 3D', text: 'Gieo, khóa khối, ghép hai câu và hội thoại A–B.', color: 'var(--looks)' },
  { page: 'build' as const, title: 'Thiết kế & Chế tạo', text: 'Hình khai triển gấp thành khối, cạnh 5–6 cm, 6a².', color: 'var(--personality)' },
  { page: 'assess' as const, title: 'Đánh giá', text: 'Rubric 30/60/10, quan sát nói cá nhân, phiếu thử nghiệm.', color: 'var(--primary)' },
];

export function HomePage() {
  const { state, update } = useAppState();
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Tiếng Anh 6 · <span lang="en">Global Success</span> · <span lang="en">Unit 3 – My Friends</span></p>
          <h1 className="hero__title" lang="en">Magic English Cubes</h1>
          <p className="hero__sub">{PROJECT.titleVi}</p>
          <p className="hero__lede">
            Học sinh thiết kế và chế tạo 3 khối lập phương bằng bìa tái chế, kiểm tra độ bền, rồi dùng chúng để miêu tả nhân vật hư cấu và luyện hội thoại.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary btn--big" onClick={() => { update({ sceneIndex: 0 }); navigate({ page: 'present', scene: 1 }); }}>
              Bắt đầu thuyết trình
            </button>
            <button type="button" className="btn btn--big btn--outline" onClick={() => navigate({ page: 'demo' })}>
              Trải nghiệm 3D
            </button>
          </div>
          {state.sceneIndex > 0 && (
            <a className="resume" href={hrefFor({ page: 'present', scene: state.sceneIndex + 1 })}>
              Tiếp tục bài thuyết trình từ cảnh {state.sceneIndex + 1} →
            </a>
          )}
        </div>
        <div className="hero__visual">
          <CubeTrio faces={state.faces} size={140} />
        </div>
      </section>

      <nav className="areas" aria-label="Các khu vực">
        {AREAS.map((a) => (
          <a key={a.page} className="area" href={hrefFor({ page: a.page })} style={{ ['--area' as string]: a.color }}>
            <strong>{a.title}</strong>
            <span>{a.text}</span>
          </a>
        ))}
      </nav>

      <section className="panel info" aria-labelledby="info-title">
        <h2 id="info-title">Thông tin chủ đề</h2>
        <dl className="info__grid">
          <div><dt>Cuộc thi</dt><dd>{PROJECT.competition}</dd></div>
          <div><dt>Đơn vị</dt><dd>{PROJECT.school}, {PROJECT.locality}</dd></div>
          <div><dt>Thời lượng</dt><dd>{PROJECT.duration}</dd></div>
          <div><dt>Sản phẩm</dt><dd>{PROJECT.product}</dd></div>
          <div><dt>Giáo viên</dt><dd>{blankOr(PROJECT.teacherName)}</dd></div>
          <div><dt>Tổ chuyên môn</dt><dd>{blankOr(PROJECT.department)}</dd></div>
          <div><dt>Năm học</dt><dd>{blankOr(PROJECT.schoolYear)}</dd></div>
        </dl>
        <p className="hint">Cập nhật tên giáo viên, tổ chuyên môn và năm học trong <code>src/content/project.ts</code>.</p>
      </section>
    </div>
  );
}
