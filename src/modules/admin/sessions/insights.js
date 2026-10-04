import {
  AlertTriangle, Skull, LifeBuoy, Trophy, Timer, Repeat, Target, Gauge, BookOpen, ShieldCheck, Users,
} from 'lucide-react'
import { failReasonLabel, formatSeconds, fullName, levelLabel, ordinal, stageLabel, formatPct } from '@/lib/format'

const times = (n) => `${n} ${n === 1 ? 'vez' : 'veces'}`

// Conclusiones en lenguaje claro generadas a partir de los datos — lo primero que se lee en cada
// vista, antes de gráficas y tablas. Funciones puras: sin datos suficientes, no hay tarjeta.

export function sessionInsights(data) {
  if (!data) return []
  const { summary, risks = [], fail_reasons = [], participants = [] } = data
  const out = []

  const worst = risks.find(r => r.failed > 0)
  if (worst) {
    out.push({
      icon: AlertTriangle, tone: 'bad',
      title: `Riesgo más difícil: ${worst.risk_name}`,
      body: `El grupo lo falló ${worst.failed} de ${worst.results} veces (${formatPct(worst.fail_rate)} de fallo). Es lo primero a reforzar.`,
    })
  }

  const topFail = fail_reasons[0]
  if (topFail) {
    out.push({
      icon: Skull, tone: 'warn',
      title: `Causa de fallo más común: ${failReasonLabel(topFail.fail_reason)}`,
      body: `${topFail.count} intento${topFail.count > 1 ? 's' : ''} terminaron así${topFail.fail_stage ? ` en «${stageLabel(topFail.fail_stage)}»` : ''} (${levelLabel(topFail.level_key)}).`,
    })
  }

  const needHelp = participants.filter(p => p.band === 'refuerzo')
  if (needHelp.length) {
    const names = needHelp.slice(0, 3).map(p => p.user?.first_name).filter(Boolean).join(', ')
    out.push({
      icon: LifeBuoy, tone: 'bad',
      title: `${needHelp.length} participante${needHelp.length > 1 ? 's necesitan' : ' necesita'} refuerzo`,
      body: `Mitigaron menos del 40% de los riesgos${names ? `: ${names}${needHelp.length > 3 ? ' y otros' : ''}` : ''}.`,
    })
  } else if (summary?.with_data) {
    out.push({ icon: ShieldCheck, tone: 'good', title: 'Nadie quedó en zona de refuerzo', body: 'Todos los participantes con datos mitigaron al menos el 40% de los riesgos.' })
  }

  const best = [...participants].filter(p => p.total_attempts > 0).sort((a, b) => b.percentage - a.percentage || (a.avg_reaction_ms ?? 1e9) - (b.avg_reaction_ms ?? 1e9))[0]
  if (best) {
    out.push({
      icon: Trophy, tone: 'good',
      title: `Mejor desempeño: ${fullName(best.user)}`,
      body: `${best.percentage}% de riesgos mitigados${best.avg_reaction_ms ? ` y ${formatSeconds(best.avg_reaction_ms)} de reacción promedio` : ''}.`,
    })
  }

  if (!out.length && summary?.participants) {
    out.push({ icon: Users, tone: 'info', title: 'Esperando resultados', body: 'Las conclusiones aparecerán cuando los participantes empiecen a jugar.' })
  }
  return out.slice(0, 4)
}

export function participantInsights(a) {
  if (!a) return []
  const { participant: p, group, reading, summary_counters: sc = {} } = a
  const out = []

  const strong = [...p.risks].filter(r => r.results > 0).sort((x, y) => (y.mitigation_rate ?? 0) - (x.mitigation_rate ?? 0) || y.results - x.results)[0]
  if (strong && strong.mitigation_rate >= 60) {
    out.push({ icon: ShieldCheck, tone: 'good', title: `Su fortaleza: ${strong.risk_name}`, body: `Lo mitigó ${strong.mitigated} de ${strong.results} veces (${formatPct(strong.mitigation_rate)}).` })
  }

  if (p.weakest_risk) {
    const w = p.weakest_risk
    const g = group.risks?.[w.risk_id]?.mitigation_rate
    out.push({
      icon: Target, tone: 'bad',
      title: `Su punto débil: ${w.risk_name}`,
      body: `Falló ${w.failed} de ${w.results} veces${g != null ? ` — el grupo lo mitiga el ${formatPct(g)} de las veces` : ''}.`,
    })
  }

  const levels = p.telemetry.levels ?? []
  const firstDone = levels.filter(l => l.attempts_until_first_completion)
  if (firstDone.length) {
    const l = firstDone.sort((x, y) => y.attempts_until_first_completion - x.attempts_until_first_completion)[0]
    const g = group.levels?.[l.level_key]?.avg_attempts_until_first_completion
    out.push({
      icon: Repeat, tone: l.attempts_until_first_completion <= 1 ? 'good' : (g && l.attempts_until_first_completion > g ? 'warn' : 'info'),
      title: l.attempts_until_first_completion === 1
        ? `Superó el ${levelLabel(l.level_key)} al primer intento`
        : `Superó el ${levelLabel(l.level_key)} en el ${ordinal(l.attempts_until_first_completion)} intento`,
      body: g ? `El grupo necesita ${g.toLocaleString('es-CO')} intentos en promedio.` : undefined,
    })
  } else if (levels.length) {
    out.push({ icon: Repeat, tone: 'warn', title: 'Aún no completa ningún nivel', body: `Lleva ${p.telemetry.attempts} intento${p.telemetry.attempts !== 1 ? 's' : ''} en esta sesión.` })
  }

  if (p.telemetry.top_fail_reason) {
    const f = p.telemetry.top_fail_reason
    out.push({ icon: Skull, tone: 'warn', title: `Pierde sobre todo por ${failReasonLabel(f.reason).toLowerCase()}`, body: `${f.count} de sus ${p.telemetry.failed} intentos fallidos.` })
  }

  if (p.avg_reaction_ms && group.avg_reaction_ms) {
    const diff = p.avg_reaction_ms - group.avg_reaction_ms
    if (Math.abs(diff) >= 300) {
      out.push({
        icon: Timer, tone: diff < 0 ? 'good' : 'warn',
        title: `Reacciona ${formatSeconds(Math.abs(diff))} ${diff < 0 ? 'más rápido' : 'más lento'} que el grupo`,
        body: `Su promedio es ${formatSeconds(p.avg_reaction_ms)} frente a ${formatSeconds(group.avg_reaction_ms)} del grupo.`,
      })
    }
  }

  if (sc.exits_uncalibrated > 0 || sc.calibrations_invalid > 0) {
    out.push({ icon: Gauge, tone: 'bad', title: 'Usa mal el detector de gases', body: [sc.exits_uncalibrated ? `Avanzó sin calibrar ${times(sc.exits_uncalibrated)}` : null, sc.calibrations_invalid ? `calibró fuera de la zona segura ${times(sc.calibrations_invalid)}` : null].filter(Boolean).join(' y ') + '.' })
  } else if (sc.calibrations_valid > 0) {
    out.push({ icon: Gauge, tone: 'good', title: 'Calibra el detector correctamente', body: `${sc.calibrations_valid} calibración${sc.calibrations_valid > 1 ? 'es' : ''} válida${sc.calibrations_valid > 1 ? 's' : ''} antes de avanzar.` })
  }

  if (reading?.avg_read_ms && reading?.group_avg_read_ms) {
    const ratio = reading.avg_read_ms / reading.group_avg_read_ms
    if (ratio < 0.6) out.push({ icon: BookOpen, tone: 'warn', title: 'Lee poco los paneles informativos', body: `${formatSeconds(reading.avg_read_ms)} por panel frente a ${formatSeconds(reading.group_avg_read_ms)} del grupo.` })
  }

  return out.slice(0, 6)
}
