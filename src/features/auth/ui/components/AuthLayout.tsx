import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Aurora from '@/shared/ui/effects/Aurora'
import { useIsDark } from '@/shared/lib/useIsDark'

const AURORA_DARK = ['#0f3460', '#16213e', '#533483']
const AURORA_LIGHT = ['#c9d6ff', '#e2e2e2', '#a8c0ff']

/** Fondo Aurora + "Volver al inicio" + rótulo de la plataforma, común a las pantallas de acceso. */
export function AuthLayout({ children }: { children: ReactNode }) {
  const isDark = useIsDark()
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">

      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={isDark ? AURORA_DARK : AURORA_LIGHT}
          blend={isDark ? 0.5 : 0.35}
          amplitude={isDark ? 1.0 : 0.6}
          speed={0.5}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-background/60' : 'bg-background/70'
          }`} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </Link>

        <div className="mb-8 text-center">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
            Plataforma de instructores
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
