import Dexie, { type Table } from 'dexie';
import type { PARANode, Loop, CaptureItem, ReviewSession } from '@/domain/types';

export class BlueprintDB extends Dexie {
  paraNodes!: Table<PARANode, string>;
  loops!: Table<Loop, string>;
  captureItems!: Table<CaptureItem, string>;
  reviewSessions!: Table<ReviewSession, string>;

  constructor(name: string = 'blueprint-v02') {
    super(name);

    // Version 1 — original schema (must remain intact)
    this.version(1).stores({
      paraNodes:    'id, type, updatedAt, createdAt',
      loops:        'id, nodeId, status, createdAt',
      captureItems: 'id, processed, createdAt',
    });

    // Version 2 — adds reviewSessions table
    this.version(2).stores({
      paraNodes:      'id, type, updatedAt, createdAt',
      loops:          'id, nodeId, status, createdAt',
      captureItems:   'id, processed, createdAt',
      reviewSessions: 'id, completedAt',
    });

    // Version 3 — adds paraNodes.status index (Finalizar/Archivar/Eliminar lifecycle, v0.3)
    this.version(3).stores({
      paraNodes:      'id, type, status, updatedAt, createdAt',
      loops:          'id, nodeId, status, createdAt',
      captureItems:   'id, processed, createdAt',
      reviewSessions: 'id, completedAt',
    });
  }
}

export const db = new BlueprintDB();
