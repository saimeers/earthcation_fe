# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

React admin panel for Earthcation — **not the game**. Today it only implements the `admin` role;
`instructor` has full backend support but no frontend UI yet. Consumes the API in
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

- `modules/auth/Login.jsx` (the login actually wired up) calls `navigate('/instructor')` for
  instructor-role users, but **no `/instructor` route is registered** in `App.jsx`. This currently
  produces a blank/404 result for instructor logins. Building the instructor module means adding
  the route AND the pages/module — not just fixing the navigate call.
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
- `email` is **not required** in `UserFormPage` (backend dropped the unique constraint — see
  `../earthcation_be/CLAUDE.md` for why). Don't re-add `required` validation on that field.

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

### Mines map (`modules/admin/analytics/MinesMap.jsx`)

Uses **`react-leaflet`** (not `react-simple-maps` — tried first, dropped after it pulled in a CJS
`require("prop-types")` that Vite's rolldown bundler can't resolve; if you ever see
`Calling require for "X" in an environment that doesn't expose the require function`, it's this
class of problem — check for a missing transitive dep like `prop-types`/`react-is` before assuming
the library itself is broken). Renders `public/data/colombia-departamentos.geo.json` (DIVIPOLA
department polygons, `DPTO_CNMBR` property) as the base layer, with `CircleMarker`s **per
municipio** (not per department) fanned out around the department's centroid when multiple
municipios share a department — there's no municipio-level geometry, so this is a visual spread,
not a real position. Backend department names (typos included) are matched against the GeoJSON's
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
