import { beforeEach, describe, expect, it } from 'vitest';
import { BlueprintDB } from '@/db/schema';
import type { Loop } from '@/domain/types';

let testDb: BlueprintDB;
let counter = 0;

function makeTestDb(): BlueprintDB {
  counter += 1;
  return new BlueprintDB(`blueprint-test-loop-${counter}`);
}

async function createLoop(
  dbInst: BlueprintDB,
  input: Omit<Loop, 'id' | 'createdAt'>,
): Promise<string> {
  const id = crypto.randomUUID();
  await dbInst.loops.add({ ...input, id, createdAt: Date.now() });
  return id;
}

describe('Loop repository', () => {
  beforeEach(() => {
    testDb = makeTestDb();
  });

  it('creates a Loop and returns its id', async () => {
    const id = await createLoop(testDb, {
      nodeId: 'node-1',
      title: 'Sprint Loop',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    expect(typeof id).toBe('string');
    expect(id).not.toBe('');
  });

  it('reads a Loop by id', async () => {
    const id = await createLoop(testDb, {
      nodeId: 'node-2',
      title: 'Read Loop',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    const loop = await testDb.loops.get(id);
    expect(loop).toBeDefined();
    expect(loop?.title).toBe('Read Loop');
  });

  it('lists loops by nodeId', async () => {
    await createLoop(testDb, {
      nodeId: 'node-A',
      title: 'Loop 1',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    await createLoop(testDb, {
      nodeId: 'node-A',
      title: 'Loop 2',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    await createLoop(testDb, {
      nodeId: 'node-B',
      title: 'Loop 3',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    const loops = await testDb.loops.where('nodeId').equals('node-A').toArray();
    expect(loops).toHaveLength(2);
  });

  it('closes a loop (updates status)', async () => {
    const id = await createLoop(testDb, {
      nodeId: 'node-3',
      title: 'Close Me',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    await testDb.loops.update(id, { status: 'CLOSED' });
    const loop = await testDb.loops.get(id);
    expect(loop?.status).toBe('CLOSED');
  });

  it('appends feedback to a loop', async () => {
    const id = await createLoop(testDb, {
      nodeId: 'node-4',
      title: 'Feedback Loop',
      status: 'ACTIVE',
      feedbackNotes: ['initial note'],
    });
    const loop = await testDb.loops.get(id);
    if (!loop) throw new Error('Loop not found');
    await testDb.loops.update(id, {
      feedbackNotes: [...loop.feedbackNotes, 'new note'],
    });
    const updated = await testDb.loops.get(id);
    expect(updated?.feedbackNotes).toEqual(['initial note', 'new note']);
  });
});
