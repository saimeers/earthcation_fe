import { useState, useMemo } from 'react'
import {
  useSessions,
  useStartSession,
  useEndSession,
  useLocationsForFilter,
} from '@/hooks/admin/useSessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

import { SessionCard } from './components/SessionCard'
import { CreateSessionModal } from './components/CreateSessionModal'
import { OnboardingCard } from '@/modules/admin/components/OnboardingCard'

export function SessionsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all') 
  const [open, setOpen] = useState(false)

  const { data: sessions, isLoading } = useSessions()
  const { data: locations } = useLocationsForFilter()

  const startSession = useStartSession()
  const endSession = useEndSession()

  const allSessions = sessions ?? []

  const filtered = useMemo(() => {
    return allSessions.filter(s => {
      const matchSearch = `${s.name} ${s.code} ${s.instructor?.first_name ?? ''} ${s.instructor?.last_name ?? ''}`
        .toLowerCase().includes(search.toLowerCase())
      
      const matchStatus = statusFilter === 'all' || s.status === statusFilter

      const locationId = s.location_id || s.location?.id
      const matchLocation = locationFilter === 'all' || locationId === locationFilter

      return matchSearch && matchStatus && matchLocation
    })
  }, [allSessions, search, statusFilter, locationFilter])

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
        ctaLabel="Crear tu primera sesión"
        onCta={() => setOpen(true)}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allSessions.length} sesiones registradas
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva sesión
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por nombre, código o instructor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 w-full sm:max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <SessionCard
              key={s.id}
              session={s}
              onStart={startSession.mutate}
              onEnd={endSession.mutate}
            />
          ))}
        </div>
      )}

      <CreateSessionModal open={open} onClose={() => setOpen(false)} locations={locations} />
    </div>
  )
}