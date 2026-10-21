/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_PLAY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Puente temporal: la portada pública (`src/pages/home`, `src/modules/home`) todavía no se migró a
// TypeScript (no tiene lógica de negocio, solo JSX de la landing) — ver CLAUDE.md, pendientes.
declare module '@/pages/home/HomePage' {
  import type { JSX } from 'react'
  const HomePage: () => JSX.Element
  export default HomePage
}
