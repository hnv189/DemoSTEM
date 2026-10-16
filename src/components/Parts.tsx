import type { Part } from '../lib/language';

/** English text with each part coloured by its cube (WHO / LOOKS / PERSONALITY). */
export function Parts({ parts }: { parts: Part[] }) {
  return (
    <span lang="en">
      {parts.map((p, i) =>
        p.role === 'plain' ? <span key={i}>{p.text}</span> : <mark key={i} className={`hl hl--${p.role}`}>{p.text}</mark>,
      )}
    </span>
  );
}
