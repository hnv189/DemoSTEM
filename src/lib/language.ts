import type { PredicateFace, Pronoun, WhoFace } from '../content/vocabulary';

/** For "My best friend" / "My classmate": repeat the subject (default) or use he/she. */
export type PronounMode = 'repeat' | Pronoun;

export type Role = 'who' | 'looks' | 'personality' | 'plain';
export interface Part {
  text: string;
  role: Role;
}

export interface Selection {
  who: WhoFace;
  looks: PredicateFace;
  personality: PredicateFace;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  parts: Part[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Whether a subject needs the he/she choice. */
export const needsPronounChoice = (who: WhoFace) => who.pronoun === null;

/** The pronoun used after the first sentence, or null when the subject is repeated. */
export function followUpPronoun(who: WhoFace, mode: PronounMode): Pronoun | null {
  if (who.pronoun) return who.pronoun;
  return mode === 'repeat' ? null : mode;
}

/** Subject of the second sentence and of B's answers (sentence-initial). */
export function followUpSubject(who: WhoFace, mode: PronounMode): string {
  const p = followUpPronoun(who, mode);
  return p ? cap(p) : who.text;
}

/** How partner A refers to the subject after the first question. */
function followUpRef(who: WhoFace, mode: PronounMode): string {
  return followUpPronoun(who, mode) ?? who.questionRef;
}

export function buildSentences(sel: Selection, mode: PronounMode): [Part[], Part[]] {
  return [
    [
      { text: sel.who.text, role: 'who' },
      { text: ' ', role: 'plain' },
      { text: sel.looks.text, role: 'looks' },
      { text: '.', role: 'plain' },
    ],
    [
      { text: followUpSubject(sel.who, mode), role: 'who' },
      { text: ' ', role: 'plain' },
      { text: sel.personality.text, role: 'personality' },
      { text: '.', role: 'plain' },
    ],
  ];
}

export function buildDialogue(sel: Selection, mode: PronounMode): DialogueLine[] {
  const answerSubject = followUpSubject(sel.who, mode);
  return [
    {
      speaker: 'A',
      parts: [
        { text: 'What does ', role: 'plain' },
        { text: sel.who.questionRef, role: 'who' },
        { text: ' look like?', role: 'plain' },
      ],
    },
    {
      speaker: 'B',
      parts: [
        { text: answerSubject, role: 'who' },
        { text: ' ', role: 'plain' },
        { text: sel.looks.text, role: 'looks' },
        { text: '.', role: 'plain' },
      ],
    },
    {
      speaker: 'A',
      parts: [
        { text: 'What is ', role: 'plain' },
        { text: followUpRef(sel.who, mode), role: 'who' },
        { text: ' like?', role: 'plain' },
      ],
    },
    {
      speaker: 'B',
      parts: [
        { text: answerSubject, role: 'who' },
        { text: ' ', role: 'plain' },
        { text: sel.personality.text, role: 'personality' },
        { text: '.', role: 'plain' },
      ],
    },
  ];
}

export const partsToText = (parts: Part[]) => parts.map((p) => p.text).join('');
