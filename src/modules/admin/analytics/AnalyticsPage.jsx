import { useState } from 'react'
import { useOverview, useVarkAll, useAnalyticsByOrganization } from '@/hooks/admin/useAnalytics'
import { useOrganizations } from '@/hooks/admin/useOrganizations'
import { Skeleton }     from '@/components/ui/skeleton'
import { Badge }        from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { Users, BookOpen, Activity, TrendingUp, AlertTriangle, Building2, Map } from 'lucide-react'
import { MinesMap } from './MinesMap'
import { OnboardingCard } from '@/modules/admin/components/OnboardingCard'

const VARK_COLORS = {
  'Visual':         'hsl(var(--primary))',
  'Auditivo':       'hsl(217 91% 60%)',
  'Lector/Escritor':'hsl(142 71% 45%)',
  'Sin completar':  'hsl(var(--muted-foreground))',
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value ?? '—'}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsPage() {
  const { data: overview, isLoading } = useOverview()
  const { data: varkData }            = useVarkAll()
  const { orgs }                      = useOrganizations()
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const { data: orgAnalytics, isLoading: isLoadingOrg } = useAnalyticsByOrganization(selectedOrgId)

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {[1,2].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
      </div>
    </div>
  )

  const pct = overview?.progress?.global_percentage ?? 0

  const safeVarkData = (overview?.vark_distribution ?? []).map(({ style, ...rest }) => ({
    ...rest,
    varkStyle: style 
  }))

  return (
    <div className="space-y-6">
      <OnboardingCard
        storageKey="dashboard"
        title="Analíticas"
        description="Aquí ves el estado general del entrenamiento."
        tips={[
          'Los riesgos con más fallos te dicen qué reforzar primero.',
          'El mapa ubica cada organización — haz clic en un punto para ver su detalle.',
          'Usa el comparador por organización para revisar una sede específica.',
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios totales"
          value={overview?.users?.total}
          subtitle={`${overview?.users?.players} jugadores · ${overview?.users?.instructors} instructores`}
          icon={Users}
        />
        <StatCard
          title="Sesiones"
          value={overview?.sessions?.total}
          subtitle={`${overview?.sessions?.active} activas`}
          icon={BookOpen}
        />
        <StatCard
          title="Intentos totales"
          value={overview?.progress?.total_attempts}
          subtitle={`${overview?.progress?.total_mitigated} mitigados`}
          icon={Activity}
        />
        <StatCard
          title="Tasa de mitigación"
          value={`${pct}%`}
          subtitle="Global del juego"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
            Mapa de unidades mineras
          </CardTitle>
          <CardDescription className="text-xs">
            Organizaciones ubicadas por departamento — el tamaño del punto crece con la cantidad de jugadores, el color según % de mitigación. Haz clic en un punto para ver el detalle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MinesMap />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Distribución VARK</CardTitle>
          <CardDescription className="text-xs">
            Estilos de aprendizaje de los jugadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={224} minHeight={224}>
                <PieChart>
                  <Pie
                    data={safeVarkData}
                    dataKey="count"
                    nameKey="varkStyle"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}>
                    {safeVarkData.map((entry, i) => (
                      <Cell key={i} fill={VARK_COLORS[entry.varkStyle] ?? 'hsl(var(--muted))'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {safeVarkData.map(item => (
                <div key={item.varkStyle} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: VARK_COLORS[item.varkStyle] ?? 'hsl(var(--muted))' }}
                    />
                    <span className="text-xs text-muted-foreground truncate">{item.varkStyle}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{item.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {overview?.riesgos_mas_fallados?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Riesgos con más fallos
            </CardTitle>
            <CardDescription className="text-xs">
              Ordenado por tasa de fallo — qué riesgo se está mitigando peor
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Riesgo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Categoría</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Intentos</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Fallidos</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Tasa de fallo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Errores prom.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overview.riesgos_mas_fallados.map(r => (
                    <tr key={r.risk_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-sm">{r.name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.category ?? '—'}</td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{r.total_attempts}</td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{r.failed}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={r.fail_rate >= 50 ? 'destructive' : 'outline'} className="text-xs">{r.fail_rate}%</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{r.avg_mistakes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Comparar por organización
          </CardTitle>
          <CardDescription className="text-xs">
            Desempeño de los jugadores de una organización específica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="h-9 w-full sm:w-72 bg-background">
              <SelectValue placeholder="Selecciona una organización" />
            </SelectTrigger>
            <SelectContent className="z-200 bg-popover border border-border shadow-lg">
              {(orgs ?? []).map(o => (
                <SelectItem key={o.id} value={o.id} className="text-sm cursor-pointer">{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedOrgId && (
            isLoadingOrg ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : !orgAnalytics?.length ? (
              <p className="text-sm text-muted-foreground">Sin jugadores registrados en esta organización.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Jugador</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Estilo VARK</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Intentos</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Mitigados</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orgAnalytics.map(row => (
                      <tr key={row.user?.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-sm">{row.user?.first_name} {row.user?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{row.user?.cedula}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-xs">{row.dominant_style ?? '—'}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-xs tabular-nums">{row.total_attempts}</td>
                        <td className="px-4 py-2.5 text-xs tabular-nums">{row.mitigated}</td>
                        <td className="px-4 py-2.5 text-xs tabular-nums">{row.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {varkData && varkData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Jugadores y estilos VARK</CardTitle>
            <CardDescription className="text-xs">
              Detalle por jugador
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Jugador</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Organización</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Localidad</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Estilo VARK</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Visual</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Auditivo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Lector</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {varkData.map(item => (
                    <tr key={item.user_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-sm">
                          {item.user?.first_name} {item.user?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.user?.cedula}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {item.user?.profile?.organization?.name ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {item.user?.profile?.location?.municipality ?? '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-xs">{item.dominant_style ?? '—'}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{item.visual_score ?? 0}</td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{item.auditory_score ?? 0}</td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{item.reading_score ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}