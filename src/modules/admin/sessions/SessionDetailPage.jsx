import { useParams, Link }  from 'react-router-dom'
import { useSessionProgress } from '@/hooks/admin/useSessions'
import { Badge }            from '@/components/ui/badge'
import { Button }           from '@/components/ui/button'
import { Skeleton }         from '@/components/ui/skeleton'
import { Separator }        from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress }         from '@/components/ui/progress'
import { ArrowLeft, RefreshCw, Clock, Target, AlertTriangle } from 'lucide-react'

const VARK_VARIANT = {
  'Visual':          'default',
  'Auditivo':        'secondary',
  'Lector/Escritor': 'outline',
}

export function SessionDetailPage() {
  const { id } = useParams()
  const { data, isLoading, refetch, isFetching } = useSessionProgress(id)

  const session      = data?.session
  const participants = data?.participants ?? []

  return (
    <div className="space-y-5">

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to="/admin/sessions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          {isLoading
            ? <Skeleton className="h-6 w-48" />
            : <h1 className="text-xl font-semibold tracking-tight truncate">{session?.name}</h1>}
          <p className="text-xs text-muted-foreground mt-0.5">
            Código: <span className="font-mono font-medium">{session?.code}</span>
            {' · '}Se actualiza cada 15s
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0"
          onClick={() => refetch()}
          disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Separator />

      {/* Resumen global de la sesión */}
      {!isLoading && participants.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Participantes', value: participants.length },
            {
              label: 'Promedio',
              value: `${Math.round(participants.reduce((a, p) => a + p.percentage, 0) / participants.length)}%`,
            },
            {
              label: 'Completaron',
              value: participants.filter(p => p.percentage === 100).length,
            },
            {
              label: 'Tiempo prom.',
              value: (() => {
                const withTime = participants.filter(p => p.avg_reaction_ms)
                if (!withTime.length) return '—'
                const avg = withTime.reduce((a, p) => a + p.avg_reaction_ms, 0) / withTime.length
                return `${Math.round(avg / 1000)}s`
              })(),
            },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold mt-0.5">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de participantes */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : participants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Aún no hay participantes en esta sesión.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Los jugadores deben unirse con el código <span className="font-mono font-medium">{session?.code}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map(p => (
            <Card key={p.user?.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {p.user?.first_name} {p.user?.last_name}
                      </p>
                      {p.dominant_style && (
                        <Badge variant={VARK_VARIANT[p.dominant_style] ?? 'outline'} className="text-xs">
                          {p.dominant_style}
                        </Badge>
                      )}
                      {p.percentage === 100 && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Completado
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Cédula: {p.user?.cedula}
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{p.mitigated} de {p.total_attempts} riesgos mitigados</span>
                        <span className="font-medium text-foreground">{p.percentage}%</span>
                      </div>
                      <Progress value={p.percentage} className="h-2" />
                    </div>
                  </div>

                  <div className="flex gap-4 sm:flex-col sm:items-end text-xs text-muted-foreground shrink-0">
                    {p.avg_reaction_ms && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{(p.avg_reaction_ms / 1000).toFixed(1)}s promedio</span>
                      </div>
                    )}
                    {p.total_attempts > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{p.total_attempts} intentos</span>
                      </div>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}