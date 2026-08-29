# Verification Report — blueprint-pwa-v02 / PR-1

- **Change**: blueprint-pwa-v02
- **Scope**: PR-1 (T01–T17) — scaffold + data layer + routing + capture tunnel
- **Date**: 2026-08-28
- **Verdict**: PASS WITH WARNINGS

---

## Build / Test Evidence

| Command | Exit Code | Result |
|---|---|---|
| `npx vitest run` | 0 | 19/19 tests pass |
| `npx tsc --project tsconfig.app.json --noEmit` | 0 | Zero type errors |
| `npx eslint src/` | 0 | Zero lint violations |

---

## Task Completion Matrix (T01–T17)

| Task | Description | Status | Evidence |
|---|---|---|---|
| T-01 | tsconfig.app.json strict:true + @/ alias in tsconfig + vite.config | PASS | `"strict": true` confirmed; paths `"@/*": ["src/*"]`; vite alias `'@': path.resolve(...)` |
| T-02 | Required runtime/dev deps present | PASS WITH WARNING | dexie, zustand, recharts, @tanstack/react-router, vite-plugin-pwa all in package.json; vitest, @testing-library/react, fake-indexeddb in devDeps. **vite-plugin-pwa is installed but not wired in vite.config.ts** |
| T-03 | TailwindCSS v4 plugin in vite.config; globals.css with @import "tailwindcss" in main.tsx | PASS | `tailwindcss()` plugin in vite.config; `@import "tailwindcss"` in globals.css; globals.css imported in main.tsx |
| T-04 | Shadcn primitives: button, card, input, textarea, badge | PASS | All 5 present in src/components/ui/ |
| T-05 | vitest.config.ts with jsdom + setupFiles; setup.ts imports fake-indexeddb/auto + jest-dom | PASS | Confirmed verbatim |
| T-06 | src/domain/types.ts has exact locked interfaces | PASS | DepositType, PARANode, Loop, CaptureItem match spec exactly — no alterations |
| T-07 | BlueprintDB v1 with correct tables and indexes | PASS | v1 schema: paraNodes(id,type,updatedAt,createdAt), loops(id,nodeId,status,createdAt), captureItems(id,processed,createdAt); optional name param (approved deviation) |
| T-08 | paraNode.repo.ts has 5 functions; tests cover CRUD | PASS | listParaNodes, getParaNode, createParaNode, updateParaNode, deleteParaNode; 5 tests pass |
| T-09 | loop.repo.ts has 4 functions; tests cover create/read/listByNodeId/closeLoop/appendFeedback | PASS WITH WARNING | 4 functions: listLoops, createLoop, closeLoop, appendFeedback. No explicit `getLoop` function — tests exercise read via direct db access. 5 test scenarios pass. |
| T-10 | captureItem.repo.ts has 4 functions; tests cover 5 scenarios | PASS | addCapture, listInbox, markProcessed, deleteCapture; `listInbox` uses `.filter()` (approved deviation); 5 tests pass |
| T-11 | eslint.config.js has no-restricted-imports db boundary rule | PASS | Rule active on src/**; ignores src/repositories/**; all db/schema imports are exclusively in src/repositories/ |
| T-12 | paraRules.ts has classify(); wizardMachine.ts has step-transition logic; neither imports db | PASS | Both confirmed; no db or Dexie imports in either file |
| T-13 | TanStack Router route tree: 4 routes + nav shell + not-found | PASS | capture, dashboard, para, review routes via createRoute (approved deviation); nav shell in __root.tsx; NotFound component registered |
| T-14 | useCaptureInbox.ts wraps listInbox with useLiveQuery | PASS | Confirmed: `useLiveQuery(() => listInbox(), [], [])` |
| T-15 | CaptureShell structural CSS; CaptureInput shrink-0; bubbles break-words | PASS | CaptureShell: `flex flex-col min-h-0 min-w-0 h-full`; CaptureInput wrapper: `shrink-0 border-t`; bubbles: `break-words overflow-wrap-anywhere whitespace-pre-wrap` |
| T-16 | CaptureShell.test.tsx — long-token, multi-line, short-input regression | PASS | TC-1, TC-2, TC-3 all pass at runtime |
| T-17 | /capture route uses CaptureShell | PASS | capture.tsx renders `<CaptureShell />` inside a flex container |

---

## Spec Compliance Matrix

### RF-01 CSS acceptance criteria

| Scenario | Covered by test | Runtime result |
|---|---|---|
| Long unbroken token (60+ chars) wraps without horizontal overflow | TC-1 in CaptureShell.test.tsx | PASS |
| Multi-line input (3+ lines) does not collapse flex siblings | TC-2 | PASS |
| Normal short input renders without regression | TC-3 | PASS |
| Fix encapsulated in CaptureShell (structural, not a patch) | Source inspection | PASS — structural Tailwind classes, not inline style patches |

### RNF-01 (Local-First boundary)

| Check | Result |
|---|---|
| All domain data in Dexie only | PASS |
| Zustand holds no PARANode/Loop/CaptureItem | PASS — no Zustand store files exist in src; zustand is installed but unused in PR-1 scope |

### RNF-02 (Stack compliance)

| Check | Result |
|---|---|
| tsc --strict passes with zero errors | PASS (exit 0) |
| No unapproved libraries | PASS — all imports resolve to approved stack |

### RNF-03 (No Supabase)

| Check | Result |
|---|---|
| Zero Supabase imports, env vars, or stubs | PASS — rg found no supabase references anywhere in project |

---

## Design Boundary Checks

| Constraint | Result |
|---|---|
| Only src/repositories/** imports from src/db/schema | PASS — 6 db/schema imports, all within src/repositories/ |
| Components read via useLiveQuery-backed hooks | PASS — CaptureShell uses useCaptureInbox which uses useLiveQuery |
| Zustand stores never import db | PASS — no Zustand stores exist in PR-1; db import boundary enforced by ESLint |
| Dexie schema v1 with exact indexes | PASS |
| TanStack Router 4 routes + nav + not-found | PASS |

---

## Approved Deviations (All Accepted)

1. `createRoute` instead of `createFileRoute` — avoids codegen requirement, equivalent type-safety. ESLint and tsc both pass.
2. `BlueprintDB` constructor accepts optional name param — enables test isolation; backward-compatible.
3. `listInbox` uses `.filter()` — fake-indexeddb boolean index compatibility. Tests pass.
4. Shadcn files in `src/components/ui/` and `src/lib/` — correctly placed, ESLint boundary unaffected.

---

## Issues

### WARNINGS (2)

**W-01**: `vite-plugin-pwa` is listed in `package.json` dependencies but is not imported or configured in `vite.config.ts`. T-02 requires the package to be present (satisfied), but a non-functional PWA plugin is ambiguous for PR-1 scope. If PWA activation is deferred to a later PR, this is acceptable — no CRITICAL impact.

**W-02**: `loop.repo.ts` has no dedicated `getLoop(id)` function. The test for "reads a Loop by id" uses direct `testDb.loops.get(id)` rather than a repo-layer function. The task spec counts "4 functions" (correct) but lists "read" as a covered scenario — coverage is partial at the repository-API level. Direct db access in tests is acceptable but the repo API surface is slightly inconsistent with the paraNode and captureItem repos which expose explicit getters.

### SUGGESTIONS (1)

**S-01**: The `loop.repo.test.ts` read test bypasses the repo layer (accesses `testDb.loops.get()` directly). A thin `getLoop(id)` function in `loop.repo.ts` would make the API surface consistent and give the test a real unit to cover.

---

## Final Verdict

**PASS WITH WARNINGS** — 19/19 tests pass, tsc strict exits 0, ESLint exits 0, all spec requirements met. Two minor warnings (PWA plugin not wired, missing `getLoop` in loop repo) do not constitute spec violations. All approved deviations confirmed and accepted.

