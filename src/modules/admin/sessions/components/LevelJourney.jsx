import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { failReasonLabel, formatDuration, levelLabel, stageLabel, LEVEL_STAGES, ordinal } from '@/lib/format'
import { OUTCOME_META, tintBg } from '../bands'

function attemptText(a) {
  const meta = OUTCOME_META[a.outcome] ?? OUTCOME_META.in_progress
  const parts = [`Intento ${a.attempt_number}: ${meta.label}`]
  if (a.outcome === 'failed') parts.push(`${failReasonLabel(a.fail_reason)} en «${stageLabel(a.fail_stage)}»`)
  if (a.outcome === 'abandoned' && a.fail_stage) parts.push(`en «${stageLabel(a.fail_stage)}»`)
  if (a.duration_ms) parts.push(formatDuration(a.duration_ms))
  return parts.join(' · ')
}

// Puntos compactos por intento (tabla de participantes): ✓ ✗ ↩ con color + ícono
export function JourneyDots({ journeys = {} }) {
  const keys = Object.keys(journeys).sort()
  if (!keys.length) return <span className="text-xs text-muted-foreground">Sin intentos</span>
  return (
    <div className="flex flex-col gap-1">
      {keys.map(k => (
        <div key={k} className="flex items-center gap-1.5">
          <span className="w-7 text-[10px] font-semibold text-muted-foreground tabular-nums">N{levelLabel(k).replace(/\D/g, '')}</span>
          <div className="flex items-center gap-1">
            {journeys[k].map(a => {
              const meta = OUTCOME_META[a.outcome] ?? OUTCOME_META.in_progress
              const Icon = meta.icon
              return (
                <Tooltip key={a.id}>
                  <TooltipTrigger asChild>
                    <span
                      className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                      style={{ backgroundColor: tintBg(meta.color, 22) }}>
                      <Icon className="h-3 w-3" style={{ color: meta.color }} aria-label={meta.label} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{attemptText(a)}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Recorrido detallado de un nivel: pasos conectados intento a intento + tira de etapas
export function LevelJourneyCard({ levelKey, attempts = [], level, group, onSelectAttempt, selectedAttemptId }) {
  const stages = LEVEL_STAGES[levelKey] ?? []
  const failCounts = {}
  attempts.forEach(a => { if (a.fail_stage && a.outcome !== 'completed') failCounts[a.fail_stage] = (failCounts[a.fail_stage] || 0) + 1 })
  const completedAt = level?.attempts_until_first_completion
  const groupFirst = group?.avg_attempts_until_first_completion

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{levelLabel(levelKey)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedAt
              ? <>Lo completó en el <span className="font-semibold text-foreground">{ordinal(completedAt)} intento</span>{groupFirst ? <> · el grupo tarda {groupFirst.toLocaleString('es-CO')} en promedio</> : null}</>
              : attempts.length ? 'Todavía no lo completa' : 'No lo ha jugado en esta sesión'}
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[11px] text-muted-foreground">Mejor tiempo</p>
            <p className="text-sm font-semibold tabular-nums">{formatDuration(level?.best_time_ms)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Tiempo jugado</p>
            <p className="text-sm font-semibold tabular-nums">{formatDuration(level?.total_time_ms)}</p>
          </div>
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {attempts.map((a, i) => {
            const meta = OUTCOME_META[a.outcome] ?? OUTCOME_META.in_progress
            const Icon = meta.icon
            const selected = selectedAttemptId === a.id
            return (
              <div key={a.id} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                <button
                  type="button"
                  onClick={() => onSelectAttempt?.(a.id)}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm',
                    selected ? 'border-primary ring-2 ring-primary/25' : 'border-border',
                  )}
                  style={{ backgroundColor: tintBg(meta.color, 10) }}
                  title="Ver la repetición de este intento">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: meta.color }} />
                  <span className="leading-tight">
                    <span className="block text-xs font-semibold">Intento {a.attempt_number}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {a.outcome === 'failed' ? failReasonLabel(a.fail_reason) : meta.label}
                      {a.duration_ms ? ` · ${formatDuration(a.duration_ms)}` : ''}
                    </span>
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {stages.length > 0 && attempts.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Dónde se quedó en cada etapa</p>
          <div className="flex gap-[2px]">
            {stages.map(st => {
              const n = failCounts[st] || 0
              return (
                <Tooltip key={st}>
                  <TooltipTrigger asChild>
                    <div
                      className="h-6 flex-1 rounded-[4px] flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: n ? tintBg('var(--status-critical)', 25 + n * 20) : 'var(--muted)' }}>
                      {n > 0 ? n : ''}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{stageLabel(st)}{n ? ` — ${n} intento${n > 1 ? 's' : ''} terminó aquí` : ''}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Inicio</span><span>Final del nivel</span>
          </div>
        </div>
      )}
    </div>
  )
}
