import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/shared/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { usePanelBase } from '@/features/auth'
import { useOrganizationList } from '@/features/organizations'
import { BandPill, bandFor, bandMeta } from '@/features/sessions'
import { organizationRanking } from '../../domain/overview'
import { useOrganizationPlayers } from '../../application/useAnalytics'

/** Elegir una organización y ver el desempeño de cada jugador. */
export function OrgComparator() {
  const base = usePanelBase()
  const { data: orgs } = useOrganizationList()
  const [orgId, setOrgId] = useState('')
  const { data, isLoading } = useOrganizationPlayers(orgId)
  const { rows, avg } = useMemo(() => organizationRanking(data), [data])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <Select value={orgId} onValueChange={setOrgId}>
          <SelectTrigger className="h-9 w-full sm:w-80 bg-background text-sm"><SelectValue placeholder="Selecciona una organización" /></SelectTrigger>
          <SelectContent position="popper" className="max-h-72 bg-popover border shadow-lg z-[200]">
            {(orgs ?? []).map(o => <SelectItem key={o.id} value={o.id} className="text-sm">{o.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {avg != null && <p className="text-sm text-muted-foreground">{rows.length} jugadores · promedio <span className="font-semibold text-foreground">{avg}%</span></p>}
      </div>
      {!orgId ? (
        <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Elige una organización para ver el desempeño de sus jugadores.</p>
      ) : isLoading ? <Skeleton className="h-40 rounded-xl" /> : !rows.length ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Sin jugadores registrados en esta organización.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map(r => {
            const band = bandFor(r.percentage, r.total_attempts > 0)
            return (
              <Link key={r.user?.id} to={`${base}/users/${r.user?.id}`} className="rounded-lg border p-3 hover:bg-muted/40 transition-colors space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.user?.first_name} {r.user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">CC {r.user?.cedula}{r.dominant_style ? ` · ${r.dominant_style}` : ''}</p>
                  </div>
                  <BandPill band={band} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: bandMeta(band).color }} />
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-16 text-right">{r.percentage}% <span className="text-muted-foreground font-normal">({r.mitigated}/{r.total_attempts})</span></span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
