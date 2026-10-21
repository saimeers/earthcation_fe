# Earthcation — Panel (earthcation_fe)

Panel de administración de Earthcation, un juego serio de entrenamiento en identificación de
riesgos laborales para mineros (Semillero VIRAL, UFPS). Este paquete es el panel web (roles
`admin`, `instructor`, `developer`); el juego en sí vive en `../../earthcation_sg` (Unity) y la API
en `../earthcation_be` (Node/Express + PostgreSQL), que es la fuente de verdad de los tres.

## Stack

React 19 + Vite (rolldown) + React Router 7 + TypeScript (strict) · Tailwind CSS v4 + shadcn/ui ·
TanStack React Query · Zustand · react-hook-form · Recharts · vitest + Testing Library + MSW ·
Playwright.

## Arquitectura

Organizado **por feature** (`src/features/<nombre>/{domain,application,infrastructure,ui}` +
`index.ts` como única API pública), con la composición de la app (router, providers, layout) en
`src/app/` y utilidades/componentes compartidos en `src/shared/`. Un feature nunca importa los
internos de otro feature — solo su `index.ts` (regla de ESLint, ver `eslint.config.js`). Detalle
completo en [`CLAUDE.md`](./CLAUDE.md).

## Comandos

```
npm run dev       # servidor de desarrollo (vite)
npm run build     # build de producción
npm run lint      # eslint .
npm run preview   # sirve el build de producción localmente
npm test          # vitest (jsdom) + Testing Library + MSW
npm run e2e       # Playwright: humo de los 3 paneles sobre el build de producción
npx tsc --noEmit  # chequeo de tipos
```

Variables de entorno (`.env`, no hay `.env.example` — ver `shared/config/env.ts`):
`VITE_API_URL` (origen de la API, sin `/api`), `VITE_PLAY_URL` (dominio del juego, para el QR de
sala).

## Cómo contribuir

Ver [`CONTRIBUTING.md`](./CONTRIBUTING.md) (git flow, commits, checklist antes de abrir el PR).
