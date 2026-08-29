# Blueprint for a Technical Personal System

A Local-First Progressive Web App for personal productivity using the GTD + PARA methodology.

## Stack

- **Frontend**: React 18 + Vite + TypeScript (strict)
- **UI**: TailwindCSS v4 + Shadcn/ui
- **State**: Zustand (ephemeral UI) + Dexie.js / IndexedDB (domain data)
- **Charts**: Recharts
- **Router**: TanStack Router
- **PWA**: vite-plugin-pwa (Service Workers + Web Manifest)

## Architecture

**Dexie-first, Local-First.** IndexedDB via Dexie.js is the single source of truth for all domain data. Components subscribe to data through `useLiveQuery` hooks. Zustand is restricted to ephemeral UI state only (wizard step, modal state, form drafts). The app is 100% functional offline after the first load.

```
src/
  app/routes/         # TanStack Router route modules
  db/                 # Dexie schema (BlueprintDB v1)
  repositories/       # Only layer allowed to call db.*
  hooks/              # useLiveQuery-backed read hooks
  stores/             # Zustand ephemeral slices
  domain/             # Pure functions (GTD/PARA rules, wizard transitions)
  components/         # React components (ui/, capture/, dashboard/, wizard/)
```

## Data Model

```typescript
type DepositType = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';

interface PARANode { id: string; title: string; type: DepositType; description?: string; createdAt: number; updatedAt: number; }
interface Loop     { id: string; nodeId: string; title: string; status: 'ACTIVE' | 'CLOSED'; feedbackNotes: string[]; createdAt: number; }
interface CaptureItem { id: string; rawText: string; processed: boolean; createdAt: number; }
```

## Development

```bash
npm install
npm run dev
```

## Tests

```bash
npm test           # vitest run
npm run typecheck  # tsc --strict --noEmit
npm run lint       # eslint src/
```

## Roadmap

| Version | Focus |
|---|---|
| v0.1 | Monolithic prototype (Claude Artifacts) |
| **v0.2** | **PWA Local-First migration** — capture tunnel, dashboard, weekly review wizard, offline support |
| v0.3 | Optional Supabase sync (multi-device) |
