import { PROTOCOLS, stratum } from '../../domain/content'
import { StrataEdge, StratumLabel } from './Strata'
import { SafetySign } from './SafetySign'

/** Las tres competencias del jugador, cada una con la forma de señal de seguridad que le corresponde. */
export function Protocols() {
  return (
    <section id="protocolos" aria-labelledby="protocolos-title" className="l-grain relative scroll-mt-16 bg-(--l-shale) text-(--l-paper)">
      <StrataEdge color="var(--l-sandstone)" />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-24 sm:px-6 lg:pt-32">
        <StratumLabel stratum={stratum('protocolos')}>Protocolos</StratumLabel>
        <h2 id="protocolos-title" className="l-display max-w-3xl text-[clamp(2.6rem,6vw,4.5rem)]">
          Tres competencias para la labor minera.
        </h2>

        <ol className="mt-14 grid gap-px bg-(--l-paper)/15 md:grid-cols-3">
          {PROTOCOLS.map(({ number, sign, signLabel, title, description }) => (
            <li key={number} className="flex flex-col bg-(--l-shale) p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <SafetySign kind={sign} number={number} className="size-20 shrink-0" />
                <span className="l-mono text-right text-[11px] tracking-[0.18em] text-(--l-paper-soft) uppercase">
                  Señal de
                  <br />
                  {signLabel}
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-bold [font-stretch:85%]">{title}</h3>
              <p className="mt-3 leading-relaxed text-(--l-paper-soft)">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
