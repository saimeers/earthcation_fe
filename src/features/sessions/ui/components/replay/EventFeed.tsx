import { Flag } from 'lucide-react'
import { tintBg } from '@/shared/lib/color'
import { formatDuration } from '@/shared/lib/format'
import { describeEvent, eventTone, stageLabel, type GameEvent } from '../../../domain/telemetry'
import { TONE_STYLE } from './tones'

/** Relato del intento evento por evento, con separadores por etapa. */
export function EventFeed({ feed }: { feed: GameEvent[] }) {
  return (
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
          const tone = TONE_STYLE[eventTone(e.event_type, e.payload)]
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
  )
}
