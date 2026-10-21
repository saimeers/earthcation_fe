import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { usePanelBase } from '@/features/auth'
import { sessionInsights } from '../../domain/insights'
import { rankParticipants } from '../../domain/sessions'
import { useSessionProgress } from '../../application/useSessions'
import { InsightCards } from '../components/InsightGrid'
import { RiskMatrix, MatrixLegend } from '../components/RiskMatrix'
import { LIGHT_VARS, ReportHeader, ReportParticipants, ReportRisks, ReportSummary, Section } from '../components/report/ReportParts'

/** Informe A4 imprimible de una sesión (fuera del layout con sidebar para que el PDF salga limpio). */
export function SessionReportPage() {
  const { id = '' } = useParams()
  const base = usePanelBase()
  const { data, isLoading } = useSessionProgress(id)
  const insights = useMemo(() => sessionInsights(data), [data])

  useEffect(() => {
    if (data?.session) document.title = `Informe — ${data.session.name}`
  }, [data])

  if (isLoading || !data) {
    return <div className="min-h-svh flex items-center justify-center bg-white text-zinc-600"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Preparando informe…</div>
  }

  const sorted = rankParticipants(data.participants)

  return (
    <div style={LIGHT_VARS} className="min-h-svh bg-[#f4f4f2] print:bg-white text-[color:var(--foreground)]">
      {/* Barra de acciones — no se imprime */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[210mm] flex items-center justify-between gap-3 px-4 py-2.5">
          <Button variant="ghost" size="sm" className="h-8" asChild>
            <Link to={`${base}/sessions/${id}`}><ArrowLeft className="h-4 w-4 mr-1" /> Volver a la sesión</Link>
          </Button>
          <div className="flex items-center gap-3">
            <p className="text-xs text-zinc-500 hidden sm:block">En el diálogo de impresión elige «Guardar como PDF».</p>
            <Button size="sm" className="h-8" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> Imprimir / Guardar PDF</Button>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white my-6 print:my-0 shadow-xl print:shadow-none rounded-sm print:rounded-none px-[14mm] py-[12mm] print:p-0 space-y-6 text-[12px]">
        <ReportHeader session={data.session} />
        <ReportSummary summary={data.summary} />

        {insights.length > 0 && (
          <Section title="Conclusiones">
            <div className="grid grid-cols-2 gap-2.5"><InsightCards insights={insights} /></div>
          </Section>
        )}

        <ReportParticipants participants={sorted} />
        {data.risks.length > 0 && <ReportRisks data={data} />}

        {data.risks.length > 0 && (
          <Section title="Matriz de dominio por participante" breakable>
            <MatrixLegend />
            <div className="[&_.overflow-x-auto]:overflow-visible">
              <RiskMatrix participants={sorted} risks={data.risks} onOpen={() => {}} />
            </div>
          </Section>
        )}

        <footer className="pt-3 border-t text-[10px] text-muted-foreground flex justify-between">
          <span>Earthcation · Plataforma de capacitación en seguridad minera</span>
          <span>Generado el {format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</span>
        </footer>
      </article>
    </div>
  )
}
