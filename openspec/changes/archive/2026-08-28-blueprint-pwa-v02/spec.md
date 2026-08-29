# Blueprint PWA v0.2 — Specification

**Change**: `blueprint-pwa-v02`
**Type**: New (no prior specs exist)
**Date**: 2026-08-28

---

## Purpose

This spec defines the behavioral requirements and acceptance criteria for migrating the Blueprint personal-productivity tool from a monolithic Claude Artifact to a decoupled Local-First PWA. It covers RF-01 through RF-05, RNF-01 through RNF-03, the locked data model, the testing requirements, and explicit out-of-scope boundaries.

---

## Data Model (locked)

The Dexie schema MUST declare version 1 with the following tables and indexes:

| Table | Key | Indexes |
|---|---|---|
| `paraNodes` | `id` | `type`, `createdAt` |
| `loops` | `id` | `nodeId`, `status`, `createdAt` |
| `captureItems` | `id` | `processed`, `createdAt` |

TypeScript interfaces (canonical, MUST NOT be altered in v0.2):

```typescript
export type DepositType = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';
export interface PARANode { id: string; title: string; type: DepositType; description?: string; createdAt: number; updatedAt: number; }
export interface Loop { id: string; nodeId: string; title: string; status: 'ACTIVE' | 'CLOSED'; feedbackNotes: string[]; createdAt: number; }
export interface CaptureItem { id: string; rawText: string; processed: boolean; createdAt: number; }
```

---

## Requirements

### Requirement: RF-01 — Capture-Tunnel CSS Defects Fixed

The capture tunnel MUST render correctly for all valid inputs. Specifically, flexbox layout MUST NOT collapse or overflow, and `word-break` MUST prevent long unbroken tokens from escaping their container.

**Reproduction procedure** (minimum input to trigger the defect):

1. Open the capture input field.
2. Enter a string with no whitespace of at least 60 characters (e.g., `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`).
3. Submit or observe the rendered output.
4. Expected: the token wraps within the container boundary; no horizontal scroll appears; layout does not break.
5. Defective behavior: the token overflows the container, pushing sibling elements or causing horizontal scroll.

Additionally, enter a multi-line input (three or more lines) and verify the capture area expands vertically without collapsing flex siblings.

#### Scenario: Long unbroken token wraps within container

- GIVEN the capture input is visible
- WHEN the user types or pastes a string of 60+ characters with no whitespace
- THEN the rendered text wraps within the container boundary
- AND no horizontal overflow or scroll bar appears on the capture surface

#### Scenario: Multi-line input expands vertically

- GIVEN the capture input is visible
- WHEN the user enters three or more lines of text
- THEN the capture area expands vertically to accommodate the content
- AND adjacent flex siblings retain their position and do not collapse

#### Scenario: Normal short input renders unchanged

- GIVEN the capture input is visible
- WHEN the user types a sentence of fewer than 40 characters
- THEN the input renders as before with no visual regression

---

### Requirement: RF-02 — Interactive Dashboard via useLiveQuery

The dashboard MUST display PARA nodes (by type), project progress, and active loops using Recharts. All data MUST be sourced exclusively from Dexie via `useLiveQuery`. The dashboard MUST update live when the underlying Dexie tables change without a full page reload.

#### Scenario: Dashboard renders PARA node counts

- GIVEN at least one PARANode exists in Dexie
- WHEN the user navigates to `/dashboard`
- THEN a chart shows the count of nodes grouped by `DepositType`
- AND the data matches what is stored in the `paraNodes` table

#### Scenario: Active loops are listed

- GIVEN at least one Loop with `status: 'ACTIVE'` exists
- WHEN the user views the dashboard
- THEN the active loops section lists those loops with their titles

#### Scenario: Dashboard updates live on data change

- GIVEN the dashboard is open
- WHEN a new PARANode is added to Dexie (e.g., via the capture or PARA route)
- THEN the dashboard chart updates without a page reload

#### Scenario: Dashboard renders with empty data

- GIVEN no data exists in any Dexie table
- WHEN the user navigates to `/dashboard`
- THEN the dashboard renders without errors, showing empty-state indicators

---

### Requirement: RF-03 — Guided Weekly Review Wizard

The wizard MUST implement a 3-step sequential flow: (1) inbox emptying, (2) GTD/PARA processing, (3) project update. Each step MUST be completable independently. Completion of step 3 MUST persist the review result to Dexie. CES instrumentation MUST be in place (step timing and completion event) so post-release measurement is possible.

#### Scenario: User completes all three wizard steps

- GIVEN the user navigates to `/review`
- WHEN the user completes step 1, step 2, and step 3 in order
- THEN the wizard reaches a completion state
- AND the review result (at minimum a timestamp and completion flag) is persisted to Dexie

#### Scenario: User navigates back within the wizard

- GIVEN the user is on step 2 or step 3
- WHEN the user activates the back control
- THEN the wizard returns to the previous step
- AND previously entered data for that step is preserved

#### Scenario: User abandons the wizard mid-flow

- GIVEN the user is on step 1 or step 2
- WHEN the user navigates away from `/review`
- THEN no partial review result is persisted to Dexie

#### Scenario: CES instrumentation records step timing

- GIVEN the wizard is rendered
- WHEN the user transitions between steps or completes the wizard
- THEN a timing event is recorded (step index, elapsed time) accessible for post-release analysis

---

### Requirement: RF-04 — Typed TanStack Router Navigation

The application MUST expose four routes: `/capture`, `/dashboard`, `/para`, `/review`. All routes MUST be typed via TanStack Router. Browser back/forward navigation MUST move between routes correctly without triggering a full reload.

#### Scenario: All four routes resolve

- GIVEN the application is loaded
- WHEN the user navigates to `/capture`, `/dashboard`, `/para`, or `/review`
- THEN the corresponding view renders without error

#### Scenario: Back/forward browser navigation works

- GIVEN the user has visited `/dashboard` then `/capture`
- WHEN the user presses the browser back button
- THEN the application returns to `/dashboard` without a full page reload

#### Scenario: Unknown route does not crash

- GIVEN the application is loaded
- WHEN the user navigates to an undefined path
- THEN a not-found view is displayed and the application does not throw an unhandled error

---

### Requirement: RF-05 — Full PWA Delivery

The application MUST include a Web Manifest and a Service Worker generated by `vite-plugin-pwa`. A Lighthouse PWA audit MUST pass. The application MUST be fully functional (all four routes, capture, read from Dexie) with the network disconnected after the first successful load.

#### Scenario: Install prompt appears on eligible browser

- GIVEN the app is served over HTTPS (or localhost) and the user has not installed it
- WHEN the user visits the app for the first time on an eligible browser
- THEN the browser presents an install prompt (or the app provides a manual install trigger)

#### Scenario: App launches offline after first load

- GIVEN the app has been loaded at least once with network connectivity
- WHEN the network is disconnected and the user reloads or reopens the app
- THEN all four routes load without network requests
- AND Dexie data remains accessible and writable

#### Scenario: Service Worker update is delivered cleanly

- GIVEN a new build has been deployed
- WHEN the user returns to the app with connectivity
- THEN the Service Worker detects the update and prompts or applies it without leaving the app in a broken state

#### Scenario: Lighthouse PWA audit passes

- GIVEN the production build is served over HTTPS
- WHEN a Lighthouse audit is run against the app
- THEN all PWA audit checks pass (installable, Service Worker registered, manifest valid)

---

### Requirement: RNF-01 — Local-First Data Layer

All persistent domain data MUST be stored exclusively in Dexie.js / IndexedDB. The application MUST be 100% functional offline. No domain data MUST be stored outside Dexie (no localStorage for entities, no in-memory-only state for persisted records, no network requests for data).

#### Scenario: All CRUD operations function offline

- GIVEN the device has no network connectivity
- WHEN the user creates, reads, updates, or deletes a PARANode, Loop, or CaptureItem
- THEN the operation succeeds and the change is reflected immediately via `useLiveQuery`

#### Scenario: Zustand holds no domain data

- GIVEN the application is running
- WHEN any Zustand slice is inspected
- THEN it contains only ephemeral UI state (e.g., current wizard step, modal open/closed flag)
- AND no PARANode, Loop, or CaptureItem instance is present in any Zustand slice

---

### Requirement: RNF-02 — Stack Compliance

The application MUST be built with React 18+, Vite, TypeScript in strict mode, TailwindCSS v4, and Shadcn/ui. No other CSS framework or component library MAY be introduced without an explicit proposal amendment.

#### Scenario: TypeScript strict mode is enforced

- GIVEN the project is built
- WHEN `tsc --strict` is run
- THEN it exits with zero errors

#### Scenario: No unapproved libraries are introduced

- GIVEN the locked stack (React 18, Vite, TypeScript, TailwindCSS v4, Shadcn/ui, Recharts, TanStack Router, vite-plugin-pwa, Zustand, Dexie.js)
- WHEN the dependency list is audited
- THEN no charting library other than Recharts is present
- AND no CSS framework other than TailwindCSS v4 is present

---

### Requirement: RNF-03 — Supabase Fully Deferred

The v0.2 codebase MUST NOT contain any Supabase client code, environment variable references, adapter interfaces, repository ports, or stubs intended for future Supabase use. The data layer is Dexie-only.

#### Scenario: No Supabase artifact exists in the codebase

- GIVEN the v0.2 build
- WHEN the source tree is inspected
- THEN no file imports `@supabase/supabase-js` or any Supabase SDK
- AND no environment variable prefixed with `SUPABASE_` or `VITE_SUPABASE_` is referenced

---

## Testing Requirements

The following coverage MUST exist. Implementation choice (test runner, assertion style) is left to the design phase.

| Layer | What must be covered |
|---|---|
| Unit — Dexie repositories | CRUD for PARANode: create, read by id, list all, update, delete |
| Unit — Dexie repositories | CRUD for Loop: create, read by id, list by nodeId, update status, delete |
| Unit — Dexie repositories | CRUD for CaptureItem: create, read by id, list unprocessed, mark processed, delete |
| Component — Wizard | Step 1 → Step 2 transition renders step 2 content |
| Component — Wizard | Step 2 → Step 3 transition renders step 3 content |
| Component — Wizard | Back navigation from step 2 renders step 1 content |
| Component — Capture tunnel | Long unbroken token does not overflow container (RF-01 reproduction case) |
| Manual — PWA checklist | Install prompt appears on Chrome desktop and Chrome/Safari mobile |
| Manual — PWA checklist | App loads and all routes render with network disconnected after first load |
| Manual — PWA checklist | Service Worker update is applied cleanly on new deployment |

Repository function tests MUST use an in-memory or ephemeral Dexie instance (no shared state between tests). Component tests MUST not call real Dexie — use test doubles or an in-memory db.

---

## Out-of-Scope Boundaries (v0.2)

These items are explicitly excluded. Any implementation touching them is a scope violation requiring a new proposal.

| Item | Status |
|---|---|
| Supabase (client, adapter, port, stub, env var) | Deferred to v0.3 |
| D3 visualizations | Dropped; Recharts only |
| Multi-device sync | Deferred with Supabase |
| Authentication / authorization | Deferred with Supabase |
| Data export / import | Not in v0.2 |
| External calendar or task-system integrations | Not in v0.2 |
| Mobile-native packaging (Capacitor, Cordova) | Not in v0.2 |
| AI-assisted capture processing | Not in v0.2 |
| Migration tooling from v0.1 | Not needed (v0.1 had no persistent data) |
| CES target validation | Measured post-release; refinement scheduled for v0.2.1 if missed |
