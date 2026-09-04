import { db } from '@/db/schema';
import type { DepositType, PARANode } from '@/domain/types';
import { randomUUID } from '@/lib/uuid';

export async function listParaNodes(type?: DepositType): Promise<PARANode[]> {
  if (type !== undefined) {
    return db.paraNodes.where('type').equals(type).toArray();
  }
  return db.paraNodes.toArray();
}

export async function getParaNode(id: string): Promise<PARANode | undefined> {
  return db.paraNodes.get(id);
}

export async function createParaNode(
  input: Omit<PARANode, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const now = Date.now();
  const id = randomUUID();
  await db.paraNodes.add({ ...input, id, createdAt: now, updatedAt: now });
  return id;
}

export async function updateParaNode(
  id: string,
  patch: Partial<PARANode>,
): Promise<void> {
  await db.paraNodes.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteParaNode(id: string): Promise<void> {
  await db.paraNodes.delete(id);
}

/** Marks a node as finished (e.g. a completed project). Reversible via reopenParaNode. */
export async function finishParaNode(id: string): Promise<void> {
  await db.paraNodes.update(id, { status: 'FINISHED', updatedAt: Date.now() });
}

/** Reopens a previously finished node. */
export async function reopenParaNode(id: string): Promise<void> {
  await db.paraNodes.update(id, { status: 'ACTIVE', updatedAt: Date.now() });
}

/** Sends a node to the ARCHIVE deposit, remembering its original type for restore. */
export async function archiveParaNode(id: string): Promise<void> {
  const node = await db.paraNodes.get(id);
  if (!node || node.type === 'ARCHIVE') return;
  await db.paraNodes.update(id, {
    archivedFromType: node.type,
    type: 'ARCHIVE',
    updatedAt: Date.now(),
  });
}

/** Restores an archived node to the deposit it was archived from. */
export async function restoreParaNode(id: string): Promise<void> {
  const node = await db.paraNodes.get(id);
  if (!node || node.type !== 'ARCHIVE' || !node.archivedFromType) return;
  await db.paraNodes.update(id, {
    type: node.archivedFromType,
    archivedFromType: undefined,
    updatedAt: Date.now(),
  });
}

/** Sets the lightweight time estimate for a node, in minutes. */
export async function setEstimatedMinutes(id: string, minutes: number): Promise<void> {
  await db.paraNodes.update(id, { estimatedMinutes: Math.max(0, minutes), updatedAt: Date.now() });
}

/** Appends time spent to a node's running total, in minutes. */
export async function logTimeSpent(id: string, minutes: number): Promise<void> {
  if (minutes <= 0) return;
  const node = await db.paraNodes.get(id);
  if (!node) return;
  await db.paraNodes.update(id, {
    loggedMinutes: (node.loggedMinutes ?? 0) + minutes,
    updatedAt: Date.now(),
  });
}
