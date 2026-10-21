import type { ParticipantAnalysisDto, SessionProgressDto } from '@/shared/api/types'
import { formatPct, formatSeconds, fullName, ordinal, times } from '@/shared/lib/format'
import { failReasonLabel, levelLabel, stageLabel } from './telemetry'

// Conclusiones en lenguaje claro generadas a partir de los datos — lo primero que se lee en cada
// vista, antes de gráficas y tablas. Funciones puras: sin datos suficientes, no hay tarjeta.

/** Ícono sugerido para la tarjeta (la UI lo traduce a un ícono concreto). */
export type InsightIcon =
  | 'hardest_risk' | 'fail_cause' | 'needs_help' | 'nobody_behind' | 'best' | 'waiting'
  | 'strength' | 'weakness' | 'retries' | 'reaction' | 'detector' | 'reading'

export type InsightTone = 'good' | 'bad' | 'warn' | 'info'

export interface Insight {
  icon: InsightIcon
  tone: InsightTone
  title: string
  body?: string
}

export function sessionInsights(data: Partial<SessionProgressDto> | null | undefined): Insight[] {
  if (!data) return []
  const { summary, risks = [], fail_reasons = [], participants = [] } = data
  const out: Insight[] = []

  const worst = risks.find(r => r.failed > 0)
  if (worst) {
    out.push({
      icon: 'hardest_risk', tone: 'bad',
      title: `Riesgo más difícil: ${worst.risk_name}`,
      body: `El grupo lo falló ${worst.failed} de ${worst.results} veces (${formatPct(worst.fail_rate)} de fallo). Es lo primero a reforzar.`,
    })
  }

  const topFail = fail_reasons[0]
  if (topFail) {
    out.push({
      icon: 'fail_cause', tone: 'warn',
      title: `Causa de fallo más común: ${failReasonLabel(topFail.fail_reason)}`,
      body: `${topFail.count} intento${topFail.count > 1 ? 's' : ''} terminaron así${topFail.fail_stage ? ` en «${stageLabel(topFail.fail_stage)}»` : ''} (${levelLabel(topFail.level_key)}).`,
    })
  }

  const needHelp = participants.filter(p => p.band === 'refuerzo')
  if (needHelp.length) {
    const names = needHelp.slice(0, 3).map(p => p.user?.first_name).filter(Boolean).join(', ')
    out.push({
      icon: 'needs_help', tone: 'bad',
      title: `${needHelp.length} participante${needHelp.length > 1 ? 's necesitan' : ' necesita'} refuerzo`,
      body: `Mitigaron menos del 40% de los riesgos${names ? `: ${names}${needHelp.length > 3 ? ' y otros' : ''}` : ''}.`,
    })
  } else if (summary?.with_data) {
    out.push({ icon: 'nobody_behind', tone: 'good', title: 'Nadie quedó en zona de refuerzo', body: 'Todos los participantes con datos mitigaron al menos el 40% de los riesgos.' })
  }

  const best = [...participants]
    .filter(p => p.total_attempts > 0)
    .sort((a, b) => b.percentage - a.percentage || (a.avg_reaction_ms ?? 1e9) - (b.avg_reaction_ms ?? 1e9))[0]
  if (best) {
    out.push({
      icon: 'best', tone: 'good',
      title: `Mejor desempeño: ${fullName(best.user)}`,
      body: `${best.percentage}% de riesgos mitigados${best.avg_reaction_ms ? ` y ${formatSeconds(best.avg_reaction_ms)} de reacción promedio` : ''}.`,
    })
  }

  if (!out.length && summary?.participants) {
    out.push({ icon: 'waiting', tone: 'info', title: 'Esperando resultados', body: 'Las conclusiones aparecerán cuando los participantes empiecen a jugar.' })
  }
  return out.slice(0, 4)
}

type Analysis = ParticipantAnalysisDto

function strengthInsight({ participant: p }: Analysis): Insight | null {
  const strong = [...p.risks]
    .filter(r => r.results > 0)
    .sort((x, y) => (y.mitigation_rate ?? 0) - (x.mitigation_rate ?? 0) || y.results - x.results)[0]
  if (!strong || (strong.mitigation_rate ?? 0) < 60) return null
  return { icon: 'strength', tone: 'good', title: `Su fortaleza: ${strong.risk_name}`, body: `Lo mitigó ${strong.mitigated} de ${strong.results} veces (${formatPct(strong.mitigation_rate)}).` }
}

function weaknessInsight({ participant: p, group }: Analysis): Insight | null {
  const w = p.weakest_risk
  if (!w) return null
  const g = group.risks?.[w.risk_id]?.mitigation_rate
  return {
    icon: 'weakness', tone: 'bad',
    title: `Su punto débil: ${w.risk_name}`,
    body: `Falló ${w.failed} de ${w.results} veces${g != null ? ` — el grupo lo mitiga el ${formatPct(g)} de las veces` : ''}.`,
  }
}

function retriesInsight({ participant: p, group }: Analysis): Insight | null {
  const levels = p.telemetry.levels ?? []
  const firstDone = levels.filter(l => l.attempts_until_first_completion)
  if (!firstDone.length) {
    if (!levels.length) return null
    return { icon: 'retries', tone: 'warn', title: 'Aún no completa ningún nivel', body: `Lleva ${p.telemetry.attempts} intento${p.telemetry.attempts !== 1 ? 's' : ''} en esta sesión.` }
  }
  const l = firstDone.sort((x, y) => (y.attempts_until_first_completion ?? 0) - (x.attempts_until_first_completion ?? 0))[0]
  const n = l.attempts_until_first_completion ?? 0
  const g = group.levels?.[l.level_key]?.avg_attempts_until_first_completion
  return {
    icon: 'retries', tone: n <= 1 ? 'good' : (g && n > g ? 'warn' : 'info'),
    title: n === 1
      ? `Superó el ${levelLabel(l.level_key)} al primer intento`
      : `Superó el ${levelLabel(l.level_key)} en el ${ordinal(n)} intento`,
    body: g ? `El grupo necesita ${g.toLocaleString('es-CO')} intentos en promedio.` : undefined,
  }
}

function failCauseInsight({ participant: p }: Analysis): Insight | null {
  const f = p.telemetry.top_fail_reason
  if (!f) return null
  return { icon: 'fail_cause', tone: 'warn', title: `Pierde sobre todo por ${failReasonLabel(f.reason).toLowerCase()}`, body: `${f.count} de sus ${p.telemetry.failed} intentos fallidos.` }
}

function reactionInsight({ participant: p, group }: Analysis): Insight | null {
  if (!p.avg_reaction_ms || !group.avg_reaction_ms) return null
  const diff = p.avg_reaction_ms - group.avg_reaction_ms
  if (Math.abs(diff) < 300) return null
  return {
    icon: 'reaction', tone: diff < 0 ? 'good' : 'warn',
    title: `Reacciona ${formatSeconds(Math.abs(diff))} ${diff < 0 ? 'más rápido' : 'más lento'} que el grupo`,
    body: `Su promedio es ${formatSeconds(p.avg_reaction_ms)} frente a ${formatSeconds(group.avg_reaction_ms)} del grupo.`,
  }
}

function detectorInsight({ summary_counters }: Analysis): Insight | null {
  const sc = summary_counters ?? {}
  const exits = sc.exits_uncalibrated ?? 0
  const invalid = sc.calibrations_invalid ?? 0
  const valid = sc.calibrations_valid ?? 0
  if (exits > 0 || invalid > 0) {
    const parts = [exits ? `Avanzó sin calibrar ${times(exits)}` : null, invalid ? `calibró fuera de la zona segura ${times(invalid)}` : null]
    return { icon: 'detector', tone: 'bad', title: 'Usa mal el detector de gases', body: parts.filter(Boolean).join(' y ') + '.' }
  }
  if (valid > 0) {
    return { icon: 'detector', tone: 'good', title: 'Calibra el detector correctamente', body: `${valid} calibración${valid > 1 ? 'es' : ''} válida${valid > 1 ? 's' : ''} antes de avanzar.` }
  }
  return null
}

function readingInsight({ reading }: Analysis): Insight | null {
  if (!reading?.avg_read_ms || !reading?.group_avg_read_ms) return null
  if (reading.avg_read_ms / reading.group_avg_read_ms >= 0.6) return null
  return { icon: 'reading', tone: 'warn', title: 'Lee poco los paneles informativos', body: `${formatSeconds(reading.avg_read_ms)} por panel frente a ${formatSeconds(reading.group_avg_read_ms)} del grupo.` }
}

const PARTICIPANT_RULES = [strengthInsight, weaknessInsight, retriesInsight, failCauseInsight, reactionInsight, detectorInsight, readingInsight]

export function participantInsights(a: Analysis | null | undefined): Insight[] {
  if (!a) return []
  return PARTICIPANT_RULES.map(rule => rule(a)).filter((i): i is Insight => i !== null).slice(0, 6)
}
