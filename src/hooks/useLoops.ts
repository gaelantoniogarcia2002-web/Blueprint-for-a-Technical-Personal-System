import { useLiveQuery } from 'dexie-react-hooks';
import { listLoops } from '@/repositories/loop.repo';
import type { Loop } from '@/domain/types';

export function useLoops(filter?: {
  nodeId?: string;
  status?: Loop['status'];
}): Loop[] {
  return useLiveQuery(() => listLoops(filter), [filter?.nodeId, filter?.status], []);
}
