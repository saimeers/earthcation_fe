import { Link } from 'react-router-dom'
import { usePanelBase } from '@/hooks/usePanelBase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Play, Square, Users, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS = {
  waiting: { label: 'En espera', variant: 'secondary' },
  active: { label: 'Activa', variant: 'default' },
  finished: { label: 'Finalizada', variant: 'outline' },
}

export function SessionCard({ session, onStart, onEnd }) {
  const base = usePanelBase()
  const st = STATUS[session.status] ?? STATUS.waiting
  const duration = session.started_at && session.ended_at
    ? Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000)
    : null

  return (
    <Card className="hover:bg-muted/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm truncate">{session.name}</p>
              <Badge variant={st.variant} className="text-xs shrink-0">{st.label}</Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {session.is_free_play
                ? <Badge variant="outline" className="text-[10px] h-5">Juego libre</Badge>
                : <span className="font-mono font-medium text-foreground">{session.code}</span>}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {session.participants?.length ?? 0} participantes
              </span>
              {session.instructor && (
                <span>
                  {session.instructor.first_name} {session.instructor.last_name}
                </span>
              )}
              {session.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {session.location.municipality}, {session.location.department}
                </span>
              )}
              {session.created_at && (
                <span>{format(new Date(session.created_at), "d MMM yyyy", { locale: es })}</span>
              )}
              {duration !== null && (
                <span>{duration} min de duración</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!session.is_free_play && session.status === 'waiting' && (
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onStart(session.id)}>
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
            )}
            {!session.is_free_play && session.status === 'active' && (
              <Button size="sm" variant="outline" className="h-8 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30" onClick={() => onEnd(session.id)}>
                <Square className="h-3 w-3 mr-1" />
                Finalizar
              </Button>
            )}
            <Button size="sm" asChild className="h-8 text-xs">
              <Link to={`${base}/sessions/${session.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver detalle
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}