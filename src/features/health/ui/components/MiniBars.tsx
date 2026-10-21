import type { MinuteTrafficDto } from '@/shared/api/types'
import { fillMinutes } from '../../domain/health'

interface MiniBarsProps {
  data: MinuteTrafficDto[]
  minutes: number
  until: number
}

// Cada columna necesita h-full: sin alto propio, el % de la barra se calculaba sobre 0 y no se veía nada.
export function MiniBars({ data, minutes, until }: MiniBarsProps) {
  const series = fillMinutes(data, minutes, until)
  const max = Math.max(1, ...series.map(d => d.requests))
  return (
    <div>
      <div className="flex items-end gap-1 h-24" aria-label="Peticiones por minuto">
        {series.map(d => (
          <div key={d.minute} className="flex-1 h-full flex flex-col justify-end min-w-0" title={`${new Date(d.minute).toLocaleTimeString()} · ${d.requests} peticiones · ${d.errors} errores`}>
            <div className="rounded-t" style={{ height: `${(d.requests / max) * 100}%`, minHeight: d.requests ? 2 : 0, background: d.errors ? 'var(--status-critical)' : 'var(--chart-1)' }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 tabular-nums">
        <span>{new Date(series[0].minute).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>{max} máx/min</span>
        <span>Ahora</span>
      </div>
    </div>
  )
}
