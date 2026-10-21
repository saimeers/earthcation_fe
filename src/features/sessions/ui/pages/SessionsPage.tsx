import { useMemo, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { OnboardingCard, useCanEdit, usePanelBase } from '@/features/auth'
import { useLocationList } from '@/features/locations'
import { filterSessions, type StatusFilter } from '../../domain/sessions'
import { useEndSession, useSessionList, useStartSession } from '../../application/useSessions'
import { SessionCard } from '../components/SessionCard'
import { CreateSessionModal } from '../components/CreateSessionModal'

export function SessionsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [open, setOpen] = useState(false)

  const isInstructor = usePanelBase() === '/instructor'
  const canEdit = useCanEdit()
  const { data: sessions, isLoading, refetch, isFetching } = useSessionList(isInstructor)
  const { data: locations } = useLocationList()
  const startSession = useStartSession()
  const endSession = useEndSession()

  const allSessions = useMemo(() => sessions ?? [], [sessions])
  const filtered = useMemo(
    () => filterSessions(allSessions, { search, status: statusFilter, locationId: locationFilter }),
    [allSessions, search, statusFilter, locationFilter],
  )

  return (
    <div className="space-y-5">
      <OnboardingCard
        storageKey="sessions"
        title="Sesiones"
        description="Crea sesiones de entrenamiento en vivo para que los jugadores se unan desde el juego con un código."
        tips={[
          'Al crear una se genera un código de 3 dígitos — compártelo con los jugadores para que se unan.',
          'Desde el detalle de una sesión la inicias y la finalizas cuando termine.',
        ]}
        ctaLabel={canEdit ? 'Crear tu primera sesión' : undefined}
        onCta={canEdit ? () => setOpen(true) : undefined}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{isInstructor ? 'Mis sesiones' : 'Sesiones'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allSessions.length} sesiones registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4 mr-1.5', isFetching && 'animate-spin')} />
            Actualizar
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Nueva sesión
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por nombre, código o instructor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 w-full sm:max-w-xs"
        />

        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-9 w-full sm:w-44 bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="z-200 bg-popover border border-border shadow-lg">
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="waiting">En espera</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="finished">Finalizadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="h-9 w-full sm:w-64 bg-background">
            <SelectValue placeholder="Localidad" />
          </SelectTrigger>
          <SelectContent className="z-200 bg-popover border border-border shadow-lg">
            <SelectItem value="all">Todas las localidades</SelectItem>
            {(locations ?? []).map(loc => (
              <SelectItem key={loc.id} value={loc.id} className="text-sm">
                {loc.municipality} — {loc.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center bg-muted/10 border border-dashed rounded-lg">
          No se encontraron sesiones con estos filtros.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <SessionCard key={s.id} session={s} onStart={startSession.mutate} onEnd={endSession.mutate} />
          ))}
        </div>
      )}

      <CreateSessionModal open={open} onClose={() => setOpen(false)} locations={locations} />
    </div>
  )
}
