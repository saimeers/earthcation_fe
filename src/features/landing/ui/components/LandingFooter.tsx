import { TransitionLink } from '@/shared/ui/TransitionLink'
import { env } from '@/shared/config/env'
import { Logo } from '@/shared/ui/brand/Logo'
import { PROJECT_TITLE } from '../../domain/content'

export function LandingFooter() {
  return (
    <footer className="bg-(--l-bedrock) text-(--l-paper-soft)">
      <div aria-hidden="true" className="l-hazard h-3" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_auto]">
        <div>
          <Logo className="text-(--l-paper)" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{PROJECT_TITLE}.</p>
        </div>
        <p className="text-sm leading-relaxed">
          Proyecto del Semillero VIRAL
          <br />
          Universidad Francisco de Paula Santander
        </p>
        <nav aria-label="Enlaces" className="flex flex-col gap-2 text-sm">
          <a href={env.playUrl} target="_blank" rel="noopener noreferrer" className="l-focus hover:text-(--l-paper)">Jugar</a>
          <TransitionLink to="/login" className="l-focus hover:text-(--l-paper)">Acceso instructores</TransitionLink>
          <a href="#superficie" className="l-focus hover:text-(--l-paper)">Volver arriba</a>
        </nav>
      </div>
      <div className="l-mono mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-(--l-paper)/10 px-4 py-5 text-[11px] tracking-[0.18em] uppercase sm:px-6">
        <span>Semillero VIRAL · UFPS</span>
        <span>© {new Date().getFullYear()} Earthcation</span>
      </div>
    </footer>
  )
}
