import { db } from '@/db/schema';
import type { ReviewSession } from '@/domain/types';
import { randomUUID } from '@/lib/uuid';

export async function createReviewSession(
  input: Omit<ReviewSession, 'id'>,
): Promise<string> {
  const id = randomUUID();
  await db.reviewSessions.add({ ...input, id });
  return id;
}

export async function listReviewSessions(): Promise<ReviewSession[]> {
  return db.reviewSessions.toArray();
}
