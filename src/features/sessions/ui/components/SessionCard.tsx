import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExternalLink, Play, Square, Users, MapPin } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useCanEdit, usePanelBase } from '@/features/auth'
import { canEnd, canStart, sessionDuration, showsRoomQr, type Session } from '../../domain/sessions'
import { SESSION_BADGE } from '../meta'
import { RoomQrButton } from './RoomQr'

interface SessionCardProps {
  session: Session
  onStart: (id: string) => void
  onEnd: (id: string) => void
}

export function SessionCard({ session, onStart, onEnd }: SessionCardProps) {
  const base = usePanelBase()
  const canEdit = useCanEdit()
  const st = SESSION_BADGE[session.status] ?? SESSION_BADGE.waiting
  const duration = sessionDuration(session)

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
                <span>{format(new Date(session.created_at), 'd MMM yyyy', { locale: es })}</span>
              )}
              {duration !== null && (
                <span>{duration} min de duración</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showsRoomQr(session) && (
              <RoomQrButton code={session.code} name={session.name} label="QR" className="h-8 text-xs" />
            )}
            {canEdit && canStart(session) && (
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onStart(session.id)}>
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
            )}
            {canEdit && canEnd(session) && (
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
