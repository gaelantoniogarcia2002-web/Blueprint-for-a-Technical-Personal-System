# Design: Blueprint PWA v0.2

## Technical Approach

Dexie-first Local-First PWA. IndexedDB via Dexie is the single source of truth for domain data. React components subscribe via `useLiveQuery`. Zustand holds ephemeral UI state only. TanStack Router handles navigation across four routes. Recharts renders the dashboard. `vite-plugin-pwa` provides installability and offline shell. No Supabase surface in v0.2.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Source of truth | Dexie/IndexedDB only | Zustand-persisted, LocalStorage, in-memory | Local-First, reactive queries, structured indexes, transaction safety |
| Reactivity | `useLiveQuery` per hook | Zustand mirror, manual subscriptions, Query cache | Zero drift, no double SoT, Dexie-native |
| Ephemeral UI | Zustand slices | Component state everywhere, Context | Cross-component wizard/modal without prop drilling |
| Router | TanStack Router | React Router, none | Typed routes, file-agnostic tree, first-class TS |
| Charts | Recharts only | D3, Chart.js | React-composable, sufficient for v0.2 shapes |
| PWA | `vite-plugin-pwa` (Workbox) | Custom SW, Serwist | Batteries-included, Vite-integrated |
| Backend abstraction | None in v0.2 | Repository interface + Supabase stub | Avoid premature port; refactor at v0.3 boundary |
| Tests | Vitest + Testing Library + fake-indexeddb | Jest, Playwright-only | Vite-native, fast, Dexie testable in Node |

## Project Structure

    src/
      main.tsx
      app/                 # router root, providers, PWA registration
        routes/            # TanStack Router route modules
          __root.tsx
          capture.tsx
          dashboard.tsx
          para.tsx
          review.tsx
      db/
        schema.ts          # Dexie subclass + typed tables
        seed.ts
      repositories/
        paraNode.repo.ts
        loop.repo.ts
        captureItem.repo.ts
      hooks/               # useLiveQuery-backed read hooks
        useParaNodes.ts
        useLoops.ts
        useCaptureInbox.ts
      stores/              # Zustand ephemeral slices only
        wizard.store.ts
        ui.store.ts
      domain/              # pure functions (GTD/PARA rules, transitions)
        paraRules.ts
        wizardMachine.ts
      components/
        ui/                # shadcn primitives
        capture/           # CaptureTunnel, CaptureInput
        dashboard/         # ParaChart, ProgressChart, LoopsChart
        wizard/            # StepInbox, StepProcess, StepProjects
      styles/
        globals.css        # Tailwind v4 layers
      test/
        setup.ts           # fake-indexeddb, RTL config

## Dexie Schema

```ts
// db/schema.ts
import Dexie, { Table } from 'dexie';
import type { PARANode, Loop, CaptureItem } from '@/domain/types';

export class BlueprintDB extends Dexie {
  paraNodes!: Table<PARANode, string>;
  loops!: Table<Loop, string>;
  captureItems!: Table<CaptureItem, string>;

  constructor() {
    super('blueprint-v02');
    this.version(1).stores({
      paraNodes:    'id, type, updatedAt, createdAt',
      loops:        'id, nodeId, status, createdAt',
      captureItems: 'id, processed, createdAt',
    });
  }
}
export const db = new BlueprintDB();
```

## Repository API (contracts)

```ts
// paraNode.repo.ts
listParaNodes(type?: DepositType): Promise<PARANode[]>
getParaNode(id: string): Promise<PARANode | undefined>
createParaNode(input: Omit<PARANode,'id'|'createdAt'|'updatedAt'>): Promise<string>
updateParaNode(id: string, patch: Partial<PARANode>): Promise<void>
deleteParaNode(id: string): Promise<void>

// loop.repo.ts
listLoops(filter?: { nodeId?: string; status?: Loop['status'] }): Promise<Loop[]>
createLoop(input: Omit<Loop,'id'|'createdAt'>): Promise<string>
closeLoop(id: string, feedback?: string): Promise<void>
appendFeedback(id: string, note: string): Promise<void>

// captureItem.repo.ts
listInbox(): Promise<CaptureItem[]>          // where processed=false
addCapture(rawText: string): Promise<string>
markProcessed(id: string): Promise<void>
deleteCapture(id: string): Promise<void>
```

Only these functions touch `db.*`. Hooks wrap them with `useLiveQuery`.

## Zustand Slices (ephemeral only)

```ts
// wizard.store.ts
type WizardState = {
  step: 0 | 1 | 2;           // inbox | process | projects
  currentItemId: string | null;
  draft: { title?: string; type?: DepositType; };
  next(): void; prev(): void; reset(): void;
  setDraft(p: Partial<WizardState['draft']>): void;
};

// ui.store.ts
type UIState = {
  modals: Record<string, boolean>;
  toggle(id: string): void;
};
```

Zustand never imports `db`. Persistence points are Dexie writes triggered by wizard `commit` handlers, not by the store itself.

## TanStack Router Route Tree

    __root (providers, nav shell, <Outlet/>)
    ├── /capture   → CaptureTunnel
    ├── /dashboard → DashboardPage (Recharts)
    ├── /para      → ParaBrowser
    └── /review    → ReviewWizard

Typed via `createRootRoute` + `createRoute`; router registered in `main.tsx` with `RouterProvider`.

## Wizard State Machine (3 steps)

    step0 Inbox ──next──▶ step1 Process ──next──▶ step2 Projects ──finish──▶ reset
       ▲                    │                       │
       └──prev──────────────┴──prev─────────────────┘

- **Step 0 Inbox**: iterate `listInbox()`; per item user chooses action → writes on Next.
- **Step 1 Process**: apply PARA rule (`paraRules.classify(draft)`) → `createParaNode` and/or `createLoop`, then `markProcessed(currentItemId)`.
- **Step 2 Projects**: iterate PROJECT nodes; user updates status/feedback → `updateParaNode` / `appendFeedback`.

Persistence happens at each `commit`; store only tracks step + draft. Refresh restores from Dexie (inbox is naturally resumable).

## Recharts Dashboard

| Chart | Component | Data hook | Shape |
|---|---|---|---|
| PARA distribution | `<ParaChart/>` PieChart | `useParaNodes()` | `{ type, count }[]` |
| Project progress | `<ProgressChart/>` BarChart | `useParaNodes('PROJECT')` + `useLoops()` | `{ projectId, active, closed }[]` |
| Active loops over time | `<LoopsChart/>` LineChart | `useLoops({ status:'ACTIVE' })` | `{ date, count }[]` |

All aggregations are pure functions in `domain/` fed by live query results.

## PWA Configuration

```ts
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Blueprint', short_name: 'Blueprint',
    display: 'standalone', start_url: '/', theme_color: '#0b0b0b',
    icons: [/* 192, 512, maskable */],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,woff2,png}'],
    navigateFallback: '/index.html',
    runtimeCaching: [], // data is local; no network cache needed
  },
})
```

Strategy: cache-first for shell, no runtime caching for data (Dexie is local).

## CSS Architecture for Capture Tunnel (structural fix)

Root cause of v0.1 defects: unbounded flex children + missing overflow-wrap on token containers.

Structural rules (Tailwind v4 utility layer + `@layer components`):

- Capture container: `flex flex-col min-h-0 min-w-0` — establish shrink context.
- Scroll region: `flex-1 min-h-0 overflow-y-auto` — flex child must have `min-h-0` to scroll.
- Token/text bubbles: `max-w-full min-w-0 break-words overflow-wrap-anywhere whitespace-pre-wrap` — replaces brittle `word-break: break-all`.
- Input row: `shrink-0` so it never collapses.

Encapsulate in a `CaptureShell` component so the pattern cannot drift.

## Testing Architecture

Runner: **Vitest** + `@testing-library/react` + `fake-indexeddb` (loaded in `test/setup.ts` before Dexie import).

| Layer | Target | Approach |
|---|---|---|
| Unit | `repositories/*`, `domain/*` | Vitest against fake-indexeddb; assert CRUD, indexes, PARA rule outputs |
| Component | Wizard steps, CaptureTunnel | RTL: step transitions, draft-to-Dexie commits, long-token rendering (regression for RF-01) |
| Boundary lint | No `db.` import outside `repositories/` | ESLint `no-restricted-imports` rule |
| Manual | PWA install/offline | Checklist in tasks phase |

## File Changes

Greenfield: all files under `src/**` are Create. No deletions.

## Threat Matrix

N/A — no routing shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Client-side TanStack Router navigation only.

## Migration / Rollout

No migration. v0.1 had no persistent store. First run initializes empty Dexie DB v1.

## Open Questions

- [ ] Icon assets source (design deliverable vs. placeholder for v0.2).
- [ ] CES instrumentation sink — local Dexie table `wizardMetrics` vs. deferred until v0.2.1.
