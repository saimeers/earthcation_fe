import { useParams }    from 'react-router-dom'
import { Badge }        from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton }     from '../../components/ui/skeleton'
import { Separator }    from '../../components/ui/separator'
import { Progress }     from '../../components/ui/progress'
import { useSessionProgress } from '../../hooks/useSession'

const styleVariant = { Visual: 'default', Auditivo: 'secondary', 'Lector/Escritor': 'outline' }

export function SessionDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useSessionProgress(id)

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
    </div>
  )

  const session = data?.session
  const participants = data?.participants ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{session?.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Código: <span className="font-mono">{session?.code}</span>
          {' · '}{participants.length} participantes
          {' · '}Actualiza cada 10s
        </p>
      </div>

      <Separator className="mb-8" />

      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Aún no hay participantes en esta sesión.
        </p>
      ) : (
        <div className="space-y-3">
          {participants.map(p => (
            <Card key={p.user?.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {p.user?.first_name} {p.user?.last_name}
                      </p>
                      {p.dominant_style && (
                        <Badge variant={styleVariant[p.dominant_style] ?? 'outline'}>
                          {p.dominant_style}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.user?.cedula} · {p.mitigated}/{p.total_attempts} riesgos
                      {p.avg_reaction_ms && ` · ${p.avg_reaction_ms}ms promedio`}
                    </p>
                    <Progress value={p.percentage} className="h-1.5 mt-2" />
                  </div>
                  <span className="text-sm font-semibold shrink-0">{p.percentage}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}