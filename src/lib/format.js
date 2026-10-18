// Formateo y etiquetas en español para los datos de telemetría del juego (catálogo en
// earthcation_be/docs/TELEMETRY.md). Nunca mostrar claves crudas como "Methane1" en la UI.

export const fullName = (u) => [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.username || '—'

export const initials = (u) =>
  [u?.first_name?.[0], u?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

// 154321 → "2:34"
export function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '—'
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

// 8123 → "8,1 s"
export function formatSeconds(ms, digits = 1) {
  if (ms == null || Number.isNaN(ms)) return '—'
  return `${(ms / 1000).toLocaleString('es-CO', { maximumFractionDigits: digits, minimumFractionDigits: digits })} s`
}

export const formatPct = (v) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(v)}%`)

export const formatNumber = (v, digits = 0) =>
  v == null || Number.isNaN(v) ? '—' : Number(v).toLocaleString('es-CO', { maximumFractionDigits: digits })

export const ordinal = (n) => `${n}.º`

export function levelLabel(key) {
  const n = String(key ?? '').replace(/\D/g, '')
  return n ? `Nivel ${n}` : (key ?? '—')
}

export const FAIL_REASONS = {
  derrumbe:             'Derrumbe',
  intoxicacion_metano:  'Intoxicación por metano',
  mordedura_ofidio:     'Mordedura de serpiente',
  infeccion_por_hongos: 'Infección por hongos',
  lesion_por_fatiga:    'Lesión por fatiga',
  impacto_proyeccion:   'Impacto por proyección de fragmentos',
  fatiga:               'Lesión por fatiga',
  desconocido:          'Causa desconocida',
}
export const failReasonLabel = (r) => (r ? FAIL_REASONS[r] ?? r : '—')

export const OUTCOMES = {
  completed:   'Completado',
  failed:      'Fallido',
  abandoned:   'Abandonado',
  in_progress: 'En curso',
}

const STAGE_PREFIXES = [
  ['PickingMuro',    'Picando muro'],
  ['WagonToSurface', 'Vagón a superficie'],
  ['PlacingSupport', 'Colocando sostenimiento'],
  ['WagonReturning', 'Vagón de regreso'],
  ['Support',        'Sostenimiento'],
  ['Methane',        'Metano'],
  ['Hazard',         'Riesgo biológico'],
]
export function stageLabel(stage) {
  if (!stage) return '—'
  for (const [prefix, label] of STAGE_PREFIXES) {
    if (stage.startsWith(prefix)) return `${label} ${stage.slice(prefix.length)}`.trim()
  }
  return stage
}

// Etapas en orden, para dibujar el recorrido de cada nivel
export const LEVEL_STAGES = {
  level1: ['PickingMuro1', 'WagonToSurface1', 'PlacingSupport1', 'WagonReturning1', 'PickingMuro2',
    'WagonToSurface2', 'PlacingSupport2', 'WagonReturning2', 'PickingMuro3', 'WagonToSurface3'],
  level2: ['PickingMuro1', 'WagonToSurface1', 'Support1', 'Methane1', 'Hazard1', 'WagonReturning1',
    'PickingMuro2', 'WagonToSurface2', 'Support2', 'Methane2', 'Hazard2', 'WagonReturning2',
    'PickingMuro3', 'WagonToSurface3'],
}

export const VARK_LABEL = { Visual: 'Visual', Auditivo: 'Auditivo', 'Lector/Escritor': 'Lector/Escritor' }

// Contadores del `summary` de cada intento
export const SUMMARY_COUNTERS = {
  coal_collected:       'Carbón recolectado',
  fatigue_injuries:     'Lesiones por fatiga',
  hose_dodged:          'Manguera esquivada',
  hose_hit:             'Impactos de la manguera',
  lantern_warnings:     'Advertencias de linterna',
  device_opened:        'Veces que abrió el detector',
  calibrations_valid:   'Calibraciones válidas',
  calibrations_invalid: 'Calibraciones fuera de zona segura',
  exits_uncalibrated:   'Avanzó sin calibrar',
  damage_methane:       'Vida perdida por metano',
  damage_biohazard:     'Vida perdida por riesgo biológico',
}

const kindLabel = (k) => ({ ofidio: 'una serpiente', hongo: 'hongos' }[k] ?? 'un riesgo biológico')

// Texto legible para cada evento del juego (línea de tiempo de un intento)
export function describeEvent(e) {
  const p = e.payload ?? {}
  switch (e.event_type) {
    case 'level_start':       return `Inicia el nivel${p.gas_brand ? ` con detector ${p.gas_brand}` : ''}`
    case 'stage_enter':       return `Entra a la etapa «${stageLabel(e.stage)}»`
    case 'risk_info_shown':   return `Abre el panel informativo ${e.risk_id ? `de ${e.risk_id}` : ''}`.trim()
    case 'risk_info_closed':  return `Cierra el panel tras leerlo ${formatSeconds(p.read_ms)}${p.audio_finished ? ' (escuchó el audio completo)' : ''}`
    case 'risk_mitigated':    return `Mitiga ${e.risk_id ?? 'el riesgo'}${p.reaction_ms ? ` en ${formatSeconds(p.reaction_ms)}` : ''}`
    case 'risk_failed':       return `Falla ${e.risk_id ?? 'el riesgo'}${p.mistakes ? ` (${p.mistakes} errores)` : ''}`
    case 'wall_broken':       return 'Termina de picar el muro'
    case 'stone_broken':      return 'Rompe la roca'
    case 'coal_collected':    return 'Recoge el carbón'
    case 'wagon_sent':        return p.to_surface === false ? 'Envía el vagón de regreso' : 'Envía el vagón a superficie'
    case 'wagon_arrived':     return 'Llega el vagón'
    case 'fatigue_injury':    return 'Se lesiona por fatiga al picar sin descanso'
    case 'qte_hose_dodged':   return `Se aparta de la manguera suelta a tiempo${p.reaction_ms ? ` (${formatSeconds(p.reaction_ms)})` : ''}`
    case 'qte_hose_hit':      return 'No se aparta: lo alcanzan los fragmentos de la manguera suelta'
    case 'support_prompt':    return `Aparece la orden de sostenimiento (${p.timeout_s ?? '?'} s para reaccionar)`
    case 'support_placed':    return `Coloca el sostenimiento a tiempo${p.reaction_ms ? ` (${formatSeconds(p.reaction_ms)})` : ''}`
    case 'collapse':          return 'Se acaba el tiempo: derrumbe'
    case 'player_death':      return `Muere: ${failReasonLabel(p.cause)}`
    case 'level_complete':    return 'Completa el nivel'
    case 'level_failed':      return `Pierde el nivel${p.fail_reason ? `: ${failReasonLabel(p.fail_reason)}` : ''}`
    case 'level_abandoned':   return 'Abandona el nivel'
    case 'lantern_warning':   return 'Avanza con la linterna apagada (advertencia)'
    case 'lantern_on':        return p.after_warning ? 'Enciende la linterna después de la advertencia' : 'Enciende la linterna a tiempo'
    case 'device_opened':     return 'Abre el detector de gases'
    case 'device_closed':     return 'Cierra el detector de gases'
    case 'device_powered_on': return `Enciende el detector${p.in_safe_zone === false ? ' fuera de la zona segura' : ''}`
    case 'device_calibrated': return p.valid === false ? 'Calibra el detector fuera de la zona segura' : 'Calibra el detector correctamente'
    case 'safe_zone_enter':   return 'Entra a la zona segura'
    case 'safe_zone_exit':    return `Sale de la zona segura${p.calibrated === false ? ' sin calibrar' : ''}`
    case 'methane_start':     return 'Empieza a subir el metano'
    case 'gas_alarm':         return `Suena la alarma de gas (${p.reading_lel ?? '?'}% LEL)`
    case 'methane_evacuated': return `Evacúa a la zona segura${p.reaction_ms ? ` en ${formatSeconds(p.reaction_ms)}` : ''}`
    case 'biohazard_warned':  return `Detecta ${kindLabel(p.kind)} en la vía`
    case 'biohazard_contact': return `Contacto con ${kindLabel(p.kind)}`
    case 'biohazard_reported':return `Reporta ${kindLabel(p.kind)} sin contacto`
    case 'biohazard_treated': return `Recibe tratamiento tras contacto con ${kindLabel(p.kind)}`
    default:                  return e.event_type
  }
}

// Tono de cada evento: 'good' | 'bad' | 'warn' | 'info'
export function eventTone(type) {
  if (['level_complete', 'support_placed', 'methane_evacuated', 'biohazard_reported', 'lantern_on', 'risk_mitigated', 'coal_collected', 'qte_hose_dodged'].includes(type)) return 'good'
  if (['player_death', 'collapse', 'level_failed', 'risk_failed', 'biohazard_contact', 'fatigue_injury', 'qte_hose_hit'].includes(type)) return 'bad'
  if (['gas_alarm', 'methane_start', 'lantern_warning', 'support_prompt', 'biohazard_warned', 'level_abandoned'].includes(type)) return 'warn'
  return 'info'
}

// Banda de desempeño — misma escala que el backend (session.service.js#performanceBand)
export function bandFor(percentage, hasData = true) {
  if (!hasData) return 'sin_datos'
  if (percentage >= 80) return 'destacado'
  if (percentage >= 40) return 'en_progreso'
  return 'refuerzo'
}
