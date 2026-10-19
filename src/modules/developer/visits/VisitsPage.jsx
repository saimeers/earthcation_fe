import { useState } from 'react'
import { Globe2, Users, QrCode, LogIn, MapPin, Smartphone, Rocket, Monitor, Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatTile } from '@/modules/admin/sessions/components/Performance'
import { HBarList, Panel } from '@/modules/admin/sessions/components/Bars'
import { useVisitStats } from '@/hooks/developer/useVisits'
import { VisitsMap } from './VisitsMap'

const RANGES = [7, 30, 90]
const DEVICE = { mobile: 'Celular', tablet: 'Tableta', desktop: 'Computador' }
const ROLE = { player: 'Jugadores', instructor: 'Instructores', admin: 'Administradores', developer: 'Soporte' }

const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })
const countryName = (code) => {
  try { return countryNames.of(code) } catch { return code }
}
const place = (r) => `${r.region}${r.country && r.country !== 'CO' ? ` (${countryName(r.country)})` : ''}`
const pct = (n, total) => (total ? `${Math.round((n / total) * 100)} %` : '')

// Barras por día (visitas totales, con las únicas resaltadas)
function DayBars({ data, days, since }) {
  // Rellena los días sin visitas para que la escala de tiempo sea real
  const byDay = Object.fromEntries((data ?? []).map(d => [d.day, d]))
  const series = Array.from({ length: days }, (_, i) => {
    const day = new Date(new Date(since).getTime() + (i + 1) * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    return byDay[day] ?? { day, visits: 0, unique: 0 }
  })
  const max = Math.max(1, ...series.map(d => d.visits))
  return (
    // Ocupa todo el alto de la tarjeta (va al lado del mapa, que es más alto)
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-32 flex items-end gap-px" aria-label="Visitas por día">
        {series.map(d => (
          <div key={d.day} className="flex-1 h-full flex flex-col justify-end min-w-0"
            title={`${new Date(`${d.day}T12:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${d.visits} visitas · ${d.unique} únicas`}>
            <div className="rounded-t-sm relative" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits ? 2 : 0, background: 'var(--seq-300)' }}>
              <div className="absolute inset-x-0 bottom-0 rounded-t-sm" style={{ height: d.visits ? `${(d.unique / d.visits) * 100}%` : 0, background: 'var(--chart-1)' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 tabular-nums">
        <span>{new Date(`${series[0].day}T12:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
        <span className="flex gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: 'var(--chart-1)' }} /> Únicas</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: 'var(--seq-300)' }} /> Recargas</span>
        </span>
        <span>Hoy</span>
      </div>
    </div>
  )
}

export default function VisitsPage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, isFetching } = useVisitStats(days)

  if (isLoading || !data) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
  }

  const t = data.totals
  const logins = data.logins.by_role.reduce((s, r) => s + r.count, 0)
  const loginUsers = data.logins.by_role.reduce((s, r) => s + r.users, 0)
  const total = (list) => list.reduce((s, i) => s + i.count, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Visitas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quién abre el juego y desde dónde. Ubicación aproximada por la red (Cloudflare), sin guardar IP.
          </p>
        </div>
        <div className="inline-flex rounded-lg border p-0.5" role="group" aria-label="Periodo">
          {RANGES.map(r => (
            <button key={r} type="button" onClick={() => setDays(r)} aria-pressed={days === r}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${days === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {r} días
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
        <StatTile label="Aperturas del juego" value={t.visits} sub={`${t.unique} únicas (sin recargas en 30 min)${t.bots ? ` · ${t.bots} de robots descartadas` : ''}`} icon={Globe2} />
        <StatTile label="Dispositivos distintos" value={t.visitors} sub="Por red y navegador, aproximado" icon={Users} />
        <StatTile label="Llegaron por QR" value={t.via_qr} sub={t.visits ? `${pct(t.via_qr, t.visits)} de las aperturas` : 'Código de sala en el enlace'} icon={QrCode} />
        <StatTile label="Inicios de sesión" value={logins} sub={`${loginUsers} personas distintas`} icon={LogIn} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Mapa de visitas" description="Ciudades desde donde se abrió el juego." icon={MapPin} className="lg:col-span-3">
          <VisitsMap cities={data.cities} />
        </Panel>
        <Panel title="Por día" description={`Últimos ${days} días, hora de Colombia.`} icon={Globe2} className="lg:col-span-2 flex flex-col">
          <DayBars data={data.per_day} days={data.days} since={data.since} />
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Departamentos / regiones" icon={MapPin}>
          <HBarList items={data.regions.slice(0, 10).map(r => ({ key: `${r.country}-${r.region}`, label: place(r), value: r.count, sub: pct(r.count, t.visits) }))} />
        </Panel>
        <Panel title="Ciudades" icon={Building2}>
          <HBarList items={data.cities.slice(0, 10).map(c => ({ key: `${c.country}-${c.region}-${c.city}`, label: c.city, title: place(c), value: c.count, sub: pct(c.count, t.visits) }))} />
        </Panel>
        <Panel title="Países" icon={Globe2}>
          <HBarList items={data.countries.map(c => ({ key: c.key, label: countryName(c.key), value: c.count, sub: pct(c.count, t.visits) }))} />
        </Panel>
        <Panel title="Dispositivo" description="Si juegan en celular conviene revisar rendimiento y controles táctiles." icon={Smartphone}>
          <HBarList items={data.devices.map(d => ({ key: d.key, label: DEVICE[d.key] ?? d.key, value: d.count, sub: pct(d.count, total(data.devices)) }))} />
        </Panel>
        <Panel title="Sistema y navegador" icon={Monitor}>
          <HBarList items={[
            ...data.os.map(o => ({ key: `os-${o.key}`, label: o.key, value: o.count, sub: pct(o.count, total(data.os)) })),
            ...data.browsers.map(b => ({ key: `br-${b.key}`, label: b.key, value: b.count, sub: pct(b.count, total(data.browsers)), color: 'var(--chart-2)' })),
          ]} />
        </Panel>
        <Panel title="Versión que recibieron" icon={Rocket}>
          <HBarList items={data.versions.map(v => ({ key: v.id, label: v.label, value: v.count, sub: pct(v.count, t.visits) }))} />
        </Panel>
      </div>

      <Panel title="Inicios de sesión" description="Ubicación del inicio de sesión (juego y panel). Ayuda a soporte a ubicar a quien reporta un problema." icon={LogIn}>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Por rol</p>
            <HBarList items={data.logins.by_role.map(r => ({ key: r.role, label: ROLE[r.role] ?? r.role, value: r.count, sub: `${r.users} personas` }))} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Por región</p>
            <HBarList items={data.logins.regions.slice(0, 8).map(r => ({ key: `${r.country}-${r.region}`, label: place(r), value: r.count }))}
              empty="Sin ubicación: activa en Cloudflare la transformación «Add visitor location headers»." />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Por dispositivo</p>
            <HBarList items={data.logins.devices.map(d => ({ key: d.key, label: DEVICE[d.key] ?? d.key, value: d.count }))} />
          </div>
        </div>
      </Panel>
    </div>
  )
}
