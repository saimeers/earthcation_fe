import { Search, Skull, Flag, ListOrdered, Gauge, Activity } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Panel } from '@/shared/ui/data/Panel'
import { HBarList } from '@/shared/ui/data/HBarList'
import { StackedBar } from '@/shared/ui/data/StackedBar'
import { formatDuration } from '@/shared/lib/format'
import type { SessionProgressDto } from '@/shared/api/types'
import type { PerformanceBand } from '../../../domain/bands'
import { levelLabel } from '../../../domain/telemetry'
import {
  eventCountItems, failReasonItems, gasBrandItems, PARTICIPANT_SORTS, stageFailItems, type Participant, type ParticipantSort,
} from '../../../domain/sessions'
import { useTelemetryOverview } from '../../../application/useSessions'
import { categoryIcon, outcomeSegments } from '../../meta'
import { BandPill } from '../BandPill'
import { RiskMatrix, MatrixLegend } from '../RiskMatrix'

interface ParticipantsToolbarProps {
  search: string
  onSearch: (v: string) => void
  sort: ParticipantSort
  onSort: (v: ParticipantSort) => void
  band: PerformanceBand | null
  onClearBand: () => void
  shown: number
  total: number
}

export function ParticipantsToolbar({ search, onSearch, sort, onSort, band, onClearBand, shown, total }: ParticipantsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="relative sm:max-w-xs w-full">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Buscar por nombre, cédula u organización" className="h-9 pl-8 text-sm bg-card" />
      </div>
      <Select value={sort} onValueChange={v => onSort(v as ParticipantSort)}>
        <SelectTrigger className="h-9 w-full sm:w-52 bg-card text-sm"><SelectValue /></SelectTrigger>
        <SelectContent position="popper" className="bg-popover border shadow-lg z-[200]">
          {Object.entries(PARTICIPANT_SORTS).map(([k, s]) => <SelectItem key={k} value={k} className="text-sm">{s.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {band && (
        <Button variant="ghost" size="sm" className="h-9 self-start sm:self-auto" onClick={onClearBand}>
          <BandPill band={band} /> <span className="ml-1 text-muted-foreground">Quitar filtro ×</span>
        </Button>
      )}
      <p className="text-xs text-muted-foreground sm:ml-auto">{shown} de {total} · la línea negra marca el promedio del grupo</p>
    </div>
  )
}

interface RisksTabProps {
  data: SessionProgressDto
  participants: Participant[]
  hasResults: boolean
  onOpen: (userId: string) => void
}

export function RisksTab({ data, participants, hasResults, onOpen }: RisksTabProps) {
  if (!hasResults) {
    return <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed">Los riesgos aparecerán cuando haya resultados.</p>
  }
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel icon={Skull} title="Tasa de fallo por riesgo" description="Del más difícil al más dominado por el grupo." className="lg:col-span-1 self-start" accent="var(--status-critical)">
        <HBarList
          items={data.risks.map(r => ({ key: r.risk_id, label: `${r.risk_id} · ${r.risk_name}`, icon: categoryIcon(r.category), value: r.fail_rate ?? 0, sub: `${r.failed}/${r.results}`, title: r.risk_name }))}
          max={100} format={v => `${Math.round(v)}%`} color="var(--status-critical)"
        />
      </Panel>
      <div className="lg:col-span-2 space-y-3 min-w-0">
        <MatrixLegend />
        <RiskMatrix participants={participants} risks={data.risks} onOpen={onOpen} />
      </div>
    </div>
  )
}

export function TelemetryTab({ data, sessionId }: { data: SessionProgressDto, sessionId: string }) {
  const { data: overview, isLoading } = useTelemetryOverview({ session_id: sessionId })
  const levels = data.levels ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel icon={Flag} title="Resultados por nivel" description="Cómo terminó cada intento de nivel en esta sesión." className="lg:col-span-2">
        {levels.length === 0 ? <p className="text-sm text-muted-foreground">Sin intentos de nivel todavía.</p> : (
          <div className="grid gap-5 md:grid-cols-2">
            {levels.map(l => (
              <div key={l.level_key} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold">{levelLabel(l.level_key)}</p>
                  <p className="text-xs text-muted-foreground">{l.attempts} intentos · mejor {formatDuration(l.best_time_ms)}</p>
                </div>
                <StackedBar segments={outcomeSegments(l)} />
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Panel icon={Skull} title="Causas de fallo" description="De qué pierden los participantes." accent="var(--status-critical)">
        <HBarList items={failReasonItems(data.fail_reasons)} format={v => `${v}`} empty="Nadie ha perdido un nivel todavía." />
      </Panel>
      <Panel icon={ListOrdered} title="Dónde se quedan" description="Etapas en las que más intentos terminan (fallo o abandono).">
        <HBarList items={stageFailItems(levels)} format={v => `${v}`} empty="Sin fallos registrados por etapa." />
      </Panel>
      <Panel icon={Gauge} title="Detector de gases (Nivel 2)" description="Marca elegida y cuántos intentos lo calibraron.">
        {isLoading ? <Skeleton className="h-24" /> : (
          <HBarList items={gasBrandItems(overview)} max={100} format={v => `${v}%`} color="var(--chart-3)" empty="Nadie ha jugado el Nivel 2 todavía." />
        )}
      </Panel>
      <Panel icon={Activity} title="Lo que más pasa en el juego" description="Eventos registrados durante la sesión.">
        {isLoading ? <Skeleton className="h-24" /> : <HBarList items={eventCountItems(overview)} format={v => v.toLocaleString('es-CO')} color="var(--chart-1)" />}
      </Panel>
    </div>
  )
}
