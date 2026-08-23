import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { OrganizationFormModal } from './OrganizationFormModal'
import { useOrganizations } from '../../../hooks/admin/useOrganizations'
import { OnboardingCard } from '@/modules/admin/components/OnboardingCard'

export function OrganizationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  
  const [orgToToggle, setOrgToToggle] = useState(null)

  const { orgs, isLoading, toggleStatus } = useOrganizations()

  const filtered = useMemo(() => {
    if (!orgs) return []
    const query = search.toLowerCase()
    
    return orgs.filter(o => {
      const matchesSearch = `${o.name} ${o.type ?? ''}`.toLowerCase().includes(query)
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? o.is_active :
        !o.is_active

      return matchesSearch && matchesStatus
    })
  }, [orgs, search, statusFilter])

  // Función que se ejecuta al confirmar en el Alert Dialog
  const handleConfirmToggle = () => {
    if (!orgToToggle) return
    toggleStatus({ id: orgToToggle.id, active: orgToToggle.is_active })
    setOrgToToggle(null)
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

      {/* Encabezado */}
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

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por nombre o tipo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm h-9"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Lista */}
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
              <div 
                key={org.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-colors ${
                  org.is_active 
                    ? 'hover:bg-muted/40' 
                    : 'bg-muted/30 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!org.is_active && 'text-muted-foreground line-through decoration-muted-foreground/50'}`}>
                      {org.name}
                    </p>
                    <Badge variant={org.is_active ? 'default' : 'secondary'} className="text-[10px] uppercase font-semibold tracking-wider">
                      {org.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {org.type ?? 'Sin tipo'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8"
                    onClick={() => { setEditing(org); setOpen(true) }}>
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className={`h-8 ${
                      org.is_active 
                        ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' 
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                    // En lugar de mutar directamente, guardamos la org en el estado
                    onClick={() => setOrgToToggle(org)}>
                    {org.is_active ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Formulario de Creación/Edición */}
      <OrganizationFormModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null) }}
        organization={editing}
      />

      {/* Alert Dialog de Confirmación */}
      <AlertDialog open={!!orgToToggle} onOpenChange={(isOpen) => !isOpen && setOrgToToggle(null)}>
        <AlertDialogContent className="bg-background border border-border shadow-2xl z-300 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de {orgToToggle?.is_active ? 'deshabilitar' : 'habilitar'} esta organización?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {orgToToggle?.is_active
                ? `Al deshabilitar "${orgToToggle?.name}", la organización ya no estará disponible para su uso en el sistema hasta que se vuelva a habilitar.`
                : `Al habilitar "${orgToToggle?.name}", la organización volverá a estar disponible para su uso normal en el sistema.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmToggle}
              className={orgToToggle?.is_active ? 'bg-amber-600 hover:bg-amber-700 ' : 'bg-green-600 hover:bg-green-700 '}
            >
              Sí, {orgToToggle?.is_active ? 'deshabilitar' : 'habilitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}