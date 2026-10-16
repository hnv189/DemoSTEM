import { describe, expect, it } from 'vitest';
import { LOOKS, PERSONALITY, WHO, GUIDED_FACES } from '../content/vocabulary';
import { buildDialogue, buildSentences, partsToText, type PronounMode } from './language';

const MODES: PronounMode[] = ['repeat', 'he', 'she'];
const SUBJECT_PRONOUN: Record<string, 'He' | 'She' | null> = {
  He: 'He', She: 'She', Lan: 'She', Nam: 'He', 'My best friend': null, 'My classmate': null,
};

const all = WHO.faces.flatMap((who) => LOOKS.faces.flatMap((looks) => PERSONALITY.faces.map((personality) => ({ who, looks, personality }))));

describe('the 216 combinations', () => {
  it('there are exactly 216', () => expect(all).toHaveLength(216));

  it.each(MODES)('every combination makes two compatible sentences (mode: %s)', (mode) => {
    for (const sel of all) {
      const [s1, s2] = buildSentences(sel, mode).map(partsToText);
      // Sentence 1: subject + complete predicate.
      expect(s1).toBe(`${sel.who.text} ${sel.looks.text}.`);
      expect(s1).toMatch(/^[A-Z][a-zA-Z ]* (is|has) [a-z -]+\.$/);
      // "has" only with hair noun phrases, "is" only with adjectives.
      for (const p of [sel.looks, sel.personality]) {
        if (p.verb === 'has') expect(p.text).toMatch(/^has (long|short|curly) hair$/);
        else expect(p.text).toMatch(/^is [a-z-]+$/);
      }
      // Sentence 2: pronoun consistent with the subject.
      const fixed = SUBJECT_PRONOUN[sel.who.text];
      const expected = fixed ?? (mode === 'repeat' ? sel.who.text : mode === 'he' ? 'He' : 'She');
      expect(s2).toBe(`${expected} ${sel.personality.text}.`);
    }
  });

  it.each(MODES)('dialogue stays consistent with the sentences (mode: %s)', (mode) => {
    for (const sel of all) {
      const [s1, s2] = buildSentences(sel, mode).map(partsToText);
      const [q1, a1, q2, a2] = buildDialogue(sel, mode).map((l) => partsToText(l.parts));
      expect(q1).toMatch(/^What does (he|she|Lan|Nam|your best friend|your classmate) look like\?$/);
      expect(q2).toMatch(/^What is (he|she|your best friend|your classmate) like\?$/);
      const subj2 = s2.slice(0, s2.length - sel.personality.text.length - 2);
      expect(a1).toBe(`${subj2} ${sel.looks.text}.`);
      expect(a2).toBe(s2);
      // The pronoun in question 2 matches the answer's subject.
      if (subj2 === 'He' || subj2 === 'She') expect(q2).toBe(`What is ${subj2.toLowerCase()} like?`);
      else expect(q2).toBe(`What is ${subj2.replace(/^My/, 'your')} like?`);
      expect(s1.endsWith('.')).toBe(true);
    }
  });
});

describe('guided example from the proposal', () => {
  it('Lan / has long hair / is friendly', () => {
    const sel = { who: WHO.faces[GUIDED_FACES[0]], looks: LOOKS.faces[GUIDED_FACES[1]], personality: PERSONALITY.faces[GUIDED_FACES[2]] };
    expect(buildSentences(sel, 'repeat').map(partsToText)).toEqual(['Lan has long hair.', 'She is friendly.']);
    expect(buildDialogue(sel, 'repeat').map((l) => `${l.speaker}: ${partsToText(l.parts)}`)).toEqual([
      'A: What does Lan look like?',
      'B: She has long hair.',
      'A: What is she like?',
      'B: She is friendly.',
    ]);
  });

  it('proposal sample "Nam is slim. He is funny."', () => {
    const sel = { who: WHO.faces[3], looks: LOOKS.faces[2], personality: PERSONALITY.faces[1] };
    expect(buildSentences(sel, 'repeat').map(partsToText)).toEqual(['Nam is slim.', 'He is funny.']);
  });

  it('proposal sample "My classmate has short hair. My classmate is creative."', () => {
    const sel = { who: WHO.faces[5], looks: LOOKS.faces[4], personality: PERSONALITY.faces[3] };
    expect(buildSentences(sel, 'repeat').map(partsToText)).toEqual(['My classmate has short hair.', 'My classmate is creative.']);
    expect(partsToText(buildDialogue(sel, 'repeat')[0].parts)).toBe('What does your classmate look like?');
  });
});
