import { beforeEach, describe, expect, it } from 'vitest';
import { BlueprintDB } from '@/db/schema';
import type { PARANode } from '@/domain/types';

let testDb: BlueprintDB;
let counter = 0;

function makeTestDb(): BlueprintDB {
  counter += 1;
  return new BlueprintDB(`blueprint-test-para-${counter}`);
}

async function createNode(
  dbInst: BlueprintDB,
  input: Omit<PARANode, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const now = Date.now();
  const id = crypto.randomUUID();
  await dbInst.paraNodes.add({ ...input, id, createdAt: now, updatedAt: now });
  return id;
}

describe('PARANode repository', () => {
  beforeEach(() => {
    testDb = makeTestDb();
  });

  it('creates a PARANode and returns its id', async () => {
    const id = await createNode(testDb, { title: 'My Project', type: 'PROJECT' });
    expect(typeof id).toBe('string');
    expect(id).not.toBe('');
  });

  it('reads a PARANode by id', async () => {
    const id = await createNode(testDb, { title: 'Read Test', type: 'AREA' });
    const node = await testDb.paraNodes.get(id);
    expect(node).toBeDefined();
    expect(node?.title).toBe('Read Test');
    expect(node?.type).toBe('AREA');
  });

  it('lists all PARANodes', async () => {
    await createNode(testDb, { title: 'Node A', type: 'PROJECT' });
    await createNode(testDb, { title: 'Node B', type: 'RESOURCE' });
    const all = await testDb.paraNodes.toArray();
    expect(all).toHaveLength(2);
  });

  it('updates a PARANode', async () => {
    const id = await createNode(testDb, { title: 'Original', type: 'PROJECT' });
    await testDb.paraNodes.update(id, { title: 'Updated', updatedAt: Date.now() });
    const node = await testDb.paraNodes.get(id);
    expect(node?.title).toBe('Updated');
  });

  it('deletes a PARANode', async () => {
    const id = await createNode(testDb, { title: 'To Delete', type: 'ARCHIVE' });
    await testDb.paraNodes.delete(id);
    const node = await testDb.paraNodes.get(id);
    expect(node).toBeUndefined();
  });
});
