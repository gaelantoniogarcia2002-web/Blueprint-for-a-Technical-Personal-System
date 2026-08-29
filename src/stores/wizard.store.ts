/**
 * Wizard store — tracks step and UI draft state only.
 * NEVER imports db. NEVER holds PARANode, Loop, or CaptureItem instances.
 */
import { create } from 'zustand';
import type { DepositType } from '@/domain/types';

export type WizardStep = 0 | 1 | 2;

interface WizardDraft {
  title?: string;
  type?: DepositType;
}

interface WizardState {
  step: WizardStep;
  currentItemId: string | null;
  draft: WizardDraft;
  next(): void;
  prev(): void;
  reset(): void;
  setCurrentItemId(id: string | null): void;
  setDraft(patch: Partial<WizardDraft>): void;
}

export const useWizardStore = create<WizardState>((set) => ({
  step: 0,
  currentItemId: null,
  draft: {},

  next() {
    set((s) => ({
      step: (Math.min(s.step + 1, 2) as WizardStep),
      draft: {},
    }));
  },

  prev() {
    set((s) => ({
      step: (Math.max(s.step - 1, 0) as WizardStep),
    }));
  },

  reset() {
    set({ step: 0, currentItemId: null, draft: {} });
  },

  setCurrentItemId(id) {
    set({ currentItemId: id });
  },

  setDraft(patch) {
    set((s) => ({ draft: { ...s.draft, ...patch } }));
  },
}));
