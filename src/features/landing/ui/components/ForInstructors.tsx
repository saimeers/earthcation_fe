import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, QrCode, Activity, FileSpreadsheet, Map } from 'lucide-react'
import { CAPABILITIES, stratum, type CapabilityId } from '../../domain/content'
import { StrataEdge, StratumLabel } from './Strata'

const ICONS: Record<CapabilityId, LucideIcon> = {
  salas: QrCode,
  'en-vivo': Activity,
  excel: FileSpreadsheet,
  mapa: Map,
}

export function ForInstructors() {
  return (
    <section id="instructores" aria-labelledby="instructores-title" className="l-grain relative scroll-mt-16 bg-(--l-coal) text-(--l-paper)">
      <StrataEdge color="var(--l-shale)" />
      <div className="mx-auto grid max-w-6xl gap-14 px-4 pt-24 pb-28 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:pt-32">
        <div>
          <StratumLabel stratum={stratum('instructores')}>Para instructores</StratumLabel>
          <h2 id="instructores-title" className="l-display text-[clamp(2.6rem,6vw,4.5rem)]">
            El turno se sigue desde arriba, en vivo.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-(--l-paper-soft)">
            Crea una sala, comparte el código con el grupo y mira cómo avanza cada jugador mientras juega: qué
            riesgos mitigó, cuánto tardó en reaccionar y dónde se equivocó.
          </p>
          <Link
            to="/login"
            className="l-focus group mt-10 inline-flex items-center gap-3 border-2 border-(--l-amber) px-5 py-3 font-semibold text-(--l-amber) transition-colors hover:bg-(--l-amber) hover:text-(--l-ink)">
            Acceso instructores
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ul className="grid gap-px self-start bg-(--l-paper)/12 sm:grid-cols-2">
          {CAPABILITIES.map(({ id, title, description }) => {
            const Icon = ICONS[id]
            return (
              <li key={id} className="bg-(--l-coal) p-6">
                <Icon aria-hidden="true" strokeWidth={1.75} className="size-6 text-(--l-amber)" />
                <h3 className="mt-5 text-lg font-bold [font-stretch:85%]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-(--l-paper-soft)">{description}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
