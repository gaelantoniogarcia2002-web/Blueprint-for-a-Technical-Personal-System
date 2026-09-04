export type DepositType = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';

export type NodeLifecycleStatus = 'ACTIVE' | 'FINISHED';

export interface PARANode {
  id: string;
  title: string;
  type: DepositType;
  description?: string;
  createdAt: number;
  updatedAt: number;
  /** Lifecycle status. Undefined is treated as 'ACTIVE' for nodes created before v0.3. */
  status?: NodeLifecycleStatus;
  /** Set when a node is archived, so it can be restored to its original deposit. */
  archivedFromType?: DepositType;
  /** Lightweight time-tracking, in minutes. */
  estimatedMinutes?: number;
  loggedMinutes?: number;
}

export interface Loop {
  id: string;
  nodeId: string;
  title: string;
  status: 'ACTIVE' | 'CLOSED';
  feedbackNotes: string[];
  createdAt: number;
}

export interface CaptureItem {
  id: string;
  rawText: string;
  processed: boolean;
  createdAt: number;
}

export interface ReviewSession {
  id: string;
  completedAt: number;
  completed: boolean;
}
