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
import { filterOrganizations, type Organization } from '../../domain/organizations'
import { useOrganizationList, useToggleOrganization } from '../../application/useOrganizations'
import { OrganizationFormModal } from '../components/OrganizationFormModal'

export function OrganizationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Organization | null>(null)
  const [toToggle, setToToggle] = useState<Organization | null>(null)

  const { data: orgs, isLoading } = useOrganizationList()
  const toggle = useToggleOrganization()
  const filtered = useMemo(() => filterOrganizations(orgs ?? [], search, statusFilter), [orgs, search, statusFilter])

  const confirmToggle = () => {
    if (!toToggle) return
    toggle.mutate(toToggle)
    setToToggle(null)
  }

  return (
    <div className="space-y-6">
      <OnboardingCard
        storageKey="organizations"
        title="Organizaciones"
        description="Las empresas/instituciones a las que pertenecen los jugadores — se usan para comparar desempeño entre sedes en Analíticas."
        tips={[
          'Búscala antes de crear una nueva — casi siempre ya existe o se crea sola al importar el Excel.',
          'Créala manualmente aquí solo si necesitas asignarla a un usuario antes de tener el Excel listo.',
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Organizaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Empresas e instituciones registradas en el sistema
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva organización
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por nombre o tipo..."
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
              No se encontraron organizaciones con estos filtros.
            </div>
          ) : (
            filtered.map(org => (
              <CatalogRow
                key={org.id}
                title={org.name}
                subtitle={org.type ?? 'Sin tipo'}
                subtitleClassName="capitalize"
                isActive={org.is_active}
                onEdit={() => { setEditing(org); setOpen(true) }}
                onToggle={() => setToToggle(org)}
              />
            ))
          )}
        </div>
      )}

      <OrganizationFormModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null) }}
        organization={editing}
      />

      <ToggleActiveDialog
        target={toToggle && { isActive: toToggle.is_active }}
        noun="esta organización"
        description={toToggle?.is_active
          ? `Al deshabilitar "${toToggle.name}", la organización ya no estará disponible para su uso en el sistema hasta que se vuelva a habilitar.`
          : `Al habilitar "${toToggle?.name}", la organización volverá a estar disponible para su uso normal en el sistema.`}
        onConfirm={confirmToggle}
        onCancel={() => setToToggle(null)}
      />
    </div>
  )
}
