import { useMemo } from 'react'
import {
  Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { CheckCircle2, XCircle, AlertTriangle, Circle, Heart, Flag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAttemptDetail } from '@/hooks/admin/useTelemetry'
import { describeEvent, eventTone, failReasonLabel, formatDuration, levelLabel, stageLabel } from '@/lib/format'
import { OUTCOME_META, tintBg } from '../bands'

const TONE = {
  good: { color: 'var(--status-good)', icon: CheckCircle2 },
  bad:  { color: 'var(--status-critical)', icon: XCircle },
  warn: { color: 'var(--status-warning)', icon: AlertTriangle },
  info: { color: 'var(--status-neutral)', icon: Circle },
}

function ChartTooltip({ active, payload }) {
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

// Repetición de un intento: curva de vida en el tiempo con bandas por etapa y marcas de los
// eventos clave, más el relato completo evento por evento.
export function AttemptReplay({ attempts, selectedId, onSelect }) {
  const { data, isLoading } = useAttemptDetail(selectedId)
  const selected = attempts.find(a => a.id === selectedId)

  const { points, stages, marks, feed } = useMemo(() => {
    const events = data?.events ?? []
    const pts = events.filter(e => e.health != null && e.t_ms != null)
    const st = []
    events.filter(e => e.event_type === 'stage_enter').forEach((e, i, arr) => {
      st.push({ stage: e.stage, from: e.t_ms, to: arr[i + 1]?.t_ms ?? (events.at(-1)?.t_ms ?? e.t_ms) })
    })
    const mk = events.filter(e => eventTone(e.event_type, e.payload) !== 'info' && e.health != null && e.t_ms != null)
    return { points: pts, stages: st, marks: mk, feed: events }
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {attempts.map(a => {
          const meta = OUTCOME_META[a.outcome] ?? OUTCOME_META.in_progress
          const Icon = meta.icon
          const on = a.id === selectedId
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${on ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-muted'}`}>
              <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
              {levelLabel(a.level_key)} · intento {a.attempt_number}
            </button>
          )
        })}
      </div>

      {!selectedId ? (
        <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Elige un intento para ver su repetición.</p>
      ) : isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : feed.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Este intento no tiene eventos registrados.</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3 rounded-xl border bg-card p-4 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold flex items-center gap-1.5"><Heart className="h-4 w-4" style={{ color: 'var(--status-critical)' }} /> Vida del jugador durante el intento</p>
              {selected && (
                <span className="text-xs text-muted-foreground">
                  {OUTCOME_META[selected.outcome]?.label}
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
                  <XAxis dataKey="t_ms" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatDuration} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }} />
                  <Area type="stepAfter" dataKey="health" stroke="var(--chart-1)" strokeWidth={2} fill="url(#healthFill)" isAnimationActive={false} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }} />
                  {marks.map(m => (
                    <ReferenceDot key={m.id} x={m.t_ms} y={m.health} r={5} fill={TONE[eventTone(m.event_type, m.payload)].color} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--status-good)' }} /> Acción correcta</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--status-warning)' }} /> Alerta</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--status-critical)' }} /> Error o daño</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-4 rounded-sm bg-muted" /> Bandas = etapas del nivel</span>
            </div>
          </div>

          <div className="xl:col-span-2 rounded-xl border bg-card min-w-0 flex flex-col">
            <p className="text-sm font-semibold px-4 pt-4 pb-2">Qué pasó, paso a paso</p>
            <ol className="overflow-y-auto max-h-[22rem] px-4 pb-4">
              {feed.map(e => {
                if (e.event_type === 'stage_enter') {
                  return (
                    <li key={e.id} className="flex items-center gap-2 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Flag className="h-3 w-3" /> {stageLabel(e.stage)}
                      <span className="flex-1 h-px bg-border" />
                    </li>
                  )
                }
                const tone = TONE[eventTone(e.event_type, e.payload)]
                const Icon = tone.icon
                return (
                  <li key={e.id} className="relative flex gap-2.5 py-1.5 pl-1">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: tintBg(tone.color, 18) }}>
                      <Icon className="h-3 w-3" style={{ color: tone.color }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug">{describeEvent(e)}</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">{formatDuration(e.t_ms)}{e.health != null ? ` · vida ${Math.round(e.health)}` : ''}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
