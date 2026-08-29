import { useLiveQuery } from 'dexie-react-hooks';
import { listParaNodes } from '@/repositories/paraNode.repo';
import type { DepositType, PARANode } from '@/domain/types';

export function useParaNodes(type?: DepositType): PARANode[] {
  return useLiveQuery(() => listParaNodes(type), [type], []);
}
