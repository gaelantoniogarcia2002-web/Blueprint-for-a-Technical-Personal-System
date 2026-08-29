/**
 * UI store — modal open/close state only.
 * NEVER imports db. NEVER holds domain entities.
 */
import { create } from 'zustand';

interface UIState {
  modals: Record<string, boolean>;
  toggle(id: string): void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {},

  toggle(id) {
    set((s) => ({
      modals: { ...s.modals, [id]: !s.modals[id] },
    }));
  },
}));
