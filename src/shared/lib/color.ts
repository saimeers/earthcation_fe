/** Fondo suave a partir de un color (token CSS o hex): `color-mix` con transparente. */
export const tintBg = (color: string, pct = 14): string => `color-mix(in oklab, ${color} ${pct}%, transparent)`

/** Tokens de estado de src/app/index.css: se reservan para estados (bandas, resultados), nunca solo color. */
export const STATUS_COLOR = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  critical: 'var(--status-critical)',
  neutral: 'var(--status-neutral)',
} as const

export type StatusTone = keyof typeof STATUS_COLOR
