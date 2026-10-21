import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/jetbrains-mono'
import '../landing.css'
import { useScrollDepth } from '../../application/useScrollDepth'
import { LandingHeader } from '../components/LandingHeader'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { Protocols } from '../components/Protocols'
import { ForInstructors } from '../components/ForInstructors'
import { LandingFooter } from '../components/LandingFooter'
import { DepthGauge } from '../components/DepthGauge'

/** Portada pública: la página se recorre como un descenso a la mina, de la bocamina al fondo del pozo. */
export function HomePage() {
  const depth = useScrollDepth()
  return (
    <div className="landing min-h-svh">
      <a
        href="#contenido"
        className="l-focus sr-only z-50 bg-(--l-amber) px-4 py-2 font-semibold text-(--l-ink) focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Saltar al contenido
      </a>
      <LandingHeader underground={depth > 8} />
      <main id="contenido">
        <Hero />
        <HowItWorks />
        <Protocols />
        <ForInstructors />
      </main>
      <LandingFooter />
      <DepthGauge depth={depth} />
    </div>
  )
}
