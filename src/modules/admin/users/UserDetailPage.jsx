import { useParams, Link } from 'react-router-dom'
import { useUserDetail } from '@/hooks/admin/useUserDetail'
import { Button }   from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Pencil, Activity, CheckCircle, Timer, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { roleLabel, roleVariant } from './constants'
import { latestAttemptsByLevel } from '@/lib/attempts'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-muted/50 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserDetailPage() {
  const { id } = useParams()
  const { user, progress, sessions, isLoading } = useUserDetail(id)

  // % del último intento de cada nivel: reintentar reemplaza el %, no lo promedia
  const latestByLevel = latestAttemptsByLevel(progress)
  const totalAttempts = latestByLevel.reduce((a, l) => a + l.total, 0)
  const mitigated = latestByLevel.reduce((a, l) => a + l.mitigated, 0)
  const percentage = totalAttempts > 0 ? Math.round((mitigated / totalAttempts) * 100) : 0
  const withTime = progress.filter(p => p.reaction_time_ms)
  const avgReactionMs = withTime.length
    ? withTime.reduce((a, p) => a + p.reaction_time_ms, 0) / withTime.length
    : null

  const vark = user?.varkProfile

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            {isLoading
              ? <Skeleton className="h-7 w-64 mb-1" />
              : (
                <h1 className="text-2xl font-bold tracking-tight truncate flex items-center gap-2">
                  {user?.first_name} {user?.last_name}
                  {user?.role && <Badge variant={roleVariant[user.role] ?? 'secondary'}>{roleLabel[user.role] ?? user.role}</Badge>}
                  {user?.is_active === false && <Badge variant="destructive">Deshabilitado</Badge>}
                </h1>
              )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>Cédula: <span className="font-mono font-semibold text-foreground">{user?.cedula ?? '—'}</span></span>
              <span>@{user?.username}</span>
              {user?.email && <span>{user.email}</span>}
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm" className="h-9 shadow-sm" asChild>
          <Link to={`/admin/users/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar datos
          </Link>
        </Button>
      </div>

      <Separator />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Organización / ubicación */}
          <div className="flex flex-wrap gap-6 text-sm bg-background p-3 rounded-lg border shadow-sm w-fit">
            <p className="text-muted-foreground">Organización: <span className="text-foreground font-medium">{user?.profile?.organization?.name ?? '—'}</span></p>
            <p className="text-muted-foreground">Ubicación: <span className="text-foreground font-medium">{user?.profile?.location ? `${user.profile.location.municipality}, ${user.profile.location.department}` : '—'}</span></p>
            {user?.created_at && (
              <p className="text-muted-foreground">Registrado: <span className="text-foreground font-medium">{format(new Date(user.created_at), "d MMM yyyy", { locale: es })}</span></p>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Intentos totales" value={totalAttempts} icon={Activity} color="text-blue-500" />
            <StatCard label="Riesgos mitigados" value={`${percentage}%`} icon={CheckCircle} color="text-green-500" />
            <StatCard
              label="Tiempo prom. reacción"
              value={avgReactionMs ? `${(avgReactionMs / 1000).toFixed(1)}s` : '—'}
              icon={Timer} color="text-purple-500"
            />
            <StatCard label="Sesiones" value={sessions.length} icon={BookOpen} color="text-amber-500" />
          </div>

          {/* VARK desglosado */}
          {vark && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Estilo de aprendizaje (VARK)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6">
                  <Badge variant="outline" className="text-sm">{vark.dominant_style ?? 'Sin completar'}</Badge>
                  <div className="flex gap-6 text-sm">
                    <p className="text-muted-foreground">Visual: <span className="text-foreground font-medium tabular-nums">{vark.visual_score ?? 0}</span></p>
                    <p className="text-muted-foreground">Auditivo: <span className="text-foreground font-medium tabular-nums">{vark.auditory_score ?? 0}</span></p>
                    <p className="text-muted-foreground">Lector: <span className="text-foreground font-medium tabular-nums">{vark.reading_score ?? 0}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de progreso */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Historial de intentos por riesgo</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {progress.length === 0 ? (
                <p className="text-sm text-muted-foreground p-5">Sin intentos registrados todavía.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Riesgo</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Errores</TableHead>
                        <TableHead>Tiempo de reacción</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {progress.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">
                            <p className="font-medium">{p.risk?.name ?? p.risk_id}</p>
                            <p className="text-xs text-muted-foreground">{p.risk?.category}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.risk?.level?.name ?? '—'}</TableCell>
                          <TableCell>
                            {p.is_mitigated
                              ? <Badge className="bg-green-600 hover:bg-green-600 text-xs">Mitigado</Badge>
                              : <Badge variant="destructive" className="text-xs">Fallido</Badge>}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums">{p.mistakes_count ?? 0}</TableCell>
                          <TableCell className="text-sm tabular-nums">{p.reaction_time_ms ? `${(p.reaction_time_ms / 1000).toFixed(1)}s` : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {p.recorded_at ? format(new Date(p.recorded_at), "d MMM yyyy, HH:mm", { locale: es }) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sesiones */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Sesiones de entrenamiento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground p-5">Aún no se ha unido a ninguna sesión.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Sesión</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Se unió</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map(su => (
                        <TableRow key={su.id}>
                          <TableCell className="text-sm font-medium">
                            <Link to={`/admin/sessions/${su.session?.id}`} className="hover:underline">
                              {su.session?.name ?? '—'}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm font-mono">{su.session?.code}</TableCell>
                          <TableCell className="text-sm text-muted-foreground capitalize">{su.session?.status}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {su.joined_at ? format(new Date(su.joined_at), "d MMM yyyy, HH:mm", { locale: es }) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
