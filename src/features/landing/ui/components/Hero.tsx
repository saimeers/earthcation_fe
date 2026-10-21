import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { env } from '@/shared/config/env'
import { stratum } from '../../domain/content'
import { StratumLabel } from './Strata'
import { MineSection } from './MineSection'
import { GasReadout } from './GasReadout'

export function Hero() {
  return (
    <section id="superficie" aria-labelledby="hero-title" className="scroll-mt-16 bg-(--l-limestone) text-(--l-ink)">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
        <div>
          <StratumLabel stratum={stratum('superficie')}>Juego serio de seguridad minera</StratumLabel>
          <h1 id="hero-title" className="l-display text-[clamp(3.2rem,9vw,6.5rem)]">
            Aprende a ver el riesgo{' '}
            <span className="relative inline-block">
              antes de bajar.
              <span aria-hidden="true" className="l-hazard absolute inset-x-0 -bottom-1 h-2" />
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-(--l-ink-soft)">
            Earthcation es un videojuego de capacitación para mineros: adapta la instrucción a tu estilo de
            aprendizaje y te pone frente a los riesgos de una mina subterránea —mecánicos, eléctricos, químicos
            y de altura— en un lugar donde equivocarse no le cuesta nada a nadie.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={env.playUrl} target="_blank" rel="noopener noreferrer"
              className="l-focus group inline-flex items-center gap-3 bg-(--l-amber) px-6 py-4 text-lg font-bold text-(--l-ink) shadow-[5px_5px_0_var(--l-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--l-ink)]">
              Jugar ahora
              <ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
            <Link to="/login" className="l-focus font-semibold underline decoration-2 underline-offset-4 hover:decoration-(--l-amber)">
              Soy instructor
            </Link>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
          <MineSection />
          <div className="mt-4 sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0">
            <GasReadout />
          </div>
          <figcaption className="sr-only">
            Corte de una mina subterránea: castillete en superficie, un pozo vertical con su jaula y tres
            galerías a 40, 120 y 200 metros de profundidad con señales de peligro.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
