import { db } from '@/db/schema';
import type { Loop } from '@/domain/types';
import { randomUUID } from '@/lib/uuid';

export async function listLoops(filter?: {
  nodeId?: string;
  status?: Loop['status'];
}): Promise<Loop[]> {
  let collection = db.loops.toCollection();

  if (filter?.nodeId !== undefined && filter?.status !== undefined) {
    return db.loops
      .where('nodeId')
      .equals(filter.nodeId)
      .and((l) => l.status === filter.status)
      .toArray();
  }

  if (filter?.nodeId !== undefined) {
    return db.loops.where('nodeId').equals(filter.nodeId).toArray();
  }

  if (filter?.status !== undefined) {
    const status = filter.status;
    return collection.and((l) => l.status === status).toArray();
  }

  return collection.toArray();
}

export async function createLoop(
  input: Omit<Loop, 'id' | 'createdAt'>,
): Promise<string> {
  const id = randomUUID();
  const now = Date.now();
  await db.loops.add({ ...input, id, createdAt: now });
  return id;
}

export async function getLoop(id: string): Promise<Loop | undefined> {
  return db.loops.get(id);
}

export async function closeLoop(id: string, feedback?: string): Promise<void> {
  const loop = await db.loops.get(id);
  if (!loop) return;

  const feedbackNotes =
    feedback !== undefined
      ? [...loop.feedbackNotes, feedback]
      : loop.feedbackNotes;

  await db.loops.update(id, { status: 'CLOSED', feedbackNotes });
}

export async function appendFeedback(id: string, note: string): Promise<void> {
  const loop = await db.loops.get(id);
  if (!loop) return;
  await db.loops.update(id, {
    feedbackNotes: [...loop.feedbackNotes, note],
  });
}
