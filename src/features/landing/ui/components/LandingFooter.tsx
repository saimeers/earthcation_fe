import { Link } from 'react-router-dom'
import { env } from '@/shared/config/env'
import { BOTTOM_DEPTH, formatDepth } from '../../domain/depth'
import { Wordmark } from './Wordmark'

export function LandingFooter() {
  return (
    <footer className="bg-(--l-bedrock) text-(--l-paper-soft)">
      <div aria-hidden="true" className="l-hazard h-3" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_auto]">
        <div>
          <Wordmark className="text-(--l-paper)" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Juego serio para la capacitación en identificación de riesgos en minería subterránea.
          </p>
        </div>
        <p className="text-sm leading-relaxed">
          Proyecto del Semillero VIRAL
          <br />
          Universidad Francisco de Paula Santander
        </p>
        <nav aria-label="Enlaces" className="flex flex-col gap-2 text-sm">
          <a href={env.playUrl} target="_blank" rel="noopener noreferrer" className="l-focus hover:text-(--l-paper)">Jugar</a>
          <Link to="/login" className="l-focus hover:text-(--l-paper)">Acceso instructores</Link>
          <a href="#superficie" className="l-focus hover:text-(--l-paper)">Volver a la superficie ↑</a>
        </nav>
      </div>
      <div className="l-mono mx-auto flex max-w-6xl justify-between gap-4 border-t border-(--l-paper)/10 px-4 py-5 text-[11px] tracking-[0.18em] uppercase sm:px-6">
        <span>Fondo del pozo · {formatDepth(BOTTOM_DEPTH)}</span>
        <span>© {new Date().getFullYear()} Earthcation</span>
      </div>
    </footer>
  )
}
