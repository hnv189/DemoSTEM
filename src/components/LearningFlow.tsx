import { useEffect, useState } from 'react';
import { CUBES } from '../content/vocabulary';
import { FLOW_STEPS } from '../content/teaching';
import { buildDialogue, buildSentences, needsPronounChoice, partsToText, type PronounMode, type Selection } from '../lib/language';
import { useAppState } from '../state/AppState';
import { Parts } from './Parts';

interface Props {
  selection: Selection;
  busy: boolean;
  /** Words are on the cards but a roll is still settling. */
  rolling: boolean;
  onRollAll: () => void;
  onGuidedExample: () => void;
}

const PRONOUN_OPTIONS: { id: PronounMode; label: string }[] = [
  { id: 'repeat', label: 'Lặp lại chủ ngữ' },
  { id: 'he', label: 'he' },
  { id: 'she', label: 'she' },
];

function useSpeech() {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const speak = (text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };
  return { supported, speak };
}

/** Roll → Read → Build → Speak → Ask → Answer & Switch. */
export function LearningFlow({ selection, busy, rolling, onRollAll, onGuidedExample }: Props) {
  const { state, update } = useAppState();
  const { flowStep, showSentences, pronounMode, rolesSwapped, demoMode } = state;
  const step = FLOW_STEPS[flowStep];
  const sentences = buildSentences(selection, pronounMode);
  const dialogue = buildDialogue(selection, pronounMode);
  const choose = needsPronounChoice(selection.who);
  const speech = useSpeech();
  const studentA = rolesSwapped ? 'Học sinh 2' : 'Học sinh 1';
  const studentB = rolesSwapped ? 'Học sinh 1' : 'Học sinh 2';
  const guided = demoMode === 'guided';
  const canAdvance = !rolling && flowStep < FLOW_STEPS.length - 1;

  useEffect(() => () => {
    if (speech.supported) window.speechSynthesis.cancel();
  }, [speech.supported]);

  const goto = (i: number) => update({ flowStep: i, ...(i >= 2 ? {} : { showSentences: false }) });

  return (
    <section className="panel flow" aria-labelledby="flow-title" data-no-shortcuts>
      <div className="flow__top">
        <div className="panel__head">
          <h2 id="flow-title">Luyện nói theo nhóm</h2>
          <p className="muted">{guided ? 'Làm lần lượt từng bước với ví dụ có hướng dẫn.' : 'Chọn bước bất kỳ. Gieo xúc xắc để có tổ hợp mới.'}</p>
        </div>
        <button type="button" className={`btn btn--toggle${showSentences ? ' is-on' : ''}`} aria-pressed={showSentences} onClick={() => update({ showSentences: !showSentences })} disabled={rolling}>
          {showSentences ? 'Ẩn câu hỗ trợ' : 'Hiện câu hỗ trợ'}
        </button>
      </div>

      <ol className="stepper" aria-label="Các bước">
        {FLOW_STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`stepper__btn${i === flowStep ? ' is-current' : ''}${i < flowStep ? ' is-done' : ''}`}
              aria-current={i === flowStep ? 'step' : undefined}
              onClick={() => goto(i)}
              disabled={guided && i > flowStep + 1}
              lang="en"
            >
              <span className="stepper__num" aria-hidden="true">{i + 1}</span>
              {s.en}
            </button>
          </li>
        ))}
      </ol>

      <div className="flow__body" aria-live="polite">
        <p className="flow__instruction">
          <strong lang="en">{step.en}.</strong> {step.vi}
        </p>

        {step.id === 'roll' && (
          <div className="flow__actions">
            {guided ? (
              <button type="button" className="btn btn--primary" onClick={onGuidedExample} disabled={busy}>
                Gieo ví dụ: Lan / has long hair / is friendly
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={onRollAll} disabled={busy}>
                Gieo cả 3 khối
              </button>
            )}
          </div>
        )}

        {step.id === 'read' && (
          <div className="read-row">
            {CUBES.map((cube, i) => {
              const face = [selection.who, selection.looks, selection.personality][i];
              return (
                <div key={cube.id} className={`word-chip word-chip--${cube.id}`}>
                  <small lang="en">{cube.label}</small>
                  <span lang="en">{rolling ? '…' : face.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {step.id === 'build' && (
          <div className="build-row">
            <div className="formula" aria-label="Công thức ghép câu">
              <span className="formula__line">
                <span className="hl hl--who">WHO</span> + <span className="hl hl--looks">LOOKS</span> → <span>câu 1</span>
              </span>
              <span className="formula__line">
                <span className="hl hl--who">WHO / he / she</span> + <span className="hl hl--personality">PERSONALITY</span> → <span>câu 2</span>
              </span>
            </div>
            {!showSentences && (
              <button type="button" className="btn btn--primary" onClick={() => update({ showSentences: true })} disabled={rolling}>
                Hiện hai câu
              </button>
            )}
          </div>
        )}

        {choose && flowStep >= 2 && (
          <fieldset className="pronoun">
            <legend>
              <span lang="en">“{selection.who.text}”</span> có thể là bạn nam hoặc bạn nữ. Câu 2 dùng:
            </legend>
            <div className="segmented">
              {PRONOUN_OPTIONS.map((o) => (
                <label key={o.id} className={pronounMode === o.id ? 'is-on' : ''}>
                  <input type="radio" name="pronoun" value={o.id} checked={pronounMode === o.id} onChange={() => update({ pronounMode: o.id })} />
                  <span lang={o.id === 'repeat' ? 'vi' : 'en'}>{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {flowStep >= 2 && showSentences && !rolling && (
          <div className="sentences" data-testid="sentences">
            {sentences.map((parts, i) => (
              <p key={i} className="sentence">
                <Parts parts={parts} />
              </p>
            ))}
            {speech.supported && (
              <button type="button" className="btn btn--small" onClick={() => speech.speak(sentences.map(partsToText).join(' '))}>
                Nghe mẫu
              </button>
            )}
          </div>
        )}
        {flowStep >= 2 && !showSentences && (step.id !== 'build') && <p className="hint">Câu đang ẩn. Hãy tự nói trước, sau đó bấm “Hiện câu hỗ trợ” để kiểm tra.</p>}

        {step.id === 'speak' && (
          <p className="prompt">
            {studentB} đọc to hai câu. Không cần micro: cả nhóm cùng nghe và góp ý.
          </p>
        )}

        {(step.id === 'ask' || step.id === 'answer') && (
          <div className="dialogue" data-testid="dialogue">
            {dialogue.map((line, i) => {
              const hideAnswer = line.speaker === 'B' && (!showSentences || step.id === 'ask');
              return (
                <div key={i} className={`dialogue__line dialogue__line--${line.speaker}`}>
                  <span className="dialogue__who">
                    <span lang="en">{line.speaker}</span> · {line.speaker === 'A' ? studentA : studentB}
                  </span>
                  <span className="dialogue__text">{hideAnswer ? <span className="dialogue__blank">B tự trả lời…</span> : <Parts parts={line.parts} />}</span>
                </div>
              );
            })}
          </div>
        )}

        {step.id === 'answer' && (
          <div className="flow__actions">
            <button type="button" className="btn btn--ghost" onClick={() => update({ rolesSwapped: !rolesSwapped })}>
              Đổi vai A ↔ B
            </button>
            <button type="button" className="btn btn--primary" onClick={() => (guided ? update({ demoMode: 'free', flowStep: 0, showSentences: false }) : goto(0))}>
              {guided ? 'Sang khám phá tự do' : 'Lượt mới: gieo lại'}
            </button>
            <p className="prompt">Đổi vai: {studentB} hỏi, {studentA} trả lời và bổ sung một câu.</p>
          </div>
        )}
      </div>

      <div className="flow__nav">
        <button type="button" className="btn btn--ghost" onClick={() => goto(Math.max(0, flowStep - 1))} disabled={flowStep === 0}>
          ← Bước trước
        </button>
        <button type="button" className="btn btn--primary" onClick={() => goto(flowStep + 1)} disabled={!canAdvance || (guided && flowStep === 0)}>
          Bước tiếp →
        </button>
      </div>
    </section>
  );
}
