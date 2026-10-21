import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Users, Maximize2 } from 'lucide-react'
import { mitigationLevel, type MineMarker, type MitigationLevel } from '../../../domain/minesMap'

// Colores del mapa: Leaflet pinta atributos SVG, donde los tokens CSS no aplican
export const PALETTE = {
  light: { empty: '#eceae4', stroke: '#c3c2b7', hover: '#52514e', seq: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf'], ring: '#ffffff', bg: '#f7f7f4' },
  dark: { empty: '#2a2a28', stroke: '#45443f', hover: '#c3c2b7', seq: ['#0d366b', '#184f95', '#256abf', '#3987e5', '#6da7ec'], ring: '#1a1a19', bg: '#141413' },
}
export type Palette = typeof PALETTE.light

export const MITIGATION: { level: MitigationLevel, color: string, label: string }[] = [
  { level: 'high', color: '#0ca30c', label: '80% o más' },
  { level: 'mid', color: '#fab219', label: '40–79%' },
  { level: 'low', color: '#d03b3b', label: 'Menos de 40%' },
]
export const mitigationColor = (level: MitigationLevel): string => MITIGATION.find(m => m.level === level)!.color

export function ResetViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Ver todo el país"
      className="absolute top-[84px] right-[10px] z-[1000] flex h-[30px] w-[30px] items-center justify-center rounded-lg border bg-popover/95 shadow-sm hover:bg-muted">
      <Maximize2 className="h-4 w-4" />
    </button>
  )
}

export function MapLegend({ pal, maxPlayers, totalPlayers }: { pal: Palette, maxPlayers: number, totalPlayers: number }) {
  return (
    <div className="absolute top-3 left-3 z-[1000] rounded-lg border bg-popover/95 backdrop-blur px-3 py-2.5 shadow-sm space-y-2.5 text-[11px] w-[190px]">
      <div>
        <p className="font-semibold mb-1">Jugadores por departamento</p>
        <div className="flex items-center gap-[2px]">
          {pal.seq.map(c => <span key={c} className="h-2.5 flex-1 rounded-sm" style={{ background: c }} />)}
        </div>
        <div className="flex justify-between text-muted-foreground mt-0.5"><span>1</span><span>{maxPlayers}</span></div>
      </div>
      <div>
        <p className="font-semibold mb-1">Mitigación (punto = municipio)</p>
        <div className="space-y-0.5">
          {MITIGATION.map(m => (
            <p key={m.label} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full ring-2 ring-background" style={{ background: m.color }} />{m.label}
            </p>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">Fuente: DANE – MGN · {totalPlayers} jugadores ubicados</p>
    </div>
  )
}

/** Tarjeta con las organizaciones del municipio elegido. */
export function MineDetail({ selected, onClose }: { selected: MineMarker | null, onClose: () => void }) {
  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 bg-popover border border-border rounded-xl shadow-xl p-4 space-y-3 z-[1001]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{selected.municipality}</p>
              <p className="text-xs text-muted-foreground">{selected.department} · <Users className="inline h-3 w-3" /> {selected.players} jugadores</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {selected.orgs.map(o => (
              <div key={o.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <p className="font-medium truncate">{o.name}</p>
                  <p className="text-xs font-semibold tabular-nums shrink-0">{o.percentage}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${o.percentage}%`, background: mitigationColor(mitigationLevel(o.percentage)) }} />
                </div>
                <p className="text-[11px] text-muted-foreground">{o.player_count} jugador{o.player_count !== 1 ? 'es' : ''}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
