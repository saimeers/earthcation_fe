import { Activity, AlertTriangle, CheckCircle2, Clock, Cpu, Database, Gauge, Server, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatTile } from '@/modules/admin/sessions/components/Performance'
import { Panel } from '@/modules/admin/sessions/components/Bars'
import { useHealth } from '@/hooks/developer/useHealth'

const fmtUptime = (s) => {
  if (s == null) return '—'
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`
}

// Latencia: verde < 300 ms, amarillo < 1 s, rojo de ahí para arriba
const latencyTone = (ms) => (ms == null ? 'var(--status-neutral)' : ms < 300 ? 'var(--status-good)' : ms < 1000 ? 'var(--status-warning)' : 'var(--status-critical)')

function StatusPill({ ok, label }) {
  const Icon = ok === true ? CheckCircle2 : ok === false ? XCircle : AlertTriangle
  const color = ok === true ? 'var(--status-good)' : ok === false ? 'var(--status-critical)' : 'var(--status-warning)'
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
      <Icon className="h-4 w-4" /> {label}
    </span>
  )
}

function MiniBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.requests))
  return (
    <div className="flex items-end gap-1 h-24" aria-label="Peticiones por minuto">
      {data.map(d => (
        <div key={d.minute} className="flex-1 flex flex-col justify-end min-w-0" title={`${new Date(d.minute).toLocaleTimeString()} · ${d.requests} peticiones · ${d.errors} errores`}>
          <div className="rounded-t" style={{ height: `${(d.requests / max) * 100}%`, minHeight: d.requests ? 2 : 0, background: d.errors ? 'var(--status-critical)' : 'var(--chart-1)' }} />
        </div>
      ))}
    </div>
  )
}

export default function HealthPage() {
  const { data, isLoading, isError, dataUpdatedAt } = useHealth()
  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
  if (isError || !data) {
    return (
      <div className="rounded-xl border p-6 text-center space-y-2">
        <XCircle className="h-8 w-8 mx-auto" style={{ color: 'var(--status-critical)' }} />
        <p className="font-medium">No se pudo consultar la API</p>
        <p className="text-sm text-muted-foreground">El servicio puede estar caído o reiniciándose. Se reintenta cada 10 s.</p>
      </div>
    )
  }
  const m = data.metrics ?? {}
  const pool = data.database?.pool
  const errorRate = m.requests ? (m.errors / m.requests) * 100 : 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Salud del servicio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            API de Earthcation · últimos {m.window_minutes ?? 15} min · se actualiza cada 10 s
            {dataUpdatedAt ? ` (${new Date(dataUpdatedAt).toLocaleTimeString()})` : ''}
          </p>
        </div>
        <StatusPill ok={data.status === 'ok'} label={data.status === 'ok' ? 'Operando con normalidad' : 'Degradado'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Latencia p95" value={m.p95_ms != null ? `${m.p95_ms} ms` : '—'} sub={`p50 ${m.p50_ms ?? '—'} ms`} icon={Gauge} accent={latencyTone(m.p95_ms)} />
        <StatTile label="Peticiones" value={m.requests ?? 0} sub={`${m.requests ? Math.round(m.requests / (m.window_minutes || 15)) : 0} por minuto`} icon={Activity} />
        <StatTile label="Errores (5xx)" value={m.errors ?? 0} sub={`${errorRate.toFixed(1)} % de las peticiones`} icon={AlertTriangle} accent={m.errors ? 'var(--status-critical)' : 'var(--status-good)'} />
        <StatTile label="En línea" value={fmtUptime(data.uptime_s)} sub={`v${data.version} · ${data.memory_mb} MB de memoria`} icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Base de datos" icon={Database} accent={data.database?.ok ? 'var(--status-good)' : 'var(--status-critical)'}>
          <StatusPill ok={data.database?.ok} label={data.database?.ok ? `Responde en ${data.database.ms} ms` : `Sin respuesta: ${data.database?.error ?? ''}`} />
          {pool && (
            <p className="text-sm text-muted-foreground">
              Conexiones: {pool.using} en uso, {pool.available} libres de {pool.max}
              {pool.waiting ? <span style={{ color: 'var(--status-warning)' }}> · {pool.waiting} en espera</span> : ''}
            </p>
          )}
        </Panel>
        <Panel title="Caché (Redis)" icon={Cpu} accent={data.redis?.ok === false ? 'var(--status-critical)' : 'var(--status-good)'}>
          <StatusPill ok={data.redis?.ok} label={data.redis?.ok === true ? `Responde en ${data.redis.ms} ms` : data.redis?.ok === false ? `Sin respuesta: ${data.redis.error ?? ''}` : 'Sin Redis: caché en memoria'} />
          <p className="text-sm text-muted-foreground">Guarda los límites de peticiones y la caché de consultas pesadas. Si falla, la API sigue funcionando sin caché.</p>
        </Panel>
        <Panel title="Peticiones por minuto" icon={Server}>
          {m.per_minute?.length ? <MiniBars data={m.per_minute} /> : <p className="text-sm text-muted-foreground">Sin tráfico en esta ventana.</p>}
        </Panel>
      </div>

      <Panel title="Rutas más lentas" description="Ordenadas por p95. Útil para encontrar el cuello de botella durante una sesión con muchos jugadores." icon={Gauge}>
        {m.routes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3 font-medium">Ruta</th>
                  <th className="py-2 px-3 font-medium text-right">Peticiones</th>
                  <th className="py-2 px-3 font-medium text-right">Errores</th>
                  <th className="py-2 px-3 font-medium text-right">p50</th>
                  <th className="py-2 pl-3 font-medium text-right">p95</th>
                </tr>
              </thead>
              <tbody>
                {m.routes.map(r => (
                  <tr key={r.route} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs break-all">{r.route}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{r.requests}</td>
                    <td className="py-2 px-3 text-right tabular-nums" style={{ color: r.errors ? 'var(--status-critical)' : undefined }}>{r.errors}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{r.p50_ms} ms</td>
                    <td className="py-2 pl-3 text-right tabular-nums font-medium" style={{ color: latencyTone(r.p95_ms) }}>{r.p95_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-muted-foreground">Sin datos todavía.</p>}
      </Panel>
    </div>
  )
}
