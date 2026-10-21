import { TransitionLink } from '@/shared/ui/TransitionLink'
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
            La sesión se sigue desde el panel, en vivo.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-(--l-paper-soft)">
            El instructor crea una sala, comparte el código con el grupo y observa a cada jugador mientras juega. Al
            cerrar la sesión tiene el registro de la capacitación listo para exportar.
          </p>
          <TransitionLink
            to="/login"
            className="l-focus group mt-10 inline-flex items-center gap-3 border-2 border-(--l-amber) px-5 py-3 font-semibold text-(--l-amber) transition-colors hover:bg-(--l-amber) hover:text-(--l-ink)">
            Acceso instructores
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
          </TransitionLink>
        </div>

        <ul className="self-start border-t-2 border-(--l-paper)/70">
          {CAPABILITIES.map(({ id, title, description }) => {
            const Icon = ICONS[id]
            return (
              <li key={id} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-dashed border-(--l-paper)/25 py-6">
                <Icon aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-6 text-(--l-amber)" />
                <div>
                  <h3 className="text-lg font-bold [font-stretch:85%]">{title}</h3>
                  <p className="mt-1.5 leading-relaxed text-(--l-paper-soft)">{description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
