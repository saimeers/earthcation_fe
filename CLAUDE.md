# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

React panel for Earthcation — **not the game**. Implements the `admin` role, the `instructor`
role (sessions only, see "Instructor panel" below) and the `developer` role (deploy + read-only
support). Consumes the API in `../earthcation_be` via `VITE_API_URL`. Deployed on Vercel. See
`../../project-context.md` §4 for the exhaustive route/module breakdown — this file covers what's
specific to working in this folder.

## Commands

```
npm run dev       # vite dev server
npm run build     # vite build
npm run lint      # eslint .
npm run preview   # preview production build locally
npm test          # vitest (jsdom) + Testing Library + MSW: src/**/*.test.{ts,tsx}
npm run e2e       # Playwright smoke of the 3 panels over `vite preview`
npx tsc --noEmit  # type-check (strict mode, no emit)
```

Lockfile note: npm 11.4.2 crashes installing vitest (`Cannot read properties of null (reading
'edgesOut')`); dependency changes were done with `npx npm@10.9.4 install`, whose lockfile works
with npm 10 and 11.

## Architecture: feature-based clean architecture, TypeScript strict

The panel is organized **by feature**, not by technical layer. Each business capability lives
under `src/features/<feature>/` with the same four sub-layers:

```
src/features/<feature>/
  domain/           Pure functions and types — no React, no HTTP, no backend DTOs leaking out.
                     This is what gets unit-tested (`*.test.ts`, vitest).
  application/      React Query hooks + the feature's port (its dependency-injection interface)
                     and query keys. `ports.ts` defines the interface, `use<Thing>.ts` the hooks.
  infrastructure/   The port's real implementation against the backend (`<feature>Http.ts`),
                     using `shared/api/client`'s `http`/`externalHttp`.
  ui/               Pages and components (`.tsx`). `ui/pages/*Page.tsx` are what the router mounts.
  index.ts          The feature's ONLY public surface — see "Feature boundaries" below.
```

Current features: `auth`, `users`, `sessions`, `bulk-import`, `locations`, `organizations`,
`analytics` (admin/instructor data), `deploy` (game build versions, developer role),
`visits` (traffic analytics, developer role), `health` (service health, developer role).

### Dependency injection: ports

`shared/lib/ports.tsx` is a minimal DI container: `definePort<T>(id)` declares an interface slot,
`bindPort(port, impl)` wires an implementation to it, and `<PortsProvider bindings>` (mounted once
in `src/app/providers.tsx` with every feature's `*Bindings` concatenated) makes `usePort(port)`
resolve it anywhere in the tree. A feature's `application/` layer only ever imports its own
`ports.ts` — never `infrastructure/` directly — so hooks can be tested with a fake gateway via
`<PortsProvider bindings={[bindPort(port, fakeGateway)]}>`.

### Feature boundaries (ESLint)

`eslint.config.js` configures `eslint-plugin-boundaries` with one `boundaries/entry-point` policy:
any file under `src/features/<name>/` is importable **from outside that feature** (another
feature, `src/app`, a shared util) only through its `index.ts`. Importing
`@/features/users/domain/users` from another feature is a lint error; importing
`@/features/users/domain/users` from *inside* `src/features/users/*` is fine (it's an internal
dependency, not a cross-feature one — the rule only checks imports that cross a feature's
boundary). When a feature needs something from another feature, add it to that feature's
`index.ts` first.

### `src/app/` — composition root

`src/main.tsx` renders `<AppProviders><AppRouter /></AppProviders>`:
- `src/app/providers.tsx` — calls `configureHttp()` to wire the HTTP client to the auth feature's
  token/401 handling, builds the DI container from every feature's `*Bindings`, and wraps
  `QueryClientProvider` + `TooltipProvider`.
- `src/app/router.tsx` — **all routing lives here**, importing pages from each feature's
  `index.ts`. There is no other `routes/` folder; add routes directly here.
- `src/app/layout/` — `AppShell` (sidebar + breadcrumb header + `<Outlet/>`, used by `/admin`,
  `/instructor`, `/developer`), `AppSidebar`, `NavUser`, `ProtectedRoute`. These are
  composition-root concerns (which panel am I in, is the sidebar item active), not any single
  feature's — that's why they live in `app/` instead of inside a feature.

### `src/shared/` — cross-feature building blocks

`shared/api/client.ts` (axios instance + `ApiError`/`apiErrorMessage`), `shared/api/types/*` (DTOs,
one file per backend resource, re-exported from `types/index.ts`), `shared/lib/*` (`format.ts`,
`color.ts`, `geo.ts`, `filters.ts`, `ports.tsx`, `use-mobile.ts`, `useIsDark.ts`, `utils.ts`),
`shared/ui/*` — the shadcn/ui kit (`radix-mira` style) plus `shared/ui/data/*` (`StatTile`,
`Panel`, `HBarList`, `StackedBar`, `Gauges`, `InsightCard`, `CatalogList` — generic data-display
primitives reused across features) and `shared/ui/effects/*` (`Aurora`, `TextPressure`,
`RotatingText`, used by the public landing page).

### TypeScript strict, everywhere that matters

`tsconfig.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters`,
`noFallthroughCasesInSwitch`, `noImplicitOverride`, `verbatimModuleSyntax`. All of `src/features`,
`src/app`, `src/shared` and tests are `.ts`/`.tsx`. The one exception is the public landing page
(`src/pages/home`, `src/modules/home`) — plain JSX, no business logic, not yet migrated; `src/app/router.tsx`
imports it through an ambient module declaration in `src/vite-env.d.ts` so `tsc` stays clean without
porting 350 lines of marketing markup that isn't part of any feature.

### Known gap: the public landing page isn't a "feature"

`src/pages/home/HomePage.jsx` → `src/modules/home/*` is the only code left outside the
`features/app/shared` structure. It was deliberately left alone: it has no domain logic, no API
calls, and doesn't fit the `domain/application/infrastructure/ui` shape — porting it would mean
rewriting presentational JSX to TSX for no behavioral gain. If it ever grows real logic (A/B
copy, a contact form that calls the API), give it a proper `features/home/` first.

## Stack

React 19 + Vite (rolldown) + React Router 7. Tailwind CSS v4 (via Vite plugin) + shadcn/ui
(`radix-mira` style, see `components.json`). Hugeicons + lucide-react for icons. TanStack React
Query for server state, Zustand (`features/auth/application/authStore.ts`, persisted to
`localStorage` under key `auth-storage`) for auth state. react-hook-form for forms. Recharts for
charts. Sonner for toasts. TypeScript everywhere except the home landing page (see above).

### Tests

- Unit/domain tests live next to the code (`domain/*.test.ts`), vitest + jsdom. `src/test/setup.ts`
  starts an MSW server (`src/test/server.ts`, `onUnhandledRequest: 'error'`) for the handful of
  tests that exercise HTTP; most domain tests are pure-function tests with no network at all.
  Mock `@/shared/ui/effects/Aurora` (WebGL) in any test that renders auth pages.
- Playwright (`e2e/panels.spec.ts`): admin, instructor and developer landing pages on the
  production build, with the API replaced by **real responses recorded** from a seeded local API
  (`e2e/fixtures/<role>/`). A page that calls an endpoint without a recording fails the test. To
  re-record: run the backend seed (`earthcation_be/tests/support/seed.cjs`) behind a listening app,
  export `E2E_TOKEN_ADMIN/INSTRUCTOR/DEVELOPER` (signed by that backend) and run
  `E2E_RECORD_URL=http://localhost:3999 npx playwright test`.
- CI: lint (errors block), vitest, `tsc --noEmit`, build, Playwright (report uploaded on failure).

## Conventions

- **All routing lives in `src/app/router.tsx`.** Don't create another `routes/` folder; add
  routes directly there, importing pages from the relevant feature's `index.ts`.
- A feature never imports another feature's `domain/application/infrastructure/ui` internals —
  only its `index.ts` (enforced by `boundaries/entry-point` in `eslint.config.js`).
- Protected routes: `/admin`, `/instructor`, `/developer` are layout routes wrapped in
  `<ProtectedRoute allowedRoles={[...]}>` (`src/app/layout/ProtectedRoute.tsx`) +
  `AppShell` + `Outlet`. `ProtectedRoute` redirects to `/login` if there's no token, or to `/` if
  the role isn't allowed.
- `/register` is not mounted in the router even though a registration flow could in principle work
  in isolation. The backend's public `POST /api/auth/register` is also gone (see
  `../earthcation_be/CLAUDE.md`) — self-registration is dead everywhere, not just unmounted here.

### Instructor panel (`/instructor`)

Same layout (`AppShell`) and the same session screens as the admin, under
`ProtectedRoute allowedRoles={['instructor']}`: `/instructor` = session list (`SessionsPage` from
`features/sessions` uses `useMySessions` → `GET /api/sessions/mine`: own rooms + the "Juego libre"
session of the instructor's location), `/instructor/sessions/:id`, `.../participants/:userId` and
`.../report`. Shared screens build their links with `usePanelBase()` (from `features/auth`) —
never hardcode `/admin/...`. The sidebar shows only "Mis sesiones"; the participant page hides "Ver
perfil completo" (user detail is admin-only). The backend checks that the instructor can see each
session (`sessionService.assertCanView`).

### Developer panel (`/developer`, role `developer` "Desarrollador/Soporte")

Same layout as admin. Sidebar: **Despliegue** (Salud del servicio = `features/health`'s
`HealthPage` at the index route, Versiones del juego = `features/deploy`'s `VersionsPage`, Visitas
= `features/visits`'s `VisitsPage`) and **Consulta** (analytics, users, sessions — the admin
screens in read-only mode). `usePanelBase()` returns `'/admin' | '/instructor' | '/developer'` and
`useCanEdit()` is false on `/developer`: shared screens hide create/edit/disable/start/end there
(the backend also answers 403). Admins can open `/developer` too.
- `features/health`'s `HealthPage` polls `GET /api/health/details` every 10 s (p50/p95, errors, DB
  pool, Redis, requests per minute, slowest routes).
- `features/deploy`'s `VersionsPage` (`/developer/versions`): drop a build ZIP → checked in the
  browser with JSZip (`domain/deploy.ts#checkBuild`, same rules as the API) → label prefilled from
  Unity's `productVersion` → upload with progress (presigned S3 URL, or the API itself in dev) →
  list polls every 3 s while a version is publishing.
- `features/visits`'s `VisitsPage` (`/developer/visits`, `GET /api/visits/stats`): 7/30/90-day
  toggle, totals, a Leaflet map (department outlines + city circles from Cloudflare coordinates),
  per-day bars, regions/cities/countries/devices/OS/browsers/versions and login locations by role.

### Users module — page-per-action, not modal-per-action

`features/users/ui/` deliberately does NOT put every user action in a `Dialog`. Once a form has
more than a couple of fields or a data table, it's a full route under `/admin/users/*` with a
back-link header, not a cramped modal:
- `UserFormPage` handles both create and edit (`/admin/users/new` and `/admin/users/:id/edit` —
  presence of the `:id` param decides the mode).
- `features/bulk-import`'s `BulkImportUsersPage` (`/admin/users/bulk-import`) — drag-and-drop Excel
  upload → editable preview table → confirm, via the backend's two-step `/parse`+`/confirm`.
- `AlertDialog` is still correct for quick yes/no confirmations (disable/enable/change role) with
  no real form behind them.
- `email` is **not required** for players (backend dropped the unique constraint). It **is**
  required for instructor/admin, because their set-password link is emailed. `username` is
  optional on create (defaults to the cédula).

### UI conventions

- Dialogs need explicit `bg-background border border-border shadow-2xl z-[300]`.
- `SelectContent`/`DropdownMenuContent` need explicit `bg-popover border shadow-lg z-[200]`.
- Destructive/state-changing confirmations use `AlertDialog` with semantic colors: `amber-600` for
  disable, `green-600` for enable.
- User creation never collects a password — the backend generates one and emails it. Never add a
  password field to a "create user" form regardless of role.
- All UI copy is in Spanish; generic technical identifiers (hooks, variables) stay in English.
- Theme (dark/light/system) toggle lives in `NavUser` (`src/app/layout/NavUser.tsx`); Sonner
  toaster uses `theme="system"`.

### Chart & status color tokens (`src/app/index.css`)

`--chart-1..5` (validated colorblind-safe categorical order — assign in order, never cycle),
`--status-good/warning/critical/neutral`, `--seq-100..700` (single-hue sequential), `--chart-grid`.
Use them via `var(...)`; `hsl(var(--primary))` is invalid here (tokens are oklch/hex).

### Mines map (`features/analytics/ui/components/map/MinesMap.tsx`) & visits map

**Vector-only — no tile layer**, using `react-leaflet` + the local GeoJSON of Colombian
departments (`shared/lib/geo.ts`'s `useColombiaDepartments`/`mainlandFeatures`/`boundsOf`, shared
between the mines map and the visits map). Department name matching against the GeoJSON
(`DEPT_ALIASES`, Levenshtein ≤2) lives in `features/analytics/domain/minesMap.ts`. The wrapper
needs `isolate` so Leaflet's z-index 400–1000 panes don't paint over the sticky header/sidebar/dialogs.

### Room QR

`qrcode.react`. The QR encodes `${VITE_PLAY_URL}/?sala=<code>`; the game stores that code and locks
it in the level window. Not shown for "Juego libre".
