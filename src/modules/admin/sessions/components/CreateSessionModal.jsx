import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateSession } from '@/hooks/admin/useSessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export function CreateSessionModal({ open, onClose, locations = [] }) {
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm()
  const createSession = useCreateSession()

  const [searchLoc, setSearchLoc] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredLocs = useMemo(() => {
    const lower = searchLoc.toLowerCase()
    return locations.filter(l =>
      l.municipality.toLowerCase().includes(lower) ||
      l.department.toLowerCase().includes(lower)
    ).slice(0, 15)
  }, [locations, searchLoc])

  const handleSelectLoc = (loc) => {
    setValue('location_id', loc.id)
    setSearchLoc(`${loc.municipality} — ${loc.department}`)
    setShowDropdown(false)
  }

  const onSubmit = async (data) => {
    if (!data.location_id) return
    await createSession.mutateAsync(data)
    reset()
    setSearchLoc('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm bg-background border border-border shadow-2xl z-300">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nueva sesión</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Crea una sesión de capacitación y asigna su localidad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">Nombre</Label>
            <Input
              id="name"
              placeholder="Capacitación Nivel 1 — Mayo"
              disabled={isSubmitting}
              className="bg-background border-border"
              {...register('name', { required: true })}
            />
          </div>

          <div className="space-y-1.5 relative">
            <Label className="text-sm font-medium">Localidad</Label>
            <Input
              placeholder="Buscar municipio o departamento..."
              value={searchLoc}
              disabled={isSubmitting}
              onChange={(e) => {
                setSearchLoc(e.target.value)
                setValue('location_id', '')
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <input type="hidden" {...register('location_id', { required: true })} />

            {showDropdown && searchLoc && (
              <div className="absolute z-50 top-16.25 w-full border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                {filteredLocs.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground text-center">No hay resultados</p>
                ) : (
                  filteredLocs.map(loc => (
                    <div
                      key={loc.id}
                      className="px-3 py-2 bg-background text-sm cursor-pointer hover:bg-[#ededed] transition-colors"
                      onClick={() => handleSelectLoc(loc)}
                    >
                      {loc.municipality} <span className="text-muted-foreground">— {loc.department}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !searchLoc}>
              {isSubmitting ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}