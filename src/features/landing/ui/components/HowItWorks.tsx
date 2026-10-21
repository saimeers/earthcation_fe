import type { LucideIcon } from 'lucide-react'
import { BookOpen, HardHat, TriangleAlert, Gauge } from 'lucide-react'
import { STEPS, stratum, type StepId } from '../../domain/content'
import { StrataEdge, StratumLabel } from './Strata'

const ICONS: Record<StepId, LucideIcon> = {
  vark: BookOpen,
  epp: HardHat,
  riesgos: TriangleAlert,
  seguimiento: Gauge,
}

/** El recorrido del jugador como un registro de perforación: un renglón por etapa. */
export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-title" className="relative scroll-mt-16 bg-(--l-sandstone) text-(--l-ink)">
      <StrataEdge color="var(--l-limestone)" />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-24 sm:px-6 lg:pt-32">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <StratumLabel stratum={stratum('como-funciona')}>Cómo funciona</StratumLabel>
            <h2 id="como-funciona-title" className="l-display text-[clamp(2.6rem,6vw,4.5rem)]">
              Una jornada completa, de la entrada al frente.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-(--l-ink-soft)">
              La capacitación tradicional no siempre llega a todos ni se entiende igual. En el juego, cada decisión
              tiene una consecuencia visible y se puede repetir hasta hacerla bien.
            </p>
          </div>

          <ol className="border-t-2 border-(--l-ink)">
            {STEPS.map(({ id, title, description }, index) => {
              const Icon = ICONS[id]
              return (
                <li key={id} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-dashed border-(--l-ink)/40 py-7 sm:grid-cols-[4.5rem_1fr_auto]">
                  <span className="l-mono pt-1 text-sm font-semibold text-(--l-ink-soft)">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold [font-stretch:85%]">{title}</h3>
                    <p className="mt-2 leading-relaxed text-(--l-ink-soft)">{description}</p>
                  </div>
                  <Icon aria-hidden="true" strokeWidth={1.75} className="mt-1 hidden size-7 sm:block" />
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
