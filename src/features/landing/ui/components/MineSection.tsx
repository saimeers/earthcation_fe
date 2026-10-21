// Corte transversal de la mina: castillete en superficie, pozo con su jaula, tres galerías con
// riesgos señalizados y la escala de profundidad a la derecha. Decorativo (aria-hidden): la
// descripción para lectores de pantalla va en el <figcaption> de Hero.

const STRATA_BANDS = [
  { d: 'M0 96 C80 90 160 102 240 95 S400 88 480 97 V168 C400 176 320 160 240 170 S80 178 0 166 Z', fill: 'var(--l-ochre)' },
  { d: 'M0 166 C80 178 160 168 240 170 S400 176 480 168 V292 C390 300 300 282 210 294 S60 300 0 288 Z', fill: '#8c6440' },
  { d: 'M0 288 C60 300 140 290 210 294 S390 300 480 292 V414 C400 420 300 404 220 416 S70 424 0 410 Z', fill: '#4a3d33' },
  { d: 'M0 410 C70 424 150 412 220 416 S400 420 480 414 V560 H0 Z', fill: 'var(--l-shale)' },
]

const GALLERIES = [
  { y: 222, x1: 168, x2: 400, depth: '−40' },
  { y: 342, x1: 40, x2: 380, depth: '−120' },
  { y: 462, x1: 168, x2: 410, depth: '−200' },
]

const HAZARDS = [
  { x: 376, y: 222, blink: false },
  { x: 78, y: 342, blink: true },
  { x: 352, y: 342, blink: false },
  { x: 386, y: 462, blink: false },
]

function Headframe() {
  return (
    <g stroke="var(--l-ink)" strokeWidth="3" fill="none" strokeLinejoin="round">
      <path d="M132 96 L150 24 L168 96 M150 24 L196 96 M140 64 H176" />
      <circle cx="150" cy="24" r="11" fill="var(--l-limestone)" />
      <circle cx="150" cy="24" r="3" fill="var(--l-ink)" />
      <rect x="200" y="70" width="58" height="26" fill="var(--l-sandstone)" />
      <path d="M200 70 L229 54 L258 70" />
    </g>
  )
}

function Hazard({ x, y, blink }: { x: number, y: number, blink: boolean }) {
  return (
    <g className={blink ? 'l-blink' : undefined} transform={`translate(${x} ${y - 30})`}>
      <path d="M0 0 L11 19 H-11 Z" fill="var(--l-sign-yellow)" stroke="var(--l-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="-1" y="6" width="2" height="7" fill="var(--l-ink)" />
      <rect x="-1" y="14.5" width="2" height="2" fill="var(--l-ink)" />
    </g>
  )
}

function Shaft() {
  return (
    <g>
      <rect x="140" y="96" width="20" height="388" fill="var(--l-bedrock)" />
      <path d="M144 96 V484 M156 96 V484" stroke="var(--l-paper-soft)" strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />
      <rect className="l-cage" x="143" y="200" width="14" height="22" fill="var(--l-amber)" />
    </g>
  )
}

function DepthScale() {
  return (
    <g className="l-mono" fontSize="11" fill="var(--l-paper)">
      {GALLERIES.map(({ y, depth }) => (
        <g key={depth}>
          <path d={`M424 ${y} H470`} stroke="var(--l-paper)" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="466" y={y - 6} textAnchor="end">{depth} m</text>
        </g>
      ))}
      <path d="M470 96 V540" stroke="var(--l-paper)" strokeWidth="1" opacity="0.5" />
    </g>
  )
}

export function MineSection() {
  return (
    <svg viewBox="0 0 480 560" className="h-auto w-full" aria-hidden="true" focusable="false">
      {STRATA_BANDS.map(({ d, fill }) => <path key={d} d={d} fill={fill} />)}
      <path d="M0 96 C80 90 160 102 240 95 S400 88 480 97" stroke="var(--l-ink)" strokeWidth="2.5" fill="none" />
      {GALLERIES.map(({ y, x1, x2 }) => (
        <rect key={y} x={x1} y={y - 12} width={x2 - x1} height="24" rx="2" fill="var(--l-bedrock)" />
      ))}
      <Shaft />
      {HAZARDS.map((h) => <Hazard key={`${h.x}-${h.y}`} {...h} />)}
      <Headframe />
      <DepthScale />
    </svg>
  )
}
