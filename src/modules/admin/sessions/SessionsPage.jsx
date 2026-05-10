import { useState }        from 'react'
import { Link }            from 'react-router-dom'
import { useSessions, useCreateSession, useStartSession, useEndSession } from '@/hooks/admin/useSessions'
import { Button }          from '@/components/ui/button'
import { Badge }           from '@/components/ui/badge'
import { Input }           from '@/components/ui/input'
import { Skeleton }        from '@/components/ui/skeleton'
import { Separator }       from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Label }           from '@/components/ui/label'
import { useForm }         from 'react-hook-form'
import { Plus, ExternalLink, Play, Square, Users } from 'lucide-react'
import { format }          from 'date-fns'
import { es }              from 'date-fns/locale'

const STATUS = {
  waiting:  { label: 'En espera', variant: 'secondary' },
  active:   { label: 'Activa',    variant: 'default'   },
  finished: { label: 'Finalizada',variant: 'outline'   },
}

function CreateSessionModal({ open, onClose }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const createSession = useCreateSession()

  const onSubmit = async (data) => {
    await createSession.mutateAsync(data)
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm bg-background border border-border shadow-2xl z-[300]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nueva sesión</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Crea una sesión de capacitación para tus jugadores.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">Nombre de la sesión</Label>
            <Input
              id="name"
              placeholder="Capacitación Nivel 1 — Enero"
              disabled={isSubmitting}
              className="bg-background border-border"
              {...register('name', { required: true })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear sesión'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SessionsPage() {
  const [search,  setSearch]  = useState('')
  const [open,    setOpen]    = useState(false)

  const { data: sessions, isLoading } = useSessions()
  const startSession = useStartSession()
  const endSession   = useEndSession()

  const filtered = (sessions ?? []).filter(s =>
    `${s.name} ${s.code} ${s.instructor?.first_name} ${s.instructor?.last_name}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sessions?.length ?? 0} sesiones registradas
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva sesión
        </Button>
      </div>

      <Separator />

      <Input
        placeholder="Buscar por nombre, código o instructor..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="h-9 max-w-xs"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No se encontraron sesiones.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(session => {
            const st = STATUS[session.status] ?? STATUS.waiting
            return (
              <Card key={session.id} className="hover:bg-muted/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{session.name}</p>
                        <Badge variant={st.variant} className="text-xs shrink-0">
                          {st.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="font-mono font-medium">
                          Código: {session.code}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {session.participants?.length ?? 0} participantes
                        </span>
                        {session.instructor && (
                          <span>
                            Instructor: {session.instructor.first_name} {session.instructor.last_name}
                          </span>
                        )}
                        {session.created_at && (
                          <span>
                            {format(new Date(session.created_at), "d MMM yyyy", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {session.status === 'waiting' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => startSession.mutate(session.id)}>
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {session.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                          onClick={() => endSession.mutate(session.id)}>
                          <Square className="h-3 w-3 mr-1" />
                          Finalizar
                        </Button>
                      )}
                      <Button size="sm" asChild className="h-8 text-xs">
                        <Link to={`/admin/sessions/${session.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver progreso
                        </Link>
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateSessionModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}