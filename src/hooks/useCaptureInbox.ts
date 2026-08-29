import { useLiveQuery } from 'dexie-react-hooks';
import { listInbox } from '@/repositories/captureItem.repo';
import type { CaptureItem } from '@/domain/types';

export function useCaptureInbox(): CaptureItem[] {
  return useLiveQuery(() => listInbox(), [], []);
}
