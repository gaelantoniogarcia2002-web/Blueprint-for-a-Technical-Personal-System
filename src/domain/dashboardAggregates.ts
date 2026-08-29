/**
 * Pure aggregation functions for dashboard charts.
 * No side-effects, no Dexie imports.
 */

import type { DepositType, PARANode, Loop } from '@/domain/types';

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
