# Tasks: Blueprint PWA v0.2

**Change**: `blueprint-pwa-v02`
**Date**: 2026-08-28
**Artifact store**: hybrid (engram + openspec)
**Delivery strategy**: auto-chain
**Review budget**: 800 lines

---

## Phase 1 — Project Scaffold

### T-01 · Init Vite + React + TypeScript project
- **RF/RNF**: RNF-02
- **Size**: S
- **Depends on**: —
- **Notes**: `npm create vite@latest unidad -- --template react-ts`. Enable `strict: true` in `tsconfig.json`. Configure path alias `@/` → `src/`.

### T-02 · Install and configure core dependencies
- **RF/RNF**: RNF-02
- **Size**: S
- **Depends on**: T-01
- **Notes**: Install: `dexie dexie-react-hooks zustand recharts @tanstack/react-router vite-plugin-pwa`. Install dev: `vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom fake-indexeddb jsdom eslint`. Single `npm install` command.

### T-03 · Configure TailwindCSS v4
- **RF/RNF**: RNF-02
- **Size**: S
- **Depends on**: T-01
- **Notes**: Install `tailwindcss @tailwindcss/vite`. Add Tailwind v4 Vite plugin. Create `src/styles/globals.css` with `@import "tailwindcss"` layers. Import from `main.tsx`.

### T-04 · Initialize Shadcn/ui
- **RF/RNF**: RNF-02
- **Size**: S
- **Depends on**: T-03
- **Notes**: `npx shadcn@latest init`. Accept defaults (CSS variables, Tailwind v4, TypeScript). Add primitives needed immediately: `button`, `card`, `input`, `textarea`, `badge`.

### T-05 · Configure Vitest + test setup
- **RF/RNF**: RNF-02 (testing infrastructure)
- **Size**: S
- **Depends on**: T-02
- **Notes**: Add `vitest.config.ts` with `jsdom` environment, `setupFiles: ['src/test/setup.ts']`. Create `src/test/setup.ts` importing `fake-indexeddb/auto` and `@testing-library/jest-dom`.

---

## Phase 2 — Data Layer

### T-06 · Domain types
- **RF/RNF**: RNF-01, RNF-03
- **Size**: S
- **Depends on**: T-01
- **Notes**: Create `src/domain/types.ts` with the exact locked interfaces: `DepositType`, `PARANode`, `Loop`, `CaptureItem`. No alterations permitted in v0.2.

### T-07 · Dexie schema (BlueprintDB)
- **RF/RNF**: RNF-01, RNF-03
- **Size**: S
- **Depends on**: T-06
- **Notes**: Create `src/db/schema.ts`. `BlueprintDB extends Dexie`, version 1 with tables `paraNodes`, `loops`, `captureItems` and exact indexes from spec. Export singleton `db`. Create `src/db/seed.ts` as an optional dev helper (no test imports).

### T-08 · PARANode repository + unit tests
- **RF/RNF**: RNF-01, RNF-02
- **Size**: M
- **Depends on**: T-07, T-05
- **Notes**: Create `src/repositories/paraNode.repo.ts` with `listParaNodes`, `getParaNode`, `createParaNode`, `updateParaNode`, `deleteParaNode`. Tests: create, read by id, list all, update, delete — each in an isolated fake-indexeddb instance. Use `beforeEach` to reset db.

### T-09 · Loop repository + unit tests
- **RF/RNF**: RNF-01, RF-03
- **Size**: M
- **Depends on**: T-07, T-05
- **Notes**: Create `src/repositories/loop.repo.ts` with `listLoops`, `createLoop`, `closeLoop`, `appendFeedback`. Tests: create, read by id, list by `nodeId`, update status, delete.

### T-10 · CaptureItem repository + unit tests
- **RF/RNF**: RNF-01, RF-01
- **Size**: M
- **Depends on**: T-07, T-05
- **Notes**: Create `src/repositories/captureItem.repo.ts` with `listInbox`, `addCapture`, `markProcessed`, `deleteCapture`. Tests: create, read by id, list unprocessed, mark processed, delete.

### T-11 · ESLint db-boundary rule
- **RF/RNF**: RNF-01
- **Size**: S
- **Depends on**: T-07
- **Notes**: Add ESLint `no-restricted-imports` rule: any import from `@/db/schema` or `../db/schema` is only allowed inside `src/repositories/**`. Verify rule fires when a non-repo file imports `db`.

### T-12 · Domain pure functions (paraRules, wizardMachine)
- **RF/RNF**: RF-03, RNF-01
- **Size**: S
- **Depends on**: T-06
- **Notes**: Create `src/domain/paraRules.ts` with `classify(draft)` returning a `DepositType`. Create `src/domain/wizardMachine.ts` with step-transition logic (pure, no side-effects). No Dexie import.

---

## Phase 3 — Routing

### T-13 · TanStack Router route tree + nav shell
- **RF/RNF**: RF-04
- **Size**: M
- **Depends on**: T-04 (Shadcn primitives available)
- **Notes**: Create `src/app/routes/__root.tsx` (`createRootRoute`) with nav shell (`<nav>` links to all four routes) and `<Outlet/>`. Create stub route modules: `capture.tsx`, `dashboard.tsx`, `para.tsx`, `review.tsx` — each exporting a minimal placeholder component. Wire `createRouter` + `RouterProvider` in `src/main.tsx`. Verify browser back/forward works and unknown routes render not-found.

---

## Phase 4 — Capture Tunnel (RF-01)

### T-14 · useLiveQuery hook — useCaptureInbox
- **RF/RNF**: RF-01, RNF-01
- **Size**: S
- **Depends on**: T-10
- **Notes**: Create `src/hooks/useCaptureInbox.ts` wrapping `listInbox` with `useLiveQuery`. Returns `CaptureItem[]`.

### T-15 · CaptureShell + CaptureInput components
- **RF/RNF**: RF-01
- **Size**: M
- **Depends on**: T-04, T-14
- **Notes**: Create `src/components/capture/CaptureShell.tsx` (structural container: `flex flex-col min-h-0 min-w-0`). Create `src/components/capture/CaptureInput.tsx` (textarea input row: `shrink-0`). Inbox list region: `flex-1 min-h-0 overflow-y-auto`. Token/text bubbles: `max-w-full min-w-0 break-words overflow-wrap-anywhere whitespace-pre-wrap`. Wire `addCapture` on submit.

### T-16 · Component tests — CaptureShell (RF-01 regression)
- **RF/RNF**: RF-01
- **Size**: S
- **Depends on**: T-15, T-05
- **Notes**: RTL test: render `<CaptureShell>` with a 60-char unbroken token; assert no horizontal overflow (check `scrollWidth <= clientWidth` on container). Test multi-line expansion: 3+ newlines do not collapse siblings. Test normal short input renders without regression.

### T-17 · Wire capture route
- **RF/RNF**: RF-01, RF-04
- **Size**: S
- **Depends on**: T-13, T-15
- **Notes**: Replace stub in `src/app/routes/capture.tsx` with `<CaptureShell>`. Manual smoke test: submit a capture item, observe it in inbox list live.

---

## Phase 5 — Dashboard (RF-02)

### T-18 · useLiveQuery hooks — useParaNodes, useLoops
- **RF/RNF**: RF-02, RNF-01
- **Size**: S
- **Depends on**: T-08, T-09
- **Notes**: Create `src/hooks/useParaNodes.ts` wrapping `listParaNodes` with optional `type` filter. Create `src/hooks/useLoops.ts` wrapping `listLoops` with optional `{ nodeId, status }` filter.

### T-19 · Dashboard chart components (Recharts)
- **RF/RNF**: RF-02
- **Size**: M
- **Depends on**: T-18, T-04
- **Notes**: Create `src/components/dashboard/ParaChart.tsx` (PieChart by DepositType). Create `src/components/dashboard/ProgressChart.tsx` (BarChart: PROJECT nodes × active/closed loops). Create `src/components/dashboard/LoopsChart.tsx` (LineChart: active loops over time). All data from hook results; aggregation in pure functions in `src/domain/`. Empty-state indicator when data is absent.

### T-20 · Wire dashboard route
- **RF/RNF**: RF-02, RF-04
- **Size**: S
- **Depends on**: T-13, T-19
- **Notes**: Replace stub in `src/app/routes/dashboard.tsx`. Compose `ParaChart`, `ProgressChart`, `LoopsChart`. Manual smoke: verify chart updates live when a new PARANode is added via capture.

---

## Phase 6 — Weekly Review Wizard (RF-03)

### T-21 · Zustand stores (wizard.store, ui.store)
- **RF/RNF**: RF-03, RNF-01
- **Size**: S
- **Depends on**: T-06
- **Notes**: Create `src/stores/wizard.store.ts` with `step`, `currentItemId`, `draft`, `next`, `prev`, `reset`, `setDraft`. Create `src/stores/ui.store.ts` with `modals`, `toggle`. Neither store imports `db`. No PARANode/Loop/CaptureItem in store state.

### T-22 · Wizard step components + commit handlers
- **RF/RNF**: RF-03, RNF-01
- **Size**: L
- **Depends on**: T-21, T-14, T-08, T-09, T-10, T-12
- **Notes**: Create `src/components/wizard/StepInbox.tsx` (step 0: iterate inbox, per-item action). Create `src/components/wizard/StepProcess.tsx` (step 1: apply `paraRules.classify`, call `createParaNode`, `createLoop`, `markProcessed`). Create `src/components/wizard/StepProjects.tsx` (step 2: iterate PROJECT nodes, call `updateParaNode`, `appendFeedback`). Each step has a `commit` handler that writes to Dexie then calls `next()`. `reset()` on wizard completion.

### T-23 · CES instrumentation (console.debug)
- **RF/RNF**: RF-03
- **Size**: S
- **Depends on**: T-22
- **Notes**: At each step transition (inside `next`/`prev` handlers) and at wizard completion, emit `console.debug('[CES]', { step, elapsed, event })`. `elapsed` is measured from `Date.now()` at mount. No Dexie write for CES in v0.2. Satisfies RF-03 "CES instrumentation records step timing" scenario.

### T-24 · Wizard component tests
- **RF/RNF**: RF-03
- **Size**: M
- **Depends on**: T-22, T-05
- **Notes**: RTL tests using fake-indexeddb (or mocked repo): (1) Step 1 → Step 2 transition renders step 2 content. (2) Step 2 → Step 3 transition renders step 3 content. (3) Back navigation from step 2 renders step 1. (4) Completing step 3 persists a timestamp + completion flag to Dexie. (5) Abandoning mid-flow (navigate away before step 3) leaves Dexie unchanged.

### T-25 · Wire review route
- **RF/RNF**: RF-03, RF-04
- **Size**: S
- **Depends on**: T-13, T-22
- **Notes**: Replace stub in `src/app/routes/review.tsx` with `<ReviewWizard>` (orchestrates steps via `wizard.store`). Manual smoke: complete all three steps, verify Dexie entry persisted.

---

## Phase 7 — PARA Browser (RF-04 partial)

### T-26 · PARA browser list + create UI
- **RF/RNF**: RF-04
- **Size**: M
- **Depends on**: T-18, T-13, T-04
- **Notes**: Create `src/components/para/ParaBrowser.tsx`. List all PARANodes grouped by `DepositType` via `useParaNodes`. Inline form to create a new PARANode (calls `createParaNode`). Basic update (title/description) via `updateParaNode`. No delete UI required in v0.2. Wire to `src/app/routes/para.tsx`.

---

## Phase 8 — PWA (RF-05)

### T-27 · Inline SVG icon asset
- **RF/RNF**: RF-05
- **Size**: S
- **Depends on**: T-01
- **Notes**: Create `public/icon.svg` as a 512×512 inline SVG placeholder (solid filled rectangle with "B" letter, no external assets). Generate a second `public/icon-maskable.svg` with `purpose: "maskable"` safe zone. These are the only icon assets for v0.2.

### T-28 · vite-plugin-pwa configuration + manifest
- **RF/RNF**: RF-05
- **Size**: S
- **Depends on**: T-02, T-27
- **Notes**: Add `VitePWA` to `vite.config.ts` with `registerType: 'autoUpdate'`. Manifest: `name: 'Blueprint'`, `short_name: 'Blueprint'`, `display: 'standalone'`, `start_url: '/'`, `theme_color: '#0b0b0b'`, `icons` array referencing `icon.svg` (192, 512) and `icon-maskable.svg`. Workbox `globPatterns: ['**/*.{js,css,html,svg}']`, `navigateFallback: '/index.html'`, `runtimeCaching: []`.

### T-29 · PWA manual checklist execution
- **RF/RNF**: RF-05
- **Size**: S
- **Depends on**: T-28, T-17, T-20, T-25, T-26
- **Notes**: Manual verification only — no automated test. Checklist items: (1) Install prompt appears on Chrome desktop. (2) Install prompt on Chrome/Safari mobile. (3) All four routes load with network disconnected after first load. (4) Dexie data accessible offline. (5) New SW update prompts cleanly. Record pass/fail per item.

---

## Phase 9 — Quality Gate

### T-30 · TypeScript strict-mode clean build
- **RF/RNF**: RNF-02
- **Size**: S
- **Depends on**: All implementation tasks (T-06 through T-28)
- **Notes**: Run `tsc --strict --noEmit`. Fix every error. Zero errors required. This is a blocking gate before any delivery.

### T-31 · ESLint boundary rule verification
- **RF/RNF**: RNF-01
- **Size**: S
- **Depends on**: T-11, T-30
- **Notes**: Run `eslint src/` and confirm no `no-restricted-imports` violations. Confirm the rule fires by attempting a test import of `db` outside `repositories/` and verifying the lint error appears.

### T-32 · Full test suite green
- **RF/RNF**: All
- **Size**: S
- **Depends on**: T-08, T-09, T-10, T-16, T-24
- **Notes**: `vitest run`. All unit and component tests pass. Zero skips in required coverage. Coverage: PARANode CRUD (5 ops), Loop CRUD (5 ops), CaptureItem CRUD (5 ops), Wizard step transitions (5 scenarios), CaptureShell overflow (3 scenarios).

---

## Parallelism Map

Tasks within each phase that share only the scaffold dependency can run in parallel once their prerequisites are complete.

```
T-01
├── T-02 (deps T-01) ──┬── T-05 (deps T-02)
│                       └── [dep chain for T-08/09/10]
├── T-03 (deps T-01) ── T-04 (deps T-03)
└── T-06 (deps T-01) ── T-07 (deps T-06)
                           ├── T-08 ─┐
                           ├── T-09 ─┤  (parallel, each needs T-07 + T-05)
                           └── T-10 ─┘

After T-04 + T-14:  T-15, T-18 can run in parallel
After T-15:         T-16, T-17 can run in parallel
After T-18:         T-19, T-26 can run in parallel

T-21 depends on T-06 only → can start as soon as T-06 is done
T-22 depends on T-21, T-14, T-08, T-09, T-10, T-12 → must wait for all

T-27, T-28 are independent of feature phases; T-27 can start at T-01.
```

Sequential gates (cannot be bypassed):
1. T-06 → T-07 → repositories (T-08, T-09, T-10)
2. T-13 (routing) must precede all route-wiring tasks (T-17, T-20, T-25, T-26)
3. T-22 is the critical-path longest task (L size, most upstream deps)
4. T-30 → T-31 → T-32 → T-29 (quality gate is fully sequential at the end)

---

## Review Workload Forecast

| Phase | Tasks | Est. lines changed |
|---|---|---|
| Scaffold (T-01–T-05) | 5 | ~120 |
| Data layer (T-06–T-12) | 7 | ~280 |
| Routing (T-13) | 1 | ~80 |
| Capture tunnel (T-14–T-17) | 4 | ~160 |
| Dashboard (T-18–T-20) | 3 | ~200 |
| Weekly Wizard (T-21–T-25) | 5 | ~350 |
| PARA browser (T-26) | 1 | ~120 |
| PWA (T-27–T-29) | 3 | ~60 |
| Quality gate (T-30–T-32) | 3 | ~30 (fixes only) |
| **Total** | **32** | **~1400** |

**Budget**: 800 lines per review. Total estimate: ~1400 lines.

**Recommendation**: split into two chained PRs.

### Suggested PR boundaries

**PR-1 — Data layer + routing + capture** (~480 lines)
- T-01 through T-17 (scaffold, data layer, routing, capture tunnel + tests)
- This PR is self-contained and verifiable: all three repositories tested, capture tunnel regression test passes, routing resolves four routes.

**PR-2 — Dashboard + wizard + PARA + PWA + quality gate** (~920 lines)
- T-18 through T-32 (dashboard, wizard, PARA browser, PWA config, gates)
- Depends on PR-1 merged. Ends with `tsc --strict`, ESLint boundary rule, full test suite, and manual PWA checklist.

Both PRs are within the 800-line review budget with a modest buffer (PR-1 ~480, PR-2 ~920 → PR-2 slightly over; if needed, split wizard tests T-24 into a micro-PR between dashboard and quality gate to stay under 800).

---

## Key Learnings

1. The Dexie schema is fully locked at version 1 and must not be altered within v0.2.
2. Zustand stores must never import `db` or hold any PARANode, Loop, or CaptureItem instance.
3. CES step-timing instrumentation is satisfied in v0.2 by `console.debug` emission only; the Dexie sink is deferred to v0.2.1.
4. The capture tunnel CSS fix is structural and must be encapsulated in `CaptureShell` to prevent layout drift across future refactors.
5. The ESLint `no-restricted-imports` boundary rule is the primary enforcement mechanism for the Dexie-only data layer contract.
