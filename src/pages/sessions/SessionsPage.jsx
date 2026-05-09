import { useState }        from 'react'
import { Link }            from 'react-router-dom'
import { Button }          from '../../components/ui/button'
import { Badge }           from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton }        from '../../components/ui/skeleton'
import { Separator }       from '../../components/ui/separator'
import { CreateSessionModal } from './CreateSessionModal'
import { useMySessions, useStartSession, useEndSession } from '../../hooks/useSession'

const statusLabel = { waiting: 'En espera', active: 'Activa', finished: 'Finalizada' }
const statusVariant = { waiting: 'secondary', active: 'default', finished: 'outline' }

export default function SessionsPage() {
  const [open, setOpen]  = useState(false)
  const { data: sessions, isLoading } = useMySessions()
  const startSession = useStartSession()
  const endSession   = useEndSession()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus capacitaciones activas y pasadas
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Nueva sesión</Button>
      </div>

      <Separator className="mb-8" />

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : sessions?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No tienes sesiones creadas aún.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions?.map(session => (
            <Card key={session.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{session.name}</p>
                    <Badge variant={statusVariant[session.status]}>
                      {statusLabel[session.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Código: <span className="font-mono font-medium">{session.code}</span>
                    {' · '}
                    {session.participants?.length ?? 0} participantes
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {session.status === 'waiting' && (
                    <Button size="sm" variant="outline"
                      onClick={() => startSession.mutate(session.id)}>
                      Iniciar
                    </Button>
                  )}
                  {session.status === 'active' && (
                    <Button size="sm" variant="outline"
                      onClick={() => endSession.mutate(session.id)}>
                      Finalizar
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link to={`/sessions/${session.id}`}>Ver</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSessionModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}