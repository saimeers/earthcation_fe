import { useParams, Link } from 'react-router-dom'
import { useSessionProgressAdmin, useStartSession, useEndSession } from '@/hooks/admin/useSessions'
import { Button }          from '@/components/ui/button'
import { Badge }           from '@/components/ui/badge'
import { Skeleton }        from '@/components/ui/skeleton'
import { Separator }       from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, RefreshCw, Users, Activity, CheckCircle, Timer, Play, Square } from 'lucide-react'
import { format }          from 'date-fns'
import { es }              from 'date-fns/locale'

import { ParticipantCard } from './components/ParticipantCard'

const STATUS_INFO = {
  waiting:  { label: 'Esperando participantes', className: 'bg-muted text-muted-foreground border-border' },
  active:   { label: 'En curso',                className: 'bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/20' },
  finished: { label: 'Finalizada',              className: 'bg-muted text-muted-foreground border-border' },
}

export function SessionDetailPage() {
  const { id }  = useParams()
  const { data, isLoading, refetch, isFetching } = useSessionProgressAdmin(id)
  const startSession = useStartSession()
  const endSession = useEndSession()

  const session      = data?.session
  const participants = data?.participants ?? []
  const statusInfo = STATUS_INFO[session?.status] ?? STATUS_INFO.waiting

  const avgGlobal = participants.length > 0
    ? Math.round(participants.reduce((a, p) => a + p.percentage, 0) / participants.length)
    : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
            <Link to="/admin/sessions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            {isLoading
              ? <Skeleton className="h-7 w-64 mb-1" />
              : (
                <h1 className="text-2xl font-bold tracking-tight truncate flex items-center gap-2">
                  {session?.name}
                  {session?.status && <Badge variant="outline" className={statusInfo.className}>{statusInfo.label}</Badge>}
                </h1>
              )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>Código: <span className="font-mono font-semibold text-foreground">{session?.code}</span></span>
              {session?.instructor && (
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">•</span>
                  Instructor: {session.instructor.first_name} {session.instructor.last_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {session?.status === 'waiting' && (
            <Button
              size="sm" className="h-9 shadow-sm bg-green-600 hover:bg-green-700"
              onClick={() => startSession.mutate(id)} disabled={startSession.isPending}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar sesión
            </Button>
          )}
          {session?.status === 'active' && (
            <Button
              size="sm" variant="destructive" className="h-9 shadow-sm"
              onClick={() => endSession.mutate(id)} disabled={endSession.isPending}>
              <Square className="h-4 w-4 mr-2" />
              Finalizar sesión
            </Button>
          )}
          <Button variant="secondary" size="sm" className="h-9 shadow-sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Sincronizar datos
          </Button>
        </div>
      </div>

      <Separator />

      {!isLoading && (session?.started_at || session?.ended_at) && (
         <div className="flex gap-6 text-sm bg-background p-3 rounded-lg border shadow-sm w-fit">
           {session?.started_at && (
             <p className="text-muted-foreground">Inició: <span className="text-foreground font-medium">{format(new Date(session.started_at), "d MMM yyyy, HH:mm", { locale: es })}</span></p>
           )}
           {session?.ended_at && (
             <p className="text-muted-foreground">Finalizó: <span className="text-foreground font-medium">{format(new Date(session.ended_at), "d MMM yyyy, HH:mm", { locale: es })}</span></p>
           )}
         </div>
      )}

      {!isLoading && participants.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Participantes',  value: participants.length, icon: Users, color: 'text-blue-500' },
            { label: 'Promedio global',value: `${avgGlobal}%`, icon: Activity, color: 'text-amber-500' },
            { label: 'Completaron 100%', value: participants.filter(p => p.percentage === 100).length, icon: CheckCircle, color: 'text-green-500' },
            {
              label: 'Tiempo prom. reacción',
              value: (() => {
                const w = participants.filter(p => p.avg_reaction_ms)
                if (!w.length) return '—'
                return `${(w.reduce((a, p) => a + p.avg_reaction_ms, 0) / w.length / 1000).toFixed(1)}s`
              })(),
              icon: Timer, color: 'text-purple-500'
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Card key={idx} className="shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-muted/50 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-xl bg-background/50">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">Aún no hay participantes</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
            Los datos aparecerán aquí una vez que los usuarios se unan a la sesión utilizando el código asignado.
          </p>
          <div className="bg-muted/50 px-4 py-2 rounded-lg border">
            Código para unirse: <span className="font-mono font-bold text-foreground ml-1 text-lg">{session?.code}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Análisis por Participante
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {participants.map(p => (
              <ParticipantCard key={p.user?.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}