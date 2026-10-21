import type { SignKind } from '../../domain/content'

// Forma y color normalizados de cada tipo de señal (NTC 1461): triángulo amarillo de advertencia, círculo azul de
// obligación y cuadrado verde de condición segura. En lugar de un pictograma lleva el número del protocolo.

const SHAPES: Record<SignKind, { shape: React.JSX.Element, ink: string, textY: number }> = {
  advertencia: {
    shape: <path d="M48 7 L91 83 H5 Z" fill="var(--l-sign-yellow)" stroke="var(--l-ink)" strokeWidth="6" strokeLinejoin="round" />,
    ink: 'var(--l-ink)',
    textY: 70,
  },
  obligacion: {
    shape: <circle cx="48" cy="48" r="42" fill="var(--l-sign-blue)" />,
    ink: '#ffffff',
    textY: 60,
  },
  'condicion-segura': {
    shape: <rect x="6" y="6" width="84" height="84" rx="3" fill="var(--l-sign-green)" />,
    ink: '#ffffff',
    textY: 60,
  },
}

export function SafetySign({ kind, number, className }: { kind: SignKind, number: string, className?: string }) {
  const { shape, ink, textY } = SHAPES[kind]
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
      {shape}
      <text
        x="48" y={textY} textAnchor="middle" fill={ink} fontSize="32" fontWeight="800"
        style={{ fontFamily: "'Archivo Variable', sans-serif", fontStretch: '68%' }}>
        {number}
      </text>
    </svg>
  )
}
