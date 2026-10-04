// Igual que el backend (earthcation_be/src/utils/attempt.utils.js): el % de éxito de un jugador en
// un nivel es el de su ÚLTIMO intento; reintentar reemplaza el %, no lo promedia con lo anterior.
const dayOf = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '')
const attemptKey = (r) => r.attempt_id ?? `sin-intento:${r.session_id ?? ''}:${dayOf(r.recorded_at)}`
const levelOf = (r) => r.risk?.level_id ?? r.risk?.level?.id ?? null

/** Por nivel: filas del último intento y cuántas veces se intentó. */
export function latestAttemptsByLevel(progress = []) {
  const byLevel = new Map()
  for (const row of progress) {
    const level = levelOf(row)
    if (!byLevel.has(level)) byLevel.set(level, new Map())
    const attempts = byLevel.get(level)
    const key = attemptKey(row)
    if (!attempts.has(key)) attempts.set(key, { rows: [], last: 0 })
    const a = attempts.get(key)
    a.rows.push(row)
    a.last = Math.max(a.last, new Date(row.recorded_at).getTime() || 0)
  }
  return [...byLevel.entries()].map(([level_id, attempts]) => {
    const list = [...attempts.values()].sort((a, b) => a.last - b.last)
    const rows = list[list.length - 1].rows
    const mitigated = rows.filter(r => r.is_mitigated).length
    return {
      level_id,
      level_name: rows[0]?.risk?.level?.name ?? 'Sin nivel',
      attempts: list.length,
      rows,
      total: rows.length,
      mitigated,
      percentage: rows.length ? Math.round((mitigated / rows.length) * 100) : 0,
    }
  })
}
