import type { ReactNode } from 'react'
import '@fontsource-variable/jetbrains-mono'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/shared/ui/brand/Logo'
import { TransitionLink } from '@/shared/ui/TransitionLink'
import './auth.css'

// Franja de estratos del costado: las mismas capas que se atraviesan en la portada
const STRATA = ['var(--a-ochre)', '#8c6440', '#6b4f37', 'var(--a-shale)', 'var(--a-coal)']

function Strata() {
  return (
    <div aria-hidden="true" className="flex h-24 flex-col">
      {STRATA.map((color) => <div key={color} className="flex-1" style={{ background: color }} />)}
      <div className="auth-hazard h-2.5" />
    </div>
  )
}

/** Costado claro (pantallas anchas): logo, a quién va dirigido el acceso y los estratos de la mina. */
function Surface() {
  return (
    <aside className="hidden flex-col justify-between bg-(--a-limestone) text-(--a-ink) lg:flex">
      <div className="px-12 pt-10">
        <TransitionLink to="/" direction="up" className="auth-focus inline-block [view-transition-name:brand]" aria-label="Earthcation, volver al inicio">
          <Logo />
        </TransitionLink>
      </div>
      <div className="px-12">
        <p className="auth-mono text-xs tracking-[0.2em] text-(--a-ink-soft) uppercase">Panel de capacitación</p>
        <h1 className="auth-display mt-4 text-[clamp(3rem,5vw,4.5rem)]">Instructores, administración y soporte.</h1>
        <p className="mt-6 max-w-sm leading-relaxed text-(--a-ink-soft)">
          Desde aquí se crean las salas, se sigue a cada jugador durante la sesión y se exporta el registro de la
          capacitación.
        </p>
      </div>
      <Strata />
    </aside>
  )
}

/** Pantallas de acceso (iniciar sesión, olvidé mi contraseña, restablecer) con la estética de la portada. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth grid min-h-svh lg:grid-cols-[1fr_1.1fr]">
      <Surface />
      <main className="auth-form flex flex-col bg-(--a-coal) text-(--a-paper)">
        <div className="flex items-center justify-between px-4 pt-6 sm:px-10">
          <TransitionLink to="/" direction="up" className="auth-focus inline-flex items-center gap-1.5 text-sm text-(--a-paper-soft) hover:text-(--a-paper)">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al inicio
          </TransitionLink>
          <Logo className="text-xl text-(--a-paper) lg:hidden" />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  )
}
