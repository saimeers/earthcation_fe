import { TransitionLink } from '@/shared/ui/TransitionLink'
import { ArrowUpRight } from 'lucide-react'
import { env } from '@/shared/config/env'
import { SERIOUS_GAME_NOTE, stratum } from '../../domain/content'
import { StratumLabel } from './Strata'
import { MineSection } from './MineSection'
import { GasReadout } from './GasReadout'

export function Hero() {
  return (
    <section id="superficie" aria-labelledby="hero-title" className="scroll-mt-16 bg-(--l-limestone) text-(--l-ink)">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
        <div>
          <StratumLabel stratum={stratum('superficie')}>Juego Serio de seguridad minera</StratumLabel>
          <h1 id="hero-title" className="l-display text-[clamp(3.2rem,9vw,6.5rem)]">
            Aprende a ver el riesgo{' '}
            <span className="relative inline-block">
              antes de entrar.
              <span aria-hidden="true" className="l-hazard absolute inset-x-0 -bottom-1 h-2" />
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-(--l-ink-soft)">
            Earthcation es un Juego Serio para reforzar la identificación de riesgos en la minería subterránea de
            carbón de Norte de Santander. Recorres una mina en 2D, reconoces los peligros de cada labor y aplicas el
            protocolo que corresponde, en un entorno donde equivocarse no lastima a nadie.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={env.playUrl} target="_blank" rel="noopener noreferrer"
              className="l-focus group inline-flex items-center gap-3 bg-(--l-amber) px-6 py-4 text-lg font-bold text-(--l-ink) shadow-[5px_5px_0_var(--l-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--l-ink)]">
              Jugar ahora
              <ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
            <TransitionLink to="/login" className="l-focus font-semibold underline decoration-2 underline-offset-4 hover:decoration-(--l-amber)">
              Soy instructor
            </TransitionLink>
          </div>
          <aside aria-label="Qué es un Juego Serio" className="mt-12 max-w-xl border-l-4 border-(--l-amber) pl-4">
            <p className="l-mono text-[11px] tracking-[0.18em] text-(--l-ink-soft) uppercase">Qué es un Juego Serio</p>
            <p className="mt-1.5 text-sm leading-relaxed text-(--l-ink-soft)">{SERIOUS_GAME_NOTE}</p>
          </aside>
        </div>

        <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
          <MineSection />
          <div className="mt-4 sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0">
            <GasReadout />
          </div>
          <figcaption className="sr-only">
            Corte de una mina subterránea de carbón en una ladera: la entrada con marco de madera, un inclinado con
            rieles y un coche que sube y baja tirado por el malacate, mantos de carbón con sus sobreguías, puertas de
            madera de sostenimiento, un ventilador en la segunda entrada y señales de peligro en los frentes.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
