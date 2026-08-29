/**
 * Wizard step-transition logic.
 * Pure functions — no side effects, no Dexie import.
 */

export type WizardStep = 'INBOX' | 'PROCESS' | 'PROJECTS';

const STEP_ORDER: WizardStep[] = ['INBOX', 'PROCESS', 'PROJECTS'];

export interface WizardState {
  step: WizardStep;
  currentItemId: string | null;
}

export function nextStep(state: WizardState): WizardState {
  const idx = STEP_ORDER.indexOf(state.step);
  const next = STEP_ORDER[idx + 1];
  if (next === undefined) return state;
  return { ...state, step: next };
}

export function prevStep(state: WizardState): WizardState {
  const idx = STEP_ORDER.indexOf(state.step);
  const prev = STEP_ORDER[idx - 1];
  if (prev === undefined) return state;
  return { ...state, step: prev };
}

export function isFirstStep(state: WizardState): boolean {
  return state.step === STEP_ORDER[0];
}

export function isLastStep(state: WizardState): boolean {
  return state.step === STEP_ORDER[STEP_ORDER.length - 1];
}

export function initialState(): WizardState {
  return { step: 'INBOX', currentItemId: null };
}
