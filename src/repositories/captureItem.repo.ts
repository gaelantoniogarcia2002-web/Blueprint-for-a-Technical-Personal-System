import { db } from '@/db/schema';
import type { CaptureItem } from '@/domain/types';
import { randomUUID } from '@/lib/uuid';

export async function listInbox(): Promise<CaptureItem[]> {
  // Use filter() since fake-indexeddb and IndexedDB handle boolean indexes differently
  return db.captureItems.filter((item) => !item.processed).toArray();
}

export async function addCapture(rawText: string): Promise<string> {
  const id = randomUUID();
  const now = Date.now();
  await db.captureItems.add({ id, rawText, processed: false, createdAt: now });
  return id;
}

export async function markProcessed(id: string): Promise<void> {
  await db.captureItems.update(id, { processed: true });
}

export async function deleteCapture(id: string): Promise<void> {
  await db.captureItems.delete(id);
}
