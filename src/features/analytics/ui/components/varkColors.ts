// Orden fijo de la paleta categórica (validada para daltonismo) — el color sigue al estilo, no al rango
const VARK_COLORS: Record<string, string> = {
  'Visual': 'var(--chart-1)',
  'Auditivo': 'var(--chart-2)',
  'Lector/Escritor': 'var(--chart-3)',
  'Sin completar': 'var(--status-neutral)',
}

export const varkColor = (style: string | null | undefined): string => (style && VARK_COLORS[style]) || 'var(--status-neutral)'
