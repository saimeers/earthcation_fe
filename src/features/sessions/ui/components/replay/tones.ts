import { CheckCircle2, XCircle, AlertTriangle, Circle, type LucideIcon } from 'lucide-react'
import type { EventTone } from '../../../domain/telemetry'

export const TONE_STYLE: Record<EventTone, { color: string, icon: LucideIcon }> = {
  good: { color: 'var(--status-good)', icon: CheckCircle2 },
  bad: { color: 'var(--status-critical)', icon: XCircle },
  warn: { color: 'var(--status-warning)', icon: AlertTriangle },
  info: { color: 'var(--status-neutral)', icon: Circle },
}
