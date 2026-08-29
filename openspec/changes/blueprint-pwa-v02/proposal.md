# Proposal: Blueprint PWA v0.2

**Change**: `blueprint-pwa-v02`
**Status**: Proposal
**Project**: unidad
**Date**: 2026-08-28

---

## 1. Intent

### Problem

The "Blueprint for a Technical Personal System" currently ships as a monolithic static executable delivered via Claude Artifacts. User Testing v0.1 surfaced three concrete failures that make the tool difficult to adopt as a daily personal-productivity system:

1. **Access friction** — the artifact is not installable, not offline-capable, and not launchable from a home screen. Every session requires reopening the source environment.
2. **Blind visualization** — users cannot see the state of their PARA nodes, project progress, or active loops. The system captures data but returns no synthesis.
3. **Capture-tunnel CSS bugs** — flexbox and `word-break` defects make the capture surface visually broken under real inputs, damaging trust in the primary entry point.
4. **High cognitive load in the weekly review** — the current review flow is unguided, forcing users to hold GTD/PARA processing rules in working memory.

### Why now

v0.1 has been validated in real use and its limits are known. Continuing to iterate on the monolithic artifact reinforces the access-friction problem and blocks every other improvement (visualization, offline, install). Migrating to a decoupled PWA with a Local-First architecture is the smallest change that unblocks all four failures at once, without committing to backend infrastructure that the product does not yet need.

### Success shape

After v0.2, a user can install the Blueprint on their device, capture offline, see their PARA state and active loops on a dashboard, and complete a guided weekly review without external instructions.

---

## 2. Scope

### In scope (v0.2)

- **RF-01** — Fix the capture-tunnel CSS defects (flexbox and `word-break`).
- **RF-02** — Interactive visualization dashboard built on Recharts, showing PARA nodes, project progress, and active loops.
- **RF-03** — Guided Weekly Review Wizard: a 3-step flow (inbox emptying → GTD/PARA processing → project update).
- **RF-04** — Productive navigation using TanStack Router across Capture, Dashboard, PARA, and Review routes.
- **RF-05** — Full PWA delivery: Web Manifest + Service Workers via `vite-plugin-pwa`, offline capability, home-screen install.
- **RNF-01** — Local-First data layer on Dexie.js/IndexedDB, 100% offline-functional.
- **RNF-02** — Locked stack: React 18 + Vite + TypeScript + TailwindCSS v4 + Shadcn/ui.
- **Data model** — `PARANode`, `Loop`, `CaptureItem` as documented in exploration.
- **Testing layer** — introduce a minimum viable testing surface (unit for Dexie repositories, component tests for Wizard steps) even though strict TDD is not enabled, to protect the data layer and the wizard flow.

### Out of scope (v0.2)

- **Supabase** — fully deferred to v0.3+. No interface, no adapter, no stub, no port. The data layer is Dexie-only in v0.2.
- **D3 visualizations** — dropped from v0.2; Recharts is the only charting library.
- **Multi-device sync, auth, sharing, collaboration** — deferred with Supabase.
- **Advanced analytics, exports, integrations with external calendars/task systems** — not in v0.2.
- **Mobile-native shell** — v0.2 is PWA only; no Capacitor/Cordova wrapping.

---

## 3. Approach

### Architectural stance

**Dexie-first, Local-First, decoupled PWA.** The application is a single-page PWA whose source of truth is IndexedDB (via Dexie.js). All persistent state — PARA nodes, loops, capture items — lives in Dexie. Reactivity flows through `useLiveQuery`, which subscribes React components to Dexie tables. Zustand is reserved exclusively for ephemeral UI state (wizard step index, modal open/closed, transient form drafts). No domain data is stored in Zustand.

### Layered structure

- **Data layer** — Dexie schema definitions, repository functions (typed CRUD per entity), and `useLiveQuery`-backed hooks. This is the only layer that touches IndexedDB.
- **Domain layer** — pure functions for GTD/PARA processing rules, wizard-step transitions, and loop-status computations. No React, no Dexie.
- **UI layer** — React 18 components using Shadcn/ui primitives and Tailwind v4 for styling. Recharts for visualization. Routing via TanStack Router with typed routes for Capture, Dashboard, PARA, Review.
- **PWA shell** — `vite-plugin-pwa` provides Service Worker registration and Web Manifest. Offline strategy is cache-first for the app shell and network-never for data (data is local by construction).

### Boundary rules (locked in design phase)

- Zustand never persists to IndexedDB and never mirrors Dexie state.
- Components read domain data only through `useLiveQuery`-backed hooks, never through direct Dexie calls.
- Repository functions are the only surface allowed to call Dexie's `db.*` APIs.
- No abstraction is introduced for a future Supabase adapter in v0.2. When Supabase enters in v0.3+, it will be introduced through a repository-level refactor at that time, not preemptively.

### Delivery mechanism

- Vite build produces static assets.
- `vite-plugin-pwa` injects manifest and Service Worker.
- Distribution as a static PWA (any static host); no server required in v0.2.

---

## 4. Risks and mitigations

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | Dexie + Zustand boundary drifts, causing double-source-of-truth bugs | Lock the boundary in the design artifact with a written rule: Dexie is the only source of truth for domain data; Zustand is ephemeral UI only. Enforce with code review and repository-layer test coverage. |
| R3 | RF-01 CSS bug fix has no v0.1 source to reference; reproduction is undocumented | Spec must include a reproduction procedure (minimum input that triggers the flexbox/`word-break` defect) and expected rendering. Fix is validated against that reproduction, not against the original codebase. |
| R4 | CES ≤ 2/7 target for the Wizard is aspirational and may not be met on first release | Phase the validation: v0.2 ships the wizard and instruments it (step timing, drop-off, completion). CES is measured post-release in a follow-up user test, and refinement is scheduled for v0.2.1 if the target is missed. |
| R6 | No testing strategy exists; regressions in Dexie repositories or wizard flow will be invisible | Introduce a minimum testing layer in v0.2: unit tests for repository functions, component tests for wizard step transitions and capture-tunnel rendering. Strict TDD is not required, but the data layer and wizard must have coverage. |
| R-new | PWA install and offline behavior can silently regress across builds | Include a manual PWA-verification checklist in the tasks phase (install prompt appears, app launches offline, Service Worker updates cleanly). |

---

## 5. Non-goals

- No backend, no cloud sync, no authentication in v0.2.
- No Supabase interface, adapter, port, or stub — not even as scaffolding.
- No D3 visualizations.
- No multi-device or multi-user scenarios.
- No native mobile packaging.
- No migration tooling from v0.1 data — v0.1 was not persistent, so there is nothing to migrate.
- No AI-assisted capture processing in v0.2.

---

## 6. Success criteria

- **Installability**: the app is installable as a PWA on desktop Chrome and mobile Chrome/Safari; Lighthouse PWA audit passes.
- **Offline**: the app loads and is fully functional (capture, dashboard, PARA, review) with the network disconnected after first load.
- **Capture tunnel**: the documented reproduction of the flexbox/`word-break` defect no longer occurs; capture surface renders correctly for long tokens and multi-line inputs.
- **Dashboard**: the dashboard renders PARA nodes, project progress, and active loops from Dexie via `useLiveQuery`, updating live when data changes.
- **Wizard**: the 3-step weekly review flow is navigable end-to-end and persists results to Dexie. Instrumentation for CES measurement is in place.
- **Data-layer integrity**: repository-function tests pass; no component reads or writes IndexedDB directly.
- **Boundary discipline**: no domain data is stored in Zustand; a code-review checklist enforces this.
- **Routing**: Capture, Dashboard, PARA, and Review are reachable via typed TanStack Router routes with correct back/forward behavior.

---

## 7. Next phases

- `sdd-spec` — formalize functional/non-functional requirements and acceptance criteria for RF-01…RF-05 and RNF-01…RNF-03.
- `sdd-design` — lock the Dexie schema, repository API, Zustand slices, route tree, wizard state machine, and PWA caching strategy.
- (spec and design may run in parallel.)
