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
