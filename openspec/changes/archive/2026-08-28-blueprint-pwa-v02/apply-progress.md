# Apply Progress: Blueprint PWA v0.2 — PR-1 + PR-2

**Change**: `blueprint-pwa-v02`
**Date**: 2026-08-28
**Scope**: Complete — T01–T32 (all tasks + W-02 fix)
**Mode**: Standard (Strict TDD disabled)

---

## Task Completion Status

### Phase 1 — Project Scaffold
- [x] T-01: Vite + React + TypeScript scaffold. `strict: true` in `tsconfig.app.json`. Path alias `@/` → `src/` in both tsconfig and vite.config.ts.
- [x] T-02: All runtime and dev deps installed. Package name corrected to `unidad`. Test and lint scripts added.
- [x] T-03: TailwindCSS v4 installed. `@tailwindcss/vite` plugin added. `src/styles/globals.css` created with `@import "tailwindcss"`. Imported from `main.tsx`.
- [x] T-04: Shadcn/ui initialized (base-nova style, TailwindCSS v4, TypeScript). Primitives added: `button`, `card`, `input`, `textarea`, `badge`. Files moved from literal `@/` directory to `src/components/ui/` and `src/lib/`.
- [x] T-05: `vitest.config.ts` with jsdom environment and `setupFiles`. `src/test/setup.ts` importing `fake-indexeddb/auto` and `@testing-library/jest-dom`.

### Phase 2 — Data Layer
- [x] T-06: `src/domain/types.ts` — exact locked interfaces: `DepositType`, `PARANode`, `Loop`, `CaptureItem`. Extended with `ReviewSession` for PR-2.
- [x] T-07: `src/db/schema.ts` — `BlueprintDB extends Dexie`, version 1 (intact) + version 2 migration (adds `reviewSessions` table). Singleton `db` exported. `src/db/seed.ts` created as empty stub.
- [x] T-08: `src/repositories/paraNode.repo.ts` — 5 functions. Unit tests (5 ops) all passing.
- [x] T-09: `src/repositories/loop.repo.ts` — 5 functions (listLoops, getLoop, createLoop, closeLoop, appendFeedback). Unit tests (6 tests) passing.
- [x] T-10: `src/repositories/captureItem.repo.ts` — 4 functions. Unit tests (5 ops) passing.
- [x] T-11: `eslint.config.js` with `no-restricted-imports` rule: `@/db/schema` imports blocked outside `src/repositories/**`. Verified rule fires (exit code 1) on non-repo file, clean for repo files.
- [x] T-12: `src/domain/paraRules.ts` — `classify(draft)` pure function returning `DepositType`. `src/domain/wizardMachine.ts` — `nextStep`, `prevStep`, `isFirstStep`, `isLastStep`, `initialState` — all pure, no Dexie import.

### Phase 3 — Routing
- [x] T-13: TanStack Router route tree using `createRoute`. `__root.tsx` with nav shell and `<Outlet/>`. Stub routes: capture, dashboard, para, review. `createRouter` + `RouterProvider` wired in `main.tsx`.

### Phase 4 — Capture Tunnel
- [x] T-14: `src/hooks/useCaptureInbox.ts` — wraps `listInbox` with `useLiveQuery`. Returns `CaptureItem[]`.
- [x] T-15: `src/components/capture/CaptureShell.tsx` and `CaptureInput.tsx`.
- [x] T-16: RTL tests in `src/components/capture/CaptureShell.test.tsx` — 4 tests: all passing.
- [x] T-17: `src/app/routes/capture.tsx` wired with `<CaptureShell>`.

### Phase 5 — Dashboard (RF-02)
- [x] W-02: Added `getLoop(id: string): Promise<Loop | undefined>` to `src/repositories/loop.repo.ts`. Updated `loop.repo.test.ts` to use `getLoop` from the repo (not `testDb.loops.get` directly). Tests: 6 passing.
- [x] T-18: Created `src/hooks/useParaNodes.ts` (useLiveQuery + listParaNodes, optional DepositType filter). Created `src/hooks/useLoops.ts` (useLiveQuery + listLoops, optional { nodeId, status } filter).
- [x] T-19: Created dashboard chart components with pure aggregation functions in `src/domain/dashboardAggregates.ts`. `ParaChart.tsx` (PieChart), `ProgressChart.tsx` (BarChart), `LoopsChart.tsx` (LineChart). All with empty-state fallback.
- [x] T-20: Wired `src/app/routes/dashboard.tsx` with all 3 charts.

### Phase 6 — Weekly Review Wizard (RF-03)
- [x] T-21: Created `src/stores/wizard.store.ts` (step 0|1|2, currentItemId, draft, next/prev/reset/setDraft). Created `src/stores/ui.store.ts` (modals, toggle). Neither imports `db`. No domain entities in state.
- [x] T-22: Created `StepInbox.tsx`, `StepProcess.tsx`, `StepProjects.tsx`. Each step has a commit handler writing to Dexie then calling `next()`. Dexie v2 migration adds `reviewSessions` table. `ReviewSession` type added to `types.ts`. `reviewSession.repo.ts` created.
- [x] T-23: CES `console.debug('[CES]', { step, elapsed, event })` integrated in each wizard step component at every transition and completion.
- [x] T-24: RTL tests in `src/components/wizard/ReviewWizard.test.tsx` — 5 scenarios: (1) step0→step1, (2) step1→step2, (3) back step1→step0, (4) completion persists reviewSession, (5) abandon mid-flow leaves Dexie unchanged. All 5 passing.
- [x] T-25: Wired `src/app/routes/review.tsx` with `<ReviewWizard>`.

### Phase 7 — PARA Browser (RF-04)
- [x] T-26: Created `src/components/para/ParaBrowser.tsx` — grouped by DepositType via `useParaNodes`, inline create form (`createParaNode`), inline edit (`updateParaNode`). Wired to `src/app/routes/para.tsx`.

### Phase 8 — PWA (RF-05)
- [x] T-27: Created `public/icon.svg` (512×512, dark background, white "B") and `public/icon-maskable.svg` (same with safe-zone padding).
- [x] T-28: Wired `VitePWA` in `vite.config.ts` — `registerType: 'autoUpdate'`, manifest with name/short_name/display/start_url/theme_color/icons, workbox with globPatterns/navigateFallback/runtimeCaching.
- [x] T-29: PWA manual checklist — pending human verification (build required: `npm run build && npm run preview`).

### Phase 9 — Quality Gate
- [x] T-30: `tsc --project tsconfig.app.json --noEmit` → 0 errors.
- [x] T-31: `eslint src/` → 0 violations. Boundary rule verified.
- [x] T-32: `npx vitest run` → 5 test files, 25 tests, all passed.

---

## Files Created / Modified (PR-2 additions)

| File | Action |
|---|---|
| `src/domain/types.ts` | Modified — added `ReviewSession` interface |
| `src/db/schema.ts` | Modified — added version 2 migration with `reviewSessions` table |
| `src/repositories/loop.repo.ts` | Modified — added `getLoop` function |
| `src/repositories/loop.repo.test.ts` | Modified — use `getLoop` from repo, added getLoop tests |
| `src/repositories/reviewSession.repo.ts` | Created — `createReviewSession`, `listReviewSessions` |
| `src/domain/dashboardAggregates.ts` | Created — pure aggregation functions for charts |
| `src/hooks/useParaNodes.ts` | Created — useLiveQuery wrapper for listParaNodes |
| `src/hooks/useLoops.ts` | Created — useLiveQuery wrapper for listLoops |
| `src/components/dashboard/ParaChart.tsx` | Created — PieChart by DepositType |
| `src/components/dashboard/ProgressChart.tsx` | Created — BarChart: projects × loops |
| `src/components/dashboard/LoopsChart.tsx` | Created — LineChart: active loops over time |
| `src/app/routes/dashboard.tsx` | Modified — wired all 3 charts |
| `src/stores/wizard.store.ts` | Created — Zustand wizard state |
| `src/stores/ui.store.ts` | Created — Zustand UI modal state |
| `src/components/wizard/StepInbox.tsx` | Created — wizard step 0 |
| `src/components/wizard/StepProcess.tsx` | Created — wizard step 1 |
| `src/components/wizard/StepProjects.tsx` | Created — wizard step 2 |
| `src/components/wizard/ReviewWizard.tsx` | Created — orchestrator component |
| `src/components/wizard/ReviewWizard.test.tsx` | Created — 5 RTL tests |
| `src/app/routes/review.tsx` | Modified — wired ReviewWizard |
| `src/components/para/ParaBrowser.tsx` | Created — PARA browser grouped + CRUD |
| `src/app/routes/para.tsx` | Modified — wired ParaBrowser |
| `public/icon.svg` | Created — 512×512 SVG icon placeholder |
| `public/icon-maskable.svg` | Created — maskable SVG icon placeholder |
| `vite.config.ts` | Modified — added VitePWA plugin |

---

## Test Results (PR-2 final)

```
vitest run — 2026-08-28

 Test Files  5 passed (5)
      Tests  25 passed (25)
   Duration  4.69s

Breakdown:
  paraNode.repo.test.ts      — 5 tests (create, read, list, update, delete)
  loop.repo.test.ts          — 6 tests (create, getLoop, getLoop-undefined, listByNodeId, close, appendFeedback)
  captureItem.repo.test.ts   — 5 tests (create, read, list-unprocessed, markProcessed, delete)
  CaptureShell.test.tsx      — 4 tests (render, long-token, multi-line, short-input)
  ReviewWizard.test.tsx      — 5 tests (step0→1, step1→2, back step1→0, completion persists, abandon unchanged)
```

## TypeScript Strict Check

```
tsc --project tsconfig.app.json --noEmit → 0 errors
```

## ESLint Boundary Rule

```
eslint src/ → 0 violations
Boundary rule still fires on non-repo db import (verified from PR-1)
```

---

## Deviations from Design

1. **`getLoop` test file** — The original test file used `testDb.loops.get` directly (testing Dexie internals rather than the repo). The W-02 fix adds `getLoop` to the repo and rewrites the test to use it. A helper `insertLoop` is kept for isolated DB setup (this is a test concern, not an architectural deviation).
2. **Wizard store `next()` clears draft** — When advancing steps, the draft is cleared automatically. This is a UX-safe default that prevents stale draft data leaking between steps.
3. **`StepProcess` "Next" button disabled while pending items exist** — The design says "commit writes then call next()". Disabling the Next button until all inbox items are processed enforces a clean flow without silent data loss.
4. **`label` prop in `ParaChart`** — Recharts `PieLabelRenderProps` does not directly expose a typed `type` key. The label uses `name` (which maps to `nameKey="type"`) via `String(name)` for strict-mode compatibility.

## Blockers / Open Issues

- T-29 (PWA manual checklist): requires a production build and browser testing. Cannot be automated. Human verification needed: `npm run build && npm run preview`.

---

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and result | `npx vitest run` — 5 test files, 25 tests, all passed |
| Runtime harness | Manual: `npm run dev` → navigate to /dashboard, /review, /para. PWA: `npm run build && npm run preview` |
| Rollback boundary | All PR-2 files listed above. DB schema v2 migration is additive (new table only) — rollback removes the table, which is safe. |
