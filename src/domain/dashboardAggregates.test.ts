import { describe, expect, it } from 'vitest';
import {
  aggregateLoopsStatusByDay,
  aggregateDurationByType,
  mostRecentUpdate,
  daysSince,
  aggregateLoopsModuleSummary,
} from '@/domain/dashboardAggregates';
import type { Loop, PARANode, ReviewSession } from '@/domain/types';

function makeLoop(overrides: Partial<Loop> = {}): Loop {
  return {
    id: crypto.randomUUID(),
    nodeId: 'node-1',
    title: 'Loop',
    status: 'ACTIVE',
    feedbackNotes: [],
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeNode(overrides: Partial<PARANode> = {}): PARANode {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: 'Node',
    type: 'PROJECT',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('aggregateLoopsStatusByDay', () => {
  it('splits active and closed loops per day', () => {
    const day = new Date('2026-01-01T12:00:00Z').getTime();
    const loops = [
      makeLoop({ createdAt: day, status: 'ACTIVE' }),
      makeLoop({ createdAt: day, status: 'CLOSED' }),
      makeLoop({ createdAt: day, status: 'CLOSED' }),
    ];
    const result = aggregateLoopsStatusByDay(loops);
    expect(result).toEqual([{ date: '2026-01-01', active: 1, closed: 2 }]);
  });

  it('returns an empty array for no loops', () => {
    expect(aggregateLoopsStatusByDay([])).toEqual([]);
  });
});

describe('aggregateDurationByType', () => {
  it('uses now - createdAt for active nodes and updatedAt - createdAt for finished/archived ones', () => {
    const now = Date.now();
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    const nodes = [
      makeNode({ type: 'PROJECT', createdAt: now - tenDaysMs, updatedAt: now - tenDaysMs }), // active: ~10 days old
      makeNode({
        type: 'ARCHIVE',
        createdAt: now - tenDaysMs,
        updatedAt: now - tenDaysMs / 2,
      }), // archived: ~5 days duration
    ];
    const result = aggregateDurationByType(nodes, now);

    const project = result.find((r) => r.type === 'PROJECT');
    const archive = result.find((r) => r.type === 'ARCHIVE');
    expect(project?.avgDurationDays).toBeCloseTo(10, 0);
    expect(archive?.avgDurationDays).toBeCloseTo(5, 0);
  });
});

describe('mostRecentUpdate / daysSince', () => {
  it('finds the max updatedAt across nodes, or null if empty', () => {
    const now = Date.now();
    expect(mostRecentUpdate([])).toBeNull();
    expect(mostRecentUpdate([makeNode({ updatedAt: now - 1000 }), makeNode({ updatedAt: now })])).toBe(now);
  });

  it('computes whole days elapsed', () => {
    const now = Date.now();
    expect(daysSince(now - 3 * 24 * 60 * 60 * 1000, now)).toBe(3);
    expect(daysSince(now, now)).toBe(0);
  });
});

describe('aggregateLoopsModuleSummary', () => {
  function makeSession(overrides: Partial<ReviewSession> = {}): ReviewSession {
    return { id: crypto.randomUUID(), completedAt: Date.now(), completed: true, ...overrides };
  }

  it('connects loop counts with review-session history', () => {
    const now = Date.now();
    const loops = [makeLoop({ status: 'ACTIVE' }), makeLoop({ status: 'CLOSED' }), makeLoop({ status: 'CLOSED' })];
    const sessions = [
      makeSession({ completedAt: now - 7 * 24 * 60 * 60 * 1000 }),
      makeSession({ completedAt: now - 2 * 24 * 60 * 60 * 1000 }),
      makeSession({ completed: false, completedAt: now }),
    ];

    const summary = aggregateLoopsModuleSummary(loops, sessions);
    expect(summary.activeCount).toBe(1);
    expect(summary.closedCount).toBe(2);
    expect(summary.reviewSessionsCompleted).toBe(2);
    expect(summary.daysSinceLastReview).toBe(2);
  });

  it('reports null daysSinceLastReview when no review was ever completed', () => {
    const summary = aggregateLoopsModuleSummary([], []);
    expect(summary.daysSinceLastReview).toBeNull();
  });
});
