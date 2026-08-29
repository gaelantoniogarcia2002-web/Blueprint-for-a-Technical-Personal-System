import { beforeEach, describe, expect, it } from 'vitest';
import { BlueprintDB } from '@/db/schema';
import {
  listLoops,
  createLoop,
  getLoop,
  closeLoop,
  appendFeedback,
} from '@/repositories/loop.repo';
import type { Loop } from '@/domain/types';

let testDb: BlueprintDB;
let counter = 0;

function makeTestDb(): BlueprintDB {
  counter += 1;
  return new BlueprintDB(`blueprint-test-loop-${counter}`);
}

// Helper: insert a loop directly into the test DB (bypasses repo singleton db)
async function insertLoop(
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
    const id = await createLoop({
      nodeId: 'node-1',
      title: 'Sprint Loop',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    expect(typeof id).toBe('string');
    expect(id).not.toBe('');
  });

  it('reads a Loop by id via getLoop', async () => {
    // insertLoop is for the isolated testDb; getLoop uses the singleton db
    await insertLoop(testDb, {
      nodeId: 'node-2',
      title: 'Read Loop',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    const repoId = await createLoop({
      nodeId: 'node-2',
      title: 'Read Loop via repo',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    const loop = await getLoop(repoId);
    expect(loop).toBeDefined();
    expect(loop?.title).toBe('Read Loop via repo');
    expect(loop?.id).toBe(repoId);
  });

  it('returns undefined for non-existent id via getLoop', async () => {
    const loop = await getLoop('does-not-exist');
    expect(loop).toBeUndefined();
  });

  it('lists loops by nodeId', async () => {
    await createLoop({
      nodeId: 'node-A',
      title: 'Loop 1',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    await createLoop({
      nodeId: 'node-A',
      title: 'Loop 2',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    await createLoop({
      nodeId: 'node-B',
      title: 'Loop 3',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    const loops = await listLoops({ nodeId: 'node-A' });
    expect(loops.length).toBeGreaterThanOrEqual(2);
    expect(loops.every((l) => l.nodeId === 'node-A')).toBe(true);
  });

  it('closes a loop and verifies status via getLoop', async () => {
    const id = await createLoop({
      nodeId: 'node-3',
      title: 'Close Me',
      status: 'ACTIVE',
      feedbackNotes: [],
    });
    await closeLoop(id);
    const loop = await getLoop(id);
    expect(loop?.status).toBe('CLOSED');
  });

  it('appends feedback to a loop and verifies via getLoop', async () => {
    const id = await createLoop({
      nodeId: 'node-4',
      title: 'Feedback Loop',
      status: 'ACTIVE',
      feedbackNotes: ['initial note'],
    });
    await appendFeedback(id, 'new note');
    const updated = await getLoop(id);
    expect(updated?.feedbackNotes).toEqual(['initial note', 'new note']);
  });
});
