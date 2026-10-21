import { useMemo } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'
import { levelLabel, type Attempt } from '../../../domain/telemetry'
import { replaySeries } from '../../../domain/replay'
import { useAttemptDetail } from '../../../application/useSessions'
import { outcomeMeta } from '../../meta'
import { HealthChart } from './HealthChart'
import { EventFeed } from './EventFeed'

function AttemptPicker({ attempts, selectedId, onSelect }: AttemptReplayProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {attempts.map(a => {
        const meta = outcomeMeta(a.outcome)
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
  )
}

const Empty = ({ children }: { children: string }) =>
  <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">{children}</p>

interface AttemptReplayProps {
  attempts: Attempt[]
  selectedId: string | null
  onSelect: (id: string) => void
}

// Repetición de un intento: curva de vida en el tiempo con bandas por etapa y marcas de los
// eventos clave, más el relato completo evento por evento. Los eventos se piden al elegir el intento.
export function AttemptReplay({ attempts, selectedId, onSelect }: AttemptReplayProps) {
  const { data, isLoading } = useAttemptDetail(selectedId)
  const selected = attempts.find(a => a.id === selectedId)
  const { points, stages, marks, feed } = useMemo(() => replaySeries(data?.events ?? []), [data])

  return (
    <div className="space-y-4">
      <AttemptPicker attempts={attempts} selectedId={selectedId} onSelect={onSelect} />
      {!selectedId ? <Empty>Elige un intento para ver su repetición.</Empty>
        : isLoading ? <Skeleton className="h-72 rounded-xl" />
          : feed.length === 0 ? <Empty>Este intento no tiene eventos registrados.</Empty>
            : (
              <div className="grid gap-4 xl:grid-cols-5">
                <HealthChart selected={selected} points={points} stages={stages} marks={marks} />
                <EventFeed feed={feed} />
              </div>
            )}
    </div>
  )
}
