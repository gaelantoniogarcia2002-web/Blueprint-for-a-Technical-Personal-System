import { describe, expect, it } from 'vitest';
import {
  createParaNode,
  getParaNode,
  finishParaNode,
  reopenParaNode,
  archiveParaNode,
  restoreParaNode,
  setEstimatedMinutes,
  logTimeSpent,
} from '@/repositories/paraNode.repo';

describe('PARANode lifecycle repository (Finalizar / Archivar / tiempo dedicado, v0.3)', () => {
  it('finishes a node and reopens it', async () => {
    const id = await createParaNode({ title: 'Finish me', type: 'PROJECT' });

    await finishParaNode(id);
    expect((await getParaNode(id))?.status).toBe('FINISHED');

    await reopenParaNode(id);
    expect((await getParaNode(id))?.status).toBe('ACTIVE');
  });

  it('archives a node into the ARCHIVE deposit and remembers its origin', async () => {
    const id = await createParaNode({ title: 'Archive me', type: 'AREA' });

    await archiveParaNode(id);
    const archived = await getParaNode(id);
    expect(archived?.type).toBe('ARCHIVE');
    expect(archived?.archivedFromType).toBe('AREA');
  });

  it('restores an archived node back to its original deposit', async () => {
    const id = await createParaNode({ title: 'Restore me', type: 'RESOURCE' });
    await archiveParaNode(id);

    await restoreParaNode(id);
    const restored = await getParaNode(id);
    expect(restored?.type).toBe('RESOURCE');
    expect(restored?.archivedFromType).toBeUndefined();
  });

  it('is a no-op to archive a node that is already archived', async () => {
    const id = await createParaNode({ title: 'Already archived', type: 'ARCHIVE' });

    await archiveParaNode(id);
    const node = await getParaNode(id);
    expect(node?.type).toBe('ARCHIVE');
    expect(node?.archivedFromType).toBeUndefined();
  });

  it('sets an estimate and logs time spent, accumulating across calls', async () => {
    const id = await createParaNode({ title: 'Time me', type: 'PROJECT' });

    await setEstimatedMinutes(id, 120);
    await logTimeSpent(id, 15);
    await logTimeSpent(id, 30);

    const node = await getParaNode(id);
    expect(node?.estimatedMinutes).toBe(120);
    expect(node?.loggedMinutes).toBe(45);
  });

  it('ignores non-positive time logs', async () => {
    const id = await createParaNode({ title: 'No negative time', type: 'PROJECT' });

    await logTimeSpent(id, 0);
    await logTimeSpent(id, -10);

    const node = await getParaNode(id);
    expect(node?.loggedMinutes).toBeUndefined();
  });
});
