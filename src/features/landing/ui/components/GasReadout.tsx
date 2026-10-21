// Lectura de un detector multigás, como el medidor que el jugador lleva en el juego. Decorativo.

const READINGS = [
  { gas: 'CH₄', value: '0,3', unit: '%' },
  { gas: 'O₂', value: '20,9', unit: '%' },
  { gas: 'CO', value: '4', unit: 'ppm' },
  { gas: 'H₂S', value: '0', unit: 'ppm' },
]

export function GasReadout() {
  return (
    <div aria-hidden="true" className="l-mono w-56 border-2 border-(--l-ink) bg-(--l-bedrock) p-3 text-(--l-paper) shadow-[6px_6px_0_var(--l-ink)]">
      <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.18em] text-(--l-paper-soft) uppercase">
        <span>Detector</span>
        <span className="l-blink size-2 rounded-full bg-(--l-gas-green)" />
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {READINGS.map(({ gas, value, unit }) => (
          <div key={gas} className="flex items-baseline justify-between border-b border-(--l-paper)/10 pb-1">
            <dt className="text-[11px] text-(--l-paper-soft)">{gas}</dt>
            <dd className="text-sm text-(--l-gas-green) tabular-nums">
              {value}<span className="ml-0.5 text-[10px] text-(--l-paper-soft)">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[10px] tracking-[0.18em] text-(--l-gas-green) uppercase">Atmósfera segura</p>
    </div>
  )
}
