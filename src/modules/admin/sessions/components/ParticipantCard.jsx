import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Clock, Target, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

const VARK_VARIANT = {
  'Visual':          'default',
  'Auditivo':        'secondary',
  'Lector/Escritor': 'outline',
}

const CATEGORY_COLOR = {
  'Químico':    'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200',
  'Mecánico':   'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200',
  'Eléctrico':  'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200',
}

function RiskRow({ risk }) {
  const mistakes = risk.mistakes_count ?? 0
  const hasMistakes = mistakes > 0

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between px-3 py-2.5 rounded-md text-sm border ${
      risk.is_mitigated ? 'bg-green-500/5 border-green-500/10' : 'bg-destructive/5 border-destructive/10'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
          risk.is_mitigated
            ? 'bg-green-500/15 text-green-700 dark:text-green-400'
            : 'bg-destructive/15 text-destructive'
        }`}>
          {risk.is_mitigated
            ? <CheckCircle2 className="h-3 w-3" />
            : <XCircle      className="h-3 w-3" />}
          {risk.is_mitigated ? 'Mitigado' : 'No mitigado'}
        </span>
        <span className="truncate text-sm font-medium">{risk.risk_name}</span>
        {risk.category && (
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide shrink-0 border ${
            CATEGORY_COLOR[risk.category] ?? 'bg-muted text-muted-foreground border-border'
          }`}>
            {risk.category.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 sm:ml-3 pl-[calc(0.625rem+1px)] sm:pl-0">
        <span className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border" title={risk.is_mitigated ? 'Errores antes de lograrlo' : 'Errores registrados'}>
          {hasMistakes && <AlertTriangle className="h-3 w-3 text-amber-500" />}
          {risk.is_mitigated
            ? (hasMistakes ? `${mistakes} errores antes de lograrlo` : 'Sin errores')
            : `${mistakes} errores`}
        </span>
        {risk.reaction_time_ms && (
          <span className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border">
            <Clock className="h-3 w-3" />
            {(risk.reaction_time_ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>
    </div>
  )
}

function LevelSection({ levelData }) {
  const [open, setOpen] = useState(false)
  const pct = levelData.total > 0
    ? Math.round((levelData.mitigated / levelData.total) * 100)
    : 0

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 hover:border-muted-foreground/30 transition-all cursor-pointer">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-muted p-1 rounded-md text-muted-foreground group-hover:text-foreground transition-colors">
               {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
            </div>
            <span className="text-sm font-semibold truncate">{levelData.name}</span>
            <Badge variant="outline" className="text-xs shrink-0 bg-background">
              {levelData.mitigated}/{levelData.total}
            </Badge>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <div className="w-24 hidden sm:block">
              <Progress value={pct} className="h-1.5" />
            </div>
            <span className="text-xs font-medium tabular-nums min-w-[3ch] text-right">{pct}%</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted ml-3">
          {levelData.risks.map((risk, i) => (
            <RiskRow key={`${risk.risk_id}-${i}`} risk={risk} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function progressTone(pct) {
  if (pct >= 80) return { ring: 'text-green-500', bar: '[&>div]:bg-green-500', chip: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' }
  if (pct >= 40) return { ring: 'text-amber-500', bar: '[&>div]:bg-amber-500', chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' }
  return { ring: 'text-destructive', bar: '[&>div]:bg-destructive', chip: 'bg-destructive/10 text-destructive border-destructive/20' }
}

export function ParticipantCard({ p }) {
  const [open, setOpen] = useState(false)
  const tone = progressTone(p.percentage)

  const initials = [p.user?.first_name?.[0], p.user?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?'

  return (
    <Card className="hover:border-primary/20 transition-colors shadow-sm">
      <CardContent className="p-5 space-y-4">
        {/* Header participante */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-base">{p.user?.first_name} {p.user?.last_name}</p>
                {p.dominant_style && (
                  <Badge variant={VARK_VARIANT[p.dominant_style] ?? 'outline'} className="text-xs">
                    {p.dominant_style}
                  </Badge>
                )}
                {p.percentage === 100 && (
                  <Badge className="text-xs bg-green-600 hover:bg-green-700 text-white shadow-none">Completado</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                CC: {p.user?.cedula} <span className="mx-1">•</span> @{p.user?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 bg-muted/50 p-2 rounded-lg border">
            {p.avg_reaction_ms && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {(p.avg_reaction_ms / 1000).toFixed(1)}s prom.
              </span>
            )}
            <span className="text-muted-foreground/30">|</span>
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {p.total_attempts} intentos
            </span>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className={`space-y-2 p-3 rounded-lg border ${tone.chip}`}>
          <div className="flex justify-between text-xs">
            <span className="font-medium">{p.mitigated} de {p.total_attempts} riesgos mitigados</span>
            <span className={`font-bold ${tone.ring}`}>{p.percentage}% completado</span>
          </div>
          <Progress value={p.percentage} className={`h-2 bg-background ${tone.bar}`} />
        </div>

        {/* Detalle por niveles */}
        {p.by_level && p.by_level.length > 0 && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground w-full sm:w-auto hover:bg-muted/50">
                {open ? <ChevronDown className="h-4 w-4 mr-1.5" /> : <ChevronRight className="h-4 w-4 mr-1.5" />}
                {open ? 'Ocultar análisis por nivel' : 'Ver análisis por nivel'}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-2 pt-2 border-t border-dashed">
                {p.by_level.map(level => (
                  <LevelSection key={level.name} levelData={level} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}