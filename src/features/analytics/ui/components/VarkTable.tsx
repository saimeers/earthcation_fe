import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { searchVark, varkScores, type VarkEntry } from '../../domain/overview'
import { varkColor } from './varkColors'

/** Jugadores con su estilo VARK y el reparto de sus puntajes. */
export function VarkTable({ data }: { data: VarkEntry[] | undefined }) {
  const [q, setQ] = useState('')
  const rows = searchVark(data, q)
  return (
    <div className="space-y-3">
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar jugador u organización" className="h-9 pl-8 text-sm" />
      </div>
      <div className="overflow-x-auto rounded-xl border max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="text-xs text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Jugador</th>
              <th className="px-4 py-2.5 text-left font-medium">Organización</th>
              <th className="px-4 py-2.5 text-left font-medium">Estilo</th>
              <th className="px-4 py-2.5 text-left font-medium w-48">Puntajes V · A · L</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(item => {
              const { scores, total } = varkScores(item)
              return (
                <tr key={item.user_id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{item.user?.first_name} {item.user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{item.user?.cedula}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{item.user?.profile?.organization?.name ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: varkColor(item.dominant_style) }} />
                      {item.dominant_style ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex h-2 gap-[2px]" title={scores.map(([k, v]) => `${k}: ${v ?? 0}`).join(' · ')}>
                      {scores.map(([k, v]) => v ? <span key={k} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(v / total) * 100}%`, background: varkColor(k) }} /> : null)}
                    </div>
                    <p className="text-[11px] text-muted-foreground tabular-nums mt-1">{item.visual_score ?? 0} · {item.auditory_score ?? 0} · {item.reading_score ?? 0}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
