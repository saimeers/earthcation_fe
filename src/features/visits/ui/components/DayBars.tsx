import { fillDays, type DailyVisits } from '../../domain/visits'

interface DayBarsProps {
  data: DailyVisits[]
  days: number
  since: string
}

// Barras por día (visitas totales, con las únicas resaltadas). Ocupa todo el alto de la tarjeta
// (va al lado del mapa, que es más alto).
export function DayBars({ data, days, since }: DayBarsProps) {
  const series = fillDays(data, days, since)
  const max = Math.max(1, ...series.map(d => d.visits))
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-32 flex items-end gap-px" aria-label="Visitas por día">
        {series.map(d => (
          <div key={d.day} className="flex-1 h-full flex flex-col justify-end min-w-0"
            title={`${new Date(`${d.day}T12:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${d.visits} visitas · ${d.unique} únicas`}>
            <div className="rounded-t-sm relative" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits ? 2 : 0, background: 'var(--seq-300)' }}>
              <div className="absolute inset-x-0 bottom-0 rounded-t-sm" style={{ height: d.visits ? `${(d.unique / d.visits) * 100}%` : 0, background: 'var(--chart-1)' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 tabular-nums">
        <span>{new Date(`${series[0].day}T12:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
        <span className="flex gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: 'var(--chart-1)' }} /> Únicas</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: 'var(--seq-300)' }} /> Recargas</span>
        </span>
        <span>Hoy</span>
      </div>
    </div>
  )
}
