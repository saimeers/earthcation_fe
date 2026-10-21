// Corte de una mina subterránea de carbón como las de Norte de Santander: la entrada en la ladera con su marco de
// madera, el inclinado que baja siguiendo el manto con rieles, el coche que sube y baja tirado por el malacate,
// las sobreguías que salen del inclinado, las puertas de madera del sostenimiento, el ventilador en la segunda
// entrada y las señales de peligro en los frentes. Decorativo (aria-hidden): la descripción va en el <figcaption>.

// Inclinado principal: de la entrada (110, 192) hacia el frente, con buzamiento constante
const INCLINE = { x1: 110, y1: 192, x2: 440, y2: 340.5 }
const DIP = (INCLINE.y2 - INCLINE.y1) / (INCLINE.x2 - INCLINE.x1)
const LENGTH = Math.hypot(INCLINE.x2 - INCLINE.x1, INCLINE.y2 - INCLINE.y1)
const DIR = { x: (INCLINE.x2 - INCLINE.x1) / LENGTH, y: (INCLINE.y2 - INCLINE.y1) / LENGTH }
const ANGLE = (Math.atan2(DIR.y, DIR.x) * 180) / Math.PI

const at = (t: number) => ({ x: INCLINE.x1 + DIR.x * LENGTH * t, y: INCLINE.y1 + DIR.y * LENGTH * t })

const GROUND = 'M0 190 L70 190 C150 186 170 130 240 104 S390 64 480 58 V560 H0 Z'

// Capas que buzan con el manto: arenisca, carbón, lutita… (y = c + DIP·x entre c1 y c2)
const LAYERS = [
  { c1: -400, c2: 132, fill: 'var(--l-ochre)' },
  { c1: 132, c2: 156, fill: 'var(--l-bedrock)' },
  { c1: 156, c2: 236, fill: '#6b4f37' },
  { c1: 236, c2: 300, fill: '#8c6440' },
  { c1: 300, c2: 318, fill: 'var(--l-bedrock)' },
  { c1: 318, c2: 700, fill: 'var(--l-shale)' },
]

const layerPath = (c1: number, c2: number) =>
  `M0 ${c1} L480 ${c1 + DIP * 480} L480 ${c2 + DIP * 480} L0 ${c2} Z`

// Sobreguías (niveles) a lo largo del inclinado, con su profundidad en la escala de la derecha
const LEVELS = [
  { t: 0.26, depth: '−40' },
  { t: 0.66, depth: '−120' },
  { t: 1, depth: '−200' },
]

function Strata() {
  return (
    <g clipPath="url(#mine-ground)">
      {LAYERS.map(({ c1, c2, fill }) => <path key={c1} d={layerPath(c1, c2)} fill={fill} />)}
    </g>
  )
}

function Incline() {
  const { x1, y1, x2, y2 } = INCLINE
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--l-bedrock)" strokeWidth="16" />
      <line x1={x1} y1={y1 + 4} x2={x2} y2={y2 + 4} stroke="var(--l-paper-soft)" strokeWidth="0.9" opacity="0.7" />
      <line x1={x1} y1={y1 + 4} x2={x2} y2={y2 + 4} stroke="var(--l-paper-soft)" strokeWidth="2.4" strokeDasharray="1 7" opacity="0.5" />
      {/* Cable del malacate: corre por el centro del inclinado */}
      <polyline points={`47,178 ${x1},${y1} ${x2},${y2}`} fill="none" stroke="var(--l-ink)" strokeWidth="0.9" opacity="0.8" />
    </g>
  )
}

// Puertas de madera (sostenimiento) perpendiculares al inclinado
function TimberSets() {
  const ts = [0.08, 0.18, 0.36, 0.46, 0.56, 0.76, 0.86]
  return (
    <g stroke="#9a6a3c" strokeWidth="2.6" strokeLinecap="square">
      {ts.map((t) => {
        const p = at(t)
        return <line key={t} x1={p.x + DIR.y * 9} y1={p.y - DIR.x * 9} x2={p.x - DIR.y * 9} y2={p.y + DIR.x * 9} />
      })}
    </g>
  )
}

function Levels() {
  return (
    <g>
      {LEVELS.map(({ t, depth }) => {
        const p = at(t)
        return (
          <g key={depth}>
            <rect x={p.x + 6} y={p.y + 8} width="14" height="12" fill="var(--l-bedrock)" stroke="#9a6a3c" strokeWidth="2" />
            <path d={`M${p.x + 22} ${p.y + 14} H452`} stroke="var(--l-paper)" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.55" />
            <path d={`M452 ${p.y + 14} H470`} stroke="var(--l-paper)" strokeWidth="1.5" />
            <text x="466" y={p.y + 8} textAnchor="end" className="l-mono" fontSize="11" fill="var(--l-paper)">{depth} m</text>
          </g>
        )
      })}
      <path d="M470 196 V540" stroke="var(--l-paper)" strokeWidth="1" opacity="0.4" />
    </g>
  )
}

function Hazard({ x, y, blink }: { x: number, y: number, blink?: boolean }) {
  return (
    <g className={blink ? 'l-blink' : undefined} transform={`translate(${x} ${y})`}>
      <path d="M0 0 L10 17 H-10 Z" fill="var(--l-sign-yellow)" stroke="var(--l-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="-1" y="5.5" width="2" height="6.5" fill="var(--l-ink)" />
      <rect x="-1" y="13.3" width="2" height="2" fill="var(--l-ink)" />
    </g>
  )
}

// Entrada principal con marco de madera, malacate con su tambor y ventilador en la segunda entrada
function Surface() {
  return (
    <g strokeLinejoin="round">
      <path d="M0 190 L70 190 C150 186 170 130 240 104 S390 64 480 58" fill="none" stroke="var(--l-ink)" strokeWidth="2.5" />
      <path d="M100 196 V172 H124 V196" fill="none" stroke="#9a6a3c" strokeWidth="4" />
      <path d="M96 172 H128" stroke="var(--l-ink)" strokeWidth="2.5" />
      <rect x="16" y="160" width="46" height="30" fill="var(--l-sandstone)" stroke="var(--l-ink)" strokeWidth="2" />
      <path d="M12 161 L39 146 L66 161" fill="none" stroke="var(--l-ink)" strokeWidth="2.2" />
      <circle cx="40" cy="176" r="7" fill="none" stroke="var(--l-ink)" strokeWidth="2" />
      <line x1="248" y1="104" x2="378" y2="313" stroke="var(--l-bedrock)" strokeWidth="6" strokeDasharray="14 3" />
      <g transform="translate(250 92)">
        <circle r="10" fill="var(--l-limestone)" stroke="var(--l-ink)" strokeWidth="2" />
        <g className="l-fan" stroke="var(--l-ink)" strokeWidth="2.2" strokeLinecap="round">
          <circle r="7.5" fill="none" stroke="none" />
          <line x1="0" y1="0" x2="0" y2="-7" /><line x1="0" y1="0" x2="6" y2="3.5" /><line x1="0" y1="0" x2="-6" y2="3.5" />
        </g>
      </g>
    </g>
  )
}

// Coche (vagoneta) que sube y baja por el inclinado
function Cart() {
  const start = at(0.12)
  return (
    <g className="l-cart" style={{ ['--l-cart-x' as string]: `${DIR.x * LENGTH * 0.72}px`, ['--l-cart-y' as string]: `${DIR.y * LENGTH * 0.72}px` }}>
      <g transform={`translate(${start.x} ${start.y}) rotate(${ANGLE})`}>
        <rect x="-9" y="-9" width="18" height="9" fill="var(--l-amber)" stroke="var(--l-ink)" strokeWidth="1.2" />
        <circle cx="-5" cy="1.5" r="2" fill="var(--l-ink)" />
        <circle cx="5" cy="1.5" r="2" fill="var(--l-ink)" />
      </g>
    </g>
  )
}

export function MineSection() {
  const frente = at(1)
  const level = at(0.66)
  return (
    <svg viewBox="0 0 480 560" className="h-auto w-full" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="mine-ground"><path d={GROUND} /></clipPath>
      </defs>
      <Strata />
      <Incline />
      <TimberSets />
      <Levels />
      <Cart />
      <Surface />
      <Hazard x={frente.x - 2} y={frente.y - 32} blink />
      <Hazard x={level.x + 34} y={level.y - 6} />
      <Hazard x={366} y={292} />
    </svg>
  )
}
