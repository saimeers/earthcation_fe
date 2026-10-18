# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

React panel for Earthcation — **not the game**. Implements the `admin` role and the `instructor`
role (sessions only, see "Instructor panel" below). Consumes the API in
`../earthcation_be` via `VITE_API_URL`. Deployed on Vercel. See `../../project-context.md` §4 for
the exhaustive route/module breakdown — this file covers what's specific to working in this folder.

## Commands

```
npm run dev       # vite dev server
npm run build     # vite build
npm run lint      # eslint .
npm run preview   # preview production build locally
```

No test framework configured.

## Stack

React 19 + Vite + React Router 7. Tailwind CSS v4 (via Vite plugin) + shadcn/ui (`radix-mira`
style, see `components.json`). Hugeicons + lucide-react for icons. TanStack React Query for server
state, Zustand (`store/authStore.js`, persisted to `localStorage` under key `auth-storage`) for
auth state. react-hook-form for forms. Recharts for charts. Sonner for toasts. Plain JSX — **no
TypeScript** anywhere in application code (only the shadcn UI kit under `components/ui/*.tsx` uses
TS, by shadcn's default, not by app convention).

## Architecture

- **All routing lives in `src/App.jsx`** — there is no `routes/` folder. Don't create one; add
  routes directly there following the existing pattern.
- `pages/` are thin wrappers that re-export the real implementation from `modules/`. If you need to
  change page behavior, edit the module, not the page wrapper.
- `services/api.js` — axios instance with a 401 interceptor that hard-redirects to `/login`.
  Resource-specific services (`auth`, `user`, `organization`, `location`, `session`, `progress`,
  `level`, `analytics`) each wrap `api.js` calls.
- `hooks/admin/` — one `use<Resource>` hook per admin resource, built on React Query, used by the
  corresponding `modules/admin/<resource>` page.
- Protected routes: single `/admin` layout route wrapped in
  `<ProtectedRoute allowedRoles={['admin']}>` + `AppSidebar` + `Outlet`. `ProtectedRoute` redirects
  to `/login` if there's no token, or to `/` if the role isn't allowed.

### Known active bugs / inconsistencies — check before touching auth or sessions

- `/register` is not mounted in `App.jsx` even though `Register.jsx`/`RegisterPage.jsx` work in
  isolation. The backend's public `POST /api/auth/register` is also gone now (see
  `../earthcation_be/CLAUDE.md`) — self-registration is dead everywhere, not just unmounted here.
- Orphaned/duplicate code from an earlier iteration — do not build on top of these, and treat them
  as deletion candidates rather than reference implementations:
  - `hooks/useAuth.js` (unused by the real login flow)
  - `modules/auth/components/LoginForm.jsx`
  - `modules/analytics/AnalyticsPage.jsx` (old duplicate — the real one used by `/admin` is
    `modules/admin/analytics/AnalyticsPage.jsx`)
  - all of `pages/sessions/*`
  - `components/shared/RoleGuard.jsx` (0 bytes, never implemented)

### Instructor panel (`/instructor`)

Same layout (`pages/admin/AdminPage.jsx` + `AppSidebar`) and the same session screens as the admin,
under `ProtectedRoute allowedRoles={['instructor']}`: `/instructor` = session list (`SessionsPage`
uses `useMySessions` → `GET /api/sessions/mine`: own rooms + the "Juego libre" session of the
instructor's location), `/instructor/sessions/:id`, `.../participants/:userId` and `.../report`.
Shared screens build their links with `hooks/usePanelBase.js` ('/admin' or '/instructor') — never
hardcode `/admin/...` in `modules/admin/sessions`. The sidebar shows only "Mis sesiones"; the
participant page hides "Ver perfil completo" (user detail is admin-only). The backend checks that
the instructor can see each session (`sessionService.assertCanView`).

### Users module — page-per-action, not modal-per-action

`modules/admin/users/` deliberately does NOT put every user action in a `Dialog`. Once a form has
more than a couple of fields or a data table, it's a full route under `/admin/users/*` with a
back-link header (same header pattern as `SessionDetailPage`), not a cramped modal:
- `UserFormPage.jsx` handles both create and edit (`/admin/users/new` and `/admin/users/:id/edit`
  — presence of the `:id` param decides the mode; edit fetches via `GET /api/users/:id`).
- `BulkImportUsersPage.jsx` (`/admin/users/bulk-import`) — drag-and-drop Excel upload → editable
  preview table (per-row `status`: `ok`/`duplicate_in_file`/`duplicate_in_db`/`missing_required`,
  admin can fix fields inline and deselect rows) → confirm. Uses `useBulkImportUsers.js`
  (two mutations: `parseFile`/`confirmRows`) against the backend's two-step `/parse`+`/confirm`.
- `AlertDialog` is still correct for the things it was already used for — quick yes/no
  confirmations (disable/enable/change role) with no real form behind them. Don't move those to
  pages; the modal-vs-page split is by form complexity, not by "is it a mutation."
- `email` is **not required** in `UserFormPage` for players (backend dropped the unique
  constraint — see `../earthcation_be/CLAUDE.md` for why). It **is** required for
  instructor/admin, because their set-password link is emailed. `username` is optional on create
  (defaults to the cédula). Empty optional fields are sent as `null`, never `''`.

### UI conventions to follow for new components

- Dialogs need explicit `bg-background border border-border shadow-2xl z-[300]` (repeated per
  modal, not extracted to a variant — match the existing pattern rather than introducing a new one
  ad hoc). Reserve dialogs for quick confirmations; see Users module note above for when a full
  page is the right call instead.
- `SelectContent`/`DropdownMenuContent` need explicit `bg-popover border shadow-lg z-[200]` for the
  same reason (contrast against the Aurora/dark background).
- Destructive or state-changing confirmations (disable, enable, change role) use `AlertDialog` with
  semantic colors: `amber-600` for disable, `green-600` for enable.
- User creation forms never collect a password — the backend generates one internally and it's
  never surfaced to a `player` (cedula-only login); only `admin`/`instructor` accounts get it
  emailed. Don't add a password field to any "create user" form regardless of role.
- All UI copy is in Spanish.
- Theme (dark/light/system) toggle lives in `NavUser` inside the sidebar; Sonner toaster uses
  `theme="system"`.

### Player detail page (`modules/admin/users/UserDetailPage.jsx`, `/admin/users/:id`)

Read-only detail view (separate from `UserFormPage.jsx`'s edit mode) — click a row in `UsersPage`'s
table to get here. Pulls three previously-unused-but-already-existing backend endpoints in one
hook (`hooks/admin/useUserDetail.js`): `GET /api/users/:id` (profile + VARK breakdown),
`GET /api/progress/user/:userId/history` (per-risk attempt history), `GET /api/users/:id/sessions`
(enrollment history). None of these needed new backend work — they existed unconsumed.

### Session detail, participant analysis & report (`modules/admin/sessions/`)

Redesigned around "insight first": every view opens with plain-Spanish conclusions generated by
`insights.js` (pure functions — `sessionInsights`, `participantInsights`), then visuals, then
tables. No nested collapsibles anywhere.
- `SessionDetailPage.jsx` (`/admin/sessions/:id`) — hero with copyable room code, KPI tiles,
  insight cards, clickable performance-band distribution (filters the table), and `Tabs`:
  **Participantes** (table on desktop / cards on mobile, level-journey dots per attempt),
  **Riesgos** (`RiskMatrix` participants × risks + fail-rate bars), **Telemetría** (session-scoped
  `/api/telemetry/overview?session_id=`). Refetches every 15s **only while the session is active**.
- `ParticipantAnalysisPage.jsx` (`/admin/sessions/:id/participants/:userId`) — full page per the
  page-not-modal convention: gauge vs. group average, insight cards, comparison tiles with
  `DeltaChip`, `LevelJourneyCard` per level, per-risk mastery rows, in-game behaviour counters,
  and `AttemptReplay` (health curve over `t_ms` + humanized event feed, events fetched lazily via
  `GET /api/telemetry/attempts/:id`). Prev/next arrows browse the session's participants.
- `SessionReportPage.jsx` (`/admin/sessions/:id/report`) — print-designed A4 report registered in
  `App.jsx` **outside** the sidebar layout (still inside `ProtectedRoute`). Always light colors
  (overrides the CSS tokens inline). "Informe PDF" in the session's Exportar menu opens it; the
  user saves it with the browser's print → "Guardar como PDF". The Excel export is server-side
  (`GET /api/sessions/:id/export.xlsx`, downloaded as a blob by `useExportSessionXlsx`).
- One performance scale everywhere (`bands.js`): Destacado ≥80% · En progreso 40–79% ·
  Necesita refuerzo <40% · Sin datos — same cut-offs as the backend's `performanceBand`.
  Status colors always ship with an icon + label, never color alone.
- `src/lib/format.js` holds every Spanish label for game enums (`fail_reason`, `stage`,
  `event_type` via `describeEvent`, summary counters). Never render raw keys like `Methane1`.

### Chart & status color tokens (`src/index.css`)

`--chart-1..5` (validated colorblind-safe categorical order — assign in order, never cycle),
`--status-good/warning/critical/neutral` (reserved for state: bands, outcomes), `--seq-100..700`
(single-hue sequential), `--chart-grid`. Use them via `var(...)` in Recharts/SVG and inline styles;
`hsl(var(--primary))` is invalid here (tokens are oklch/hex). The old dashboard had that bug.

### Dropdowns inside dialogs — z-index rule

`[data-radix-popper-content-wrapper]` is forced to `z-index: 400` in `index.css` (above `z-300`
dialogs). It used to be 50, which put every Select/Popover opened inside a modal **behind** the
modal. For searchable municipio pickers use `modules/admin/components/LocationCombobox.jsx`
(Popover-based, accent-insensitive, keyboard nav, stops wheel propagation so it scrolls inside a
Dialog's scroll lock) — used by the new-session modal and the user form. `SelectTrigger`'s height
is a plain `h-7` class now, so a consumer's `h-9` overrides it.

### Mines map (`modules/admin/analytics/MinesMap.jsx`)

**Vector-only — no tile layer.** The CARTO basemap tiles were removed (they showed an
API-key/attribution problem in production). Departments are a choropleth by player count
(sequential blue), markers are colored by mitigation %. Colors re-apply on theme change via a
`MutationObserver` on `html.dark`. The wrapper has `isolate` so Leaflet's z-index 400–1000 panes
don't paint over the sticky header/sidebar/dialogs. Bounds exclude San Andrés (it would shrink the
mainland). Marker anchors = area centroid of the department's largest polygon (Bogotá overridden
to the urban area), fanned out but kept inside the polygon. The notes below about matching
still apply.

#### Matching & history

Uses **`react-leaflet`** (not `react-simple-maps` — tried first, dropped after it pulled in a CJS
`require("prop-types")` that Vite's rolldown bundler can't resolve; if you ever see
`Calling require for "X" in an environment that doesn't expose the require function`, it's this
class of problem — check for a missing transitive dep like `prop-types`/`react-is` before assuming
the library itself is broken). Renders `public/data/colombia-departamentos.geo.json` (DIVIPOLA
department polygons, `DPTO_CNMBR` property) as the only layer, with `CircleMarker`s **per
municipio** (not per department) — there's no municipio-level geometry, so the fan-out is a visual
spread, not a real position. Backend department names (typos included) are matched against the GeoJSON's
via `normalize()` + Levenshtein distance ≤2 + a small `DEPT_ALIASES` table, same pattern as
`bulkImport.service.js#findOrCreateLocation` in the backend, duplicated client-side on purpose
(small, self-contained, not worth sharing across repos for this). Leaflet's tooltip/popup CSS
needs an explicit override in `src/index.css` (`.leaflet-tooltip`) — its default background is
effectively transparent against this app's theme.

### Onboarding — dismissible cards, not a guided tour

`modules/admin/components/OnboardingCard.jsx` — a plain card in the page's normal flow, not a
spotlight/walkthrough overlay. **`react-joyride` was tried and removed**: its spotlight overlay
desynced from page content on scroll, and its v3 API changed enough from v2 (named export, no
`showSkipButton` prop, colors moved from `styles.options` to a new `options` prop) to cause repeat
breakage. Don't reintroduce a tour library without checking in first. Each page's guide has its own
`storageKey` persisted in `authStore.pageToursSeen` (dashboard uses the separate top-level
`onboardingSeen` flag, historical naming — not worth renaming). "Ver guías de nuevo" in `NavUser`
calls `resetAllTours()`, clearing every page's flag at once.

### Home page (`modules/home/`) — brand tokens live in `src/index.css`

The public landing page's look is driven entirely by CSS variables in `src/index.css`
(`--primary`, `--accent`, etc. under `:root`/`.dark`, Tailwind v4 `@theme inline` block) — don't
hardcode brand colors in component files, change the tokens instead. Current `--primary` is a
purple/violet (`oklch(.. .. 300)` hue family, light and dark variants) — this was deliberately
changed off shadcn's default pure-grayscale palette, which read as an unbranded AI-template look.
`TextPressure.jsx` (`components/`, from React Bits) uses the `@import url(fontUrl)` variant, not
`@font-face` — the Google Fonts CSS2 API endpoint it points to is a stylesheet, not a raw font
file, so `@font-face { src: url() }` silently fails to load it (this broke the animated title once
already, from a dead third-party Cloudinary font URL in the original ported version).

### Room QR (`modules/admin/sessions/components/RoomQr.jsx`, `lib/playUrl.js`)

`qrcode.react`. The QR encodes `${VITE_PLAY_URL}/?sala=<code>` (default
`https://play.earthcation.saimers.dev`); the game stores that code and locks it in the level window.
`RoomQrButton` opens a large modal to project in class (white background, code, link, copy, PNG
download) — used in `SessionDetailPage` (under the copyable code) and `SessionCard` (live, non free-play
sessions). `RoomQrPrint` is an SVG QR in the printable report. Not shown for "Juego libre".

### Developer panel (`/developer`, role `developer` "Desarrollador/Soporte")

Same layout as admin. Sidebar: **Despliegue** (Salud del servicio = index, Versiones del juego,
Visitas) and **Consulta** (analytics, users, sessions — the admin screens in read-only mode).
`hooks/usePanelBase.js` returns '/admin' | '/instructor' | '/developer' and `useCanEdit()` is false on
'/developer': shared screens hide create/edit/disable/start/end there (the backend also answers 403).
Shared screens must build links with `usePanelBase()`, never hardcode `/admin/...`.
`modules/developer/health/HealthPage.jsx` polls `GET /api/health/details` every 10 s (p50/p95,
errors, DB pool, Redis, requests per minute, slowest routes). Admins can open `/developer` too.
