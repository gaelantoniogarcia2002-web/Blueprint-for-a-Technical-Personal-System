import Dexie, { type Table } from 'dexie';
import type { PARANode, Loop, CaptureItem } from '@/domain/types';

export class BlueprintDB extends Dexie {
  paraNodes!: Table<PARANode, string>;
  loops!: Table<Loop, string>;
  captureItems!: Table<CaptureItem, string>;

  constructor(name: string = 'blueprint-v02') {
    super(name);
    this.version(1).stores({
      paraNodes:    'id, type, updatedAt, createdAt',
      loops:        'id, nodeId, status, createdAt',
      captureItems: 'id, processed, createdAt',
    });
  }
}

export const db = new BlueprintDB();
