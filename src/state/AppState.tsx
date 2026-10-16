import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CUBES, INITIAL_FACES } from '../content/vocabulary';
import type { PronounMode, Selection } from '../lib/language';

/**
 * State shared by the presentation, the demo and the other pages.
 * Kept in sessionStorage so a reload during a talk keeps the scene and words.
 */
export interface SharedState {
  faces: [number, number, number];
  locks: [boolean, boolean, boolean];
  pronounMode: PronounMode;
  sceneIndex: number;
  demoMode: 'guided' | 'free';
  flowStep: number;
  showSentences: boolean;
  rolesSwapped: boolean;
  showNotes: boolean;
  edgeCm: number;
}

const DEFAULTS: SharedState = {
  faces: [...INITIAL_FACES],
  locks: [false, false, false],
  pronounMode: 'repeat',
  sceneIndex: 0,
  demoMode: 'guided',
  flowStep: 0,
  showSentences: false,
  rolesSwapped: false,
  showNotes: false,
  edgeCm: 6,
};

const KEY = 'mec-state-v1';

function load(): SharedState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as SharedState;
    // Guard against stale or edited values.
    parsed.faces = parsed.faces.map((f, i) => (Number.isInteger(f) && f >= 0 && f < CUBES[i].faces.length ? f : INITIAL_FACES[i])) as SharedState['faces'];
    return parsed;
  } catch {
    return DEFAULTS;
  }
}

interface Ctx {
  state: SharedState;
  update: (patch: Partial<SharedState> | ((s: SharedState) => Partial<SharedState>)) => void;
  selection: Selection;
}

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SharedState>(load);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: state still works for this visit */
    }
  }, [state]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      update: (patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })),
      selection: {
        who: CUBES[0].faces[state.faces[0]],
        looks: CUBES[1].faces[state.faces[1]],
        personality: CUBES[2].faces[state.faces[2]],
      },
    }),
    [state],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
