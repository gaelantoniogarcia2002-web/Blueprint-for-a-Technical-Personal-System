# Exploration: blueprint-pwa-v02

**Status**: done
**Date**: 2026-08-28
**Project**: unidad

## Current State

Greenfield project. Only scaffolding exists: `openspec/config.yaml`, `.gga`, `.atl/skill-registry.md`.
No `package.json`, no source files, no framework scaffold.

## Stack Assessment

### Tier 1 — Solid, no conflicts

- React 18 + Vite + TypeScript
- TailwindCSS v4 + Shadcn/ui (Shadcn's current Vite guide uses `@tailwindcss/vite`)
- Recharts 3.10.x (React 18/19 compatible)
- vite-plugin-pwa (requires Vite 5+, Node 18+)

### Tier 2 — Require explicit design decisions

- **Dexie.js + Zustand**: Two architectures possible:
  - (a) Dexie-first: Dexie as source of truth, `useLiveQuery` drives reactivity, Zustand for ephemeral UI state only — **recommended**
  - (b) Zustand-first: Zustand primary, Dexie as write-through — dual source of truth risk
- **Supabase optional backend**: No sync protocol defined (LWW vs CRDT vs queue = days to weeks difference)

### Tier 3 — Missing from spec

- Router unspecified (RF-04 navigation requires one) — TanStack Router recommended
- No testing strategy
- D3 listed alongside Recharts — must choose one; recommend Recharts only
- No cross-tab consistency strategy for SW ↔ IndexedDB offline writes

## Complexity per Requirement

| Requirement | Complexity | Key Risk |
|---|---|---|
| RF-01: CSS fixes | Low | No v0.1 source to diff against |
| RF-02: Dashboard | Medium | D3 vs Recharts must be resolved |
| RF-03: Weekly Review Wizard | Medium-High | CES ≤ 2/7 untestable without measurement harness |
| RF-04: Navigation | Low | Router unspecified |
| RF-05: PWA | Low-Medium | SW ↔ IndexedDB coordination |
| RNF-01: Local-First (Dexie) | Medium | Dexie+Zustand layering unresolved |
| RNF-02: Stack | Low | All compatible |
| RNF-03: Supabase adapter | High | No sync protocol |

## Recommendation

1. **Dexie-first** data layer — Dexie as source of truth, Zustand for ephemeral UI state only
2. **Defer Supabase to v0.3** — define adapter boundary (TypeScript interface/port) in design but ship no implementation
3. **Router**: TanStack Router (TypeScript-first, file-system routing)
4. **Charts**: Recharts only (drop D3)

## Blocking User Decisions Before Proposal

1. Router: TanStack Router vs React Router v7?
2. Supabase: define adapter interface in v0.2 but defer impl to v0.3, or full defer with no interface contract?

## Risks

- R1: Dexie + Zustand boundary unresolved — implementations will diverge across features if not locked in design
- R2: Supabase sync protocol absent — effort range Low (stub) to High (LWW/CRDT)
- R3: RF-01 CSS bug fix references v0.1 behavior with no source to compare
- R4: CES ≤ 2/7 metric has no measurement mechanism — untestable
- R5: Router unspecified — navigation provisional until decided
- R6: No testing strategy — PWA + IndexedDB tests are hard to retrofit
- R7: D3 + Recharts scope ambiguity — must resolve to one choice
