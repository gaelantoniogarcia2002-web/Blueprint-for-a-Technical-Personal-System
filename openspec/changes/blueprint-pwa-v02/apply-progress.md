# Apply Progress: Blueprint PWA v0.2 — PR-1

**Change**: `blueprint-pwa-v02`
**Date**: 2026-08-28
**Scope**: PR-1 — T01–T17 (scaffold + data layer + routing + capture tunnel)
**Mode**: Standard (Strict TDD disabled — Vitest set up as part of this PR)

---

## Task Completion Status

### Phase 1 — Project Scaffold
- [x] T-01: Vite + React + TypeScript scaffold. `strict: true` in `tsconfig.app.json`. Path alias `@/` → `src/` in both tsconfig and vite.config.ts.
- [x] T-02: All runtime and dev deps installed. Package name corrected to `unidad`. Test and lint scripts added.
- [x] T-03: TailwindCSS v4 installed. `@tailwindcss/vite` plugin added. `src/styles/globals.css` created with `@import "tailwindcss"`. Imported from `main.tsx`.
- [x] T-04: Shadcn/ui initialized (base-nova style, TailwindCSS v4, TypeScript). Primitives added: `button`, `card`, `input`, `textarea`, `badge`. Files moved from literal `@/` directory to `src/components/ui/` and `src/lib/`.
- [x] T-05: `vitest.config.ts` with jsdom environment and `setupFiles`. `src/test/setup.ts` importing `fake-indexeddb/auto` and `@testing-library/jest-dom`.

### Phase 2 — Data Layer
- [x] T-06: `src/domain/types.ts` — exact locked interfaces: `DepositType`, `PARANode`, `Loop`, `CaptureItem`.
- [x] T-07: `src/db/schema.ts` — `BlueprintDB extends Dexie`, version 1, exact indexes. Constructor accepts optional name for test isolation. Singleton `db` exported. `src/db/seed.ts` created as empty stub.
- [x] T-08: `src/repositories/paraNode.repo.ts` — 5 functions. Unit tests (5 ops: create, read by id, list all, update, delete) all passing with isolated fake-indexeddb instances.
- [x] T-09: `src/repositories/loop.repo.ts` — 4 functions (listLoops, createLoop, closeLoop, appendFeedback). Unit tests (5 ops) passing.
- [x] T-10: `src/repositories/captureItem.repo.ts` — 4 functions (listInbox, addCapture, markProcessed, deleteCapture). Unit tests (5 ops) passing. `listInbox` uses `.filter()` for boolean compatibility with fake-indexeddb.
- [x] T-11: `eslint.config.js` with `no-restricted-imports` rule: `@/db/schema` imports blocked outside `src/repositories/**`. Verified rule fires (exit code 1) on non-repo file, clean for repo files.
- [x] T-12: `src/domain/paraRules.ts` — `classify(draft)` pure function returning `DepositType`. `src/domain/wizardMachine.ts` — `nextStep`, `prevStep`, `isFirstStep`, `isLastStep`, `initialState` — all pure, no Dexie import.

### Phase 3 — Routing
- [x] T-13: TanStack Router route tree using `createRoute` (not `createFileRoute` — avoids codegen type errors without TanStack Vite plugin). `__root.tsx` with nav shell and `<Outlet/>`. Stub routes: capture, dashboard, para, review. `createRouter` + `RouterProvider` wired in `main.tsx`. `notFoundComponent` renders 404 page.

### Phase 4 — Capture Tunnel
- [x] T-14: `src/hooks/useCaptureInbox.ts` — wraps `listInbox` with `useLiveQuery`. Returns `CaptureItem[]`.
- [x] T-15: `src/components/capture/CaptureShell.tsx` — structural container with exact CSS rules from spec. `src/components/capture/CaptureInput.tsx` — shrink-0 input row wired to `addCapture` on Enter.
- [x] T-16: RTL tests in `src/components/capture/CaptureShell.test.tsx` — 4 tests: empty render, TC-1 (60-char token no overflow), TC-2 (multi-line expands, textarea still present), TC-3 (short input no regression). All passing.
- [x] T-17: `src/app/routes/capture.tsx` wired with `<CaptureShell>`.

---

## Files Created / Modified

| File | Action |
|---|---|
| `tsconfig.app.json` | Modified — strict:true, path aliases, ignoreDeprecations |
| `tsconfig.node.json` | Modified — added vitest.config.ts to include |
| `vite.config.ts` | Modified — path alias, TailwindCSS v4 plugin, import.meta.dirname |
| `vitest.config.ts` | Created — jsdom, setupFiles, @/ alias |
| `package.json` | Modified — name, test/lint scripts |
| `eslint.config.js` | Created — db-boundary no-restricted-imports rule |
| `src/main.tsx` | Modified — RouterProvider, globals.css import |
| `src/router.ts` | Created — createRouter + Register declaration |
| `src/routeTree.ts` | Created — root.addChildren([capture, dashboard, para, review]) |
| `src/styles/globals.css` | Created — @import tailwindcss (expanded by shadcn init) |
| `src/test/setup.ts` | Created — fake-indexeddb/auto + jest-dom |
| `src/domain/types.ts` | Created — locked interfaces |
| `src/domain/paraRules.ts` | Created — classify() pure function |
| `src/domain/wizardMachine.ts` | Created — step-transition pure functions |
| `src/db/schema.ts` | Created — BlueprintDB v1 with optional name param |
| `src/db/seed.ts` | Created — empty stub |
| `src/lib/uuid.ts` | Created — crypto.randomUUID() wrapper |
| `src/lib/utils.ts` | Created (copied from shadcn) — cn() utility |
| `src/repositories/paraNode.repo.ts` | Created — 5 CRUD functions |
| `src/repositories/paraNode.repo.test.ts` | Created — 5 unit tests |
| `src/repositories/loop.repo.ts` | Created — 4 functions |
| `src/repositories/loop.repo.test.ts` | Created — 5 unit tests |
| `src/repositories/captureItem.repo.ts` | Created — 4 functions |
| `src/repositories/captureItem.repo.test.ts` | Created — 5 unit tests |
| `src/hooks/useCaptureInbox.ts` | Created — useLiveQuery wrapper |
| `src/components/ui/button.tsx` | Created (shadcn) |
| `src/components/ui/card.tsx` | Created (shadcn) |
| `src/components/ui/input.tsx` | Created (shadcn) |
| `src/components/ui/textarea.tsx` | Created (shadcn) |
| `src/components/ui/badge.tsx` | Created (shadcn) |
| `src/components/capture/CaptureShell.tsx` | Created — structural container |
| `src/components/capture/CaptureInput.tsx` | Created — shrink-0 input row |
| `src/components/capture/CaptureShell.test.tsx` | Created — 4 RTL tests |
| `src/app/routes/__root.tsx` | Created — nav shell + Outlet |
| `src/app/routes/capture.tsx` | Created — wired CaptureShell |
| `src/app/routes/dashboard.tsx` | Created — stub |
| `src/app/routes/para.tsx` | Created — stub |
| `src/app/routes/review.tsx` | Created — stub |

---

## Test Results

```
vitest run — 2026-08-28

 Test Files  4 passed (4)
      Tests  19 passed (19)
   Duration  2.36s

Breakdown:
  paraNode.repo.test.ts    — 5 tests (create, read, list, update, delete)
  loop.repo.test.ts        — 5 tests (create, read, list-by-nodeId, close, appendFeedback)
  captureItem.repo.test.ts — 5 tests (create, read, list-unprocessed, markProcessed, delete)
  CaptureShell.test.tsx    — 4 tests (render, long-token, multi-line, short-input)
```

## TypeScript Strict Check

```
tsc --project tsconfig.app.json --noEmit → 0 errors
```

## ESLint Boundary Rule

```
eslint src/ → 0 violations
eslint (non-repo file importing @/db/schema) → 1 error (rule verified working)
```

---

## Deviations from Design

1. **Shadcn init created literal `@/` directory** — shadcn@4.19.0 did not resolve the `@/` alias during init and created a literal directory. Files were moved to `src/components/ui/` and `src/lib/` manually.
2. **createFileRoute → createRoute** — `createFileRoute` requires TanStack Router's Vite codegen plugin for type-safe path strings. Without it, TypeScript strict mode fails. Switched to `createRoute` with explicit `getParentRoute`, which is type-correct without codegen and matches the router structure in the design.
3. **BlueprintDB constructor accepts optional name** — added `name = 'blueprint-v02'` parameter to enable isolated test instances without module-level mocking. Production singleton still uses the locked name.
4. **listInbox uses .filter() not .where('processed').equals(0)** — fake-indexeddb stores booleans as JS booleans, not 0/1 integers. `.filter((i) => !i.processed)` works consistently across both environments.

## Blockers / Open Issues

None. All 17 tasks complete.

---

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and result | `npx vitest run` — 4 test files, 19 tests, all passed |
| Runtime harness | N/A for PR-1 (runtime smoke test is manual: `npm run dev` then navigate to /capture) |
| Rollback boundary | All files in `src/` plus `eslint.config.js`, `vitest.config.ts`. Removing these files restores the pre-PR state. No schema migrations. |
