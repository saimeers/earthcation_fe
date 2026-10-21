import { CheckCircle2, AlertTriangle, Copy, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import type { ImportCounts } from '../../domain/importRows'

function CountCard({ icon: Icon, iconClass, value, label }: { icon: LucideIcon, iconClass: string, value: number, label: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconClass} shrink-0`} />
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ImportSummary({ counts }: { counts: ImportCounts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <CountCard icon={CheckCircle2} iconClass="text-emerald-600" value={counts.ok} label="Listas para crear" />
      <CountCard icon={Copy} iconClass="text-amber-600" value={counts.duplicate} label="Repetidas / ya existen" />
      <CountCard icon={AlertTriangle} iconClass="text-destructive" value={counts.missing} label="Con datos faltantes" />
    </div>
  )
}
