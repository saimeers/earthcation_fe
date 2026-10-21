import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { CatalogRow, ToggleActiveDialog } from '@/shared/ui/data/CatalogList'
import type { StatusFilter } from '@/shared/lib/filters'
import { OnboardingCard } from '@/features/auth'
import { filterLocations, type Location } from '../../domain/locations'
import { useLocationList, useToggleLocation } from '../../application/useLocations'
import { LocationFormModal } from '../components/LocationFormModal'

export function LocationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [toToggle, setToToggle] = useState<Location | null>(null)

  const { data: locations, isLoading } = useLocationList()
  const toggle = useToggleLocation()
  const filtered = useMemo(() => filterLocations(locations ?? [], search, statusFilter), [locations, search, statusFilter])

  const confirmToggle = () => {
    if (!toToggle) return
    toggle.mutate(toToggle)
    setToToggle(null)
  }

  return (
    <div className="space-y-6">
      <OnboardingCard
        storageKey="locations"
        title="Localidades"
        description="Catálogo de municipios y departamentos de Colombia, ya cargado — normalmente no necesitas tocar nada aquí."
        tips={[
          'Búscalo antes de crear uno nuevo — es muy probable que ya exista.',
          'Solo agrega uno manualmente si de verdad falta en el catálogo oficial.',
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Localidades</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Municipios y departamentos disponibles en el sistema
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva localidad
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por municipio o departamento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm h-9"
        />
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-45 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Solo habilitadas</SelectItem>
            <SelectItem value="inactive">Solo deshabilitadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden divide-y bg-card">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No se encontraron localidades con estos filtros.
            </div>
          ) : (
            filtered.map(loc => (
              <CatalogRow
                key={loc.id}
                title={loc.municipality}
                subtitle={`${loc.department} · ${loc.country}`}
                isActive={loc.is_active}
                onEdit={() => { setEditing(loc); setOpen(true) }}
                onToggle={() => setToToggle(loc)}
              />
            ))
          )}
        </div>
      )}

      <LocationFormModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null) }}
        location={editing}
      />

      <ToggleActiveDialog
        target={toToggle && { isActive: toToggle.is_active }}
        noun="esta localidad"
        description={toToggle?.is_active
          ? `Al deshabilitar "${toToggle.municipality}", esta localidad ya no podrá ser seleccionada en el sistema.`
          : `Al habilitar "${toToggle?.municipality}", volverá a estar disponible para su uso en el sistema.`}
        onConfirm={confirmToggle}
        onCancel={() => setToToggle(null)}
      />
    </div>
  )
}
