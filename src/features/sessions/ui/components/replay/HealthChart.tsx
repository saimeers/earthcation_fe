import {
  Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Heart } from 'lucide-react'
import { formatDuration } from '@/shared/lib/format'
import { describeEvent, eventTone, failReasonLabel, stageLabel, type Attempt } from '../../../domain/telemetry'
import type { PlottedEvent, StageBand } from '../../../domain/replay'
import { outcomeMeta } from '../../meta'
import { TONE_STYLE } from './tones'

function ChartTooltip({ active, payload }: { active?: boolean, payload?: { payload: PlottedEvent }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg max-w-64">
      <p className="font-semibold tabular-nums">{formatDuration(d.t_ms)} · {stageLabel(d.stage)}</p>
      <p className="text-muted-foreground mt-0.5">{describeEvent(d)}</p>
      <p className="mt-1 flex items-center gap-1"><Heart className="h-3 w-3" style={{ color: 'var(--status-critical)' }} /> Vida: <span className="font-semibold">{Math.round(d.health)}</span></p>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--status-good)' }} /> Acción correcta</span>
      <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--status-warning)' }} /> Alerta</span>
      <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--status-critical)' }} /> Error o daño</span>
      <span className="flex items-center gap-1"><span className="h-2.5 w-4 rounded-sm bg-muted" /> Bandas = etapas del nivel</span>
    </div>
  )
}

interface HealthChartProps {
  selected: Attempt | undefined
  points: PlottedEvent[]
  stages: StageBand[]
  marks: PlottedEvent[]
}

/** Curva de vida en el tiempo con bandas por etapa y marcas de los eventos clave. */
export function HealthChart({ selected, points, stages, marks }: HealthChartProps) {
  return (
    <div className="xl:col-span-3 rounded-xl border bg-card p-4 space-y-3 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold flex items-center gap-1.5"><Heart className="h-4 w-4" style={{ color: 'var(--status-critical)' }} /> Vida del jugador durante el intento</p>
        {selected && (
          <span className="text-xs text-muted-foreground">
            {outcomeMeta(selected.outcome).label}
            {selected.outcome === 'failed' ? ` · ${failReasonLabel(selected.fail_reason)}` : ''}
            {selected.duration_ms ? ` · ${formatDuration(selected.duration_ms)}` : ''}
          </span>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {stages.map((s, i) => (
              <ReferenceArea key={`${s.stage}-${i}`} x1={s.from} x2={s.to} fill={i % 2 ? 'var(--muted)' : 'transparent'} fillOpacity={0.6} ifOverflow="extendDomain" />
            ))}
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="t_ms" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(v: number) => formatDuration(v)} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }} />
            <Area type="stepAfter" dataKey="health" stroke="var(--chart-1)" strokeWidth={2} fill="url(#healthFill)" isAnimationActive={false} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }} />
            {marks.map(m => (
              <ReferenceDot key={m.id} x={m.t_ms} y={m.health} r={5} fill={TONE_STYLE[eventTone(m.event_type, m.payload)].color} stroke="var(--card)" strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Legend />
    </div>
  )
}
