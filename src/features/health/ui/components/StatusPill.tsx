import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface StatusPillProps {
  ok: boolean | null | undefined
  label: string
}

export function StatusPill({ ok, label }: StatusPillProps) {
  const Icon = ok === true ? CheckCircle2 : ok === false ? XCircle : AlertTriangle
  const color = ok === true ? 'var(--status-good)' : ok === false ? 'var(--status-critical)' : 'var(--status-warning)'
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
      <Icon className="h-4 w-4" /> {label}
    </span>
  )
}
