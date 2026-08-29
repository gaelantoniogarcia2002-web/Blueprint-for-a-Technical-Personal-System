import type { DepositType } from '@/domain/types';

export interface ClassifyDraft {
  title: string;
  description?: string;
  hasDeadline?: boolean;
  isReference?: boolean;
  isArchived?: boolean;
}

/**
 * Classifies a draft node into one of the four PARA deposit types.
 * Pure function — no side effects, no Dexie import.
 */
export function classify(draft: ClassifyDraft): DepositType {
  if (draft.isArchived) return 'ARCHIVE';
  if (draft.isReference) return 'RESOURCE';
  if (draft.hasDeadline) return 'PROJECT';
  return 'AREA';
}
