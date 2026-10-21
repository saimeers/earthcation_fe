import { Check, X, Minus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Avatar } from '@/shared/ui/data/Gauges'
import { STATUS_COLOR, tintBg } from '@/shared/lib/color'
import { formatPct, formatSeconds, fullName, initials } from '@/shared/lib/format'
import type { ParticipantRiskDto, SessionRiskDto } from '@/shared/api/types'
import { RATE_LEGEND, rateTone } from '../../domain/bands'
import type { Participant } from '../../domain/sessions'
import { bandMeta, categoryIcon } from '../meta'

function RiskHeader({ risk }: { risk: SessionRiskDto }) {
  // categoryIcon es una tabla fija: siempre devuelve una de las mismas referencias de ícono, no
  // crea un componente nuevo. El lint no puede saber eso de una función.
  const Icon = categoryIcon(risk.category)
  return (
    <th className="px-1.5 py-3 border-b text-center min-w-20">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex flex-col items-center gap-1 cursor-help">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold tabular-nums">{risk.risk_id}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          <p className="font-semibold">{risk.risk_name}</p>
          <p className="opacity-80">{risk.category} · {risk.level_name}</p>
        </TooltipContent>
      </Tooltip>
    </th>
  )
}

function RiskCell({ participant, riskId, cell }: { participant: Participant, riskId: string, cell: ParticipantRiskDto | undefined }) {
  if (!cell) {
    return (
      <td className="px-1.5 py-2 border-b group-hover:bg-muted/50">
        <div className="mx-auto flex h-10 w-16 items-center justify-center rounded-lg border border-dashed text-muted-foreground/60" title="No lo enfrentó">
          <Minus className="h-3.5 w-3.5" />
        </div>
      </td>
    )
  }
  const color = STATUS_COLOR[rateTone(cell.mitigation_rate)]
  const LastIcon = cell.last_result === 'mitigated' ? Check : X
  return (
    <td className="px-1.5 py-2 border-b group-hover:bg-muted/50">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="mx-auto flex h-10 w-16 flex-col items-center justify-center rounded-lg cursor-default"
            style={{ backgroundColor: tintBg(color, 22), boxShadow: `inset 0 0 0 1px ${tintBg(color, 45)}` }}>
            <span className="flex items-center gap-0.5 text-xs font-bold tabular-nums">
              <LastIcon className="h-3 w-3" style={{ color }} strokeWidth={3} />
              {cell.mitigated}/{cell.results}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">{formatPct(cell.mitigation_rate)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          <p className="font-semibold">{fullName(participant.user)} · {riskId}</p>
          <p>Mitigó {cell.mitigated} de {cell.results} veces · {cell.mistakes_total} {cell.mistakes_total === 1 ? 'error' : 'errores'}</p>
          <p>Reacción promedio: {formatSeconds(cell.avg_reaction_ms)}</p>
          <p>Último resultado: {cell.last_result === 'mitigated' ? 'mitigado' : 'fallido'}</p>
        </TooltipContent>
      </Tooltip>
    </td>
  )
}

interface RiskMatrixProps {
  participants: Participant[]
  risks: SessionRiskDto[]
  onOpen: (userId: string) => void
}

// Matriz participantes × riesgos: toda la sesión de un vistazo, sin desplegables.
// Cada celda = dominio del riesgo (mitigados/resultados) con el último resultado como ícono.
export function RiskMatrix({ participants, risks, onOpen }: RiskMatrixProps) {
  if (!risks.length) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Todavía no hay resultados por riesgo en esta sesión.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground border-b min-w-52">Participante</th>
            {risks.map(r => <RiskHeader key={r.risk_id} risk={r} />)}
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.user.id} className="group">
              <td className="sticky left-0 z-10 bg-card group-hover:bg-muted px-4 py-2 border-b transition-colors">
                <button type="button" onClick={() => onOpen(p.user.id)} className="flex items-center gap-2.5 text-left min-w-0">
                  <Avatar text={initials(p.user)} color={bandMeta(p.band).color} size={28} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate hover:underline">{fullName(p.user)}</span>
                    <span className="block text-[11px] text-muted-foreground tabular-nums">{formatPct(p.total_attempts ? p.percentage : null)} mitigado</span>
                  </span>
                </button>
              </td>
              {risks.map(r => (
                <RiskCell key={r.risk_id} participant={p} riskId={r.risk_id} cell={p.risks.find(x => x.risk_id === r.risk_id)} />
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="sticky left-0 z-10 bg-muted/60 px-4 py-2.5 text-xs font-semibold">Grupo</td>
            {risks.map(r => (
              <td key={r.risk_id} className="bg-muted/60 px-1.5 py-2.5 text-center">
                <span className="text-xs font-bold tabular-nums">{formatPct(r.mitigation_rate)}</span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function MatrixLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Dominio del riesgo:</span>
      {RATE_LEGEND.map(([tone, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded" style={{ backgroundColor: tintBg(STATUS_COLOR[tone], 45) }} />{label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" strokeWidth={3} /> / <X className="h-3 w-3" strokeWidth={3} /> último resultado</span>
      <span className="inline-flex items-center gap-1"><Minus className="h-3 w-3" /> no lo enfrentó</span>
    </div>
  )
}
