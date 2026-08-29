export type DepositType = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';

export interface PARANode {
  id: string;
  title: string;
  type: DepositType;
  description?: string;
  createdAt: number;
  updatedAt: number;
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
