import type { SignKind } from '../../domain/content'

// Señales de seguridad dibujadas con la forma y el color que les da la norma: triángulo amarillo
// (advertencia), círculo azul (obligación) y cuadrado verde (condición segura). Decorativas.

function WarningSign() {
  return (
    <>
      <path d="M48 6 L92 84 H4 Z" fill="var(--l-sign-yellow)" stroke="var(--l-ink)" strokeWidth="6" strokeLinejoin="round" />
      {/* Ojo: reconocer el peligro */}
      <path d="M26 60 Q48 40 70 60 Q48 78 26 60 Z" fill="none" stroke="var(--l-ink)" strokeWidth="4.5" strokeLinejoin="round" />
      <circle cx="48" cy="60" r="6" fill="var(--l-ink)" />
    </>
  )
}

function MandatorySign() {
  return (
    <>
      <circle cx="48" cy="48" r="42" fill="var(--l-sign-blue)" />
      {/* Casco: usar el equipo de protección */}
      <path d="M24 58 H72 M28 58 C28 40 36 30 48 30 C60 30 68 40 68 58 M44 30 V40 M52 30 V40" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 64 H74" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </>
  )
}

function SafeConditionSign() {
  return (
    <>
      <rect x="6" y="6" width="84" height="84" rx="4" fill="var(--l-sign-green)" />
      {/* Flecha de salida: decidir la ruta segura */}
      <path d="M26 48 H68 M52 32 L68 48 L52 64" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

const SIGNS: Record<SignKind, () => React.JSX.Element> = {
  advertencia: WarningSign,
  obligacion: MandatorySign,
  'condicion-segura': SafeConditionSign,
}

export function SafetySign({ kind, className }: { kind: SignKind, className?: string }) {
  const Sign = SIGNS[kind]
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
      <Sign />
    </svg>
  )
}
