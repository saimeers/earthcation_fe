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

import { LocationFormModal } from './LocationFormModal'
import { useLocations } from '@/hooks/admin/useLocations' // Ajusta la ruta si es necesario

export function LocationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  
  // Estado para el modal de confirmación
  const [locToToggle, setLocToToggle] = useState(null)

  const { locations, isLoading, toggleStatus } = useLocations()

  const filtered = useMemo(() => {
    if (!locations) return []
    const query = search.toLowerCase()
    
    return locations.filter(loc => {
      const matchesSearch = `${loc.municipality} ${loc.department} ${loc.country}`
        .toLowerCase()
        .includes(query)
      
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? loc.is_active :
        !loc.is_active

      return matchesSearch && matchesStatus
    })
  }, [locations, search, statusFilter])

  const handleConfirmToggle = () => {
    if (!locToToggle) return
    toggleStatus({ id: locToToggle.id, active: locToToggle.is_active })
    setLocToToggle(null)
  }

  return (
    <div className="space-y-6">

      {/* Encabezado */}
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

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por municipio o departamento..."
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
              No se encontraron localidades con estos filtros.
            </div>
          ) : (
            filtered.map(loc => (
              <div 
                key={loc.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-colors ${
                  loc.is_active 
                    ? 'hover:bg-muted/40' 
                    : 'bg-muted/30 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!loc.is_active && 'text-muted-foreground line-through decoration-muted-foreground/50'}`}>
                      {loc.municipality}
                    </p>
                    <Badge variant={loc.is_active ? 'default' : 'secondary'} className="text-[10px] uppercase font-semibold tracking-wider">
                      {loc.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loc.department} · {loc.country}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8"
                    onClick={() => { setEditing(loc); setOpen(true) }}>
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className={`h-8 ${
                      loc.is_active 
                        ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' 
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setLocToToggle(loc)}>
                    {loc.is_active ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Formulario */}
      <LocationFormModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null) }}
        location={editing}
      />

      {/* Alert Dialog de Confirmación */}
      <AlertDialog open={!!locToToggle} onOpenChange={(isOpen) => !isOpen && setLocToToggle(null)}>
        <AlertDialogContent className="bg-background border border-border shadow-2xl z-300 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de {locToToggle?.is_active ? 'deshabilitar' : 'habilitar'} esta localidad?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locToToggle?.is_active
                ? `Al deshabilitar "${locToToggle?.municipality}", esta localidad ya no podrá ser seleccionada en el sistema.`
                : `Al habilitar "${locToToggle?.municipality}", volverá a estar disponible para su uso en el sistema.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmToggle}
              className={locToToggle?.is_active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700 '}
            >
              Sí, {locToToggle?.is_active ? 'deshabilitar' : 'habilitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}