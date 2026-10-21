import { useState } from 'react'
import { Globe2, Users, QrCode, LogIn, MapPin, Smartphone, Rocket, Monitor, Building2 } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatTile } from '@/shared/ui/data/StatTile'
import { Panel } from '@/shared/ui/data/Panel'
import { HBarList } from '@/shared/ui/data/HBarList'
import { useVisitStats } from '../../application/useVisits'
import { DEVICE_LABEL, ROLE_LABEL, countryName, pct, placeLabel, sumCount } from '../../domain/visits'
import { DayBars } from '../components/DayBars'
import { VisitsMap } from '../components/VisitsMap'

const RANGES = [7, 30, 90] as const

export function VisitsPage() {
  const [days, setDays] = useState<number>(30)
  const { data, isLoading, isFetching } = useVisitStats(days)

  if (isLoading || !data) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
  }

  const t = data.totals
  const logins = sumCount(data.logins.by_role)
  const loginUsers = data.logins.by_role.reduce((s, r) => s + r.users, 0)

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
          <HBarList items={data.regions.slice(0, 10).map(r => ({ key: `${r.country}-${r.region}`, label: placeLabel(r), value: r.count, sub: pct(r.count, t.visits) }))} />
        </Panel>
        <Panel title="Ciudades" icon={Building2}>
          <HBarList items={data.cities.slice(0, 10).map(c => ({ key: `${c.country}-${c.region}-${c.city}`, label: c.city, title: placeLabel(c), value: c.count, sub: pct(c.count, t.visits) }))} />
        </Panel>
        <Panel title="Países" icon={Globe2}>
          <HBarList items={data.countries.map(c => ({ key: c.key, label: countryName(c.key), value: c.count, sub: pct(c.count, t.visits) }))} />
        </Panel>
        <Panel title="Dispositivo" description="Si juegan en celular conviene revisar rendimiento y controles táctiles." icon={Smartphone}>
          <HBarList items={data.devices.map(d => ({ key: d.key, label: DEVICE_LABEL[d.key] ?? d.key, value: d.count, sub: pct(d.count, sumCount(data.devices)) }))} />
        </Panel>
        <Panel title="Sistema y navegador" icon={Monitor}>
          <HBarList items={[
            ...data.os.map(o => ({ key: `os-${o.key}`, label: o.key, value: o.count, sub: pct(o.count, sumCount(data.os)) })),
            ...data.browsers.map(b => ({ key: `br-${b.key}`, label: b.key, value: b.count, sub: pct(b.count, sumCount(data.browsers)), color: 'var(--chart-2)' })),
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
            <HBarList items={data.logins.by_role.map(r => ({ key: r.role, label: ROLE_LABEL[r.role] ?? r.role, value: r.count, sub: `${r.users} personas` }))} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Por región</p>
            <HBarList items={data.logins.regions.slice(0, 8).map(r => ({ key: `${r.country}-${r.region}`, label: placeLabel(r), value: r.count }))}
              empty="Sin ubicación: activa en Cloudflare la transformación «Add visitor location headers»." />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Por dispositivo</p>
            <HBarList items={data.logins.devices.map(d => ({ key: d.key, label: DEVICE_LABEL[d.key] ?? d.key, value: d.count }))} />
          </div>
        </div>
      </Panel>
    </div>
  )
}
