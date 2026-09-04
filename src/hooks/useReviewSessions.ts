import { useLiveQuery } from 'dexie-react-hooks';
import { listReviewSessions } from '@/repositories/reviewSession.repo';
import type { ReviewSession } from '@/domain/types';

export function useReviewSessions(): ReviewSession[] {
  return useLiveQuery(() => listReviewSessions(), [], []);
}
