import { beforeEach, describe, expect, it } from 'vitest';
import { BlueprintDB } from '@/db/schema';
import type { CaptureItem } from '@/domain/types';

let testDb: BlueprintDB;
let counter = 0;

function makeTestDb(): BlueprintDB {
  counter += 1;
  return new BlueprintDB(`blueprint-test-capture-${counter}`);
}

async function addCapture(
  dbInst: BlueprintDB,
  rawText: string,
): Promise<string> {
  const id = crypto.randomUUID();
  const item: CaptureItem = { id, rawText, processed: false, createdAt: Date.now() };
  await dbInst.captureItems.add(item);
  return id;
}

describe('CaptureItem repository', () => {
  beforeEach(() => {
    testDb = makeTestDb();
  });

  it('creates a CaptureItem and returns its id', async () => {
    const id = await addCapture(testDb, 'Buy milk');
    expect(typeof id).toBe('string');
    expect(id).not.toBe('');
  });

  it('reads a CaptureItem by id', async () => {
    const id = await addCapture(testDb, 'Read a book');
    const item = await testDb.captureItems.get(id);
    expect(item).toBeDefined();
    expect(item?.rawText).toBe('Read a book');
  });

  it('lists only unprocessed items', async () => {
    const id1 = await addCapture(testDb, 'Item 1');
    const id2 = await addCapture(testDb, 'Item 2');
    await addCapture(testDb, 'Item 3');

    // Mark item2 as processed
    await testDb.captureItems.update(id2, { processed: true });

    const unprocessed = await testDb.captureItems.filter((i) => !i.processed).toArray();
    expect(unprocessed).toHaveLength(2);
    expect(unprocessed.map((i) => i.id)).toContain(id1);
  });

  it('marks a CaptureItem as processed', async () => {
    const id = await addCapture(testDb, 'Process me');
    await testDb.captureItems.update(id, { processed: true });
    const item = await testDb.captureItems.get(id);
    expect(item?.processed).toBe(true);
  });

  it('deletes a CaptureItem', async () => {
    const id = await addCapture(testDb, 'Delete me');
    await testDb.captureItems.delete(id);
    const item = await testDb.captureItems.get(id);
    expect(item).toBeUndefined();
  });
});
