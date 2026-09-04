/**
 * Pure aggregation functions for dashboard charts.
 * No side-effects, no Dexie imports.
 */

import type { DepositType, PARANode, Loop, ReviewSession } from '@/domain/types';

const DAY_MS = 1000 * 60 * 60 * 24;

// --- ParaChart (PieChart) ---

export interface ParaTypeCount {
  type: DepositType;
  count: number;
}

export function aggregateParaByType(nodes: PARANode[]): ParaTypeCount[] {
  const counts: Partial<Record<DepositType, number>> = {};
  for (const node of nodes) {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
  }
  return (Object.entries(counts) as [DepositType, number][]).map(
    ([type, count]) => ({ type, count }),
  );
}

// --- ProgressChart (BarChart) ---

export interface ProjectProgress {
  projectId: string;
  title: string;
  active: number;
  closed: number;
}

export function aggregateProjectProgress(
  projects: PARANode[],
  loops: Loop[],
): ProjectProgress[] {
  return projects.map((p) => {
    const projectLoops = loops.filter((l) => l.nodeId === p.id);
    return {
      projectId: p.id,
      title: p.title,
      active: projectLoops.filter((l) => l.status === 'ACTIVE').length,
      closed: projectLoops.filter((l) => l.status === 'CLOSED').length,
    };
  });
}

// --- LoopsChart (LineChart) ---

export interface LoopsByDay {
  date: string; // ISO date 'YYYY-MM-DD'
  count: number;
}

export function aggregateLoopsByDay(loops: Loop[]): LoopsByDay[] {
  const counts: Record<string, number> = {};
  for (const loop of loops) {
    const date = new Date(loop.createdAt).toISOString().slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

// --- LoopsChart (comparative: active vs. closed, i.e. iterations completed) ---

export interface LoopsStatusByDay {
  date: string; // ISO date 'YYYY-MM-DD'
  active: number;
  closed: number;
}

export function aggregateLoopsStatusByDay(loops: Loop[]): LoopsStatusByDay[] {
  const byDate: Record<string, { active: number; closed: number }> = {};
  for (const loop of loops) {
    const date = new Date(loop.createdAt).toISOString().slice(0, 10);
    const entry = byDate[date] ?? { active: 0, closed: 0 };
    if (loop.status === 'CLOSED') entry.closed += 1;
    else entry.active += 1;
    byDate[date] = entry;
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}

// --- TimelineChart (comparative duration: Proyectos vs. Áreas/Recursos) ---

export interface DurationByType {
  type: DepositType;
  avgDurationDays: number;
  count: number;
}

/**
 * Average "age" in days per deposit type: for a finished/archived node this is
 * updatedAt - createdAt (how long it took); for an active node it's
 * now - createdAt (how long it's been open). Surfaces stalled work.
 */
export function aggregateDurationByType(
  nodes: PARANode[],
  now: number = Date.now(),
): DurationByType[] {
  const byType: Partial<Record<DepositType, number[]>> = {};
  for (const node of nodes) {
    const end = node.status === 'FINISHED' || node.type === 'ARCHIVE' ? node.updatedAt : now;
    const durationDays = Math.max(0, (end - node.createdAt) / DAY_MS);
    (byType[node.type] ??= []).push(durationDays);
  }
  return (Object.entries(byType) as [DepositType, number[]][]).map(([type, durations]) => ({
    type,
    avgDurationDays: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    count: durations.length,
  }));
}

/** Most recent updatedAt across a set of nodes, or null if empty. */
export function mostRecentUpdate(nodes: PARANode[]): number | null {
  if (nodes.length === 0) return null;
  return Math.max(...nodes.map((n) => n.updatedAt));
}

export function daysSince(timestamp: number, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - timestamp) / DAY_MS));
}

// --- Loops Module (Weekly Review feedback loop) ---

export interface LoopsModuleSummary {
  activeCount: number;
  closedCount: number;
  reviewSessionsCompleted: number;
  daysSinceLastReview: number | null;
}

/** Connects loop state with review-session history for the Dashboard's Loops Module. */
export function aggregateLoopsModuleSummary(
  loops: Loop[],
  reviewSessions: ReviewSession[],
): LoopsModuleSummary {
  const completed = reviewSessions.filter((r) => r.completed);
  const lastCompletedAt = completed.length > 0 ? Math.max(...completed.map((r) => r.completedAt)) : null;
  return {
    activeCount: loops.filter((l) => l.status === 'ACTIVE').length,
    closedCount: loops.filter((l) => l.status === 'CLOSED').length,
    reviewSessionsCompleted: completed.length,
    daysSinceLastReview: lastCompletedAt === null ? null : daysSince(lastCompletedAt),
  };
}
